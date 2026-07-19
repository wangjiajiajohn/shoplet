require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db');

const authRoutes = require('./routes/auth');
const merchantRoutes = require('./routes/merchants');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/merchants', merchantRoutes);

app.use(express.static(path.join(__dirname, '../admin-website')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'shoplet - 后端服务运行中' });
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initDatabase();
});