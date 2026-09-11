// Fungsi keanggotaan CURAH HUJAN
function curahHujanRendah(x) {
    if (x <= 0) return 1;
    if (x >= 200) return 0;
    if (x >= 0 && x <= 100) return 1;
    if (x > 100 && x < 200) return (200 - x) / 100;
    return 0;
}

function curahHujanSedang(x) {
    if (x <= 100 || x >= 500) return 0;
    if (x > 100 && x <= 300) return (x - 100) / 200;
    if (x > 300 && x < 500) return (500 - x) / 200;
    return 0;
}

function curahHujanTinggi(x) {
    if (x <= 300) return 0;
    if (x >= 500) return 1;
    if (x > 300 && x < 500) return (x - 300) / 200;
    return 0;
}

// Fungsi keanggotaan DURASI
function durasiSingkat(x) {
    if (x <= 0) return 1;
    if (x >= 120) return 0;
    if (x > 0 && x < 60) return 1;
    if (x >= 60 && x <= 120) return (120 - x) / 60;
    return 0;
}

function durasiSedang(x) {
    if (x <= 30 || x >= 180) return 0;
    if (x > 30 && x <= 90) return (x - 30) / 60;
    if (x > 90 && x < 180) return (180 - x) / 90;
    return 0;
}

function durasiLama(x) {
    if (x <= 90) return 0;
    if (x >= 180) return 1;
    if (x > 90 && x < 180) return (x - 90) / 90;
    return 0;
}

// Fungsi keanggotaan INTENSITAS
function intensitasRendah(x) {
    if (x <= 0) return 1;
    if (x >= 20) return 0;
    if (x > 0 && x <= 10) return 1;
    if (x > 10 && x < 20) return (20 - x) / 10;
    return 0;
}

function intensitasSedang(x) {
    if (x <= 5 || x >= 30) return 0;
    if (x > 5 && x <= 15) return (x - 5) / 10;
    if (x > 15 && x < 30) return (30 - x) / 15;
    return 0;
}

function intensitasTinggi(x) {
    if (x <= 15) return 0;
    if (x >= 30) return 1;
    if (x > 15 && x < 30) return (x - 15) / 15;
    return 0;
}

// INFERENSI FUZZY
function inferensiFuzzy(curah, durasi, intensitas) {
    // Jika tidak ada curah hujan, otomatis kondisi TIDAK HUJAN (Skor 0)
    if (curah <= 0) {
        return {
            nilai: 0,
            status: 'TIDAK HUJAN',
            detail: {
                alpha: { aman: 0, waspada: 0, bahaya: 0 },
                fuzzy: {
                    curah: { rendah: 1, sedang: 0, tinggi: 0 },
                    durasi: { singkat: 1, sedang: 0, tinggi: 0 },
                    intensitas: { rendah: 1, sedang: 0, tinggi: 0 }
                }
            }
        };
    }

    // Fuzzifikasi
    let ch_rendah = curahHujanRendah(curah);
    let ch_sedang = curahHujanSedang(curah);
    let ch_tinggi = curahHujanTinggi(curah);
    
    let dur_singkat = durasiSingkat(durasi);
    let dur_sedang = durasiSedang(durasi);
    let dur_lama = durasiLama(durasi);
    
    let int_rendah = intensitasRendah(intensitas);
    let int_sedang = intensitasSedang(intensitas);
    let int_tinggi = intensitasTinggi(intensitas);

    // Rules
    let rules = { aman: [], waspada: [], bahaya: [] };

    // ========================================================
    // 27 MATRIKS ATURAN LOGIKA FUZZY MAMDANI (LENGKAP)
    // Curah (3) x Durasi (3) x Intensitas (3) = 27 Rules
    // ========================================================

    // KELOMPOK 1: CURAH HUJAN RENDAH
    // 1. Rendah + Singkat
    rules.aman.push(Math.min(ch_rendah, dur_singkat, int_rendah));      // R1: AMAN
    rules.aman.push(Math.min(ch_rendah, dur_singkat, int_sedang));      // R2: AMAN
    rules.waspada.push(Math.min(ch_rendah, dur_singkat, int_tinggi));   // R3: WASPADA
    // 2. Rendah + Sedang
    rules.aman.push(Math.min(ch_rendah, dur_sedang, int_rendah));       // R4: AMAN
    rules.waspada.push(Math.min(ch_rendah, dur_sedang, int_sedang));    // R5: WASPADA
    rules.waspada.push(Math.min(ch_rendah, dur_sedang, int_tinggi));    // R6: WASPADA
    // 3. Rendah + Lama
    rules.waspada.push(Math.min(ch_rendah, dur_lama, int_rendah));      // R7: WASPADA
    rules.waspada.push(Math.min(ch_rendah, dur_lama, int_sedang));      // R8: WASPADA
    rules.bahaya.push(Math.min(ch_rendah, dur_lama, int_tinggi));       // R9: BAHAYA

    // KELOMPOK 2: CURAH HUJAN SEDANG
    // 4. Sedang + Singkat
    rules.aman.push(Math.min(ch_sedang, dur_singkat, int_rendah));      // R10: AMAN
    rules.waspada.push(Math.min(ch_sedang, dur_singkat, int_sedang));   // R11: WASPADA
    rules.waspada.push(Math.min(ch_sedang, dur_singkat, int_tinggi));   // R12: WASPADA
    // 5. Sedang + Sedang
    rules.waspada.push(Math.min(ch_sedang, dur_sedang, int_rendah));    // R13: WASPADA
    rules.waspada.push(Math.min(ch_sedang, dur_sedang, int_sedang));    // R14: WASPADA
    rules.bahaya.push(Math.min(ch_sedang, dur_sedang, int_tinggi));     // R15: BAHAYA
    // 6. Sedang + Lama
    rules.waspada.push(Math.min(ch_sedang, dur_lama, int_rendah));      // R16: WASPADA
    rules.bahaya.push(Math.min(ch_sedang, dur_lama, int_sedang));       // R17: BAHAYA
    rules.bahaya.push(Math.min(ch_sedang, dur_lama, int_tinggi));       // R18: BAHAYA

    // KELOMPOK 3: CURAH HUJAN TINGGI
    // 7. Tinggi + Singkat
    rules.waspada.push(Math.min(ch_tinggi, dur_singkat, int_rendah));   // R19: WASPADA
    rules.waspada.push(Math.min(ch_tinggi, dur_singkat, int_sedang));   // R20: WASPADA
    rules.bahaya.push(Math.min(ch_tinggi, dur_singkat, int_tinggi));    // R21: BAHAYA
    // 8. Tinggi + Sedang
    rules.waspada.push(Math.min(ch_tinggi, dur_sedang, int_rendah));    // R22: WASPADA
    rules.bahaya.push(Math.min(ch_tinggi, dur_sedang, int_sedang));     // R23: BAHAYA
    rules.bahaya.push(Math.min(ch_tinggi, dur_sedang, int_tinggi));     // R24: BAHAYA
    // 9. Tinggi + Lama
    rules.bahaya.push(Math.min(ch_tinggi, dur_lama, int_rendah));       // R25: BAHAYA
    rules.bahaya.push(Math.min(ch_tinggi, dur_lama, int_sedang));       // R26: BAHAYA
    rules.bahaya.push(Math.min(ch_tinggi, dur_lama, int_tinggi));       // R27: BAHAYA

    // Nilai maksimum tiap output (Agregasi Max)
    let alpha_aman = Math.max(...rules.aman);
    let alpha_waspada = Math.max(...rules.waspada);
    let alpha_bahaya = Math.max(...rules.bahaya);

    // Defuzzifikasi Sugeno / Weighted Average Center of Gravity
    let z1 = 30, z2 = 55, z3 = 85;
    let pembilang = (alpha_aman * z1) + (alpha_waspada * z2) + (alpha_bahaya * z3);
    let penyebut = alpha_aman + alpha_waspada + alpha_bahaya;
    
    let hasilDefuzzifikasi = penyebut === 0 ? 30 : pembilang / penyebut;
    let skorBulat = Math.round(hasilDefuzzifikasi);
    
    // Status Berdasarkan Skor
    let status = '';
    if (skorBulat <= 40) status = 'AMAN';
    else if (skorBulat >= 60) status = 'BAHAYA';
    else status = 'WASPADA';

    return {
        nilai: skorBulat,
        status: status,
        detail: {
            alpha: { aman: alpha_aman, waspada: alpha_waspada, bahaya: alpha_bahaya },
            fuzzy: {
                curah: { rendah: ch_rendah, sedang: ch_sedang, tinggi: ch_tinggi },
                durasi: { singkat: dur_singkat, sedang: dur_sedang, lama: dur_lama },
                intensitas: { rendah: int_rendah, sedang: int_sedang, tinggi: int_tinggi }
            }
        }
    };
}

module.exports = { inferensiFuzzy };