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
- **Cloud & Vercel Ready**: Dukungan penuh deployment di **Vercel** (Serverless Functions + Vercel Global Edge CDN) maupun platform PaaS konvensional seperti **Render**, **Railway**, atau VPS.
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
  (Serverless / Standalone)                   │
           │                                  ▼
           ▼ (Query/Insert)                   │
     [ Database Cloud MySQL ] ◄───────────────┘
           ▲
           │ (Polling / Fetch API)
           ▼
[ Web Dashboard UI (Vercel CDN Edge / Express Static) ]
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
│   │   └── sensorController.js # Controller logika penerimaan data & API
│   ├── routes/
│   │   └── api.js              # Routing endpoint RESTful API
│   ├── .env.example            # Template variabel konfigurasi database & port
│   ├── db.js                   # Modul koneksi pool MySQL dengan dukungan SSL & Serverless
│   ├── fuzzy.js                # Algoritma inferensi logika fuzzy
│   ├── package.json            # Dependensi backend
│   └── server.js               # Entry point Express server & static web server
├── banjir_prediksi.sql         # Skema database MySQL & view v_rekap_harian
├── vercel.json                 # Konfigurasi routing serverless Vercel
├── package.json                # Root package untuk instalasi dependensi Vercel & PaaS
├── Procfile                    # File konfigurasi proses cloud (Railway / Heroku)
├── .gitignore                  # Filter berkas yang tidak di-track git
└── README.md                   # Dokumentasi resmi proyek
```

---

## ⚡ Panduan Hosting di Vercel (Langkah demi Langkah)

Hosting di Vercel adalah cara paling cepat, gratis, dan performa tinggi (didukung Global Edge CDN).

### Tahap 1: Setup Database MySQL Online (Wajib)
> ⚠️ **PENTING**: Vercel berjalan di cloud serverless (AWS Lambda) dan **TIDAK BISA mengakses `localhost`**. Anda wajib memiliki satu database MySQL online.

**Pilihan Rekomendasi Database Cloud Gratis:**
1. **[TiDB Cloud Serverless](https://tidbcloud.com/)** (Gratis 5GB selamanya, 100% kompatibel MySQL, sangat cocok untuk Vercel).
2. **[Aiven for MySQL](https://aiven.io/)** (Free tier).
3. **[Railway MySQL](https://railway.app/)** (Tersedia credit bulanan).

**Langkah Impor Database:**
1. Daftar akun di penyedia database cloud (misal: [TiDB Cloud](https://tidbcloud.com/)).
2. Buat cluster/database baru bernama `banjir_prediksi`.
3. Buka menu **SQL Editor / Console** di dashboard database cloud Anda.
4. Salin seluruh isi berkas `banjir_prediksi.sql` dan jalankan (Execute) untuk membuat tabel dan view.
5. Catat kredensial koneksi: **Host**, **Port**, **User**, dan **Password**.

---

### Tahap 2: Hubungkan Repositori ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/) dan login/daftar menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** > **"Project"**.
3. Cari dan pilih repositori Anda: **`Hansel-vlnt/predikbanjir`**, lalu klik **"Import"**.
4. Di halaman konfigurasi project:
   - **Framework Preset**: Pilih **`Other`** (atau biarkan default).
   - **Root Directory**: `./` (biarkan default).
   - **Build & Development Settings**: Biarkan default (Vercel otomatis membaca `vercel.json` dan folder `public/`).
5. Buka bagian **"Environment Variables"**, lalu tambahkan variabel berikut satu per satu:

| Name | Contoh Nilai | Keterangan |
| :--- | :--- | :--- |
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | Host database MySQL cloud Anda |
| `DB_PORT` | `4000` *(atau 3306)* | Port database cloud |
| `DB_USER` | `xxxxxx.root` | Username database cloud |
| `DB_PASSWORD` | `password_rahasia_anda` | Password database cloud |
| `DB_NAME` | `banjir_prediksi` | Nama database |
| `DB_SSL` | `true` | Wajib `true` untuk koneksi aman ke cloud |

6. Klik tombol **"Deploy"**.
7. Tunggu sekitar 1 menit hingga proses build selesai. Anda akan mendapatkan URL domain aktif (contoh: `https://predikbanjir.vercel.app`).
8. Buka URL tersebut di browser — Dashboard pemantau banjir langsung aktif dan siap digunakan!

---

## 📡 Menghubungkan Hardware ESP32 ke Domain Vercel

Setelah aplikasi Anda live di Vercel:

1. Buka file `arduino/arduino.ino` di Arduino IDE.
2. Masukkan SSID dan password WiFi di lapangan.
3. Ubah `serverUrl` ke domain Vercel Anda dengan endpoint `/api/sensor`:
   ```cpp
   // Contoh URL Vercel Anda:
   const char* serverUrl = "https://predikbanjir.vercel.app/api/sensor";
   ```
4. Hubungkan sensor tipping bucket ke **Pin 14** ESP32.
5. Upload program ke ESP32. Mikrokontroler akan langsung mengirim data via HTTPS ke Vercel!

---

## 💻 Panduan Menjalankan Secara Lokal

Jika ingin menjalankan pengujian di komputer sendiri (localhost):

1. Pastikan **Node.js** dan **MySQL/XAMPP** sudah berjalan.
2. Impor berkas `banjir_prediksi.sql` ke database MySQL lokal bernama `banjir_prediksi`.
3. Masuk ke terminal proyek dan salin environment:
   ```bash
   cd backend
   cp .env.example .env
   ```
4. Edit `.env` sesuai user & password MySQL lokal Anda.
5. Instal dependensi dan jalankan server:
   ```bash
   npm install
   npm start
   ```
6. Buka dashboard di browser: `http://localhost:5000`

---

## 🔌 Dokumentasi REST API

| Method | Endpoint | Keterangan | Contoh Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check uptime server cloud | - |
| `POST` | `/api/sensor` | Kirim data pembacaan dari ESP32 | `{"curah_hujan": 12.5, "durasi_hujan": 30, "intensitas_hujan": 25.0}` |
| `GET` | `/api/latest` | Ambil 1 data sensor paling baru | - |
| `GET` | `/api/history` | Ambil riwayat pembacaan sensor | `?limit=50` |
| `GET` | `/api/summary` | Ambil ringkasan statistik & jumlah status | - |

---

## 🛡️ Best Practices & Keamanan
- Koneksi database terenkripsi SSL untuk lingkungan serverless.
- Manajemen pool koneksi serverless hemat resource (`connectionLimit: 2`).
- Parameterized Query untuk proteksi menyeluruh terhadap SQL Injection.
- Penggunaan edge CDN untuk penyajian aset statis tanpa beban komputasi server.
