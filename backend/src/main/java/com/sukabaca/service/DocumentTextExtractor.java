package com.sukabaca.service;

import com.sukabaca.model.Journal;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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
            if ("txt".equals(ext)) {
                return new String(bytes, StandardCharsets.UTF_8);
            }
            if ("pdf".equals(ext)) {
                try (PDDocument doc = Loader.loadPDF(bytes)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(doc);
                }
            }
            if ("docx".equals(ext)) {
                try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            }
        } catch (IOException ignored) {
            return null;
        }
        return null;
    }

    private static String safe(String val) {
        return val != null ? val : "";
    }
}
