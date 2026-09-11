const db = require('../db');
const { inferensiFuzzy } = require('../fuzzy');

// POST /api/sensor
exports.receiveData = async (req, res) => {
    try {
        let { curah_hujan, durasi_hujan, intensitas_hujan } = req.body;
        
        // Validasi input: pastikan semua parameter ada (termasuk nilai 0)
        if (curah_hujan === undefined || durasi_hujan === undefined || intensitas_hujan === undefined) {
            return res.status(400).json({ error: 'Parameter tidak lengkap: curah_hujan, durasi_hujan, intensitas_hujan wajib diisi' });
        }
        
        const curah = parseFloat(curah_hujan) || 0;
        const durasi = parseFloat(durasi_hujan) || 0;
        const intensitas = parseFloat(intensitas_hujan) || 0;
        
        // Hitung inferensi fuzzy
        const hasilFuzzy = inferensiFuzzy(curah, durasi, intensitas);
        
        // Simpan data ke tabel utama tb_sensor
        const [result] = await db.execute(
            `INSERT INTO tb_sensor (curah_hujan, durasi_hujan, intensitas_hujan, potensi_banjir, status_banjir) 
             VALUES (?, ?, ?, ?, ?)`,
            [curah, durasi, intensitas, hasilFuzzy.nilai, hasilFuzzy.status]
        );
        
        // Simpan log fuzzy detail ke tb_fuzzy_log jika tabel tersedia
        try {
            const fz = hasilFuzzy.detail?.fuzzy;
            if (fz) {
                await db.execute(
                    `INSERT INTO tb_fuzzy_log 
                     (curah_hujan, durasi_hujan, intensitas_hujan, 
                      derajat_rendah, derajat_sedang, derajat_tinggi,
                      durasi_singkat, durasi_sedang, durasi_lama,
                      intensitas_rendah, intensitas_sedang, intensitas_tinggi,
                      output_fuzzy) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        curah, durasi, intensitas,
                        fz.curah.rendah, fz.curah.sedang, fz.curah.tinggi,
                        fz.durasi.singkat, fz.durasi.sedang, fz.durasi.lama,
                        fz.intensitas.rendah, fz.intensitas.sedang, fz.intensitas.tinggi,
                        hasilFuzzy.nilai
                    ]
                );
            }
        } catch (logErr) {
            console.warn('Peringatan: tb_fuzzy_log dilewati:', logErr.message);
        }
        
        res.status(200).json({
            success: true,
            id: result.insertId,
            potensi_banjir: hasilFuzzy.nilai,
            status: hasilFuzzy.status,
            data: {
                curah_hujan: curah,
                durasi_hujan: durasi,
                intensitas_hujan: intensitas
            }
        });
        
    } catch (error) {
        console.error('Error pada receiveData:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};

// GET /api/latest
exports.getLatest = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT * FROM tb_sensor ORDER BY created_at DESC LIMIT 1`
        );
        res.json(rows[0] || null);
    } catch (error) {
        console.error('Error pada getLatest:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/history
exports.getHistory = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 1000);
        const [rows] = await db.execute(
            `SELECT * FROM tb_sensor ORDER BY created_at DESC LIMIT ?`,
            [limit]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error pada getHistory:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/summary
exports.getSummary = async (req, res) => {
    try {
        const [total] = await db.execute(`SELECT COUNT(*) as total FROM tb_sensor`);
        const [rata2] = await db.execute(`SELECT AVG(potensi_banjir) as rata_rata FROM tb_sensor`);
        const [statusCount] = await db.execute(`
            SELECT status_banjir, COUNT(*) as jumlah 
            FROM tb_sensor 
            GROUP BY status_banjir
        `);
        
        res.json({
            total_data: total[0]?.total || 0,
            rata_rata_skor: Math.round(rata2[0]?.rata_rata || 0),
            status: statusCount
        });
    } catch (error) {
        console.error('Error pada getSummary:', error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/health
exports.getHealth = (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
};