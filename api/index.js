// Entrypoint Serverless Function untuk Vercel
const app = require('../backend/server');

// Ekspor Express app untuk dihandle oleh runtime @vercel/node
module.exports = app;
