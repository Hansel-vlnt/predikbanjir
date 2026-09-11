const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const apiRoutes = require('../backend/routes/api');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API untuk Vercel: dukung prefix /api maupun root /
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

module.exports = app;
