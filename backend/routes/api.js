const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Health Check untuk Cloud Monitoring (Render, Railway, Kubernetes, etc.)
router.get('/health', sensorController.getHealth);

// Endpoint penerimaan data dari Arduino / ESP32
router.post('/sensor', sensorController.receiveData);

// Endpoint data sensor untuk Web Dashboard
router.get('/latest', sensorController.getLatest);
router.get('/history', sensorController.getHistory);
router.get('/summary', sensorController.getSummary);

// Endpoint alias kompatibilitas
router.get('/sensor/latest', sensorController.getLatest);
router.get('/sensor/history', sensorController.getHistory);

module.exports = router;