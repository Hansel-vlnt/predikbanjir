# 🌊 Sistem Monitoring & Prediksi Potensi Banjir (IoT & Fuzzy Logic)

Proyek sistem peringatan dini dan pemantauan potensi banjir berbasis **Internet of Things (IoT)** menggunakan mikrokontroler **ESP32**, sensor curah hujan tipe *tipping bucket*, algoritma **Logika Fuzzy (Fuzzy Inference System)**, backend **Node.js (Express)**, database **MySQL**, dan antarmuka web responsif **Real-time Dashboard**.

---

## 📌 Fitur Utama

- **Real-time Monitoring**: Menampilkan indikator status (*AMAN*, *WASPADA*, *BAHAYA*, atau *TIDAK HUJAN*), skor risiko (0 - 100), dan nilai sensor terkini.
- **Fuzzy Inference Engine**: Perhitungan risiko berbasis 3 variabel input:
  1. Curah Hujan ($mm$)
  2. Durasi Hujan ($menit$)
  3. Intensitas Hujan ($mm/jam$)
- **Grafik Tren 24 Jam**: Visualisasi pergerakan tren potensi banjir menggunakan Chart.js.
- **Tabel Rekap Harian & Riwayat Sensor**: Riwayat lengkap pencatatan data dan rekapitulasi harian kejadian hujan.
- **Cloud Hosting Ready**: Arsitektur terpadu (fullstack) di mana server Node.js menyajikan API sekaligus web dashboard secara langsung, siap di-deploy ke platform seperti **Render**, **Railway**, atau VPS.
- **Dukungan HTTPS IoT**: Firmware ESP32 dilengkapi dukungan koneksi SSL/HTTPS aman untuk pengiriman data ke server cloud.

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
           │                               │
           ▼ (Query/Insert)                ▼
     [ Database MySQL ] ◄──────────────────┘
           ▲
           │ (Polling / Fetch API)
           ▼
[ Web Dashboard UI (HTML5, CSS3, JS, Chart.js) ]
```

---

## 📁 Struktur Direktori

```
prediksibanjir/
├── arduino/
│   └── arduino.ino          # Kode firmware untuk ESP32 (WiFi & HTTP Client)
├── backend/
│   ├── controllers/
│   │   └── sensorController.js # Controller logika penerimaan data & API
│   ├── routes/
│   │   └── api.js              # Routing endpoint RESTful API
│   ├── .env.example            # Template variabel konfigurasi database & port
│   ├── db.js                   # Modul koneksi pool MySQL dengan dukungan SSL
│   ├── fuzzy.js                # Algoritma inferensi logika fuzzy
│   ├── package.json            # Dependensi backend
│   └── server.js               # Entry point Express server & static web server
├── frontend/
│   ├── index.html              # Tampilan antarmuka dashboard
│   ├── style.css               # Desain antarmuka modern & responsif
│   ├── dashboard.js            # Logika polling, update data DOM, dan Chart.js
│   └── assets/                 # Folder aset statis
├── banjir_prediksi.sql         # Skema database MySQL & view v_rekap_harian
├── package.json                # Root package untuk kemudahan deploy PaaS
├── Procfile                    # File konfigurasi proses cloud (Railway / Heroku)
├── .gitignore                  # Filter berkas yang tidak di-track git
└── README.md                   # Dokumentasi resmi proyek
```

---

## 🚀 Panduan Instalasi Lokal

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas)
- [MySQL](https://www.mysql.com/) / XAMPP / MariaDB

### 2. Setup Database
1. Buka phpMyAdmin atau MySQL CLI.
2. Buat database baru bernama `banjir_prediksi`.
3. Impor file `banjir_prediksi.sql` ke dalam database tersebut.

### 3. Setup Backend
1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Salin template `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
3. Sesuaikan konfigurasi pada file `.env` (misal username/password MySQL lokal).
4. Instal dependensi:
   ```bash
   npm install
   ```
5. Jalankan server:
   ```bash
   npm start
   ```
6. Buka browser dan akses dashboard di: **`http://localhost:5000`**

---

## ☁️ Panduan Hosting di Web (Cloud Deployment)

Untuk mempublikasikan sistem ke web agar dapat diakses klien secara online dari mana saja:

### Langkah 1: Setup Database Cloud (MySQL)
Gunakan penyedia layanan database MySQL cloud gratis/terjangkau seperti:
- **Aiven for MySQL** (Free tier)
- **Railway MySQL** (Gratis credit bulanan)
- **TiDB Cloud Serverless**

**Langkah impor database ke cloud:**
1. Buat database instance MySQL baru di penyedia cloud pilihan Anda.
2. Catat informasi koneksi: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME`.
3. Buka menu query / console database cloud Anda, lalu jalankan/impor isi berkas `banjir_prediksi.sql`.

### Langkah 2: Deploy Web Server & Dashboard ke Render / Railway
Aplikasi ini sudah dikonfigurasi sebagai **monolith fullstack** (Express menyajikan API dan file web dashboard di satu domain yang sama).

**Pilihan A: Render.com (Direkomendasikan - Free)**
1. Daftar/Masuk ke [Render.com](https://render.com/).
2. Buat **New Web Service** dan hubungkan ke repository GitHub: `https://github.com/Hansel-vlnt/predikbanjir.git`.
3. Isi konfigurasi:
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `node backend/server.js`
4. Di bagian **Environment Variables**, tambahkan:
   - `DB_HOST`: Host MySQL cloud Anda
   - `DB_PORT`: Port MySQL cloud (biasanya 3306 atau port unik dari cloud)
   - `DB_USER`: Username MySQL cloud
   - `DB_PASSWORD`: Password MySQL cloud
   - `DB_NAME`: Nama database
   - `DB_SSL`: `true` (jika penyedia cloud mewajibkan SSL)
5. Klik **Deploy Web Service**.
6. Setelah selesai, Anda akan mendapatkan URL publik (misal: `https://predikbanjir.onrender.com`). Dashboard web langsung aktif di URL tersebut!

---

## 📡 Konfigurasi Hardware ESP32

1. Buka file `arduino/arduino.ino` di **Arduino IDE**.
2. Pastikan Board ESP32 sudah terpasang (*Tools > Board > esp32*).
3. Sesuaikan bagian konfigurasi:
   ```cpp
   // Masukkan SSID dan Password WiFi di lokasi pemasangan
   const char* ssid = "NAMA_WIFI_ANDA";
   const char* password = "PASSWORD_WIFI_ANDA";

   // Ganti dengan URL server cloud Anda yang sudah aktif:
   const char* serverUrl = "https://nama-aplikasi-anda.onrender.com/api/sensor";
   ```
4. Pasang kabel sensor curah hujan (*tipping bucket*) ke **GPIO 14** dan **GND**.
5. Upload program ke board ESP32.
6. Buka **Serial Monitor** (baudrate `115200`) untuk memantau status koneksi dan transmisi data.

---

## 🔌 Dokumentasi REST API

| Method | Endpoint | Keterangan | Contoh Parameter / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check uptime server cloud | - |
| `POST` | `/api/sensor` | Kirim data pembacaan dari ESP32 | `{"curah_hujan": 12.5, "durasi_hujan": 30, "intensitas_hujan": 25.0}` |
| `GET` | `/api/latest` | Ambil 1 data sensor paling baru | - |
| `GET` | `/api/history` | Ambil riwayat pembacaan sensor | `?limit=50` |
| `GET` | `/api/summary` | Ambil ringkasan statistik & jumlah status | - |

---

## 🛡️ Standar Keamanan & Best Practices
- Menggunakan parameterized query pada SQL untuk pencegahan SQL Injection.
- Pemisahan kredensial lingkungan menggunakan `.env` dan `.gitignore`.
- Fallback penanganan jaringan offline pada mikrokontroler.
- Normalisasi dan sanitasi nilai input numerik pada logika fuzzy.
