package com.sukabaca.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sukabaca.exception.ApiException;
import com.sukabaca.model.Journal;
import com.sukabaca.model.Ringkasan;
import com.sukabaca.model.Subscription;
import com.sukabaca.model.User;
import com.sukabaca.repository.RingkasanRepository;
import com.sukabaca.repository.SubscriptionRepository;
import com.sukabaca.security.EnvLoader;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class AiSummarizationService {

    public static final String BASIC_LABEL = "Basic SukaBaca AI";
    public static final String PRO_LABEL = "Pro SukaBaca AI";
    public static final String BASIC_MODEL_ID = "mistralai/mistral-large-4-1t-a52b";
    public static final String PRO_MODEL_ID = "nvidia/nemotron-3-ultra-550b-a55b";

    private static final String NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
    private static final int MAX_CHUNK_CHARS = 140_000;
    private static final int MIN_RETRY_CHUNK_CHARS = 8_000;
    private static final String SYSTEM_PROMPT = """
            Anda adalah asisten riset akademik SukaBaca yang bertugas membuat ringkasan super padat.
            Aturan ketat:
            - Gunakan hanya fakta dari dokumen; jangan mengarang data atau menambah opini.
            - Buang detail minor: abaikan latar belakang umum, tinjauan pustaka/sitasi penelitian terdahulu, rincian tabel mentah, definisi dasar, serta kalimat pembuka/penutup.
            - Fokus hanya pada: masalah utama, metode inti, hasil/angka paling signifikan, dan kesimpulan.
            - Tulis dengan kalimat pendek dan langsung ke inti (maksimal 1–2 kalimat per poin).
            - Jika bernalar secara internal, lakukan dengan sangat singkat dan langsung ke poin utama tanpa mengulang isi teks.
            - Hindari garis pemisah markdown (--- atau ***), jangan menyalin instruksi batas kata dalam kurung ke hasil akhir, dan jangan tambahkan sapaan atau komentar di luar ringkasan.""";

    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final ConcurrentHashMap<String, SummarizeJob> jobs = new ConcurrentHashMap<>();

    private final DocumentTextExtractor textExtractor;
    private final RingkasanRepository ringkasanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserHistoryService userHistoryService;

    public AiSummarizationService(DocumentTextExtractor textExtractor,
                                  RingkasanRepository ringkasanRepository,
                                  SubscriptionRepository subscriptionRepository,
                                  UserHistoryService userHistoryService) {
        this.textExtractor = textExtractor;
        this.ringkasanRepository = ringkasanRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userHistoryService = userHistoryService;
    }

    public ModelSelection resolveAndAuthorizeModel(String requestedModel, User user) {
        boolean wantsPro = requestedModel != null && (
                requestedModel.equalsIgnoreCase(PRO_LABEL)
                        || requestedModel.equalsIgnoreCase(PRO_MODEL_ID)
                        || requestedModel.toLowerCase().contains("pro")
                        || requestedModel.toLowerCase().contains("nemotron")
        );

        Subscription sub = subscriptionRepository.findByUserId(user.getId())
                .orElseGet(() -> subscriptionRepository.save(
                        new Subscription(user, "active", "free", LocalDateTime.now().plusMonths(1), 10)
                ));
        if (sub.refreshDailyQuotaIfNeeded()) {
            subscriptionRepository.save(sub);
        }

        if (wantsPro && !sub.isProActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Model Pro SukaBaca AI hanya tersedia untuk pelanggan Pro aktif");
        }

        if (sub.getUsage() != null && sub.getUsage() == 0 && !sub.isProActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Kuota harian ringkasan AI Anda telah habis. Upgrade ke Pro untuk kuota tanpa batas.");
        }

        return wantsPro
                ? new ModelSelection(PRO_LABEL, PRO_MODEL_ID, true, sub)
                : new ModelSelection(BASIC_LABEL, BASIC_MODEL_ID, false, sub);
    }

    public SummarizeJob startJob(Journal journal, User user, String requestedModel) {
        ModelSelection selection = resolveAndAuthorizeModel(requestedModel, user);
        String jobId = UUID.randomUUID().toString();
        SummarizeJob job = new SummarizeJob(jobId, journal.getId(), user.getId(), selection.label());
        jobs.put(jobId, job);

        executor.submit(() -> runJob(job, journal, user, selection));
        return job;
    }

    public SummarizeJob getJob(String jobId, Long requesterUserId) {
        SummarizeJob job = jobs.get(jobId);
        if (job == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Proses ringkasan tidak ditemukan");
        }
        if (!job.getUserId().equals(requesterUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Akses ke status ringkasan ditolak");
        }
        return job;
    }

    public Ringkasan summarizeSynchronously(Journal journal, User user, String requestedModel) {
        ModelSelection selection = resolveAndAuthorizeModel(requestedModel, user);
        SummarizeJob job = new SummarizeJob("sync", journal.getId(), user.getId(), selection.label());
        runJob(job, journal, user, selection);
        if ("FAILED".equals(job.getStatus())) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, job.getError());
        }
        return job.getRingkasan();
    }

    private void runJob(SummarizeJob job, Journal journal, User user, ModelSelection selection) {
        try {
            job.updateProgress("EXTRACTING", 0, 1, "Mengekstrak teks dokumen jurnal...");
            String fullText = textExtractor.extractDocumentText(journal);
            if (fullText.length() < 20) {
                throw new IllegalArgumentException("Konten dokumen terlalu pendek untuk diringkas");
            }

            List<String> chunks = splitIntoChunks(fullText, MAX_CHUNK_CHARS);
            int totalParts = chunks.size();

            String finalSummary;
            if (totalParts == 1) {
                job.updateProgress("SUMMARIZING", 1, 1,
                        "Meringkas dokumen dengan " + selection.label() + "...");
                finalSummary = summarizeChunkWithAutoSplit(chunks.get(0), journal.getTitle(), 1, 1, selection, job);
            } else {
                List<String> partSummaries = new ArrayList<>();
                for (int i = 0; i < totalParts; i++) {
                    int partNum = i + 1;
                    job.updateProgress("SUMMARIZING", partNum, totalParts,
                            "Memproses dokumen panjang — meringkas bagian " + partNum + " dari " + totalParts + "...");
                    String partResult = summarizeChunkWithAutoSplit(
                            chunks.get(i), journal.getTitle(), partNum, totalParts, selection, job);
                    partSummaries.add("[Bagian " + partNum + "/" + totalParts + "]\n" + partResult);
                }
                job.updateProgress("SYNTHESIZING", totalParts, totalParts,
                        "Menyatukan " + totalParts + " bagian menjadi ringkasan terstruktur...");
                finalSummary = synthesizeParts(journal.getTitle(), partSummaries, selection, job);
            }

            Subscription sub = subscriptionRepository.findByUserId(user.getId()).orElse(selection.subscription());
            if (!sub.decrementUsage()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Kuota harian ringkasan AI Anda telah habis");
            }
            subscriptionRepository.save(sub);

            Ringkasan ringkasan = new Ringkasan(journal, selection.label(), finalSummary);
            ringkasanRepository.save(ringkasan);
            userHistoryService.recordLatest(user, journal, "SUMMARIZED");

            job.complete(ringkasan, sub.getUsage());
        } catch (Exception e) {
            String message = e.getMessage() != null && !e.getMessage().isBlank()
                    ? e.getMessage()
                    : "Gagal memproses ringkasan AI";
            job.fail(message);
        }
    }

    private String summarizeChunkWithAutoSplit(String text,
                                               String title,
                                               int partNum,
                                               int totalParts,
                                               ModelSelection selection,
                                               SummarizeJob job) {
        try {
            String prompt = totalParts == 1
                    ? "Ringkas jurnal \"" + title + "\" dalam Bahasa Indonesia menggunakan format ketat berikut (total maksimal 250–300 kata):\n\n"
                      + "**Inti Jurnal** (maks. 2 kalimat: masalah yang diteliti dan tujuan utama)\n"
                      + "**Metode** (maks. 2–3 poin singkat: pendekatan, data/sampel, dan teknik utama saja)\n"
                      + "**Temuan Utama** (maks. 3–5 poin: hanya hasil paling penting beserta angka/metrik kuncinya)\n"
                      + "**Kesimpulan** (maks. 2 kalimat: jawaban atas tujuan penelitian dan implikasi utama)\n\n"
                      + "Abaikan detail teknis minor, kutipan penelitian lain, dan daftar pustaka.\n\n" + text
                    : "Ini adalah bagian " + partNum + " dari " + totalParts + " dari jurnal \"" + title + "\". "
                      + "Ekstrak HANYA fakta paling krusial pada bagian ini dalam Bahasa Indonesia (maksimal 5 poin, masing-masing 1 kalimat pendek).\n"
                      + "Abaikan pengantar umum, sitasi peneliti lain, dan detail minor. Jika bagian ini hanya berisi daftar pustaka, ucapan terima kasih, atau tidak memuat metode/temuan penting, cukup tulis: \"Tidak ada poin inti.\"\n\n" + text;
            return callNvidiaApi(prompt, selection, job, "bagian " + partNum + "/" + totalParts);
        } catch (ContextLengthExceededException ex) {
            if (text.length() <= MIN_RETRY_CHUNK_CHARS) {
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "Dokumen terlalu padat untuk diringkas sekaligus, coba kurangi ukuran berkas");
            }
            int mid = findSplitIndex(text, text.length() / 2);
            String firstHalf = text.substring(0, mid).trim();
            String secondHalf = text.substring(mid).trim();
            job.updateMessage("Mengoptimalkan bagian " + partNum + " agar ringkasan tetap akurat...");
            String s1 = summarizeChunkWithAutoSplit(firstHalf, title, partNum, totalParts, selection, job);
            String s2 = summarizeChunkWithAutoSplit(secondHalf, title, partNum, totalParts, selection, job);
            boolean empty1 = isEmptyChunkSummary(s1);
            boolean empty2 = isEmptyChunkSummary(s2);
            if (empty1 && empty2) return "Tidak ada poin inti.";
            if (empty1) return s2;
            if (empty2) return s1;
            return s1 + "\n\n" + s2;
        }
    }

    private String synthesizeParts(String title, List<String> partSummaries, ModelSelection selection, SummarizeJob job) {
        List<String> filtered = partSummaries.stream()
                .filter(part -> !isEmptyChunkSummary(part))
                .toList();
        List<String> effectiveParts = filtered.isEmpty() ? partSummaries : filtered;
        String combined = String.join("\n\n", effectiveParts);
        if (combined.length() > MAX_CHUNK_CHARS) {
            combined = combined.substring(0, MAX_CHUNK_CHARS);
        }
        String prompt = "Gabungkan poin-poin per bagian berikut dari jurnal \"" + title + "\" menjadi SATU ringkasan akademik yang sangat padat dalam Bahasa Indonesia (total maksimal 300–350 kata). Hapus informasi yang berulang dan sisakan hanya poin paling berdampak.\n\n"
                + "Gunakan format ketat ini:\n"
                + "**Ringkasan Eksekutif** (maks. 2–3 kalimat)\n"
                + "**Metodologi** (maks. 3 poin singkat)\n"
                + "**Temuan Utama** (maks. 4–5 poin terpenting saja, sertakan angka kunci jika ada)\n"
                + "**Kesimpulan** (maks. 2 kalimat)\n\n" + combined;
        try {
            return callNvidiaApi(prompt, selection, job, "sintesis akhir");
        } catch (ContextLengthExceededException e) {
            return combined;
        }
    }

    private static boolean isEmptyChunkSummary(String raw) {
        if (raw == null) {
            return true;
        }
        String strippedHeader = raw.trim().replaceFirst("^\\[Bagian\\s+\\d+/\\d+]\\s*", "");
        String normalized = strippedHeader
                .replaceAll("^[\"'“‘*\\s]+", "")
                .replaceAll("[.!?;:\"'”’*\\s]+$", "")
                .trim();
        return normalized.isEmpty() || normalized.equalsIgnoreCase("Tidak ada poin inti");
    }

    private String callNvidiaApi(String userPrompt, ModelSelection selection, SummarizeJob job, String stageLabel) {
        String apiKey = EnvLoader.get("NVIDIA_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Layanan ringkasan AI sedang tidak tersedia");
        }

        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", selection.modelId());
            body.put("messages", List.of(
                    Map.of("role", "system", "content", SYSTEM_PROMPT),
                    Map.of("role", "user", "content", userPrompt)
            ));
            body.put("temperature", selection.isPro() ? 0.25 : 0.3);
            body.put("top_p", 0.95);
            body.put("max_tokens", selection.isPro() ? 16384 : 1024);
            body.put("stream", true);
            if (selection.isPro()) {
                body.put("chat_template_kwargs", Map.of("enable_thinking", true));
            } else {
                body.put("reasoning_effort", "low");
            }

            String payloadJson = mapper.writeValueAsString(body);
            ApiException lastTransient = null;
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    return executeNvidiaStream(payloadJson, apiKey, selection, job, stageLabel);
                } catch (ContextLengthExceededException e) {
                    throw e;
                } catch (ApiException e) {
                    boolean retryable = e.getStatus() == HttpStatus.BAD_GATEWAY && attempt == 1
                            && (e.getMessage().contains("sedang sibuk") || e.getMessage().contains("Gagal menghubungi")
                                || e.getMessage().contains("Respon AI kosong"));
                    if (!retryable) {
                        throw e;
                    }
                    lastTransient = e;
                    job.updateMessage("Menghubungkan ulang ke " + selection.label() + " (" + stageLabel + ")...");
                    Thread.sleep(1200);
                } catch (InterruptedException e) {
                    throw e;
                } catch (Exception e) {
                    ApiException wrapped = new ApiException(HttpStatus.BAD_GATEWAY,
                            "Gagal menghubungi layanan SukaBaca AI");
                    if (attempt >= 2) {
                        throw wrapped;
                    }
                    lastTransient = wrapped;
                    job.updateMessage("Menghubungkan ulang ke " + selection.label() + " (" + stageLabel + ")...");
                    Thread.sleep(1200);
                }
            }
            throw lastTransient != null ? lastTransient
                    : new ApiException(HttpStatus.BAD_GATEWAY, "Gagal menghubungi layanan SukaBaca AI");
        } catch (ContextLengthExceededException | ApiException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Proses ringkasan AI terhenti");
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Gagal menghubungi layanan SukaBaca AI");
        }
    }

    private String executeNvidiaStream(String payloadJson,
                                       String apiKey,
                                       ModelSelection selection,
                                       SummarizeJob job,
                                       String stageLabel) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(NVIDIA_URL))
                .timeout(Duration.ofSeconds(240))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payloadJson))
                .build();

        HttpResponse<Stream<String>> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofLines());
        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            String errBody;
            try (Stream<String> lines = resp.body()) {
                errBody = lines.collect(Collectors.joining("\n"));
            }
            if (resp.statusCode() == 400 || resp.statusCode() == 413 || resp.statusCode() == 422) {
                String lower = errBody.toLowerCase();
                if (lower.contains("context") || lower.contains("token") || lower.contains("length") || lower.contains("too long")) {
                    throw new ContextLengthExceededException("Context length exceeded");
                }
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "Permintaan ringkasan AI tidak dapat diproses saat ini");
            }
            if (resp.statusCode() == 401 || resp.statusCode() == 403) {
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "Layanan ringkasan AI sedang tidak tersedia");
            }
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "Layanan SukaBaca AI sedang sibuk, silakan coba beberapa saat lagi");
        }

        StringBuilder contentBuilder = new StringBuilder();
        int reasoningChunks = 0;
        try (Stream<String> lines = resp.body()) {
            for (String rawLine : (Iterable<String>) lines::iterator) {
                String line = rawLine.trim();
                if (!line.startsWith("data:")) {
                    continue;
                }
                String payload = line.substring(5).trim();
                if (payload.isEmpty() || "[DONE]".equals(payload)) {
                    continue;
                }
                JsonNode chunk = mapper.readTree(payload);
                JsonNode choices = chunk.path("choices");
                if (!choices.isArray() || choices.isEmpty()) {
                    continue;
                }
                JsonNode delta = choices.get(0).path("delta");
                if (delta.hasNonNull("reasoning_content")) {
                    String rToken = delta.get("reasoning_content").asText("");
                    if (!rToken.isEmpty()) {
                        reasoningChunks++;
                        if (reasoningChunks == 1 || reasoningChunks % 25 == 0) {
                            job.updateMessage(selection.label() + " sedang menganalisis (" + stageLabel + ")...");
                        }
                    }
                }
                if (delta.hasNonNull("content")) {
                    String token = delta.get("content").asText("");
                    if (!token.isEmpty()) {
                        contentBuilder.append(token);
                        if (contentBuilder.length() % 80 < token.length()) {
                            job.updateMessage("Menyusun ringkasan " + stageLabel + " (" + contentBuilder.length() + " karakter)...");
                        }
                    }
                }
            }
        }

        String content = contentBuilder.toString().trim();
        if (content.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Respon AI kosong");
        }
        return content;
    }

    public static List<String> splitIntoChunks(String text, int maxChars) {
        List<String> chunks = new ArrayList<>();
        int start = 0;
        int len = text.length();
        while (start < len) {
            int end = Math.min(len, start + maxChars);
            if (end < len) {
                end = findSplitIndex(text, end);
                if (end <= start) {
                    end = Math.min(len, start + maxChars);
                }
            }
            chunks.add(text.substring(start, end).trim());
            start = end;
        }
        return chunks;
    }

    private static int findSplitIndex(String text, int target) {
        int windowStart = Math.max(0, target - 4000);
        int para = text.lastIndexOf("\n\n", target);
        if (para > windowStart) return para + 2;
        int nl = text.lastIndexOf('\n', target);
        if (nl > windowStart) return nl + 1;
        int dot = text.lastIndexOf(". ", target);
        if (dot > windowStart) return dot + 2;
        int space = text.lastIndexOf(' ', target);
        if (space > windowStart) return space + 1;
        return target;
    }

    public record ModelSelection(String label, String modelId, boolean isPro, Subscription subscription) {}

    private static class ContextLengthExceededException extends RuntimeException {
        ContextLengthExceededException(String msg) { super(msg); }
    }

    public static class SummarizeJob {
        private final String jobId;
        private final Long journalId;
        private final Long userId;
        private final String model;
        private volatile String status = "PROCESSING";
        private volatile String stage = "QUEUED";
        private volatile int currentPart = 0;
        private volatile int totalParts = 1;
        private volatile String message = "Menyiapkan ringkasan AI...";
        private volatile String error;
        private volatile Ringkasan ringkasan;
        private volatile Integer remainingUsage;

        SummarizeJob(String jobId, Long journalId, Long userId, String model) {
            this.jobId = jobId;
            this.journalId = journalId;
            this.userId = userId;
            this.model = model;
        }

        void updateProgress(String stage, int currentPart, int totalParts, String message) {
            this.stage = stage;
            this.currentPart = currentPart;
            this.totalParts = totalParts;
            this.message = message;
        }

        void updateMessage(String message) {
            this.message = message;
        }

        void complete(Ringkasan ringkasan, Integer remainingUsage) {
            this.ringkasan = ringkasan;
            this.remainingUsage = remainingUsage;
            this.stage = "DONE";
            this.status = "COMPLETED";
            this.message = "Ringkasan berhasil dibuat";
        }

        void fail(String error) {
            this.error = error;
            this.stage = "ERROR";
            this.status = "FAILED";
            this.message = error;
        }

        public String getJobId() { return jobId; }
        public Long getJournalId() { return journalId; }
        public Long getUserId() { return userId; }
        public String getModel() { return model; }
        public String getStatus() { return status; }
        public String getStage() { return stage; }
        public int getCurrentPart() { return currentPart; }
        public int getTotalParts() { return totalParts; }
        public String getMessage() { return message; }
        public String getError() { return error; }
        public Ringkasan getRingkasan() { return ringkasan; }
        public Integer getRemainingUsage() { return remainingUsage; }
    }
}
