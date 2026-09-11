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

    // R1: Rendah + Singkat + Rendah → AMAN
    rules.aman.push(Math.min(ch_rendah, dur_singkat, int_rendah));
    
    // R2: Rendah + Singkat + Sedang → AMAN
    rules.aman.push(Math.min(ch_rendah, dur_singkat, int_sedang));
    
    // R3: Rendah + Sedang + Rendah → WASPADA
    rules.waspada.push(Math.min(ch_rendah, dur_sedang, int_rendah));
    
    // R4: Sedang + Sedang + Sedang → WASPADA
    rules.waspada.push(Math.min(ch_sedang, dur_sedang, int_sedang));
    
    // R5: Tinggi + Lama + Tinggi → BAHAYA
    rules.bahaya.push(Math.min(ch_tinggi, dur_lama, int_tinggi));
    
    // R6: Sedang + Lama + Tinggi → BAHAYA
    rules.bahaya.push(Math.min(ch_sedang, dur_lama, int_tinggi));
    
    // R7: Tinggi + Lama + Sedang → BAHAYA
    rules.bahaya.push(Math.min(ch_tinggi, dur_lama, int_sedang));
    
    // R8: Sedang + Singkat + Rendah → AMAN
    rules.aman.push(Math.min(ch_sedang, dur_singkat, int_rendah));
    
    // R9: Tinggi + Sedang + Sedang → WASPADA
    rules.waspada.push(Math.min(ch_tinggi, dur_sedang, int_sedang));

    // Nilai maksimum tiap output
    let alpha_aman = Math.max(...rules.aman);
    let alpha_waspada = Math.max(...rules.waspada);
    let alpha_bahaya = Math.max(...rules.bahaya);

    // Defuzzifikasi
    let z1 = 30, z2 = 55, z3 = 85;
    let pembilang = (alpha_aman * z1) + (alpha_waspada * z2) + (alpha_bahaya * z3);
    let penyebut = alpha_aman + alpha_waspada + alpha_bahaya;
    
    let hasilDefuzzifikasi = penyebut === 0 ? 0 : pembilang / penyebut;
    
    // Status
    let status = '';
    if (hasilDefuzzifikasi <= 40) status = 'AMAN';
    else if (hasilDefuzzifikasi >= 60) status = 'BAHAYA';
    else status = 'WASPADA';

    return {
        nilai: Math.round(hasilDefuzzifikasi),
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