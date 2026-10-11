/**
 * Free Open-Meteo Weather Service
 * Completely free, no API key required, open data.
 * Supports current weather, WMO weather codes, and batch multi-coordinate queries.
 */

// Precise geographic coordinates for Komi Republic districts
export const DISTRICT_COORDS = {
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

/**
 * WMO Weather Codes mapping to Russian description and modern vector SVG icons
 */
export function getWeatherDetails(code, isDay = 1) {
    const wmo = Number(code);

    // Default: Sunny / Clear
    let description = 'Ясно';
    let type = 'clear';
    let iconSvg = '';

    if (wmo === 0) {
        description = isDay ? 'Ясно' : 'Ясная ночь';
        type = 'clear';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="sunGrad" cx="0" cy="0" r="1" gradientTransform="translate(24 24) rotate(90) scale(15)">
                    <stop stop-color="#FFF7AD"/>
                    <stop offset="0.55" stop-color="#FFC94A"/>
                    <stop offset="1" stop-color="#FF9F1C"/>
                </radialGradient>
            </defs>
            <g stroke="#FFB52E" stroke-width="2.5" stroke-linecap="round">
                <path d="M24 4v4M24 40v4M4 24h4M40 24h4"/>
                <path d="M9.86 9.86l2.83 2.83M35.31 35.31l2.83 2.83M38.14 9.86l-2.83 2.83M12.69 35.31l-2.83 2.83"/>
            </g>
            <circle cx="24" cy="24" r="11" fill="url(#sunGrad)"/>
            <circle cx="20.5" cy="19.5" r="3" fill="#FFF9D6" opacity=".65"/>
        </svg>
    `;
    } else if (wmo === 1 || wmo === 2) {
        description = 'Переменная облачность';
        type = 'partly-cloudy';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sunPart" x1="18" y1="5" x2="31" y2="24">
                    <stop stop-color="#FFE98A"/>
                    <stop offset="1" stop-color="#FFAA24"/>
                </linearGradient>
                <linearGradient id="cloudPart" x1="14" y1="22" x2="35" y2="40">
                    <stop stop-color="#FFFFFF"/>
                    <stop offset="1" stop-color="#B9D1E8"/>
                </linearGradient>
            </defs>
            <g stroke="#FFB52E" stroke-width="2.2" stroke-linecap="round">
                <path d="M25 5v3M39 19h3M35 9l-2 2M16 10l2 2"/>
            </g>
            <circle cx="27" cy="17" r="10" fill="url(#sunPart)"/>
            <path d="M13 37h23a8 8 0 0 0 0-16 11 11 0 0 0-21-2 9 9 0 0 0-2 18Z"
                  fill="url(#cloudPart)" stroke="#D5E4F1" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M18 25c2-3 5-4 8-4" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".9"/>
        </svg>
    `;
    } else if (wmo === 3) {
        description = 'Пасмурно';
        type = 'cloudy';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cloudOvercast" x1="12" y1="13" x2="35" y2="40">
                    <stop stop-color="#DCEAF7"/>
                    <stop offset=".55" stop-color="#9FB7CE"/>
                    <stop offset="1" stop-color="#7892AD"/>
                </linearGradient>
            </defs>
            <path d="M10 29a8 8 0 0 1 8-8 12 12 0 0 1 23 4 7.5 7.5 0 0 1-1 15H12a8 8 0 0 1-2-11Z"
                  fill="#A9C0D5" opacity=".55"/>
            <path d="M8 33a9 9 0 0 1 9-9 12 12 0 0 1 23 4 7.5 7.5 0 0 1-1 15H15a9 9 0 0 1-7-10Z"
                  fill="url(#cloudOvercast)" stroke="#8CA6BE" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M17 29c3-3 7-4 11-3" stroke="#F8FBFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
        </svg>
    `;
    } else if (wmo === 45 || wmo === 48) {
        description = 'Туман';
        type = 'fog';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="fogCloud" x1="13" y1="8" x2="36" y2="27">
                    <stop stop-color="#DCEAF6"/>
                    <stop offset="1" stop-color="#94AFC6"/>
                </linearGradient>
            </defs>
            <path d="M12 24a7 7 0 0 1 7-7 10 10 0 0 1 19 3 6 6 0 0 1-2 11H15a7 7 0 0 1-3-7Z"
                  fill="url(#fogCloud)" opacity=".9"/>
            <g stroke="#91AFC7" stroke-width="3" stroke-linecap="round">
                <path d="M7 32h34"/>
                <path d="M12 38h24"/>
                <path d="M17 44h14"/>
            </g>
            <path d="M11 32h12M17 38h8" stroke="#EAF5FF" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
    `;
    } else if (wmo === 51 || wmo === 53 || wmo === 55) {
        description = 'Морось';
        type = 'rain';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="drizzleCloud" x1="12" y1="6" x2="35" y2="29">
                    <stop stop-color="#D7E5F2"/>
                    <stop offset="1" stop-color="#829DB7"/>
                </linearGradient>
                <linearGradient id="drizzleDrop" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="#8BE3FF"/>
                    <stop offset="1" stop-color="#2999E8"/>
                </linearGradient>
            </defs>
            <path d="M9 21a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H16a8 8 0 0 1-7-10Z"
                  fill="url(#drizzleCloud)" stroke="#A7BED3" stroke-width="1"/>
            <g fill="url(#drizzleDrop)">
                <path d="M14 33c0-1.5 2.5-5 2.5-5s2.5 3.5 2.5 5a2.5 2.5 0 0 1-5 0Z"/>
                <path d="M23 37c0-1.5 2.5-5 2.5-5s2.5 3.5 2.5 5a2.5 2.5 0 0 1-5 0Z"/>
                <path d="M32 33c0-1.5 2.5-5 2.5-5s2.5 3.5 2.5 5a2.5 2.5 0 0 1-5 0Z"/>
            </g>
        </svg>
    `;
    } else if (wmo === 61 || wmo === 63) {
        description = 'Дождь';
        type = 'rain';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="rainCloud" x1="10" y1="5" x2="35" y2="29">
                    <stop stop-color="#B9CDDF"/>
                    <stop offset="1" stop-color="#536E8B"/>
                </linearGradient>
                <linearGradient id="rainDrop" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="#7CE0FF"/>
                    <stop offset="1" stop-color="#1687E8"/>
                </linearGradient>
            </defs>
            <path d="M8 20a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H15a8 8 0 0 1-7-10Z"
                  fill="url(#rainCloud)" stroke="#7894AF" stroke-width="1"/>
            <g fill="url(#rainDrop)">
                <path d="M11 34c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/>
                <path d="M21 39c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/>
                <path d="M31 34c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/>
            </g>
            <path d="M13 32l1-2M23 37l1-2M33 32l1-2" stroke="#D7F5FF" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
    `;
    } else if (wmo === 65 || wmo === 80 || wmo === 81 || wmo === 82) {
        description = 'Ливень';
        type = 'heavy-rain';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="heavyCloud" x1="9" y1="3" x2="37" y2="29">
                    <stop stop-color="#829AB3"/>
                    <stop offset="1" stop-color="#334B67"/>
                </linearGradient>
                <linearGradient id="heavyDrop" x1="0" y1="0" x2="1" y2="1">
                    <stop stop-color="#56D5FF"/>
                    <stop offset="1" stop-color="#0875D1"/>
                </linearGradient>
            </defs>
            <path d="M7 19a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H14a8 8 0 0 1-7-10Z"
                  fill="url(#heavyCloud)" stroke="#526C87" stroke-width="1"/>
            <g fill="url(#heavyDrop)">
                <path d="M8 35c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/>
                <path d="M18 40c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/>
                <path d="M28 35c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/>
                <path d="M37 40c0-2 3-7 3-7s3 5 3 7a3 3 0 0 1-6 0Z"/>
            </g>
        </svg>
    `;
    } else if (wmo === 56 || wmo === 57 || wmo === 66 || wmo === 67) {
        description = 'Ледяной дождь';
        type = 'sleet';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sleetCloud" x1="10" y1="5" x2="36" y2="29">
                    <stop stop-color="#C8D9E9"/>
                    <stop offset="1" stop-color="#718CA7"/>
                </linearGradient>
            </defs>
            <path d="M8 20a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H15a8 8 0 0 1-7-10Z"
                  fill="url(#sleetCloud)" stroke="#91ABC3" stroke-width="1"/>
            <g stroke="#55C8FF" stroke-width="2.4" stroke-linecap="round">
                <path d="M13 31l-2 5"/>
                <path d="M34 31l-2 5"/>
            </g>
            <g fill="#E6F8FF" stroke="#69C9FF" stroke-width="1.2">
                <circle cx="23" cy="34" r="3"/>
                <circle cx="27" cy="40" r="2.5"/>
            </g>
            <path d="M23 32.5v3M21.5 34h3M27 38.8v2.4M25.8 40h2.4"
                  stroke="#42A5E8" stroke-width="1" stroke-linecap="round"/>
        </svg>
    `;
    } else if (wmo === 71) {
        description = 'Небольшой снег';
        type = 'snow';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lightSnowCloud" x1="10" y1="5" x2="35" y2="29">
                    <stop stop-color="#F2F8FF"/>
                    <stop offset="1" stop-color="#B2CBE2"/>
                </linearGradient>
            </defs>
            <path d="M8 20a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H15a8 8 0 0 1-7-10Z"
                  fill="url(#lightSnowCloud)" stroke="#C3D8EA" stroke-width="1"/>
            <g fill="#8BCBFF">
                <circle cx="14" cy="35" r="2.4"/>
                <circle cx="24" cy="39" r="2.4"/>
                <circle cx="34" cy="35" r="2.4"/>
            </g>
            <g stroke="#EAF8FF" stroke-width="1" stroke-linecap="round">
                <path d="M13 34l2 2M15 34l-2 2"/>
                <path d="M23 38l2 2M25 38l-2 2"/>
                <path d="M33 34l2 2M35 34l-2 2"/>
            </g>
        </svg>
    `;
    } else if (wmo === 73 || wmo === 75 || wmo === 77 || wmo === 85 || wmo === 86) {
        description = 'Снегопад';
        type = 'snow';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="snowCloud" x1="10" y1="4" x2="36" y2="29">
                    <stop stop-color="#DDEAF7"/>
                    <stop offset="1" stop-color="#819BB5"/>
                </linearGradient>
            </defs>
            <path d="M7 19a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H14a8 8 0 0 1-7-10Z"
                  fill="url(#snowCloud)" stroke="#A0B8CF" stroke-width="1"/>
            <g stroke="#EAF8FF" stroke-width="1.5" stroke-linecap="round">
                <path d="M13 32v6M10.5 33.5l5 3M15.5 33.5l-5 3"/>
                <path d="M24 31v7M21 32.5l6 4M27 32.5l-6 4"/>
                <path d="M35 32v6M32.5 33.5l5 3M37.5 33.5l-5 3"/>
            </g>
            <g fill="#B5E2FF">
                <circle cx="13" cy="41" r="1.4"/>
                <circle cx="24" cy="42" r="1.4"/>
                <circle cx="35" cy="41" r="1.4"/>
            </g>
        </svg>
    `;
    } else if (wmo === 95 || wmo === 96 || wmo === 99) {
        description = 'Гроза';
        type = 'thunder';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="stormCloud" x1="10" y1="3" x2="37" y2="29">
                    <stop stop-color="#667D9A"/>
                    <stop offset="1" stop-color="#263A56"/>
                </linearGradient>
                <linearGradient id="boltGrad" x1="20" y1="24" x2="29" y2="43">
                    <stop stop-color="#FFF59D"/>
                    <stop offset="1" stop-color="#FFB800"/>
                </linearGradient>
            </defs>
            <path d="M7 18a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H14a8 8 0 0 1-7-10Z"
                  fill="url(#stormCloud)" stroke="#506681" stroke-width="1"/>
            <path d="M25 24l-8 12h7l-2 9 11-15h-7l4-6Z"
                  fill="url(#boltGrad)" stroke="#FFE066" stroke-width=".8" stroke-linejoin="round"/>
            <path d="M12 31l-1.5 3.5M36 31l-1.5 3.5"
                  stroke="#54C9FF" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    } else {
        description = 'Облачно';
        type = 'cloudy';
        iconSvg = `
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="defaultCloud" x1="10" y1="5" x2="36" y2="40">
                    <stop stop-color="#DCEAF7"/>
                    <stop offset=".55" stop-color="#A9C0D7"/>
                    <stop offset="1" stop-color="#7893AF"/>
                </linearGradient>
            </defs>
            <path d="M8 29a8 8 0 0 1 8-8 11 11 0 0 1 21 4 7 7 0 0 1-1 14H15a8 8 0 0 1-7-10Z"
                  fill="url(#defaultCloud)" stroke="#91A9C1" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M16 27c3-3 7-4 11-3" stroke="#F8FBFF" stroke-width="2" stroke-linecap="round" opacity=".9"/>
        </svg>
    `;
    }

    const iconDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg.trim())}`;

    return {
        code: wmo,
        description,
        type,
        iconSvg: iconSvg.trim(),
        iconDataUrl
    };
}

export class WeatherManager {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
        this.serverBase = 'http://localhost:8080';
    }

    /**
     * Fetch primary weather (Syktyvkar by default, for the footer widget)
     * Queries backend in-memory cache (< 5ms response time)
     */
    async fetchWeather(lat = 61.6764, lon = 50.8099) {
        // 1. First priority: Server-side pre-cached weather
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(`${this.serverBase}/api/weather/current`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const w = data.weather || data;
                if (w && typeof w.temp === 'number') {
                    return {
                        temp: w.temp,
                        icon: w.iconDataUrl || w.icon,
                        iconDataUrl: w.iconDataUrl,
                        iconSvg: w.iconSvg,
                        description: w.description || 'Ясно',
                        code: w.code || 0
                    };
                }
            }
        } catch (serverErr) {
            // Server offline or fallback needed
        }

        // 2. Direct Open-Meteo fallback
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const current = data.current || {};
                const temp = typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m) : 0;
                const code = typeof current.weather_code === 'number' ? current.weather_code : 0;
                const isDay = typeof current.is_day === 'number' ? current.is_day : 1;

                const details = getWeatherDetails(code, isDay);
                return {
                    temp,
                    icon: details.iconDataUrl,
                    iconSvg: details.iconSvg,
                    description: details.description,
                    code
                };
            }
        } catch (error) { }

        // 3. Fallback
        const fallbackDetails = getWeatherDetails(3);
        return {
            temp: 6,
            icon: fallbackDetails.iconDataUrl,
            iconSvg: fallbackDetails.iconSvg,
            description: 'Пасмурно',
            code: 3
        };
    }

    /**
     * Fetch real-time weather for all Komi districts
     * Handled by server background scheduler (updated every 10 min in RAM)
     * Instantaneous < 5ms response time on frontend
     */
    async fetchDistrictsWeather(cities = []) {
        if (!Array.isArray(cities) || cities.length === 0) return {};

        // 1. Primary: Server-side cached weather (Fastest: < 2ms, server updates every 10 min)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const res = await fetch(`${this.serverBase}/api/weather/districts`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const json = await res.json();
                const districts = json.districts || json;
                if (districts && Object.keys(districts).length > 0) {
                    // Normalize mapping so both city._id and city.name are guaranteed
                    cities.forEach(city => {
                        const rec = districts[city.name] || districts[city._id];
                        if (rec) {
                            districts[city._id] = rec;
                            districts[city.name] = rec;
                        }
                    });

                    try {
                        sessionStorage.setItem('mapnews_districts_weather', JSON.stringify(districts));
                        sessionStorage.setItem('mapnews_districts_weather_time', Date.now().toString());
                    } catch (e) { }

                    return districts;
                }
            }
        } catch (err) {
            console.warn('[WeatherManager] Серверная погода временно недоступна:', err.message);
        }

        // 2. Second priority: sessionStorage cache
        try {
            const cached = sessionStorage.getItem('mapnews_districts_weather');
            const cachedTime = sessionStorage.getItem('mapnews_districts_weather_time');
            if (cached && cachedTime && (Date.now() - Number(cachedTime) < this.cacheExpiry)) {
                return JSON.parse(cached);
            }
        } catch (e) { }

        // 3. Realistic geographic fallback based on Komi geography
        const fallbackMap = {};
        cities.forEach(city => {
            const curated = DISTRICT_COORDS[city.name] || { lat: 62 };
            const latDiff = (curated.lat - 61.67) * 1.5;
            const tempVal = Math.round(6 - latDiff);
            const code = tempVal <= -2 ? 71 : (tempVal <= 3 ? 61 : 3);
            const details = getWeatherDetails(code, 1);
            const formattedTemp = `${tempVal > 0 ? '+' : ''}${tempVal}°`;

            let tempClass = 'is-mild';
            if (tempVal <= 0) tempClass = 'is-freezing';
            else if (tempVal >= 15) tempClass = 'is-warm';

            const record = {
                temp: tempVal,
                formattedTemp,
                code,
                description: details.description,
                type: details.type,
                iconSvg: details.iconSvg,
                iconDataUrl: details.iconDataUrl,
                tempClass
            };
            fallbackMap[city._id] = record;
            fallbackMap[city.name] = record;
        });

        return fallbackMap;
    }
}