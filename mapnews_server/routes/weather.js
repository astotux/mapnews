const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

/**
 * GET /api/weather/districts
 * Returns real-time pre-cached weather for all districts (indexed by name and _id)
 * Response time: < 2ms (served directly from RAM cache)
 */
router.get('/districts', (req, res) => {
    try {
        const districts = weatherService.getDistrictsWeather();
        const meta = weatherService.getCacheMeta();

        // If client asked for raw map (matching frontend window.districtsWeatherMap directly)
        if (req.query.raw === 'true') {
            return res.json(districts);
        }

        res.json({
            success: true,
            updatedAt: meta.lastUpdated,
            districts: districts
        });
    } catch (err) {
        console.error('Error fetching districts weather:', err);
        res.status(500).json({ success: false, message: 'Ошибка получения погоды районов' });
    }
});

/**
 * GET /api/weather/current
 * Returns current primary weather (Syktyvkar by default for the footer widget)
 */
router.get('/current', (req, res) => {
    try {
        const current = weatherService.getCurrentWeather();
        const meta = weatherService.getCacheMeta();

        if (req.query.raw === 'true') {
            return res.json(current);
        }

        res.json({
            success: true,
            updatedAt: meta.lastUpdated,
            weather: current
        });
    } catch (err) {
        console.error('Error fetching current weather:', err);
        res.status(500).json({ success: false, message: 'Ошибка получения текущей погоды' });
    }
});

/**
 * POST /api/weather/refresh
 * Manually forces an instant background refresh
 */
router.post('/refresh', async (req, res) => {
    try {
        await weatherService.updateAllWeather();
        res.json({
            success: true,
            message: 'Погода обновлена',
            meta: weatherService.getCacheMeta()
        });
    } catch (err) {
        console.error('Error refreshing weather:', err);
        res.status(500).json({ success: false, message: 'Ошибка при обновлении' });
    }
});

module.exports = router;
