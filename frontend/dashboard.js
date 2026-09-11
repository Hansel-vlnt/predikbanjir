// ============================================
// KONFIGURASI
// ============================================
const API_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : (window.location.origin ? window.location.origin + '/api' : '/api');
let chart = null;
let refreshInterval = null;

// ============================================
// FUNGSI KATEGORI
// ============================================
function getCategoryCurahHujan(value) {
    if (value <= 0) return 'TIDAK HUJAN';
    if (value <= 100) return 'RENDAH';
    if (value <= 300) return 'SEDANG';
    return 'TINGGI';
}

function getCategoryDurasi(value) {
    if (value <= 0) return 'TIDAK HUJAN';
    if (value < 60) return 'SINGKAT';
    if (value <= 120) return 'SEDANG';
    return 'LAMA';
}

function getCategoryIntensitas(value) {
    if (value <= 0) return 'TIDAK HUJAN';
    if (value <= 10) return 'RENDAH';
    if (value <= 20) return 'SEDANG';
    return 'TINGGI';
}

// ============================================
// UPDATE STATUS CARD
// ============================================
function updateStatusCard(data) {
    const statusCard = document.getElementById('statusCard');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const scoreValue = document.getElementById('scoreValue');
    const progressFill = document.getElementById('progressFill');
    const timestamp = document.getElementById('timestamp');
    
    statusCard.classList.remove('aman', 'waspada', 'bahaya', 'tidak-hujan');
    
    // CEK APAKAH TIDAK HUJAN
    const isNotRaining = !data || 
                         data.curah_hujan === 0 || 
                         data.curah_hujan === null || 
                         data.curah_hujan === undefined ||
                         data.curah_hujan === "0";
    
    if (isNotRaining) {
        console.log("☀️ TIDAK HUJAN");
        
        statusCard.classList.add('tidak-hujan');
        statusIcon.innerHTML = '☀️';
        statusText.innerHTML = 'TIDAK HUJAN';
        scoreValue.innerHTML = '0';
        progressFill.style.width = '0%';
        
        if (timestamp) {
            timestamp.innerHTML = `Terakhir update: ${new Date().toLocaleString()}`;
        }
        
        // Reset semua sensor values
        document.getElementById('curahValue').innerHTML = '0';
        document.getElementById('durasiValue').innerHTML = '0';
        document.getElementById('intensitasValue').innerHTML = '0';
        document.getElementById('curahCategory').innerHTML = 'TIDAK HUJAN';
        document.getElementById('durasiCategory').innerHTML = 'TIDAK HUJAN';
        document.getElementById('intensitasCategory').innerHTML = 'TIDAK HUJAN';
        return;
    }
    
    // ADA HUJAN
    console.log("🌧️ ADA HUJAN - Curah:", data.curah_hujan);
    
    let status = data.status_banjir || 'AMAN';
    let score = data.potensi_banjir || 0;
    
    if (status.includes('AMAN')) {
        statusCard.classList.add('aman');
        statusIcon.innerHTML = '🟢';
    } else if (status.includes('WASPADA')) {
        statusCard.classList.add('waspada');
        statusIcon.innerHTML = '🟡';
    } else {
        statusCard.classList.add('bahaya');
        statusIcon.innerHTML = '🔴';
    }
    
    progressFill.style.width = `${(score / 100) * 100}%`;
    statusText.innerHTML = status;
    scoreValue.innerHTML = score;
    
    document.getElementById('curahValue').innerHTML = data.curah_hujan || 0;
    document.getElementById('durasiValue').innerHTML = data.durasi_hujan || 0;
    document.getElementById('intensitasValue').innerHTML = data.intensitas_hujan || 0;
    document.getElementById('curahCategory').innerHTML = getCategoryCurahHujan(data.curah_hujan || 0);
    document.getElementById('durasiCategory').innerHTML = getCategoryDurasi(data.durasi_hujan || 0);
    document.getElementById('intensitasCategory').innerHTML = getCategoryIntensitas(data.intensitas_hujan || 0);
    
    if (data.created_at) {
        timestamp.innerHTML = `Terakhir update: ${new Date(data.created_at).toLocaleString()}`;
    }
}

// ============================================
// UPDATE SENSOR VALUES
// ============================================
function updateSensorValues(data) {
    if (!data) {
        document.getElementById('curahValue').innerHTML = '0';
        document.getElementById('durasiValue').innerHTML = '0';
        document.getElementById('intensitasValue').innerHTML = '0';
        document.getElementById('curahCategory').innerHTML = 'TIDAK HUJAN';
        document.getElementById('durasiCategory').innerHTML = 'TIDAK HUJAN';
        document.getElementById('intensitasCategory').innerHTML = 'TIDAK HUJAN';
        return;
    }
    
    if (data.curah_hujan === 0 || data.curah_hujan === null || data.curah_hujan === undefined) {
        document.getElementById('curahValue').innerHTML = '0';
        document.getElementById('durasiValue').innerHTML = '0';
        document.getElementById('intensitasValue').innerHTML = '0';
        document.getElementById('curahCategory').innerHTML = 'TIDAK HUJAN';
        document.getElementById('durasiCategory').innerHTML = 'TIDAK HUJAN';
        document.getElementById('intensitasCategory').innerHTML = 'TIDAK HUJAN';
        return;
    }
    
    document.getElementById('curahValue').innerHTML = data.curah_hujan || 0;
    document.getElementById('durasiValue').innerHTML = data.durasi_hujan || 0;
    document.getElementById('intensitasValue').innerHTML = data.intensitas_hujan || 0;
    document.getElementById('curahCategory').innerHTML = getCategoryCurahHujan(data.curah_hujan || 0);
    document.getElementById('durasiCategory').innerHTML = getCategoryDurasi(data.durasi_hujan || 0);
    document.getElementById('intensitasCategory').innerHTML = getCategoryIntensitas(data.intensitas_hujan || 0);
}

// ============================================
// FETCH LATEST DATA
// ============================================
async function fetchLatest() {
    try {
        const response = await fetch(`${API_URL}/latest`);
        if (!response.ok) return;
        const data = await response.json();
        console.log("Data terbaru:", data);
        updateStatusCard(data);
        updateSensorValues(data);
    } catch (error) {
        console.error('Error fetching latest data:', error);
        updateStatusCard(null);
        updateSensorValues(null);
    }
}

// ============================================
// UPDATE STATISTIK
// ============================================
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/summary`);
        if (!response.ok) return;
        const stats = await response.json();
        
        document.getElementById('totalData').innerHTML = stats.total_data || 0;
        document.getElementById('rataSkor').innerHTML = stats.rata_rata_skor || 0;
        
        if (stats.status && Array.isArray(stats.status)) {
            const aman = stats.status.find(s => s.status_banjir && s.status_banjir.includes('AMAN')) || { jumlah: 0 };
            const bahaya = stats.status.find(s => s.status_banjir && s.status_banjir.includes('BAHAYA')) || { jumlah: 0 };
            document.getElementById('statusAman').innerHTML = aman.jumlah || 0;
            document.getElementById('statusBahaya').innerHTML = bahaya.jumlah || 0;
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// ============================================
// UPDATE HISTORY
// ============================================
async function updateHistory() {
    const tbody = document.getElementById('historyBody');
    try {
        const response = await fetch(`${API_URL}/history?limit=20`);
        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`HTTP ${response.status} (${errBody.slice(0, 60)})`);
        }
        const data = await response.json();
        
        if (data && data.error) {
            tbody.innerHTML = `<tr><td colspan="6" class="loading" style="color: #e74c3c;">⚠️ Database belum terhubung: ${data.error}<br><small>Pastikan SUPABASE_URL & SUPABASE_KEY sudah diisi di Vercel Settings > Environment Variables</small></td></tr>`;
            return;
        }
        
        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">Belum ada data sensor tercatat</td></tr>';
            return;
        }
        
        // Tampilkan SEMUA data (termasuk yang 0) untuk riwayat
        tbody.innerHTML = data.map(row => {
            let statusClass = '';
            let statusText = row.status_banjir || '';
            
            // Jika curah = 0, tampilkan TIDAK HUJAN
            if (row.curah_hujan === 0) {
                statusClass = 'status-aman';
                statusText = '☀️ TIDAK HUJAN';
            } else if (statusText.includes('AMAN')) {
                statusClass = 'status-aman';
            } else if (statusText.includes('WASPADA')) {
                statusClass = 'status-waspada';
            } else if (statusText.includes('BAHAYA')) {
                statusClass = 'status-bahaya';
            }
            
            return `
                <tr>
                    <td>${new Date(row.created_at).toLocaleString()}</td>
                    <td>${row.curah_hujan}</td>
                    <td>${row.durasi_hujan}</td>
                    <td>${row.intensitas_hujan}</td>
                    <td>${row.potensi_banjir}</td>
                    <td class="${statusClass}">${statusText}</td>
                </tr>
            `;
        }).join('');
        
        // Filter data > 0 untuk chart
        const chartData = data.filter(row => row.curah_hujan > 0);
        updateChart(chartData.reverse());
    } catch (error) {
        console.error('Error fetching history:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="loading" style="color: #e74c3c;">⚠️ Gagal menghubungi server API: ${error.message}<br><small>Target: ${API_URL}/history</small></td></tr>`;
    }
}



// ============================================
// UPDATE CHART (HANYA SATU VERSION)
// ============================================
function updateChart(data) {
    const labels = data.map(d => {
        const date = new Date(d.created_at);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    });
    const scores = data.map(d => d.potensi_banjir || 0);
    
    if (chart) {
        chart.destroy();
        chart = null;
    }
    
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['Tidak Ada Data'],
            datasets: [{
                label: 'Skor Potensi Banjir',
                data: scores.length > 0 ? scores : [0],
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.1)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#2a5298',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // ← PAKAI INI
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 11, weight: '600' },
                        boxWidth: 12,
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { size: 12, weight: '700' },
                    bodyFont: { size: 11 },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => {
                            const score = ctx.raw;
                            let status = '';
                            if (score <= 40) status = '🟢 AMAN';
                            else if (score >= 60) status = '🔴 BAHAYA';
                            else status = '🟡 WASPADA';
                            return `Skor: ${score} - ${status}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Skor Potensi Banjir',
                        font: { size: 11, weight: '600' }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.06)',
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 10 },
                        stepSize: 10
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Waktu',
                        font: { size: 11, weight: '600' }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { size: 9 },
                        maxTicksLimit: 10,
                        autoSkip: true,
                        maxRotation: 30,
                        minRotation: 20
                    }
                }
            },
            animation: {
                duration: 400
            }
        }
    });
}

// ============================================
// UPDATE REKAP HARIAN
// ============================================
async function updateRekapHarian() {
    const tbody = document.getElementById('rekapBody');
    try {
        const response = await fetch(`${API_URL}/history?limit=1000`);
        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`HTTP ${response.status} (${errBody.slice(0, 60)})`);
        }
        const data = await response.json();
        
        if (data && data.error) {
            tbody.innerHTML = `<tr><td colspan="5" class="loading" style="color: #e74c3c;">⚠️ Database belum terhubung: ${data.error}</td></tr>`;
            return;
        }
        
        if (!Array.isArray(data) || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">Belum ada data</td></tr>';
            return;
        }
        
        // Filter data dengan curah > 0
        const filteredData = data.filter(row => row.curah_hujan > 0);
        
        if (filteredData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">Belum ada data hujan</td></tr>';
            return;
        }
        
        const rekap = {};
        filteredData.forEach(row => {
            const tanggal = new Date(row.created_at).toLocaleDateString('id-ID');
            if (!rekap[tanggal]) {
                rekap[tanggal] = {
                    total_curah: 0,
                    jumlah: 0,
                    skor_tertinggi: 0,
                    status_tertinggi: 'AMAN'
                };
            }
            rekap[tanggal].total_curah += row.curah_hujan || 0;
            rekap[tanggal].jumlah++;
            if ((row.potensi_banjir || 0) > rekap[tanggal].skor_tertinggi) {
                rekap[tanggal].skor_tertinggi = row.potensi_banjir || 0;
                rekap[tanggal].status_tertinggi = row.status_banjir || 'AMAN';
            }
        });
        
        const sortedDates = Object.keys(rekap).sort((a, b) => {
            const dateA = new Date(a.split('/').reverse().join('-'));
            const dateB = new Date(b.split('/').reverse().join('-'));
            return dateB - dateA;
        });
        
        tbody.innerHTML = sortedDates.slice(0, 10).map(tanggal => {
            const r = rekap[tanggal];
            let statusClass = '';
            if (r.status_tertinggi.includes('AMAN')) statusClass = 'status-aman';
            else if (r.status_tertinggi.includes('WASPADA')) statusClass = 'status-waspada';
            else if (r.status_tertinggi.includes('BAHAYA')) statusClass = 'status-bahaya';
            
            return `
                <tr>
                    <td>${tanggal}</td>
                    <td>${r.total_curah.toFixed(1)} mm</td>
                    <td>${r.jumlah}</td>
                    <td>${r.skor_tertinggi}</td>
                    <td class="${statusClass}">${r.status_tertinggi}</td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error fetching rekap:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="loading" style="color: #e74c3c;">⚠️ Gagal memuat rekap harian: ${error.message}</td></tr>`;
    }
}

// ============================================
// REFRESH ALL DATA
// ============================================
function refreshChart() {
    updateHistory();
}

async function refreshAllData() {
    await Promise.all([
        fetchLatest(), 
        updateHistory(), 
        updateStats(),
        updateRekapHarian()
    ]);
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    await refreshAllData();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(refreshAllData, 3000); // 3 detik agar lebih cepat
}

document.addEventListener('DOMContentLoaded', init);

console.log('✅ Dashboard berhasil dimuat!');
console.log(`📡 API URL: ${API_URL}`);