const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use('/api', apiRoutes);

// Sajikan Frontend Dashboard secara langsung dari backend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback untuk SPA / Web Dashboard (selain route /api)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
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