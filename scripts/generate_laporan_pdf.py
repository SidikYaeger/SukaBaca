import os
import base64
from playwright.sync_api import sync_playwright

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs"))
SCREENSHOTS_DIR = os.path.join(DOCS_DIR, "screenshots")
PDF_OUTPUT = os.path.join(DOCS_DIR, "Laporan_IMK_Tubes_SukaBaca.pdf")

def get_base64_img(filename):
    path = os.path.join(SCREENSHOTS_DIR, filename)
    if not os.path.exists(path):
        alt_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", filename))
        if os.path.exists(alt_path):
            path = alt_path
        else:
            return ""
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
        return f"data:image/png;base64,{data}"

def generate_pdf():
    print("Generating Academic PDF Report with perfected pagination...")
    
    # Load base64 images
    logo_b64 = get_base64_img("logo.png")
    login_empty_b64 = get_base64_img("02_login_empty_mobile.png")
    login_filled_b64 = get_base64_img("02b_login_filled_mobile.png")
    register_b64 = get_base64_img("03_register_mobile.png")
    upload_hub_b64 = get_base64_img("04_upload_hub_mobile.png")
    upload_drawer_b64 = get_base64_img("04b_upload_drawer_mobile.png")
    upload_form_b64 = get_base64_img("05_upload_form_mobile.png")
    upload_modal1_b64 = get_base64_img("05b_upload_modal_confirm_mobile.png")
    search_b64 = get_base64_img("06_search_mobile.png")
    search_modal_b64 = get_base64_img("06b_search_modal_confirm_mobile.png")
    history_b64 = get_base64_img("07_history_mobile.png")
    article_b64 = get_base64_img("08_article_detail_mobile.png")
    desktop_login_b64 = get_base64_img("10_desktop_login.png")
    desktop_upload_b64 = get_base64_img("11_desktop_upload_hub.png")
    desktop_search_b64 = get_base64_img("12_desktop_search.png")
    desktop_history_b64 = get_base64_img("13_desktop_history.png")
    desktop_home_b64 = get_base64_img("14_desktop_home.png")

    html_content = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Tugas Besar IMK - SukaBaca</title>
<style>
  @page {{
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-right {{
      content: counter(page);
      font-size: 8.5pt;
      color: #666;
    }}
  }}
  
  body {{
    font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
    color: #1f2937;
    line-height: 1.45;
    font-size: 9.2pt;
    margin: 0;
    padding: 0;
  }}

  .cover-page {{
    text-align: center;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 88vh;
  }}

  .cover-title {{
    font-size: 19pt;
    font-weight: 800;
    color: #111827;
    margin-top: 14px;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }}

  .cover-subtitle {{
    font-size: 12.5pt;
    font-weight: 600;
    color: #6b21a8;
    margin-bottom: 20px;
  }}

  .badge {{
    display: inline-block;
    padding: 3px 12px;
    background: #f3e8ff;
    color: #7e22ce;
    font-weight: 700;
    font-size: 8.5pt;
    border-radius: 9999px;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }}

  .logo-cover {{
    max-width: 130px;
    height: auto;
    margin: 0 auto 16px auto;
  }}

  .meta-box {{
    margin: 30px auto;
    padding: 16px 20px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f9fafb;
    max-width: 400px;
    text-align: left;
    font-size: 9pt;
  }}

  .meta-row {{
    display: flex;
    margin-bottom: 6px;
  }}
  .meta-label {{
    width: 140px;
    font-weight: 600;
    color: #4b5563;
  }}
  .meta-val {{
    font-weight: 700;
    color: #111827;
  }}

  h1 {{
    font-size: 14pt;
    font-weight: 800;
    color: #111827;
    border-bottom: 2px solid #7e22ce;
    padding-bottom: 5px;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }}

  h2 {{
    font-size: 11.5pt;
    font-weight: 700;
    color: #4c1d95;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }}

  h3 {{
    font-size: 10pt;
    font-weight: 700;
    color: #1f2937;
    margin-top: 10px;
    margin-bottom: 5px;
    page-break-after: avoid;
  }}

  p, li {{
    font-size: 9pt;
    color: #374151;
    text-align: justify;
    margin-top: 0;
    margin-bottom: 6px;
  }}

  .page-break {{
    page-break-after: always;
  }}

  .screenshot-grid {{
    display: flex;
    gap: 12px;
    margin: 8px 0 10px 0;
    justify-content: center;
    align-items: flex-start;
    page-break-inside: avoid;
  }}

  .screenshot-card {{
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 6px;
    background: #ffffff;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }}

  .screenshot-card img {{
    max-width: 100%;
    max-height: 195px;
    object-fit: contain;
    border-radius: 5px;
    display: block;
    margin: 0 auto;
  }}

  .screenshot-caption {{
    font-size: 7.5pt;
    color: #4b5563;
    font-weight: 600;
    margin-top: 4px;
  }}

  .code-block {{
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 7.2pt;
    line-height: 1.35;
    overflow-x: hidden;
    margin: 6px 0 10px 0;
    border: 1px solid #313244;
    page-break-inside: avoid;
  }}

  .code-keyword {{ color: #cba6f7; font-weight: bold; }}
  .code-fn {{ color: #89b4fa; }}
  .code-str {{ color: #a6e3a1; }}
  .code-comment {{ color: #6c7086; font-style: italic; }}
  .code-tag {{ color: #f38ba8; }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 8pt;
    page-break-inside: avoid;
  }}
  th, td {{
    border: 1px solid #d1d5db;
    padding: 6px 8px;
    text-align: left;
  }}
  th {{
    background: #f3f4f6;
    font-weight: 700;
    color: #111827;
  }}

  .callout {{
    background: #eff6ff;
    border-left: 3px solid #3b82f6;
    padding: 8px 12px;
    border-radius: 0 8px 8px 0;
    margin: 10px 0;
    font-size: 8.8pt;
  }}
</style>
</head>
<body>

<!-- HALAMAN JUDUL -->
<div class="cover-page">
  <div class="badge">Tugas Konversi Desain IMK ke Kode Program</div>
  <img src="{logo_b64}" class="logo-cover" alt="SukaBaca Logo">
  <div class="cover-title">LAPORAN IMPLEMENTASI DESAIN IMK KE KODE</div>
  <div class="cover-subtitle">Aplikasi Manajemen & Penyimpanan Jurnal Riset "SukaBaca"</div>
  
  <p style="text-align: center; color: #4b5563; max-width: 460px; margin: 0 auto; font-size: 9pt;">
    Laporan implementasi perancangan antarmuka pengguna dari mockup desain Figma ke dalam kode antarmuka React.js dengan visualisasi responsif mobile dan desktop.
  </p>

  <div class="meta-box">
    <div class="meta-row"><span class="meta-label">Mata Kuliah:</span><span class="meta-val">Interaksi Manusia & Komputer (IMK)</span></div>
    <div class="meta-row"><span class="meta-label">Tugas:</span><span class="meta-val">Tugas Besar (Tubes) - Konversi IMK</span></div>
    <div class="meta-row"><span class="meta-label">Platform UI:</span><span class="meta-val">React.js, Tailwind CSS, Lucide Icons</span></div>
    <div class="meta-row"><span class="meta-label">Arsitektur Target:</span><span class="meta-val">React Frontend, Spring Boot, MySQL</span></div>
    <div class="meta-row"><span class="meta-label">Waktu Pengumpulan:</span><span class="meta-val">Sebelum Perkuliahan Minggu Depan (LMS)</span></div>
  </div>

  <div style="font-size: 8.5pt; color: #6b7280;">
    Tahun Akademik 2026/2027 • Departemen Informatika
  </div>
</div>

<!-- BAB I: PENDAHULUAN -->
<h1>BAB I: PENDAHULUAN & KONSEP APLIKASI</h1>

<h2>1.1 Latar Belakang & Deskripsi Masalah</h2>
<p>
  Di lingkungan riset dan akademis, mahasiswa maupun peneliti sering kali berhadapan dengan puluhan hingga ratusan dokumen jurnal ilmiah. Proses membaca, mengelola, mengarsipkan, serta mengekstrak inti sari dari setiap jurnal membutuhkan waktu dan beban kognitif yang sangat tinggi. Seringkali pengguna kesulitan menemukan kembali jurnal yang pernah dianalisis atau membutuhkan waktu lama hanya untuk membaca pendahuluan dan metodologi panjang.
</p>

<h2>1.2 Konsep Solusi Aplikasi: SukaBaca</h2>
<p>
  <strong>SukaBaca</strong> dirancang sebagai aplikasi terpadu manajemen jurnal penelitian (<em>Research Journal Management System</em>) yang berfokus pada kemudahan penyimpanan, pencarian instan, dan penyiapan alur peringkasan otomatis berbasis kecerdasan buatan (<em>AI Automatic Summarization</em>). 
</p>
<div class="callout">
  <strong>Visi Desain IMK SukaBaca:</strong> Mengedepankan antarmuka mobile-first yang bersih, modern, dan intuitif sehingga mahasiswa maupun akademisi dapat mengunggah jurnal, menelusuri artikel riset, membaca ringkasan bernilai tinggi, dan mengunduh berkas dengan sedikit klik dan friksi kognitif minimal.
</div>

<h2>1.3 Alur Konversi Desain ke Kode Menggunakan AI</h2>
<p>
  Proses konversi desain mockup (dari direktori <code>riil/Untitled (3)</code>) ke kode komponen React dilakukan dengan prinsip:
</p>
<ul>
  <li><strong>Fidelitas Visual Tinggi (Pixel-Close Matching):</strong> Menjaga proporsi, radius sudut card (28px - 32px), dropzone dashed, dan warna gradien ungu-biru khas SukaBaca (<code>linear-gradient(90deg, #7da5d9, #b83c9c)</code>).</li>
  <li><strong>Kesesuaian Fungsionalitas Nama Berkas:</strong> Berkas <code>login-isi.png</code>, <code>register-isi.png</code>, <code>upload-2.png</code> (drawer), <code>upload-extend-2.png</code> & <code>upload-extend-3.png</code> (dialog konfirmasi dan hasil ringkas) diimplementasikan secara interaktif dengan state management React.</li>
  <li><strong>Adaptasi Responsif:</strong> Mempertahankan bingkai mockup mobile (390px) serta menyediakan tampilan desktop yang proporsional.</li>
</ul>

<div class="page-break"></div>

<!-- BAB II: TAMPILAN 3 IMK BESERTA KODE DAN SCREENSHOT -->
<h1>BAB II: TIGA INTERFASE IMK UTAMA, KODE & SCREENSHOT EKSEKUSI</h1>
<p>
  Sesuai dengan ketentuan tugas (menampilkan 3 antarmuka dari seluruh IMK aplikasi Tubes beserta kode dan screenshot hasil eksekusinya), berikut adalah 3 modul antarmuka terpilih:
</p>

<!-- IMK 1: LOGIN & REGISTRASI -->
<h2>2.1 Antarmuka 1: Modul Autentikasi Pengguna (Login & Registrasi)</h2>
<p>
  <strong>Deskripsi Desain & Fungsi:</strong> Antarmuka login dan registrasi menggunakan struktur <em>centered card</em> dengan radius sudut melengkung halus di atas latar belakang netral. Menampilkan logo resmi SukaBaca di bagian atas, input teks terstruktur dengan placeholder deskriptif, tombol aksi dengan gradien warna biru-ke-magenta, dan teks navigasi antar-halaman autentikasi.
</p>

<h3>A. Screenshot Hasil Eksekusi Nyata:</h3>
<div class="screenshot-grid">
  <div class="screenshot-card">
    <img src="{login_empty_b64}" alt="Login Kosong">
    <div class="screenshot-caption">Gambar 2.1: Login State Kosong (login.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{login_filled_b64}" alt="Login Terisi">
    <div class="screenshot-caption">Gambar 2.2: Login State Terisi (login-isi.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{register_b64}" alt="Registrasi">
    <div class="screenshot-caption">Gambar 2.3: Registrasi Akun (register.png)</div>
  </div>
</div>

<h3>B. Potongan Kode Implementasi Utama (LoginPage.jsx):</h3>
<div class="code-block">
<span class="code-comment">// frontend/src/pages/LoginPage.jsx - Implementasi Autentikasi SukaBaca</span><br>
<span class="code-keyword">export default function</span> <span class="code-fn">LoginPage</span>({{ onLoginSuccess }}) {{<br>
&nbsp;&nbsp;<span class="code-keyword">const</span> [username, setUsername] = <span class="code-fn">useState</span>(<span class="code-str">''</span>);<br>
&nbsp;&nbsp;<span class="code-keyword">const</span> [password, setPassword] = <span class="code-fn">useState</span>(<span class="code-str">''</span>);<br>
&nbsp;&nbsp;<span class="code-keyword">return</span> (<br>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">div</span> className=<span class="code-str">"flex-1 flex flex-col justify-center items-center bg-[#ededed] p-6"</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">div</span> className=<span class="code-str">"w-full max-w-[360px] bg-white rounded-[32px] p-8 shadow-sm flex flex-col items-center"</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">img</span> src=<span class="code-str">"/logo.png"</span> alt=<span class="code-str">"SukaBaca Logo"</span> className=<span class="code-str">"w-36 h-auto mb-6"</span> /&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">form</span> onSubmit={{handleLogin}} className=<span class="code-str">"w-full space-y-4"</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">input</span> type=<span class="code-str">"text"</span> value={{username}} placeholder=<span class="code-str">"Enter your username"</span> className=<span class="code-str">"w-full px-3.5 py-2.5 rounded-xl border border-gray-400"</span> /&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">input</span> type=<span class="code-str">"password"</span> value={{password}} placeholder=<span class="code-str">"Enter your password"</span> className=<span class="code-str">"w-full px-3.5 py-2.5 rounded-xl border border-gray-400"</span> /&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">button</span> type=<span class="code-str">"submit"</span> style={{{{ background: <span class="code-str">'linear-gradient(90deg, #7da5d9, #b83c9c)'</span> }}}} className=<span class="code-str">"w-full py-2.5 rounded-xl text-white font-semibold text-xs border border-gray-800 shadow-sm"</span>&gt;Login&lt;/<span class="code-tag">button</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span class="code-tag">form</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">p</span> className=<span class="code-str">"mt-8 text-xs text-gray-900"</span>&gt;Don't have an account? &lt;<span class="code-tag">Link</span> to=<span class="code-str">"/register"</span> className=<span class="code-str">"font-bold underline"</span>&gt;Register here&lt;/<span class="code-tag">Link</span>&gt;&lt;/<span class="code-tag">p</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span class="code-tag">div</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span class="code-tag">div</span>&gt;<br>
&nbsp;&nbsp;);<br>
}}
</div>

<div class="page-break"></div>

<!-- IMK 2: UPLOAD HUB & MODAL PERINGKASAN -->
<h2>2.2 Antarmuka 2: Modul Dashboard Utama & Pengunggahan Jurnal (Upload Hub & Form)</h2>
<p>
  <strong>Deskripsi Desain & Fungsi:</strong> Berperan sebagai pusat kendali pengguna setelah login. Menampilkan logo program, slogan, dua tombol aksi cepat (<em>Upload Journal</em> bergradien dan <em>Search Journal</em> bergaris tepi putih-ungu), drawer menu samping geser, area <em>dashed dropzone</em> unggah berkas, serta dialog konfirmasi interaktif peringkasan jurnal dengan tombol "Tidak" (merah) dan "Ya" (hijau).
</p>

<h3>A. Screenshot Hasil Eksekusi Nyata:</h3>
<div class="screenshot-grid">
  <div class="screenshot-card">
    <img src="{upload_hub_b64}" alt="Upload Hub">
    <div class="screenshot-caption">Gambar 2.4: Upload Hub (upload.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{upload_drawer_b64}" alt="Sidebar Drawer">
    <div class="screenshot-caption">Gambar 2.5: Sidebar Drawer (upload-2.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{upload_form_b64}" alt="Upload Form">
    <div class="screenshot-caption">Gambar 2.6: Form Dropzone (upload-extend.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{upload_modal1_b64}" alt="Modal Konfirmasi">
    <div class="screenshot-caption">Gambar 2.7: Dialog Ringkas (upload-extend-2)</div>
  </div>
</div>

<h3>B. Potongan Kode Implementasi Utama (UploadFormPage.jsx & Modal):</h3>
<div class="code-block">
<span class="code-comment">// frontend/src/pages/UploadFormPage.jsx - Dropzone & Alur Peringkasan AI</span><br>
&lt;<span class="code-tag">div</span> className=<span class="code-str">"border-2 border-dashed border-[#b8c2d6] rounded-2xl py-12 px-4 text-center cursor-pointer"</span>&gt;<br>
&nbsp;&nbsp;&lt;<span class="code-tag">Upload</span> size={{56}} className=<span class="code-str">"text-gray-400 mx-auto mb-3"</span> /&gt;<br>
&nbsp;&nbsp;&lt;<span class="code-tag">p</span> className=<span class="code-str">"text-xs font-semibold text-gray-700"</span>&gt;Click to upload your journal file&lt;/<span class="code-tag">p</span>&gt;<br>
&nbsp;&nbsp;&lt;<span class="code-tag">p</span> className=<span class="code-str">"text-[11px] text-gray-400"</span>&gt;Supports .txt, .doc, and other text formats&lt;/<span class="code-tag">p</span>&gt;<br>
&lt;/<span class="code-tag">div</span>&gt;<br>
&lt;<span class="code-tag">button</span> onClick={{() =&gt; setModalStep(1)}} style={{{{ background: <span class="code-str">'linear-gradient(90deg, #7da5d9, #b83c9c)'</span> }}}}<br>
&nbsp;&nbsp;className=<span class="code-str">"mt-6 py-3 px-8 rounded-xl text-white font-bold text-xs shadow-md border border-gray-800"</span>&gt;<br>
&nbsp;&nbsp;Upload Journal<br>
&lt;/<span class="code-tag">button</span>&gt;<br>
<span class="code-comment">// Modal Dialog Reusable</span><br>
&lt;<span class="code-tag">ModalConfirm</span> isOpen={{modalStep === 1}} title={{`Apakah anda ingin meringkas &lt;${{journalName}}&gt;?`}}<br>
&nbsp;&nbsp;onConfirm={{() =&gt; setModalStep(2)}} onCancel={{() =&gt; setModalStep(0)}} confirmText=<span class="code-str">"Ya"</span> cancelText=<span class="code-str">"Tidak"</span> /&gt;
</div>

<div class="page-break"></div>

<!-- IMK 3: PENCARIAN & RIWAYAT JURNAL -->
<h2>2.3 Antarmuka 3: Modul Pencarian & Riwayat Jurnal (Search & History Grid)</h2>
<p>
  <strong>Deskripsi Desain & Fungsi:</strong> Modul pencarian (<code>search.png</code>) menghadirkan <em>search bar pill</em> hitam elegan dengan icon kaca pembesar dan daftar kartu jurnal yang memuat judul, cuplikan isi, nama penulis (Adira), dan tanggal. Modul riwayat (<code>history.png</code>) menyajikan kisi 2x2 kartu jurnal visual berwarna warni dengan icon unduh serta tahun terbit (2025). Mengklik tombol unduh atau artikel akan membuka dialog konfirmasi dan menampilkan halaman pembaca artikel (<code>tampil.png</code>).
</p>

<h3>A. Screenshot Hasil Eksekusi Nyata:</h3>
<div class="screenshot-grid">
  <div class="screenshot-card">
    <img src="{search_b64}" alt="Pencarian Jurnal">
    <div class="screenshot-caption">Gambar 2.8: Pencarian (search.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{search_modal_b64}" alt="Dialog Konfirmasi Cari">
    <div class="screenshot-caption">Gambar 2.9: Dialog Ringkas (search-2.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{history_b64}" alt="Riwayat Jurnal">
    <div class="screenshot-caption">Gambar 2.10: Riwayat Grid (history.png)</div>
  </div>
  <div class="screenshot-card">
    <img src="{article_b64}" alt="Detail Pembaca">
    <div class="screenshot-caption">Gambar 2.11: Pembaca Jurnal (tampil.png)</div>
  </div>
</div>

<h3>B. Potongan Kode Implementasi Utama (SearchPage.jsx & HistoryPage.jsx):</h3>
<div class="code-block">
<span class="code-comment">// frontend/src/pages/SearchPage.jsx - Search Bar Pill & Card List</span><br>
&lt;<span class="code-tag">div</span> className=<span class="code-str">"w-full max-w-sm bg-black rounded-full px-4 py-2 flex items-center gap-2"</span>&gt;<br>
&nbsp;&nbsp;&lt;<span class="code-tag">Search</span> size={{18}} className=<span class="code-str">"text-gray-300"</span> /&gt;<br>
&nbsp;&nbsp;&lt;<span class="code-tag">input</span> type=<span class="code-str">"text"</span> value={{query}} onChange={{(e) =&gt; setQuery(e.target.value)}} placeholder=<span class="code-str">"Search by title"</span> className=<span class="code-str">"bg-transparent text-white placeholder-gray-400 text-xs outline-none w-full"</span> /&gt;<br>
&lt;/<span class="code-tag">div</span>&gt;<br>
<span class="code-comment">// frontend/src/pages/HistoryPage.jsx - Grid 2x2 Jurnal A-D</span><br>
&lt;<span class="code-tag">div</span> className=<span class="code-str">"grid grid-cols-2 gap-4 mt-2"</span>&gt;<br>
&nbsp;&nbsp;{{historyItems.map((item) =&gt; (<br>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">div</span> key={{item.id}} className=<span class="code-str">"flex flex-col"</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">div</span> onClick={{() =&gt; handleDownloadClick(item)}} className={{`w-full aspect-[4/3] rounded-2xl ${{item.bgStyle}}`}}&gt;{{item.pattern}}&lt;/<span class="code-tag">div</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="code-tag">div</span> className=<span class="code-str">"flex items-center justify-between mt-2 px-1"</span>&gt;&lt;<span class="code-tag">span</span> className=<span class="code-str">"font-bold text-xs"</span>&gt;{{item.title}}&lt;/<span class="code-tag">span</span>&gt;&lt;<span class="code-tag">button</span> onClick={{() =&gt; handleDownloadClick(item)}}&gt;&lt;<span class="code-tag">Download</span> size={{16}} /&gt;&lt;/<span class="code-tag">button</span>&gt;&lt;/<span class="code-tag">div</span>&gt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span class="code-tag">div</span>&gt;<br>
&nbsp;&nbsp;))}}<br>
&lt;/<span class="code-tag">div</span>&gt;
</div>

<div class="page-break"></div>

<!-- TAMPILAN RESPONSIVE DESKTOP -->
<h2>2.4 Adaptasi Desain untuk Tampilan Desktop</h2>
<p>
  Sesuai dengan arahan penugasan (desain difokuskan untuk mobile namun disesuaikan agar proporsional pada tampilan desktop), sistem menyediakan mekanisme <em>device frame</em> yang dapat diaktifkan secara responsif. Berikut adalah hasil eksekusi aplikasi pada resolusi layar desktop:
</p>

<div class="screenshot-grid">
  <div class="screenshot-card" style="flex: 1;">
    <img src="{desktop_home_b64}" alt="Desktop Home" style="max-height: 165px;">
    <div class="screenshot-caption">Gambar 2.12: Landing Page pada Tampilan Desktop</div>
  </div>
  <div class="screenshot-card" style="flex: 1;">
    <img src="{desktop_upload_b64}" alt="Desktop Upload" style="max-height: 165px;">
    <div class="screenshot-caption">Gambar 2.13: Upload Hub pada Tampilan Desktop</div>
  </div>
</div>
<div class="screenshot-grid">
  <div class="screenshot-card" style="flex: 1;">
    <img src="{desktop_search_b64}" alt="Desktop Search" style="max-height: 165px;">
    <div class="screenshot-caption">Gambar 2.14: Pencarian Jurnal pada Tampilan Desktop</div>
  </div>
  <div class="screenshot-card" style="flex: 1;">
    <img src="{desktop_history_b64}" alt="Desktop History" style="max-height: 165px;">
    <div class="screenshot-caption">Gambar 2.15: Riwayat Jurnal pada Tampilan Desktop</div>
  </div>
</div>

<!-- BAB III: EVALUASI PRINSIP USABILITAS IMK -->
<h1>BAB III: EVALUASI PRINSIP USABILITAS IMK (HEURISTIK NIELSEN)</h1>
<p>
  Desain antarmuka SukaBaca yang telah dikonversi ke kode diuji dan dievaluasi terhadap prinsip-prinsip dasar <em>Human-Computer Interaction</em> (HCI) dan 10 Heuristik Usabilitas Nielsen:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Prinsip Heuristik</th>
      <th style="width: 42%;">Penerapan pada Desain SukaBaca</th>
      <th style="width: 33%;">Dampak Usabilitas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Visibility of System Status</strong></td>
      <td>Indikator nama berkas saat file dipilih pada dropzone, modal konfirmasi peringkasan yang menginformasikan status jurnal (<em>"Jurnal sudah teringkas"</em>).</td>
      <td>Pengguna selalu mengetahui fase proses yang sedang berlangsung tanpa rasa bimbang.</td>
    </tr>
    <tr>
      <td><strong>2. Match Between System & Real World</strong></td>
      <td>Penggunaan metafora kacamata & buku pada logo, icon unduh, icon kalender, serta bahasa Indonesia yang natural (<em>"Apakah anda ingin meringkas...?"</em>).</td>
      <td>Mempercepat adopsi karena selaras dengan model mental mahasiswa dan akademisi.</td>
    </tr>
    <tr>
      <td><strong>3. User Control & Freedom</strong></td>
      <td>Tombol "Back" universal pada setiap halaman detail, opsi "Tidak" pada dialog modal untuk membatalkan proses, dan tombol Close (X) pada drawer.</td>
      <td>Memberikan rasa aman saat salah klik (<em>emergency exit</em>) tanpa merusak sesi.</td>
    </tr>
    <tr>
      <td><strong>4. Consistency & Standards</strong></td>
      <td>Konsistensi gradien ungu-biru SukaBaca pada seluruh tombol aksi primer, radius sudut (28px - 32px), dan letak tombol hamburger di kiri atas.</td>
      <td>Mengurangi beban kognitif untuk mempelajari antarmuka baru.</td>
    </tr>
    <tr>
      <td><strong>5. Error Prevention & Recognition</strong></td>
      <td>Validasi input login & registrasi dengan pesan peringatan jelas jika field kosong atau konfirmasi password tidak cocok.</td>
      <td>Mencegah kegagalan pengiriman formulir sebelum diproses.</td>
    </tr>
    <tr>
      <td><strong>6. Flexibility & Efficiency of Use</strong></td>
      <td>Tersedianya dua tombol aksi cepat [Upload Journal] dan [Search Journal] tepat di tengah dashboard, serta navigasi pintas drawer.</td>
      <td>Pengguna baru maupun berpengalaman dapat menyelesaikan tugas dalam &lt; 2 interaksi.</td>
    </tr>
  </tbody>
</table>

<!-- BAB IV: KESIMPULAN -->
<h1>BAB IV: KESIMPULAN & REKOMENDASI TAHAP LANJUTAN</h1>

<h2>4.1 Kesimpulan</h2>
<ol>
  <li><strong>Keberhasilan Konversi Desain ke Kode:</strong> Seluruh 8 layar desain IMK (mulai dari Landing Page, Login, Registrasi, Upload Hub, Dropzone Form, Modal Peringkasan, Pencarian Jurnal, Riwayat Jurnal, hingga Pembaca Artikel) berhasil dikonversi ke kode React.js dengan akurasi visual yang sangat tinggi terhadap mockup asli.</li>
  <li><strong>Pemenuhan Persyaratan Tugas:</strong> Tiga antarmuka utama (Modul Autentikasi, Modul Upload Hub & Peringkasan, serta Modul Pencarian & Riwayat) telah didokumentasikan lengkap dengan cuplikan kode sumber dan tangkapan layar eksekusi nyata pada lingkungan browser.</li>
  <li><strong>Kesiapan Integrasi:</strong> Struktur komponen antarmuka telah dimodularisasi dengan baik, siap untuk disambungkan ke REST API Spring Boot dan basis data MySQL yang telah disiapkan pada tahap pengembangan selanjutnya.</li>
</ol>

<h2>4.2 Rekomendasi Tahap Lanjutan</h2>
<p>
  Pada fase berikutnya, endpoint Spring Boot (<code>/api/auth/login</code>, <code>/api/journals/upload</code>, dan <code>/api/journals/summarize</code>) dapat diaktifkan bersama model AI peringkasan teks (seperti Gemini Flash API) untuk menghasilkan ringkasan otomatis dinamis sesuai format yang telah dirancang pada halaman <code>tampil.png</code>.
</p>

<div style="margin-top: 30px; text-align: center; border-top: 1px solid #e5e7eb; pt-3; font-size: 8pt; color: #9ca3af;">
  Dokumen ini dibuat otomatis sebagai bagian dari pemenuhan Tugas Besar IMK • SukaBaca Project 2026
</div>

</body>
</html>
"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_content, wait_until="networkidle")
        
        # Print to PDF
        page.pdf(
            path=PDF_OUTPUT,
            format="A4",
            print_background=True,
            margin={"top": "12mm", "bottom": "12mm", "left": "12mm", "right": "12mm"}
        )
        browser.close()
        print(f"PDF Report generated successfully at: {PDF_OUTPUT}")

if __name__ == "__main__":
    generate_pdf()
