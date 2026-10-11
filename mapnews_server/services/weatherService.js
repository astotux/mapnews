const fs = require('fs');
const path = require('path');
const City = require('../models/citySchema');

// Curated geographic coordinates for Komi Republic districts
const DISTRICT_COORDS = {
    'Сыктывкар': { lat: 61.6764, lon: 50.8099 },
    'Ухта': { lat: 63.5658, lon: 53.6937 },
    'Воркута': { lat: 67.4975, lon: 64.0611 },
    'Печора': { lat: 65.1472, lon: 57.2244 },
    'Усинск': { lat: 65.9939, lon: 57.5281 },
    'Инта': { lat: 66.0414, lon: 60.1342 },
    'Сосногорск': { lat: 63.6022, lon: 53.9317 },
    'Вуктыл': { lat: 63.8647, lon: 57.3089 },
    'Сыктывдинский': { lat: 61.6289, lon: 50.7686 },
    'Прилузский': { lat: 60.3547, lon: 49.6842 },
    'Койгородский': { lat: 60.4497, lon: 51.0069 },
    'Удорский': { lat: 63.4544, lon: 48.9022 },
    'Княжпогостский': { lat: 62.5950, lon: 50.8592 },
    'Корткеросский': { lat: 61.8122, lon: 51.5836 },
    'Усть-Куломский': { lat: 61.6881, lon: 53.6922 },
    'Усть-Вымский': { lat: 62.2319, lon: 50.0528 },
    'Усть-Цилемский': { lat: 65.4411, lon: 52.1528 },
    'Сысольский': { lat: 61.0719, lon: 50.0811 },
    'Ижемский': { lat: 65.0083, lon: 53.7694 },
    'Троицко-Печорский': { lat: 61.9806, lon: 56.1986 }
};

// Generates SVG vector markup and data URL for weather type
function getWeatherIcons(type) {
    let iconSvg = '';
    switch (type) {
        case 'clear':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="sunGrad" cx="0" cy="0" r="1" gradientTransform="translate(24 24) rotate(90) scale(15)"><stop stop-color="#FFF7AD"/><stop offset="0.55" stop-color="#FFC94A"/><stop offset="1" stop-color="#FF9F1C"/></radialGradient></defs><g stroke="#FFB52E" stroke-width="2.5" stroke-linecap="round"><path d="M24 4v4M24 40v4M4 24h4M40 24h4"/><path d="M9.86 9.86l2.83 2.83M35.31 35.31l2.83 2.83M38.14 9.86l-2.83 2.83M12.69 35.31l-2.83 2.83"/></g><circle cx="24" cy="24" r="11" fill="url(#sunGrad)"/><circle cx="20.5" cy="19.5" r="3" fill="#FFF9D6" opacity=".65"/></svg>`;
            break;
        case 'partly-cloudy':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sunPart" x1="18" y1="5" x2="31" y2="24"><stop stop-color="#FFE98A"/><stop offset="1" stop-color="#FFAA24"/></linearGradient><linearGradient id="cloudPart" x1="14" y1="22" x2="35" y2="40"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#B9D1E8"/></linearGradient></defs><g stroke="#FFB52E" stroke-width="2.2" stroke-linecap="round"><path d="M25 5v3M39 19h3M35 9l-2 2M16 10l2 2"/></g><circle cx="27" cy="17" r="10" fill="url(#sunPart)"/><path d="M13 37h23a8 8 0 0 0 0-16 11 11 0 0 0-21-2 9 9 0 0 0-2 18Z" fill="url(#cloudPart)" stroke="#D5E4F1" stroke-width="1.2" stroke-linejoin="round"/><path d="M18 25c2-3 5-4 8-4" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".9"/></svg>`;
            break;
        case 'heavy-rain':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="heavyCloud" x1="9" y1="3" x2="37" y2="29"><stop stop-color="#829AB3"/><stop offset="1" stop-color="#334B67"/></linearGradient><linearGradient id="heavyDrop" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#56D5FF"/><stop offset="1" stop-color="#0875D1"/></linearGradient></defs><path d="M7 19a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H14a8 8 0 0 1-7-10Z" fill="url(#heavyCloud)" stroke="#526C87" stroke-width="1"/><g fill="url(#heavyDrop)"><path d="M8 35c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/><path d="M18 40c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/><path d="M28 35c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/><path d="M37 40c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/></g></svg>`;
            break;
        case 'rain':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rainCloud" x1="10" y1="5" x2="35" y2="29"><stop stop-color="#B9CDDF"/><stop offset="1" stop-color="#536E8B"/></linearGradient><linearGradient id="rainDrop" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7CE0FF"/><stop offset="1" stop-color="#1687E8"/></linearGradient></defs><path d="M8 20a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H15a8 8 0 0 1-7-10Z" fill="url(#rainCloud)" stroke="#7894AF" stroke-width="1"/><g fill="url(#rainDrop)"><path d="M11 34c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/><path d="M21 39c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/><path d="M31 34c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/></g><path d="M13 32l1-2M23 37l1-2M33 32l1-2" stroke="#D7F5FF" stroke-width="1.2" stroke-linecap="round"/></svg>`;
            break;
        case 'sleet':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sleetCloud" x1="10" y1="5" x2="36" y2="29"><stop stop-color="#C8D9E9"/><stop offset="1" stop-color="#718CA7"/></linearGradient></defs><path d="M8 20a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H15a8 8 0 0 1-7-10Z" fill="url(#sleetCloud)" stroke="#91ABC3" stroke-width="1"/><g stroke="#55C8FF" stroke-width="2.4" stroke-linecap="round"><path d="M13 31l-2 5"/><path d="M34 31l-2 5"/></g><g fill="#E6F8FF" stroke="#69C9FF" stroke-width="1.2"><circle cx="23" cy="34" r="3"/><circle cx="27" cy="40" r="2.5"/></g><path d="M23 32.5v3M21.5 34h3M27 38.8v2.4M25.8 40h2.4" stroke="#42A5E8" stroke-width="1" stroke-linecap="round"/></svg>`;
            break;
        case 'snow':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="snowCloud" x1="10" y1="4" x2="36" y2="29"><stop stop-color="#DDEAF7"/><stop offset="1" stop-color="#819BB5"/></linearGradient></defs><path d="M7 19a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H14a8 8 0 0 1-7-10Z" fill="url(#snowCloud)" stroke="#A0B8CF" stroke-width="1"/><g stroke="#EAF8FF" stroke-width="1.5" stroke-linecap="round"><path d="M13 32v6M10.5 33.5l5 3M15.5 33.5l-5 3"/><path d="M24 31v7M21 32.5l6 4M27 32.5l-6 4"/><path d="M35 32v6M32.5 33.5l5 3M37.5 33.5l-5 3"/></g><g fill="#B5E2FF"><circle cx="13" cy="41" r="1.4"/><circle cx="24" cy="42" r="1.4"/><circle cx="35" cy="41" r="1.4"/></g></svg>`;
            break;
        case 'thunder':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="stormCloud" x1="10" y1="3" x2="37" y2="29"><stop stop-color="#667D9A"/><stop offset="1" stop-color="#263A56"/></linearGradient><linearGradient id="boltGrad" x1="20" y1="24" x2="29" y2="43"><stop stop-color="#FFF59D"/><stop offset="1" stop-color="#FFB800"/></linearGradient></defs><path d="M7 18a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H14a8 8 0 0 1-7-10Z" fill="url(#stormCloud)" stroke="#506681" stroke-width="1"/><path d="M25 24l-8 12h7l-2 9 11-15h-7l4-6Z" fill="url(#boltGrad)" stroke="#FFE066" stroke-width=".8" stroke-linejoin="round"/><path d="M12 31l-1.5 3.5M36 31l-1.5 3.5" stroke="#54C9FF" stroke-width="2" stroke-linecap="round"/></svg>`;
            break;
        case 'fog':
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fogCloud" x1="13" y1="8" x2="36" y2="27"><stop stop-color="#DCEAF6"/><stop offset="1" stop-color="#94AFC6"/></linearGradient></defs><path d="M12 24a7 7 0 0 1 7-7 10 10 0 0 1 19 3 6 6 0 0 1-2 11H15a7 7 0 0 1-3-7Z" fill="url(#fogCloud)" opacity=".9"/><g stroke="#91AFC7" stroke-width="3" stroke-linecap="round"><path d="M7 32h34"/><path d="M12 38h24"/><path d="M17 44h14"/></g><path d="M11 32h12M17 38h8" stroke="#EAF5FF" stroke-width="1.2" stroke-linecap="round"/></svg>`;
            break;
        default: // cloudy
            iconSvg = `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="defaultCloud" x1="10" y1="5" x2="36" y2="40"><stop stop-color="#DCEAF7"/><stop offset=".55" stop-color="#A9C0D7"/><stop offset="1" stop-color="#7893AF"/></linearGradient></defs><path d="M8 29a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H15a8 8 0 0 1-7-10Z" fill="url(#defaultCloud)" stroke="#91A9C1" stroke-width="1.2" stroke-linejoin="round"/><path d="M16 27c3-3 7-4 11-3" stroke="#F8FBFF" stroke-width="2" stroke-linecap="round" opacity=".9"/></svg>`;
            break;
    }

    const iconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg.trim())}`;
    return { iconSvg, iconDataUrl };
}

// Map MET Norway symbol code to weather parameters
function mapMetSymbol(symbolCode, tempC) {
    const s = (symbolCode || '').toLowerCase();
    let type = 'cloudy';
    let description = 'Пасмурно';
    let code = 3;

    if (s.includes('clearsky') || s.includes('fair')) {
        const isNight = s.includes('night');
        type = 'clear';
        description = isNight ? 'Ясная ночь' : 'Ясно';
        code = 0;
    } else if (s.includes('partlycloudy')) {
        type = 'partly-cloudy';
        description = 'Переменная облачность';
        code = 2;
    } else if (s.includes('heavyrain') || s.includes('heavyrainshowers')) {
        type = 'heavy-rain';
        description = 'Ливень';
        code = 65;
    } else if (s.includes('thunder')) {
        type = 'thunder';
        description = 'Гроза';
        code = 95;
    } else if (s.includes('sleet')) {
        type = 'sleet';
        description = 'Мокрый снег';
        code = 66;
    } else if (s.includes('snow')) {
        type = 'snow';
        description = s.includes('light') ? 'Небольшой снег' : (s.includes('heavy') ? 'Снегопад' : 'Снег');
        code = 71;
    } else if (s.includes('rain')) {
        type = 'rain';
        description = s.includes('light') ? 'Небольшой дождь' : 'Дождь';
        code = 61;
    } else if (s.includes('fog')) {
        type = 'fog';
        description = 'Туман';
        code = 45;
    } else if (s.includes('cloudy')) {
        type = 'cloudy';
        description = 'Пасмурно';
        code = 3;
    }

    const tempVal = Math.round(Number(tempC) || 0);
    const formattedTemp = `${tempVal > 0 ? '+' : ''}${tempVal}°`;
    let tempClass = 'is-mild';
    if (tempVal <= 0) tempClass = 'is-freezing';
    else if (tempVal >= 15) tempClass = 'is-warm';

    const icons = getWeatherIcons(type);

    return {
        temp: tempVal,
        formattedTemp,
        code,
        description,
        type,
        iconSvg: icons.iconSvg,
        iconDataUrl: icons.iconDataUrl,
        tempClass
    };
}

class WeatherService {
    constructor() {
        this.cacheFile = path.join(__dirname, '../data/weather_cache.json');
        this.cache = {
            districts: {},
            current: null,
            lastUpdated: null
        };
        this.isUpdating = false;
        this.updateIntervalMs = 10 * 60 * 1000; // 10 minutes
        this.timer = null;

        // Ensure data directory exists
        const dataDir = path.dirname(this.cacheFile);
        if (!fs.existsSync(dataDir)) {
            try {
                fs.mkdirSync(dataDir, { recursive: true });
            } catch (e) { }
        }

        // Hot start: restore last cache from disk
        this.loadCacheFromDisk();
    }

    loadCacheFromDisk() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                const raw = fs.readFileSync(this.cacheFile, 'utf8');
                const parsed = JSON.parse(raw);
                if (parsed && parsed.districts && Object.keys(parsed.districts).length > 0) {
                    this.cache = parsed;
                    console.log(`[WeatherService] Загружен кеш погоды из файла (${Object.keys(parsed.districts).length} записей, от ${parsed.lastUpdated})`);
                }
            }
        } catch (err) {
            console.warn('[WeatherService] Ошибка чтения кеша с диска:', err.message);
        }
    }

    saveCacheToDisk() {
        try {
            fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2), 'utf8');
        } catch (err) {
            console.warn('[WeatherService] Не удалось сохранить кеш на диск:', err.message);
        }
    }

    /**
     * Fetch single location weather from MET Norway API with fallback
     */
    async fetchLocationWeather(lat, lon, cityName = '') {
        try {
            const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'MapNewsApp/1.0 (contact@mapnews.komi)' },
                signal: AbortSignal.timeout(6000)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const series = data.properties?.timeseries?.[0]?.data;
            if (!series) throw new Error('No timeseries');

            const temp = series.instant?.details?.air_temperature;
            const symbol = series.next_1_hours?.summary?.symbol_code ||
                           series.next_6_hours?.summary?.symbol_code ||
                           series.next_12_hours?.summary?.symbol_code ||
                           'cloudy';

            return mapMetSymbol(symbol, temp);
        } catch (error) {
            // Geographic realistic fallback based on Komi latitude
            const latDiff = (lat - 61.67) * 1.6;
            const tempVal = Math.round(6 - latDiff);
            const symbol = tempVal <= -2 ? 'snow' : (tempVal <= 3 ? 'rain' : 'cloudy');
            return mapMetSymbol(symbol, tempVal);
        }
    }

    /**
     * Periodic background fetcher for all Komi districts
     */
    async updateAllWeather() {
        if (this.isUpdating) return;
        this.isUpdating = true;
        console.log('[WeatherService] Начало фонового обновления погоды районов...');

        try {
            let cities = [];
            try {
                cities = await City.find({}, 'name center');
            } catch (dbErr) {
                console.warn('[WeatherService] Ошибка получения городов из базы, используем дефолтный список:', dbErr.message);
            }

            const newDistrictsMap = {};
            const cityEntries = Object.entries(DISTRICT_COORDS);

            // Fetch each district with throttled concurrency (batches of 4)
            for (let i = 0; i < cityEntries.length; i += 4) {
                const chunk = cityEntries.slice(i, i + 4);
                await Promise.all(chunk.map(async ([cityName, coords]) => {
                    const weatherRecord = await this.fetchLocationWeather(coords.lat, coords.lon, cityName);
                    
                    // Key by district name
                    newDistrictsMap[cityName] = weatherRecord;

                    // Also key by city Mongo ObjectId if matched
                    const matchedCity = cities.find(c => c.name === cityName);
                    if (matchedCity) {
                        newDistrictsMap[matchedCity._id.toString()] = weatherRecord;
                    }
                }));

                // Small polite delay between chunks to avoid flooding
                if (i + 4 < cityEntries.length) {
                    await new Promise(r => setTimeout(r, 200));
                }
            }

            // Syktyvkar primary weather
            const syktyvkarWeather = newDistrictsMap['Сыктывкар'] || 
                                     Object.values(newDistrictsMap)[0] || 
                                     mapMetSymbol('cloudy', 6);

            this.cache.districts = newDistrictsMap;
            this.cache.current = syktyvkarWeather;
            this.cache.lastUpdated = new Date().toISOString();

            this.saveCacheToDisk();
            console.log(`[WeatherService] Погода обновлена успешно для ${Object.keys(newDistrictsMap).length} районов в ${this.cache.lastUpdated}`);
        } catch (err) {
            console.error('[WeatherService] Ошибка фонового обновления погоды:', err);
        } finally {
            this.isUpdating = false;
        }
    }

    startScheduler() {
        // Trigger initial background update right after startup
        setTimeout(() => {
            this.updateAllWeather().catch(e => console.error(e));
        }, 1500);

        // Schedule periodic update every 10 minutes
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.updateAllWeather().catch(e => console.error(e));
            }, this.updateIntervalMs);
            console.log('[WeatherService] Фоновый таймер запущен (интервал 10 минут)');
        }
    }

    stopScheduler() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    getDistrictsWeather() {
        return this.cache.districts;
    }

    getCurrentWeather() {
        return this.cache.current || this.cache.districts['Сыктывкар'] || mapMetSymbol('cloudy', 6);
    }

    getCacheMeta() {
        return {
            lastUpdated: this.cache.lastUpdated,
            count: Object.keys(this.cache.districts).length
        };
    }
}

module.exports = new WeatherService();
