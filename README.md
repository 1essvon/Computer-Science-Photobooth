# 📸 1essvon Photobooth (Computer Science Edition)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Tech](https://img.shields.io/badge/tech-HTML%20%7C%20CSS%20%7C%20JS-yellow.svg)

**1essvon Photobooth** adalah aplikasi photobooth berbasis web yang menggabungkan estetika minimalis Korea (*Insaengnecut*) dengan nuansa teknis (*Engineering/Coding*). Aplikasi ini dirancang sebagai proyek portofolio mahasiswa Informatika yang mengutamakan desain bersih, privasi data (client-side processing), dan interaktivitas modern.

---

## ✨ Fitur Utama

* **📷 Kamera Real-time:** Integrasi langsung dengan webcam perangkat (Laptop/Smartphone) tanpa perlu instalasi aplikasi tambahan.
* **⚡ Multi-Layout System:** Pilihan mode layout yang fleksibel:
    * **ZigZag Mode:** Susunan foto asimetris (Silang Horizontal-Vertikal) yang dinamis.
    * **Strip Mode:** Susunan foto vertikal klasik ala photobooth Korea.
* **🎨 Filter & Dekorasi:**
    * Tersedia filter warna instan (Normal, Vintage, B&W, Cool).
    * Stiker dekoratif yang bisa digeser (*drag*), diputar (*rotate*), dan diubah ukurannya (*resize*).
* **🧠 Smart Header:** Judul bingkai ("인생네컷") beradaptasi secara responsif; menjadi satu baris pada mode ZigZag dan dua baris pada mode Strip agar tetap terbaca jelas.
* **🔒 Privasi Terjamin:** Semua pemrosesan gambar dilakukan di sisi klien (*Client-Side*) menggunakan JavaScript Canvas API. Tidak ada data wajah yang dikirim ke server.
* **✍️ Custom Caption:** Pengguna dapat menambahkan teks ucapan sendiri yang akan tercetak di hasil akhir foto.

---

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan teknologi web standar tanpa framework berat, untuk memaksimalkan performa dan pemahaman konsep dasar.

* **HTML5:** Struktur semantik aplikasi & elemen Multimedia (`<video>`, `<canvas>`).
* **CSS3:** Styling responsif, Grid System, Flexbox, dan efek visual (CSS Filters, Animation).
    * *Highlight:* Penggunaan `linear-gradient` untuk membuat pola latar belakang *Engineering Grid*.
* **JavaScript (Vanilla):** Logika interaktif DOM, akses Webcam API, dan manipulasi Canvas 2D untuk rendering hasil foto.

---

## 🚀 Cara Menjalankan (Local)

1.  **Clone Repository ini:**
    ```bash
    git clone [https://github.com/username-anda/1essvon-photobooth.git](https://github.com/username-anda/1essvon-photobooth.git)
    ```
2.  **Buka Folder Proyek:**
    Masuk ke direktori proyek yang sudah di-clone.
3.  **Jalankan `index.html`:**
    Cukup buka file `index.html` menggunakan browser modern (Chrome, Edge, Firefox, Safari).
    > **Catatan:** Untuk akses kamera yang lancar, disarankan menggunakan *Live Server* (jika menggunakan VS Code) atau membukanya via `localhost`, karena beberapa browser memblokir akses webcam jika file dibuka langsung (`file://`).

---

## 📂 Struktur Proyek

```text
/
├── index.html          # Kerangka utama aplikasi
├── css/
│   └── style.css       # Kode styling (UI/UX)
├── js/
│   └── script.js       # Logika program (Kamera, Canvas, Interaksi)
├── img/
│   └── sticker1.png... # Aset gambar stiker
└── audio/
    ├── shutter.mp3     # Efek suara kamera
    └── beep.mp3        # Efek suara timer
