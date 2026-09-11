const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API: dukung baik dengan prefix /api maupun root / (kompatibilitas penuh Vercel Serverless rewrite)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Deteksi folder statis: prioritaskan 'public' (standar Vercel CDN), fallback ke 'frontend'
const publicDir = path.join(__dirname, '../public');
const frontendDir = path.join(__dirname, '../frontend');
const staticPath = fs.existsSync(publicDir) ? publicDir : frontendDir;

app.use(express.static(staticPath));

// Fallback untuk SPA / Web Dashboard (selain route /api)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/sensor') || req.path.startsWith('/latest') || req.path.startsWith('/history') || req.path.startsWith('/summary')) {
        return next();
    }
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    next();
});

// Jalankan server jika dieksekusi langsung
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`=================================================`);
        console.log(`🚀 IoT Flood Prediction Server is Running!`);
        console.log(`🌐 Web Dashboard  : http://localhost:${PORT}`);
        console.log(`📡 Health Check   : http://localhost:${PORT}/api/health`);
        console.log(`📡 Sensor API     : POST http://localhost:${PORT}/api/sensor`);
        console.log(`📊 Latest Data    : GET  http://localhost:${PORT}/api/latest`);
        console.log(`📈 History Data   : GET  http://localhost:${PORT}/api/history`);
        console.log(`📋 Summary Data   : GET  http://localhost:${PORT}/api/summary`);
        console.log(`=================================================`);
    });
}

module.exports = app;