# 🌊 Sistem Monitoring & Prediksi Potensi Banjir (IoT & Fuzzy Logic)

Proyek sistem peringatan dini dan pemantauan potensi banjir berbasis **Internet of Things (IoT)** menggunakan mikrokontroler **ESP32**, sensor curah hujan tipe *tipping bucket*, algoritma **Logika Fuzzy (Fuzzy Inference System)**, backend **Node.js (Express)**, database **Supabase (PostgreSQL)** atau **MySQL**, dan antarmuka web responsif **Real-time Dashboard**.

---

## 📌 Fitur Utama

- **Real-time Monitoring**: Menampilkan indikator status (*AMAN*, *WASPADA*, *BAHAYA*, atau *TIDAK HUJAN*), skor risiko (0 - 100), dan nilai sensor terkini.
- **Fuzzy Inference Engine**: Perhitungan risiko berbasis 3 variabel input:
  1. Curah Hujan ($mm$)
  2. Durasi Hujan ($menit$)
  3. Intensitas Hujan ($mm/jam$)
- **Grafik Tren 24 Jam**: Visualisasi pergerakan tren potensi banjir menggunakan Chart.js.
- **Tabel Rekap Harian & Riwayat Sensor**: Riwayat lengkap pencatatan data dan rekapitulasi harian kejadian hujan.
- **Dual-Database Support**: Backend cerdas yang mendukung **Supabase (PostgreSQL Cloud)** secara native untuk Vercel, dan tetap mendukung **MySQL** untuk pengujian lokal.
- **Cloud & Vercel Ready**: Dukungan penuh deployment di **Vercel** (Serverless Functions + Vercel Global Edge CDN).
- **Dukungan HTTPS IoT**: Firmware ESP32 dilengkapi pustaka SSL aman untuk pengiriman data via HTTPS ke domain cloud Vercel.

---

## 🏗️ Arsitektur Sistem

```
[ Sensor Tipping Bucket ]
           │ (Pulsa Interrupt Pin 14)
           ▼
     [ ESP32 MCU ]
           │ (HTTP/HTTPS POST /api/sensor)
           ▼
  [ Node.js Express API ] ───► [ Inferensi Logika Fuzzy ]
  (Serverless di Vercel)                      │
           │                                  ▼
           ▼ (Supabase JS SDK / SQL)          │
  [ Database Cloud Supabase ] ◄───────────────┘
  (PostgreSQL & Realtime Storage)
           ▲
           │ (Fetch API Polling)
           ▼
[ Web Dashboard UI (Vercel Edge Global CDN) ]
```

---

## 📁 Struktur Direktori

```
prediksibanjir/
├── api/
│   └── index.js             # Serverless handler untuk Vercel
├── public/                  # Aset web statis untuk Vercel Edge CDN
│   ├── index.html           # Tampilan antarmuka dashboard
│   ├── style.css            # Desain antarmuka modern & responsif
│   ├── dashboard.js         # Logika polling, update data DOM, dan Chart.js
│   └── assets/              # Folder aset statis
├── frontend/                # Sumber berkas frontend lokal
├── arduino/
│   └── arduino.ino          # Kode firmware untuk ESP32 (WiFi & HTTP Client)
├── backend/
│   ├── controllers/
│   │   └── sensorController.js # Controller cerdas (Dual-mode: Supabase & MySQL)
│   ├── routes/
│   │   └── api.js              # Routing endpoint RESTful API
│   ├── .env.example            # Template konfigurasi Supabase & MySQL
│   ├── supabase.js             # Modul inisialisasi Supabase JS Client
│   ├── db.js                   # Modul koneksi pool MySQL lokal/cloud
│   ├── fuzzy.js                # Algoritma inferensi logika fuzzy
│   ├── package.json            # Dependensi backend
│   └── server.js               # Entry point Express server & static web server
├── supabase_setup.sql          # Skrip database PostgreSQL untuk Supabase
├── banjir_prediksi.sql         # Skema database MySQL
├── vercel.json                 # Konfigurasi routing serverless Vercel
├── package.json                # Root package untuk instalasi dependensi Vercel & PaaS
├── Procfile                    # File konfigurasi proses cloud (Railway / Heroku)
├── .gitignore                  # Filter berkas yang tidak di-track git
└── README.md                   # Dokumentasi resmi proyek
```

---

## ⚡ Panduan Lengkap Hosting di Vercel + Supabase (Paling Mudah)

Kombinasi **Vercel** dan **Supabase** adalah standar industri gratis terbaik untuk aplikasi web modern.

### Tahap 1: Setup Database di Supabase (Gratis)

1. Buka **[supabase.com](https://supabase.com)** dan klik **Sign In** dengan akun GitHub Anda.
2. Klik tombol **"New Project"**.
3. Isi formulir:
   - **Name**: `banjir-prediksi`
   - **Database Password**: Buat kata sandi yang kuat dan catat.
   - **Region**: Pilih **`Singapore (ap-southeast-1)`** *(terdekat dari Indonesia)*.
4. Klik **Create new project** (tunggu ~1-2 menit hingga status database aktif).
5. Di menu bilah kiri Supabase, klik ikon **SQL Editor** (ikon dokumen/terminal).
6. Buka file [`supabase_setup.sql`](./supabase_setup.sql) dari repositori ini, salin seluruh isinya, tempel ke SQL Editor Supabase, lalu klik tombol hijau **"Run"**.
   *(Semua tabel `tb_sensor`, `tb_config`, `tb_fuzzy_log`, dan view `v_rekap_harian` otomatis dibuat).*
7. Di menu bilah kiri bawah, klik ikon **Project Settings** (ikon roda gigi) > pilih menu **API**.
8. Catat 2 nilai berikut:
   - **Project URL** (contoh: `https://abcdefghijklmnop.supabase.co`)
   - **Project API Keys (`anon` / `public`)** (token panjang berawalan `eyJ...`)

---

### Tahap 2: Hubungkan & Deploy ke Vercel

1. Buka **[Vercel Dashboard](https://vercel.com/new)** dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** > **"Project"**.
3. Cari dan pilih repositori Anda: **`Hansel-vlnt/predikbanjir`**, lalu klik **"Import"**.
4. Pada halaman konfigurasi:
   - **Framework Preset**: Pilih **`Other`** (atau biarkan default).
   - **Root Directory**: `./` (biarkan default).
5. Buka bagian **"Environment Variables"**, lalu tambahkan 2 variabel dari Supabase tadi:

| Name (Key) | Nilai yang Dimasukkan | Keterangan |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://abcdefghijklmnop.supabase.co` | Project URL dari Supabase |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5c...` | Project API Key (`anon` / `public`) dari Supabase |

6. Klik tombol **"Deploy"**.
7. Tunggu sekitar 1 menit hingga build selesai. Vercel akan memberikan domain aktif (contoh: `https://predikbanjir.vercel.app`).
8. Buka domain tersebut: Web Dashboard Anda langsung live, terhubung ke Supabase, dan siap digunakan!

---

## 📡 Menghubungkan Hardware ESP32 ke Domain Vercel

Setelah domain Vercel Anda aktif:

1. Buka file `arduino/arduino.ino` di Arduino IDE.
2. Masukkan SSID dan password WiFi di lokasi pemasangan sensor.
3. Ubah `serverUrl` ke domain Vercel Anda dengan endpoint `/api/sensor`:
   ```cpp
   // Ganti dengan URL domain Vercel Anda:
   const char* serverUrl = "https://predikbanjir.vercel.app/api/sensor";
   ```
4. Hubungkan sensor tipping bucket ke **GPIO 14** dan **GND** pada ESP32.
5. Upload program ke board ESP32.
6. Buka **Serial Monitor** (baudrate `115200`). Setiap kali sensor berayun/mengukur hujan, data akan dikirim secara aman via HTTPS ke Vercel dan langsung tersimpan di Supabase!

---

## 💻 Panduan Menjalankan Secara Lokal (Opsional - MySQL)

Jika Anda ingin menjalankan sistem di komputer lokal tanpa internet:

1. Pastikan **Node.js** dan **MySQL/XAMPP** sudah berjalan.
2. Impor berkas `banjir_prediksi.sql` ke database MySQL lokal bernama `banjir_prediksi`.
3. Masuk ke terminal proyek:
   ```bash
   cd backend
   cp .env.example .env
   ```
4. Edit `.env` dengan konfigurasi MySQL lokal Anda:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=banjir_prediksi
   ```
5. Instal dependensi dan jalankan server:
   ```bash
   npm install
   npm start
   ```
6. Buka dashboard di browser: `http://localhost:5000`

---

## 🔌 Dokumentasi REST API

| Method | Endpoint | Keterangan | Contoh Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Status uptime & deteksi database (`supabase` / `mysql`) | - |
| `POST` | `/api/sensor` | Menerima data sensor dari ESP32 & kalkulasi fuzzy | `{"curah_hujan": 12.5, "durasi_hujan": 30, "intensitas_hujan": 25.0}` |
| `GET` | `/api/latest` | Ambil 1 baris data sensor paling baru | - |
| `GET` | `/api/history` | Ambil riwayat pembacaan sensor | `?limit=50` |
| `GET` | `/api/summary` | Ambil statistik data & jumlah per status | - |

---

## 🛡️ Best Practices & Keamanan
- Kompatibilitas multi-database (PostgreSQL via Supabase SDK dan MySQL via Connection Pool).
- Mengabaikan validasi sesi anonim berlebih untuk performa tinggi di Edge Function.
- Proteksi terhadap SQL Injection dengan parameter terisolasi pada SDK.
- Penggunaan Vercel Global Edge CDN untuk menyajikan web dashboard dengan kecepatan maksimal di mana saja.
