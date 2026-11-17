package com.sukabaca.service;

import com.sukabaca.model.Journal;
import com.sukabaca.model.Ringkasan;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.encoding.WinAnsiEncoding;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SummaryPdfService {

    private static final float MARGIN = 50f;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final float CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
    private static final float BOTTOM_MARGIN = 54f;

    private static final Pattern HEADING_PATTERN = Pattern.compile("^#{1,6}\\s+(.+)$");
    private static final Pattern RULE_PATTERN = Pattern.compile("^([-*_])\\1{2,}$");
    private static final Pattern BULLET_PATTERN = Pattern.compile("^[-*•]\\s+(.+)$");
    private static final Pattern BOLD_ONLY_PATTERN = Pattern.compile("^\\*\\*(.+?)\\*\\*:?$");

    private record TextRun(String text, boolean bold, boolean italic) {}

    /**
     * Generates a typeset A4 PDF document from the journal metadata and AI summary.
     */
    public byte[] generateSummaryPdf(Journal journal, Ringkasan ringkasan) throws IOException {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font italic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

            PdfCursor cursor = new PdfCursor(doc, regular, bold, italic);
            cursor.startPage();

            cursor.drawHeaderBanner("SUKABACA  |  RINGKASAN EKSEKUTIF AI");

            String title = safeText(journal.getTitle());
            cursor.drawWrappedParagraph(title, bold, 14f, 19f, 0f, 38, 16, 85);
            cursor.advance(4f);

            String year = journal.getPublishDate() != null ? journal.getPublishDate() : "-";
            String category = journal.getCategory() != null ? journal.getCategory() : "-";
            String author = journal.getAuthor() != null ? journal.getAuthor() : "-";
            cursor.drawWrappedParagraph(
                    safeText("Penulis: " + author + "   |   Tahun: " + year + "   |   Kategori: " + category),
                    regular, 9.5f, 13f, 0f, 85, 85, 99
            );

            String created = ringkasan.getTanggalDibuat() != null
                    ? ringkasan.getTanggalDibuat().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm"))
                    : "-";
            cursor.drawWrappedParagraph(
                    safeText("Model AI: " + ringkasan.getModel() + "   |   Dibuat: " + created),
                    italic, 9f, 13f, 0f, 107, 114, 128
            );

            cursor.advance(6f);
            cursor.drawRule();
            cursor.advance(10f);

            String rawBody = ringkasan.getIsi() != null ? ringkasan.getIsi() : "";
            renderBody(cursor, rawBody);

            cursor.finishFooters();
            doc.save(out);
            return out.toByteArray();
        }
    }

    private void renderBody(PdfCursor cursor, String rawBody) throws IOException {
        String normalized = rawBody.replace("\r\n", "\n").replace('\r', '\n');
        String[] lines = normalized.split("\n", -1);

        for (String rawLine : lines) {
            String trimmed = rawLine.trim();
            if (trimmed.isEmpty()) {
                cursor.advance(6f);
                continue;
            }
            if (RULE_PATTERN.matcher(trimmed).matches()) {
                cursor.advance(4f);
                cursor.drawRule();
                cursor.advance(6f);
                continue;
            }

            Matcher headingMatcher = HEADING_PATTERN.matcher(trimmed);
            if (headingMatcher.matches()) {
                String heading = stripInlineMarkdown(headingMatcher.group(1));
                cursor.advance(5f);
                cursor.drawWrappedParagraph(safeText(heading), cursor.bold, 11.5f, 15.5f, 0f, 76, 29, 149);
                cursor.advance(2f);
                continue;
            }

            Matcher boldOnlyMatcher = BOLD_ONLY_PATTERN.matcher(trimmed);
            if (boldOnlyMatcher.matches()) {
                String heading = stripInlineMarkdown(trimmed);
                cursor.advance(5f);
                cursor.drawWrappedParagraph(safeText(heading), cursor.bold, 11f, 15f, 0f, 76, 29, 149);
                cursor.advance(2f);
                continue;
            }

            Matcher bulletMatcher = BULLET_PATTERN.matcher(trimmed);
            if (bulletMatcher.matches()) {
                String itemText = bulletMatcher.group(1);
                List<TextRun> runs = parseInlineRuns(itemText);
                cursor.drawRichParagraph(runs, 10.5f, 15f, 14f, safeText("- "));
                cursor.advance(2f);
                continue;
            }

            List<TextRun> runs = parseInlineRuns(trimmed);
            cursor.drawRichParagraph(runs, 10.5f, 15.5f, 0f, null);
            cursor.advance(2f);
        }
    }

    private List<TextRun> parseInlineRuns(String text) {
        List<TextRun> runs = new ArrayList<>();
        String cleanInput = text.replace("`", "");
        Pattern inlinePattern = Pattern.compile("(\\*\\*[^*]+\\*\\*|\\*[^*]+\\*)");
        Matcher matcher = inlinePattern.matcher(cleanInput);
        int pos = 0;
        while (matcher.find()) {
            if (matcher.start() > pos) {
                runs.add(new TextRun(safeText(cleanInput.substring(pos, matcher.start())), false, false));
            }
            String token = matcher.group(1);
            if (token.startsWith("**") && token.endsWith("**") && token.length() > 4) {
                runs.add(new TextRun(safeText(token.substring(2, token.length() - 2)), true, false));
            } else if (token.startsWith("*") && token.endsWith("*") && token.length() > 2) {
                runs.add(new TextRun(safeText(token.substring(1, token.length() - 1)), false, true));
            } else {
                runs.add(new TextRun(safeText(token), false, false));
            }
            pos = matcher.end();
        }
        if (pos < cleanInput.length()) {
            runs.add(new TextRun(safeText(cleanInput.substring(pos)), false, false));
        }
        return runs;
    }

    private String stripInlineMarkdown(String text) {
        return text.replace("**", "").replace("__", "").replace("`", "").replaceAll("\\*([^*]+)\\*", "$1").trim();
    }

    private String safeText(String input) {
        if (input == null) return "";
        String replaced = input
                .replace('\u2014', '-')
                .replace('\u2013', '-')
                .replace('\u2018', '\'')
                .replace('\u2019', '\'')
                .replace('\u201c', '"')
                .replace('\u201d', '"')
                .replace('\u2022', '-')
                .replace('\u00a0', ' ');
        StringBuilder sb = new StringBuilder(replaced.length());
        for (int i = 0; i < replaced.length(); i++) {
            char c = replaced.charAt(i);
            if (c == '\n' || c == '\r' || c == '\t') {
                sb.append(' ');
                continue;
            }
            if (WinAnsiEncoding.INSTANCE.contains(c)) {
                sb.append(c);
            } else {
                sb.append(' ');
            }
        }
        return sb.toString();
    }

    private static final class PdfCursor {
        private final PDDocument doc;
        private final PDFont regular;
        private final PDFont bold;
        private final PDFont italic;
        private final List<PDPage> pages = new ArrayList<>();
        private PDPageContentStream cs;
        private float y;

        PdfCursor(PDDocument doc, PDFont regular, PDFont bold, PDFont italic) {
            this.doc = doc;
            this.regular = regular;
            this.bold = bold;
            this.italic = italic;
        }

        void startPage() throws IOException {
            if (cs != null) {
                cs.close();
            }
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            pages.add(page);
            cs = new PDPageContentStream(doc, page);
            y = PAGE_HEIGHT - MARGIN;
        }

        void ensureSpace(float needed) throws IOException {
            if (y - needed < BOTTOM_MARGIN) {
                startPage();
            }
        }

        void advance(float delta) throws IOException {
            y -= delta;
            if (y < BOTTOM_MARGIN) {
                startPage();
            }
        }

        void drawHeaderBanner(String label) throws IOException {
            float barH = 26f;
            ensureSpace(barH + 14f);
            cs.setNonStrokingColor(76 / 255f, 29 / 255f, 149 / 255f);
            cs.addRect(MARGIN, y - barH, CONTENT_WIDTH, barH);
            cs.fill();

            cs.beginText();
            cs.setNonStrokingColor(1f, 1f, 1f);
            cs.setFont(bold, 9.5f);
            cs.newLineAtOffset(MARGIN + 12f, y - 17f);
            cs.showText(label);
            cs.endText();

            y -= (barH + 14f);
        }

        void drawRule() throws IOException {
            ensureSpace(8f);
            cs.setStrokingColor(220 / 255f, 214 / 255f, 240 / 255f);
            cs.setLineWidth(0.8f);
            cs.moveTo(MARGIN, y);
            cs.lineTo(PAGE_WIDTH - MARGIN, y);
            cs.stroke();
        }

        void drawWrappedParagraph(String text, PDFont font, float fontSize, float lineHeight,
                                  float indent, int r, int g, int b) throws IOException {
            float maxWidth = CONTENT_WIDTH - indent;
            List<String> wrapped = wrapPlainText(text, font, fontSize, maxWidth);
            for (String line : wrapped) {
                ensureSpace(lineHeight);
                cs.beginText();
                cs.setNonStrokingColor(r / 255f, g / 255f, b / 255f);
                cs.setFont(font, fontSize);
                cs.newLineAtOffset(MARGIN + indent, y);
                cs.showText(line);
                cs.endText();
                y -= lineHeight;
            }
        }

        void drawRichParagraph(List<TextRun> runs, float fontSize, float lineHeight,
                               float indent, String bulletPrefix) throws IOException {
            List<WordToken> tokens = new ArrayList<>();
            for (TextRun run : runs) {
                String[] parts = run.text().split("(?<=\\s)|(?=\\s)");
                for (String p : parts) {
                    if (!p.isEmpty()) {
                        PDFont f = run.bold() ? bold : (run.italic() ? italic : regular);
                        tokens.add(new WordToken(p, f));
                    }
                }
            }

            float maxWidth = CONTENT_WIDTH - indent;
            List<List<WordToken>> lines = new ArrayList<>();
            List<WordToken> current = new ArrayList<>();
            float currentW = 0f;

            for (WordToken tok : tokens) {
                if (current.isEmpty() && tok.text().isBlank()) {
                    continue;
                }
                float tokW = tok.font().getStringWidth(tok.text()) / 1000f * fontSize;
                if (!current.isEmpty() && currentW + tokW > maxWidth) {
                    lines.add(current);
                    current = new ArrayList<>();
                    currentW = 0f;
                    if (tok.text().isBlank()) {
                        continue;
                    }
                }
                current.add(tok);
                currentW += tokW;
            }
            if (!current.isEmpty()) {
                lines.add(current);
            }

            for (int i = 0; i < lines.size(); i++) {
                ensureSpace(lineHeight);
                if (i == 0 && bulletPrefix != null) {
                    cs.beginText();
                    cs.setNonStrokingColor(76 / 255f, 29 / 255f, 149 / 255f);
                    cs.setFont(bold, fontSize);
                    cs.newLineAtOffset(MARGIN + 3f, y);
                    cs.showText(bulletPrefix);
                    cs.endText();
                }
                float x = MARGIN + indent;
                for (WordToken tok : lines.get(i)) {
                    cs.beginText();
                    cs.setNonStrokingColor(31 / 255f, 41 / 255f, 55 / 255f);
                    cs.setFont(tok.font(), fontSize);
                    cs.newLineAtOffset(x, y);
                    cs.showText(tok.text());
                    cs.endText();
                    x += tok.font().getStringWidth(tok.text()) / 1000f * fontSize;
                }
                y -= lineHeight;
            }
        }

        void finishFooters() throws IOException {
            if (cs != null) {
                cs.close();
                cs = null;
            }
            int total = pages.size();
            for (int i = 0; i < total; i++) {
                try (PDPageContentStream footerStream = new PDPageContentStream(
                        doc, pages.get(i), PDPageContentStream.AppendMode.APPEND, true, true)) {
                    footerStream.beginText();
                    footerStream.setNonStrokingColor(107 / 255f, 114 / 255f, 128 / 255f);
                    footerStream.setFont(regular, 8.5f);
                    footerStream.newLineAtOffset(MARGIN, 28f);
                    footerStream.showText("SukaBaca Academic Summary   -   Halaman " + (i + 1) + " dari " + total);
                    footerStream.endText();
                }
            }
        }

        private List<String> wrapPlainText(String text, PDFont font, float fontSize, float maxWidth) throws IOException {
            List<String> lines = new ArrayList<>();
            if (text.isEmpty()) {
                return lines;
            }
            String[] words = text.split("\\s+");
            StringBuilder line = new StringBuilder();
            for (String w : words) {
                String candidate = line.isEmpty() ? w : line + " " + w;
                float width = font.getStringWidth(candidate) / 1000f * fontSize;
                if (!line.isEmpty() && width > maxWidth) {
                    lines.add(line.toString());
                    line = new StringBuilder(w);
                } else {
                    line = new StringBuilder(candidate);
                }
            }
            if (!line.isEmpty()) {
                lines.add(line.toString());
            }
            return lines;
        }

        private record WordToken(String text, PDFont font) {}
    }
}
