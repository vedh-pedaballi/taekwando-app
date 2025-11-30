const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Routes
app.use('/api', authRoutes);

app.get('/', (req, res) => {
    res.send('Taekwondo App API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
