package com.sukabaca.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class EnvLoader {

    private static volatile Map<String, String> fileEnv;

    private EnvLoader() {}

    public static String get(String key) {
        String sys = System.getenv(key);
        if (sys != null && !sys.isBlank()) {
            return sys.trim();
        }
        Map<String, String> loaded = getFileEnv();
        String val = loaded.get(key);
        return val != null && !val.isBlank() ? val.trim() : null;
    }

    private static Map<String, String> getFileEnv() {
        if (fileEnv != null) {
            return fileEnv;
        }
        Map<String, String> map = new HashMap<>();
        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get("../.env"),
                Paths.get("C:/IMPAL/.env")
        );
        for (Path p : candidates) {
            if (Files.isRegularFile(p)) {
                try {
                    for (String line : Files.readAllLines(p, StandardCharsets.UTF_8)) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int eq = trimmed.indexOf('=');
                        if (eq > 0) {
                            String k = trimmed.substring(0, eq).trim();
                            String v = trimmed.substring(eq + 1).trim();
                            if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
                                v = v.substring(1, v.length() - 1);
                            }
                            map.putIfAbsent(k, v);
                        }
                    }
                } catch (IOException ignored) {}
            }
        }
        fileEnv = map;
        return map;
    }
}
