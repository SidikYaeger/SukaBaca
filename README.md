# SukaBaca — Academic Repository & Research Discovery Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://adoptium.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-00758f.svg)](https://www.mysql.com/)

SukaBaca adalah platform repositori dan sistem manajemen jurnal ilmiah (*Research Journal Management & Discovery System*) modern yang dirancang untuk mempermudah civitas akademika—mahasiswa, dosen, dan peneliti—dalam menyimpan, mengarsipkan, menelusuri, dan mengekstrak intisari publikasi ilmiah secara cerdas dengan bantuan kecerdasan buatan (*AI-powered scientific summarization*).

---

## 1. Latar Belakang & Tujuan Proyek

Berdasarkan analisis kebutuhan akademis pada laporan perancangan antarmuka (*Laporan Tugas Besar Interaksi Manusia & Komputer (IMK) — SukaBaca*):

- **Problem Statement**: Peneliti dan mahasiswa sering kali berhadapan dengan puluhan hingga ratusan dokumen jurnal ilmiah. Membaca naskah panjang dan mengekstrak metodologi, temuan kunci, serta referensi membutuhkan beban kognitif (*cognitive load*) yang tinggi dan waktu yang panjang.
- **Tujuan SukaBaca**:
  1. Menghadirkan repositori jurnal digital terpusat yang aman, terstandarisasi, dan mudah diakses lintas perangkat.
  2. Mengurangi beban kognitif pengguna melalui sistem pencarian multi-kriteria (*Smart Discovery*) dan penyusunan intisari ilmiah otomatis berbasis AI.
  3. Membangun ruang telaah sejawat (*peer review & discussion*) untuk meningkatkan validitas dan kualitas riset antar akademisi.
  4. Menerapkan prinsip-prinsip desain antarmuka modern yang mematuhi hukum usabilitas (*Laws of UX*) dan 10 Heuristik Usabilitas Nielsen.

---

## 2. Fitur Utama Platform

### 🔍 Smart Filter & Publication Discovery
- **Multi-Criteria Search**: Pencarian cerdas berdasarkan kata kunci judul, topik penelitian, dan nama penulis.
- **Granular Filtering**: Filter rentang tahun publikasi (1 tahun, 5 tahun, 10 tahun terakhir, atau rentang kustom), ketersediaan abstrak/berkas penuh (*full-text*), serta bidang keilmuan (*Engineering, Computer Science, Medicine, Mathematics, dsb.*).
- **Ranking Metrics**: Pengurutan hasil berdasarkan relevansi (*views*), tanggal publikasi terbaru, rating pembaca, jumlah unduhan, dan abjad judul.

### 🤖 AI Literature Summarizer & Export
- **Semantic Extraction**: Ekstraksi otomatis struktur metodologi, temuan utama, dan kesimpulan jurnal menggunakan model inferensi bahasa alami (*NVIDIA / Spring AI*).
- **Executive PDF Export**: Unduh ringkasan hasil sintesis AI dalam format dokumen PDF resmi berstandar publikasi akademik.

### 💬 Peer Reviews & Discussions
- **Star Rating Evaluation**: Penilaian kualitas metodologi riset menggunakan skala bintang 1–5.
- **Constructive Discussions**: Kolom diskusi terbuka bagi rekan peneliti untuk memberikan catatan validitas, pertanyaan, atau evaluasi akademik.

### 📂 Scholar Workspace & Quota Tier
- **Drag-and-Drop Uploader**: Dukungan pengunggahan naskah jurnal dalam format PDF dan Microsoft Word (DOCX) dengan ekstraksi teks otomatis.
- **Personal Library**: Pengelolaan riwayat baca (*Reading History*) dan penanda buku (*Saved Bookmarks*).
- **Tier Quota Management**: Pengaturan kuota harian ekstraksi AI (Free Access vs. Ultra Academic Pro).

---

## 3. Prinsip Desain UI/UX (Laws of UX & Heuristik Nielsen)

Aplikasi SukaBaca dibangun dengan arsitektur visual **Sharp-Edged Architectural Design System** (`border-radius: 0px`, batas garis 1px tegas, dan elevasi bayangan offset geometris) yang mengimplementasikan prinsip-prinsip usabilitas:

| Prinsip UX / Heuristik | Penerapan dalam SukaBaca | Dampak pada Pengguna |
| :--- | :--- | :--- |
| **Fitts's Law** | Target tombol aksi primer, bilah pencarian, dan tag topik memiliki padding proporsional dan `cursor-pointer` yang jelas. | Mempercepat waktu eksekusi klik dan mengurangi kesalahan target pada desktop maupun mobile. |
| **Hick's Law** | Tata letak hero terpusat dengan hirarki bersih; opsi filter dikelompokkan secara teratur di sidebar. | Mengurangi waktu pengambilan keputusan dan meminimalkan distraksi visual saat menelusuri literatur. |
| **Jakob's Law** | Alur autentikasi familiar (Username & Kata Sandi), penekanan tombol `Enter` untuk mencari, dan tombol `Back` universal. | Pengguna langsung memahami cara kerja sistem tanpa perlu proses pembelajaran ulang. |
| **Doherty Threshold** | Respon micro-interactions cepat (120ms), animasi pengetikan topik real-time, dan *skeleton loading* saat memuat data. | Menghilangkan friksi menunggu dan memberikan umpan balik status sistem secara seketika (*instant feedback*). |
| **Miller's Law & Law of Proximity** | Informasi kartu publikasi dikelompokkan dalam blok metadata logis (Kategori, Tahun, Sitasi, Abstrak). | Pengguna dapat membaca cepat (*scanability*) puluhan artikel jurnal dengan nyaman. |
| **Aesthetic-Usability Effect** | Desain editorial presisi dengan palet akademik (`#FFFFFF`, `#F8FAFC`, `#0593C6`, `#D83995`) dan font *Plus Jakarta Sans* & *JetBrains Mono*. | Meningkatkan rasa percaya (*trustworthiness*) dan kenyamanan civitas akademika saat membaca. |

---

## 4. Arsitektur & Teknologi

```
SukaBaca-main/
├── backend/                  # Java 21 Spring Boot REST API
│   ├── src/main/java/com/sukabaca/
│   │   ├── config/           # CORS, Security, Environment Config
│   │   ├── controller/       # Auth, Journal, Review, Subscription Endpoints
│   │   ├── model/            # JPA Entities (Journal, User, Review, Subscription)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   └── service/          # AI Summarization, PDFBox Extraction, PDF Export
│   └── pom.xml               # Maven Dependencies & Plugins
├── frontend/                 # React 18 + Vite Single Page Application
│   ├── src/
│   │   ├── components/       # Sharp UI Primitives, Header, Drawer, JournalCard
│   │   ├── config/           # Centralized API Endpoints & Academic Constants
│   │   ├── context/          # AuthContext & SubscriptionContext Providers
│   │   ├── pages/            # Home, Search, ArticleDetail, Reader, Workspace, Auth
│   │   └── services/         # Modular HTTP API Clients (Auth, Journal, Review)
│   ├── tailwind.config.js    # Strict 0px Border-Radius & Academic Theme Palette
│   └── vite.config.js        # Vite Dev Server with Reverse Proxy to Port 8080
└── Laporan_IMK_Tubes_SukaBaca.pdf # Laporan Perancangan & Dokumentasi Desain IMK
```

### Tech Stack Details
- **Frontend**: React 18, Vite 6, Tailwind CSS 3, Lucide React Icons.
- **Backend**: Spring Boot 3.3.4, Java 21 LTS, Spring Data JPA, Apache PDFBox 3.0.3, Apache POI 5.3.0.
- **Database**: MySQL 8.0 / MariaDB.
- **Security & Tokens**: JWT Bearer Token, BCrypt Password Hashing.

---

## 5. Panduan Instalasi & Menjalankan Aplikasi Secara Lokal

### Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
1. **Node.js** (`>= 18.x`, disarankan `v20.x` LTS melalui `nvm`)
2. **Java Development Kit (JDK 21 LTS)** (contoh: Eclipse Adoptium Temurin 21)
3. **Apache Maven** (`>= 3.8.x`)
4. **MySQL Server** (port default `3306`)

---

### Langkah 1: Konfigurasi Basis Data MySQL
1. Buka MySQL Server / phpMyAdmin Anda.
2. Buat database baru bernama `sukabaca_db`:
   ```sql
   CREATE DATABASE IF NOT EXISTS sukabaca_db;
   ```
3. Sesuaikan konfigurasi kredensial pada [backend/src/main/resources/application.properties](file:///backend/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/sukabaca_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=
   ```

---

### Langkah 2: Menjalankan Backend (Spring Boot)
1. Buka terminal atau PowerShell di direktori `backend`:
   ```powershell
   cd backend
   ```
2. Jalankan server Spring Boot:
   ```powershell
   mvn clean spring-boot:run
   ```
3. Backend REST API akan aktif di `http://localhost:8080`.

---

### Langkah 3: Menjalankan Frontend (React + Vite)
1. Buka terminal baru di direktori `frontend`:
   ```powershell
   cd frontend
   ```
2. Pasang paket dependensi:
   ```powershell
   npm install
   ```
3. Jalankan server pengembangan Vite:
   ```powershell
   npm run dev
   ```
4. Buka peramban Anda di **[http://localhost:5173/](http://localhost:5173/)**.

---

## 6. Lisensi & Tim Pengembang
Dikembangkan sebagai bagian dari pemenuhan Tugas Besar Interaksi Manusia & Komputer (IMK) — SukaBaca Project 2026/2027.
Hak cipta dilindungi undang-undang.
