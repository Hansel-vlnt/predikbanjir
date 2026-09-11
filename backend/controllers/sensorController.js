const db = require('../db');
const { supabase, isSupabaseConfigured } = require('../supabase');
const { inferensiFuzzy } = require('../fuzzy');

// POST /api/sensor
exports.receiveData = async (req, res) => {
    try {
        let { curah_hujan, durasi_hujan, intensitas_hujan } = req.body;
        
        // Validasi input: pastikan semua parameter ada (termasuk nilai 0)
        if (curah_hujan === undefined || durasi_hujan === undefined || intensitas_hujan === undefined) {
            return res.status(400).json({ 
                error: 'Parameter tidak lengkap: curah_hujan, durasi_hujan, intensitas_hujan wajib diisi' 
            });
        }
        
        const curah = parseFloat(curah_hujan) || 0;
        const durasi = parseFloat(durasi_hujan) || 0;
        const intensitas = parseFloat(intensitas_hujan) || 0;
        
        // Hitung inferensi fuzzy
        const hasilFuzzy = inferensiFuzzy(curah, durasi, intensitas);
        let insertedId = null;

        // MODE 1: SUPABASE (POSTGRESQL CLOUD)
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from('tb_sensor')
                .insert([{
                    curah_hujan: curah,
                    durasi_hujan: durasi,
                    intensitas_hujan: intensitas,
                    potensi_banjir: hasilFuzzy.nilai,
                    status_banjir: hasilFuzzy.status
                }])
                .select();

            if (error) {
                console.error('Error insert Supabase tb_sensor:', error);
                throw error;
            }

            insertedId = data?.[0]?.id || null;

            // Simpan detail fuzzy log jika tabel tersedia
            try {
                const fz = hasilFuzzy.detail?.fuzzy;
                if (fz) {
                    await supabase.from('tb_fuzzy_log').insert([{
                        curah_hujan: curah,
                        durasi_hujan: durasi,
                        intensitas_hujan: intensitas,
                        derajat_rendah: fz.curah.rendah,
                        derajat_sedang: fz.curah.sedang,
                        derajat_tinggi: fz.curah.tinggi,
                        durasi_singkat: fz.durasi.singkat,
                        durasi_sedang: fz.durasi.sedang,
                        durasi_lama: fz.durasi.lama,
                        intensitas_rendah: fz.intensitas.rendah,
                        intensitas_sedang: fz.intensitas.sedang,
                        intensitas_tinggi: fz.intensitas.tinggi,
                        output_fuzzy: hasilFuzzy.nilai
                    }]);
                }
            } catch (logErr) {
                console.warn('Peringatan: tb_fuzzy_log Supabase dilewati:', logErr.message);
            }

        // MODE 2: MYSQL (LOKAL / VPS / CLOUD MYSQL)
        } else {
            const [result] = await db.execute(
                `INSERT INTO tb_sensor (curah_hujan, durasi_hujan, intensitas_hujan, potensi_banjir, status_banjir) 
                 VALUES (?, ?, ?, ?, ?)`,
                [curah, durasi, intensitas, hasilFuzzy.nilai, hasilFuzzy.status]
            );
            insertedId = result.insertId;
            
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
                console.warn('Peringatan: tb_fuzzy_log MySQL dilewati:', logErr.message);
            }
        }
        
        return res.status(200).json({
            success: true,
            id: insertedId,
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
        return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
};

// GET /api/latest
exports.getLatest = async (req, res) => {
    try {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from('tb_sensor')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            return res.json(data?.[0] || null);
        }

        // Fallback MySQL
        const [rows] = await db.execute(
            `SELECT * FROM tb_sensor ORDER BY created_at DESC LIMIT 1`
        );
        return res.json(rows[0] || null);
    } catch (error) {
        console.error('Error pada getLatest:', error);
        return res.status(500).json({ error: error.message });
    }
};

// GET /api/history
exports.getHistory = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 1000);

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from('tb_sensor')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return res.json(data || []);
        }

        // Fallback MySQL
        const [rows] = await db.execute(
            `SELECT * FROM tb_sensor ORDER BY created_at DESC LIMIT ?`,
            [limit]
        );
        return res.json(rows);
    } catch (error) {
        console.error('Error pada getHistory:', error);
        return res.status(500).json({ error: error.message });
    }
};

// GET /api/summary
exports.getSummary = async (req, res) => {
    try {
        if (isSupabaseConfigured()) {
            // Hitung total baris
            const { count: totalCount, error: countErr } = await supabase
                .from('tb_sensor')
                .select('*', { count: 'exact', head: true });

            if (countErr) throw countErr;

            // Ambil sampel data terbaru untuk rata-rata dan pengelompokan status
            const { data: rows, error: rowsErr } = await supabase
                .from('tb_sensor')
                .select('potensi_banjir, status_banjir')
                .order('created_at', { ascending: false })
                .limit(1000);

            if (rowsErr) throw rowsErr;

            let sumSkor = 0;
            const statusMap = {};
            (rows || []).forEach(r => {
                sumSkor += (r.potensi_banjir || 0);
                const st = r.status_banjir || 'AMAN';
                statusMap[st] = (statusMap[st] || 0) + 1;
            });

            const rataRata = rows && rows.length > 0 ? Math.round(sumSkor / rows.length) : 0;
            const statusCount = Object.keys(statusMap).map(k => ({
                status_banjir: k,
                jumlah: statusMap[k]
            }));

            return res.json({
                total_data: totalCount || 0,
                rata_rata_skor: rataRata,
                status: statusCount
            });
        }

        // Fallback MySQL
        const [total] = await db.execute(`SELECT COUNT(*) as total FROM tb_sensor`);
        const [rata2] = await db.execute(`SELECT AVG(potensi_banjir) as rata_rata FROM tb_sensor`);
        const [statusCount] = await db.execute(`
            SELECT status_banjir, COUNT(*) as jumlah 
            FROM tb_sensor 
            GROUP BY status_banjir
        `);
        
        return res.json({
            total_data: total[0]?.total || 0,
            rata_rata_skor: Math.round(rata2[0]?.rata_rata || 0),
            status: statusCount
        });
    } catch (error) {
        console.error('Error pada getSummary:', error);
        return res.status(500).json({ error: error.message });
    }
};

// GET /api/health
exports.getHealth = (req, res) => {
    res.json({
        status: 'ok',
        database: isSupabaseConfigured() ? 'supabase' : 'mysql',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
};