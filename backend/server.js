require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const professionRoutes = require('./routes/professions');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/test');
const statsRoutes = require('./routes/stats');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/professions', professionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/test', testRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));