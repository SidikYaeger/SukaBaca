package com.sukabaca.service;

import com.sukabaca.model.Journal;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DocumentTextExtractor {

    private static final Path UPLOAD_DIR = Paths.get("uploads").toAbsolutePath().normalize();

    public String extractDocumentText(Journal journal) {
        StringBuilder sb = new StringBuilder();
        sb.append("Judul: ").append(safe(journal.getTitle())).append("\n");
        sb.append("Penulis: ").append(safe(journal.getAuthor())).append("\n");
        if (journal.getCategory() != null && !journal.getCategory().isBlank()) {
            sb.append("Kategori: ").append(journal.getCategory()).append("\n");
        }
        if (journal.getAbstractText() != null && !journal.getAbstractText().isBlank()) {
            sb.append("\nAbstrak:\n").append(journal.getAbstractText().trim()).append("\n");
        }

        String fileText = extractFromStoredFile(journal);
        if (fileText != null && !fileText.isBlank()) {
            sb.append("\nIsi Dokumen:\n").append(fileText.trim());
        } else if (journal.getContent() != null && !journal.getContent().isBlank()) {
            String contentTrimmed = journal.getContent().trim();
            if (journal.getAbstractText() == null || !contentTrimmed.equals(journal.getAbstractText().trim())) {
                sb.append("\nIsi Dokumen:\n").append(contentTrimmed);
            }
        } else if (journal.getSnippet() != null && !journal.getSnippet().isBlank()) {
            sb.append("\nRingkasan Awal:\n").append(journal.getSnippet().trim());
        }

        return sb.toString().trim();
    }

    private String extractFromStoredFile(Journal journal) {
        String fileName = journal.getFileName();
        if (fileName == null || !fileName.contains(".")) {
            return null;
        }
        String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        Path filePath = UPLOAD_DIR.resolve(journal.getId() + "." + ext).normalize();
        if (!filePath.startsWith(UPLOAD_DIR) || !Files.isRegularFile(filePath)) {
            return null;
        }

        try {
            byte[] bytes = Files.readAllBytes(filePath);
            return extractTextFromBytes(ext, bytes);
        } catch (IOException ignored) {
            return null;
        }
    }

    public String extractTextFromBytes(String ext, byte[] bytes) {
        if (ext == null || bytes == null || bytes.length == 0) {
            return null;
        }
        String normalizedExt = ext.toLowerCase();
        try {
            if ("txt".equals(normalizedExt)) {
                return new String(bytes, StandardCharsets.UTF_8);
            }
            if ("pdf".equals(normalizedExt)) {
                try (PDDocument doc = Loader.loadPDF(bytes)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(doc);
                }
            }
            if ("docx".equals(normalizedExt)) {
                try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            }
        } catch (Exception ignored) {
            return null;
        }
        return "";
    }

    public List<Map<String, Object>> extractDocxPreviewBlocks(byte[] bytes) {
        List<Map<String, Object>> blocks = new ArrayList<>();
        if (bytes == null || bytes.length == 0) {
            return blocks;
        }
        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes))) {
            for (IBodyElement element : doc.getBodyElements()) {
                if (element instanceof XWPFParagraph para) {
                    String fullText = para.getText();
                    if (fullText == null || fullText.isBlank()) {
                        continue;
                    }
                    String style = para.getStyle() != null ? para.getStyle().toLowerCase() : "";
                    boolean isHeading1 = style.contains("heading1") || style.contains("title") || style.equals("1");
                    boolean isHeading2 = !isHeading1 && (style.contains("heading") || style.contains("subtitle"));

                    List<Map<String, Object>> runsOut = new ArrayList<>();
                    List<XWPFRun> runs = para.getRuns();
                    if (runs != null && !runs.isEmpty()) {
                        for (XWPFRun run : runs) {
                            String rt = run.text();
                            if (rt == null || rt.isEmpty()) continue;
                            Map<String, Object> runMap = new LinkedHashMap<>();
                            runMap.put("text", rt);
                            runMap.put("bold", run.isBold());
                            runMap.put("italic", run.isItalic());
                            runsOut.add(runMap);
                        }
                    }
                    if (runsOut.isEmpty()) {
                        Map<String, Object> fallbackRun = new LinkedHashMap<>();
                        fallbackRun.put("text", fullText);
                        fallbackRun.put("bold", false);
                        fallbackRun.put("italic", false);
                        runsOut.add(fallbackRun);
                    }

                    // Promote short all-bold standalone lines as section subheadings
                    boolean allRunsBold = runsOut.stream().allMatch(r -> Boolean.TRUE.equals(r.get("bold")));
                    if (!isHeading1 && !isHeading2 && allRunsBold && fullText.trim().length() <= 110) {
                        isHeading2 = true;
                    }

                    Map<String, Object> block = new LinkedHashMap<>();
                    block.put("type", isHeading1 ? "h1" : (isHeading2 ? "h2" : "p"));
                    block.put("text", fullText.trim());
                    block.put("runs", runsOut);
                    blocks.add(block);
                } else if (element instanceof XWPFTable table) {
                    List<List<String>> rowsOut = new ArrayList<>();
                    for (XWPFTableRow row : table.getRows()) {
                        List<String> cellsOut = new ArrayList<>();
                        for (XWPFTableCell cell : row.getTableCells()) {
                            cellsOut.add(cell.getText() != null ? cell.getText().trim() : "");
                        }
                        if (cellsOut.stream().anyMatch(c -> !c.isEmpty())) {
                            rowsOut.add(cellsOut);
                        }
                    }
                    if (!rowsOut.isEmpty()) {
                        Map<String, Object> tableBlock = new LinkedHashMap<>();
                        tableBlock.put("type", "table");
                        tableBlock.put("rows", rowsOut);
                        blocks.add(tableBlock);
                    }
                }
            }
        } catch (Exception ignored) {
            return blocks;
        }
        return blocks;
    }

    private static String safe(String val) {
        return val != null ? val : "";
    }
}
