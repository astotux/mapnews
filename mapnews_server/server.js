const dns = require('dns');
try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) { }

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { PORT, MONGO_URI } = require('./config');

const favoritesRoutes = require('./routes/favorites');
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const citiesRoutes = require('./routes/cities');
const sourcesRoutes = require('./routes/source');

const app = express();

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB подключен'))
    .catch(err => {
        console.error('Ошибка подключения к MongoDB Atlas:', err.message);
        console.log('Попытка подключения к локальной MongoDB (mongodb://127.0.0.1:27017/news)...');
        return mongoose.connect('mongodb+srv://admin:E0YEWac4wSDIxC5D@cluster0.eze8dor.mongodb.net/news')
            .then(() => console.log('Подключено к локальной MongoDB!'))
            .catch(localErr => console.error('Не удалось подключиться к базе данных:', localErr.message));
    });


app.use(express.json());

app.use(cors());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/favorites', favoritesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/sources', sourcesRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});