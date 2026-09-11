// ============ UNTUK ESP32 ============
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ============ KONFIGURASI JARINGAN & SERVER ============
// Silakan sesuaikan SSID dan Password WiFi yang digunakan di lapangan
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

// URL Endpoint Backend Cloud Domain Anda (Aktif & Terhubung ke Supabase):
const char* serverUrl = "https://www.prediksibanjir.my.id/api/sensor";

// ============ MODE ============
#define MODE_TESTING true  // true = 1 menit tanpa tip (reset), false = 1 jam (produksi)

// ============ SENSOR ============
const int pin_interrupt = 14;          // Pin GPIO sensor tipping bucket
const float milimeter_per_tip = 0.70;  // Kalibrasi curah hujan per ayunan (mm)
volatile long int jumlah_tip = 0;
volatile boolean flag = false;

// ============ DETEKSI HUJAN BERHENTI ============
unsigned long waktu_mulai_kejadian = 0;
unsigned long waktu_tip_terakhir = 0;
unsigned long BATAS_BERHENTI;

boolean sedang_hujan = false;
long int tip_kejadian_ini = 0;
int kejadian_hari_ini = 1;

// ============ INTERRUPT ============
void IRAM_ATTR hitung_curah_hujan() {
    flag = true;
    jumlah_tip++;
    tip_kejadian_ini++;
    waktu_tip_terakhir = millis();
    
    if (!sedang_hujan) {
        sedang_hujan = true;
        waktu_mulai_kejadian = millis();
        Serial.println("HUJAN MULAI! (Kejadian #" + String(kejadian_hari_ini) + ")");
    }
}

// ============ PROTOTIPE FUNGSI ============
void kirimKeServer(long int tip);
void kirimDataNol();
void resetManual();

// ============ SETUP ============
void setup() {
    Serial.begin(115200);
    delay(1000);
    
    #if MODE_TESTING
        BATAS_BERHENTI = 60000;    // 1 menit tanpa tip = hujan berhenti (Mode Uji Coba)
        Serial.println("MODE TESTING: 1 menit tanpa tip = reset");
    #else
        BATAS_BERHENTI = 3600000;  // 1 jam tanpa tip = hujan berhenti (Mode Real)
        Serial.println("MODE PRODUKSI: 1 jam tanpa tip = reset");
    #endif
    
    Serial.println("\n========================================");
    Serial.println("SISTEM MONITORING CURAH HUJAN (ESP32)");
    Serial.println("========================================");
    
    pinMode(pin_interrupt, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(pin_interrupt), hitung_curah_hujan, FALLING);
    Serial.println("Sensor tipping bucket siap pada GPIO 14");
    
    WiFi.begin(ssid, password);
    Serial.print("Menghubungkan ke WiFi: ");
    Serial.println(ssid);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi Terhubung!");
        Serial.print("IP ESP32: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nGagal koneksi WiFi! Periksa SSID & Password.");
    }
    
    Serial.println("========================================");
    Serial.println("Server URL: " + String(serverUrl));
    Serial.println("Menunggu data sensor...");
    Serial.println("Kirim 'r' di Serial Monitor untuk reset manual");
    Serial.println("========================================");
}

// ============ LOOP ============
void loop() {
    unsigned long waktu = millis();
    
    if (flag == true) {
        flag = false;
        waktu_tip_terakhir = waktu;
    }
    
    // === CEK SERIAL RESET ===
    if (Serial.available()) {
        char cmd = Serial.read();
        if (cmd == 'r' || cmd == 'R') {
            resetManual();
        }
    }
    
    // === DETEKSI HUJAN BERHENTI (OTOMATIS) ===
    if (sedang_hujan && (waktu - waktu_tip_terakhir > BATAS_BERHENTI)) {
        Serial.println("========================================");
        Serial.println("HUJAN BERHENTI! (Otomatis)");
        Serial.print("Kejadian #" + String(kejadian_hari_ini) + ": ");
        Serial.print(tip_kejadian_ini * milimeter_per_tip, 1);
        Serial.println(" mm");
        
        if (WiFi.status() == WL_CONNECTED) {
            if (tip_kejadian_ini > 0) {
                kirimKeServer(tip_kejadian_ini);
            }
            kirimDataNol();
        }
        
        sedang_hujan = false;
        tip_kejadian_ini = 0;
        kejadian_hari_ini++;
        Serial.println("Siap untuk kejadian berikutnya (#" + String(kejadian_hari_ini) + ")");
        Serial.println("========================================");
    }
    
    // === KIRIM DATA PERIODIK (SETIAP 30 DETIK SELAMA HUJAN) ===
    static unsigned long lastSend = 0;
    if (sedang_hujan && (waktu - lastSend > 30000)) {
        lastSend = waktu;
        if (WiFi.status() == WL_CONNECTED && tip_kejadian_ini > 0) {
            kirimKeServer(tip_kejadian_ini);
        }
    }
    
    delay(100);
}

// ============ RESET MANUAL ============
void resetManual() {
    if (sedang_hujan) {
        Serial.println("========================================");
        Serial.println("RESET MANUAL!");
        Serial.print("Kejadian #" + String(kejadian_hari_ini) + ": ");
        Serial.print(tip_kejadian_ini * milimeter_per_tip, 1);
        Serial.println(" mm");
        
        if (WiFi.status() == WL_CONNECTED) {
            if (tip_kejadian_ini > 0) {
                kirimKeServer(tip_kejadian_ini);
            }
            kirimDataNol();
        }
        
        sedang_hujan = false;
        tip_kejadian_ini = 0;
        kejadian_hari_ini++;
        Serial.println("Reset berhasil!");
        Serial.println("========================================");
    } else {
        Serial.println("Tidak ada hujan yang sedang berlangsung.");
    }
}

// ============ KIRIM DATA RESET (NOL) KE SERVER ============
void kirimDataNol() {
    Serial.println("Mengirim status reset (0) ke server...");
    
    HTTPClient http;
    WiFiClientSecure secureClient;
    
    if (String(serverUrl).startsWith("https://")) {
        secureClient.setInsecure(); // Mengabaikan validasi CA SSL untuk IoT
        http.begin(secureClient, serverUrl);
    } else {
        http.begin(serverUrl);
    }
    
    http.addHeader("Content-Type", "application/json");
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    http.setTimeout(10000);
    
    String payload = "{\"curah_hujan\":0,\"durasi_hujan\":0,\"intensitas_hujan\":0}";
    
    Serial.print("Payload (RESET): ");
    Serial.println(payload);
    
    int httpCode = http.POST(payload);
    
    if (httpCode == 200 || httpCode == 201) {
        String response = http.getString();
        Serial.println("Data reset terkirim!");
        Serial.print("Response: ");
        Serial.println(response);
    } else {
        Serial.print("Gagal kirim reset, HTTP: ");
        Serial.println(httpCode);
    }
    
    http.end();
}

// ============ KIRIM DATA SENSOR KE SERVER ============
void kirimKeServer(long int tip) {
    HTTPClient http;
    WiFiClientSecure secureClient;
    
    if (String(serverUrl).startsWith("https://")) {
        secureClient.setInsecure(); // Mengabaikan validasi CA SSL untuk IoT
        http.begin(secureClient, serverUrl);
    } else {
        http.begin(serverUrl);
    }
    
    http.addHeader("Content-Type", "application/json");
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    http.setTimeout(10000);
    
    // ============================================
    // RUMUS: Curah = tip × 0.70 mm
    // ============================================
    float curah = tip * milimeter_per_tip;
    
    // ============================================
    // RUMUS: Durasi = (waktu sekarang - waktu mulai) / 60000 menit
    // ============================================
    float durasi = (millis() - waktu_mulai_kejadian) / 60000.0;
    
    // ============================================
    // RUMUS: Intensitas = Curah / (Durasi / 60) mm/jam
    // Beri batas minimal durasi 0.5 menit (30 detik) saat awal hujan agar nilai realistis
    // ============================================
    float durasiHitung = (durasi < 0.5) ? 0.5 : durasi;
    float intensitas = (durasiHitung > 0) ? (curah / (durasiHitung / 60.0)) : 0;
    
    String payload = "{";
    payload += "\"curah_hujan\":" + String(curah, 2) + ",";
    payload += "\"durasi_hujan\":" + String(durasi, 2) + ",";
    payload += "\"intensitas_hujan\":" + String(intensitas, 2);
    payload += "}";
    
    Serial.print("Kirim ke Cloud: ");
    Serial.println(payload);
    
    int httpCode = http.POST(payload);
    
    if (httpCode == 200 || httpCode == 201) {
        String response = http.getString();
        Serial.println("Data berhasil disimpan ke cloud Vercel & Supabase!");
        Serial.print("Server Response: ");
        Serial.println(response);
    } else {
        Serial.print("Gagal kirim, HTTP Code: ");
        Serial.println(httpCode);
        if (httpCode == -1) {
            Serial.println("   → Periksa koneksi WiFi dan URL server!");
        }
    }
    
    http.end();
}