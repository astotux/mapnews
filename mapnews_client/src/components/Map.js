/**
 * Custom Vector Map Manager with Animated Weather Polygons and Surface Temperature Labels
 */

// Geographic anchors for temperature labels placed in the central area of each district
export const DISTRICT_TEMP_ANCHORS = {
    'Сыктывкар': [50.78, 61.78],
    'Воркута': [64.20, 67.48],
    'Сосногорск': [55.10, 63.40],
    'Корткеросский': [52.30, 62.2],
    'Троицко-Печорский': [57.70, 62.65],
    'Усинск': [56.10, 65.85],
    'Печора': [58.0, 65.30],
    'Прилузский': [49.30, 60.55],
    'Княжпогостский': [51.35, 63.7],
    'Усть-Куломский': [54.3, 62.0],
    'Усть-Цилемский': [51.40, 65.95],
    'Сысольский': [49.9, 61.2],
    'Ухта': [53.15, 63.9],
    'Вуктыл': [58.30, 64.2],
    'Койгородский': [51.05, 60.65],
    'Усть-Вымский': [49.95, 62.33],
    'Ижемский': [54.20, 65.6],
    'Инта': [61.00, 65.85],
    'Сыктывдинский': [50.70, 61.45],
    'Удорский': [49.60, 64.15]
};

export class MapManager {
    constructor(containerId, location, layers) {
        this.container = document.getElementById(containerId);
        this.markers = new Map();
        this.polygons = new Map();
        this.weatherOverlays = new Map();
        this.tempLabels = new Map();
        this.cityBounds = [];

        // Pan & Zoom state
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.hasAutoFitted = false;

        this.init();
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.classList.add('custom-map-container');

        // SVG layer for vector region polygons & animated weather
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.classList.add('custom-map-svg');
        this.container.appendChild(this.svg);

        // Inject animated weather patterns in SVG defs
        this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        this.defs.innerHTML = this.getWeatherPatternDefs();
        this.svg.appendChild(this.defs);

        // Main transform group inside SVG
        this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.g.classList.add('custom-map-group');
        this.svg.appendChild(this.g);

        // Layer 1: Base district polygons
        this.polygonsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.polygonsLayer.classList.add('custom-map-polygons-layer');
        this.g.appendChild(this.polygonsLayer);

        // Layer 2: Animated weather texture overlay across each polygon
        this.weatherLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.weatherLayer.classList.add('custom-map-weather-layer');
        this.g.appendChild(this.weatherLayer);

        // Layer 3: Temperature numbers printed directly on the polygon surface
        this.tempLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.tempLayer.classList.add('custom-map-temp-layer');
        this.g.appendChild(this.tempLayer);

        // HTML Layer for markers overlay (city names and coats of arms)
        this.markersContainer = document.createElement('div');
        this.markersContainer.classList.add('custom-map-markers-layer');
        this.container.appendChild(this.markersContainer);

        // Pan and Zoom event listeners
        this.setupInteractions();
    }

    /**
     * Animated SVG patterns for all weather types (Rain, Snow, Clouds, Fog, Sun, Thunder)
     */
    getWeatherPatternDefs() {
        return `
        <defs>
            <!-- Rain: Elegant flowing raindrops -->
            <pattern id="pattern-weather-rain" width="100" height="100" patternUnits="userSpaceOnUse">
                            <g
                stroke="#D7E9FF"
                stroke-width="1.2"
                stroke-linecap="round"
                opacity="0.55"
            >
                <path d="M18 8 L13 22" />
                <path d="M72 38 L67 52" />
                <path d="M43 68 L38 82" />
            </g>

            <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 -100"
                to="0 0"
                dur="5s"
                repeatCount="indefinite"
            />
            </pattern>

            <!-- Heavy rain: Dense, dynamic blue streaks -->
            <pattern id="pattern-weather-heavy-rain" width="100" height="100" patternUnits="userSpaceOnUse">
                <g
    stroke="#C6E0FF"
    stroke-width="1.4"
    stroke-linecap="round"
    opacity="0.7"
  >
    <path d="M12 5 L7 20" />
    <path d="M52 18 L47 33" />
    <path d="M85 45 L80 60" />
    <path d="M29 58 L24 73" />
    <path d="M65 82 L60 97" />
  </g>

  <animateTransform
    attributeName="patternTransform"
    type="translate"
    from="0 -100"
    to="0 0"
    dur="4s"
    repeatCount="indefinite"
  />
            </pattern>

            <!-- Snow: Delicate crystalline snowflakes -->
            <pattern id="pattern-weather-snow" width="48" height="48" patternUnits="userSpaceOnUse">
                <g stroke="#E0F2FE" stroke-linecap="round" stroke-width="1.25" opacity=".9">
                    <path d="M12 5v12M7 8l10 6M17 8L7 14"/>
                    <path d="M35 26v10M31 29l8 5M39 29l-8 5"/>
                    <path d="M17 35v7M14 37l6 3M20 37l-6 3"/>
                </g>
                <g fill="#FFFFFF">
                    <circle cx="29" cy="9" r="1.6" opacity=".8"/>
                    <circle cx="5" cy="30" r="1.3" opacity=".7"/>
                    <circle cx="42" cy="44" r="1.5" opacity=".85"/>
                </g>
                <animateTransform attributeName="patternTransform" type="translate"
                    from="0 -48" to="5 48" dur="4s" repeatCount="indefinite"/>
            </pattern>

            <!-- Sleet: Crystal ice mixed with rain -->
            <pattern id="pattern-weather-sleet" width="40" height="40" patternUnits="userSpaceOnUse">
                <g stroke-linecap="round">
                    <path d="M9 3l-4 12" stroke="#38BDF8" stroke-width="2" opacity=".8"/>
                    <path d="M29 22l-4 12" stroke="#60A5FA" stroke-width="1.8" opacity=".7"/>
                </g>
                <g stroke="#E0F2FE" stroke-width="1.2" stroke-linecap="round">
                    <path d="M24 5v7M21 6.5l6 4M27 6.5l-6 4"/>
                    <path d="M13 25v7M10 26.5l6 4M16 26.5l-6 4"/>
                </g>
                <g fill="#FFFFFF">
                    <circle cx="33" cy="10" r="1.6" opacity=".9"/>
                    <circle cx="7" cy="34" r="1.4" opacity=".75"/>
                </g>
                <animateTransform attributeName="patternTransform" type="translate"
                    from="0 -40" to="-7 40" dur="1.35s" repeatCount="indefinite"/>
            </pattern>

            <!-- Thunderstorm: Electric rain with golden sparks -->
            <pattern id="pattern-weather-thunder" width="38" height="38" patternUnits="userSpaceOnUse">
                <g stroke-linecap="round">
                    <path d="M8 2l-4 13" stroke="#38BDF8" stroke-width="2.2" opacity=".9"/>
                    <path d="M30 19l-4 13" stroke="#60A5FA" stroke-width="2" opacity=".8"/>
                </g>
                <path d="M20 7l-4 7h4l-3 6 8-9h-4l2-4Z"
                    fill="#FACC15" opacity=".95"/>
                <circle cx="32" cy="7" r="1.5" fill="#FDE68A" opacity=".8"/>
                <animateTransform attributeName="patternTransform" type="translate"
                    from="0 -38" to="-10 38" dur=".6s" repeatCount="indefinite"/>
            </pattern>

            <!-- Cloudy: Soft layered cloud silhouettes -->
            <pattern id="pattern-weather-cloudy" width="100" height="56" patternUnits="userSpaceOnUse">
                <path d="M8 31a9 9 0 0 1 9-9 13 13 0 0 1 24 3h3a8 8 0 0 1 0 16H17a9 9 0 0 1-9-10Z"
                    fill="#CBD5E1" opacity=".22"/>
                <path d="M54 12a6 6 0 0 1 6-6 9 9 0 0 1 17 3h2a6 6 0 0 1 0 12H61a7 7 0 0 1-7-9Z"
                    fill="#E2E8F0" opacity=".18"/>
                <path d="M17 27c5-4 11-4 16-2" stroke="#FFFFFF" stroke-width="1.5"
                    stroke-linecap="round" opacity=".3"/>
                <animateTransform attributeName="patternTransform" type="translate"
                    from="-100 0" to="100 0" dur="28s" repeatCount="indefinite"/>
            </pattern>

            <!-- Partly cloudy: Warm solar glows and drifting clouds -->
            <pattern id="pattern-weather-partly-cloudy" width="100" height="58" patternUnits="userSpaceOnUse">
                <defs>
                    <radialGradient id="patternSunGlow">
                        <stop offset="0" stop-color="#FDE68A" stop-opacity=".6"/>
                        <stop offset="1" stop-color="#F59E0B" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <circle cx="26" cy="20" r="18" fill="url(#patternSunGlow)"/>
                <circle cx="26" cy="20" r="5" fill="#FBBF24" opacity=".45"/>
                <g stroke="#FDE68A" stroke-width="1.5" stroke-linecap="round" opacity=".45">
                    <path d="M26 10V7M26 30v3M16 20h-3M36 20h3M19 13l-2-2M33 27l2 2"/>
                </g>
                <path d="M37 38a7 7 0 0 1 7-7 10 10 0 0 1 19 3h2a6 6 0 0 1 0 12H44a7 7 0 0 1-7-8Z"
                    fill="#E2E8F0" opacity=".3"/>
                <animateTransform attributeName="patternTransform" type="translate"
                    from="-100 0" to="100 0" dur="30s" repeatCount="indefinite"/>
            </pattern>

            <!-- Fog: Layered translucent mist -->
            <pattern id="pattern-weather-fog" width="100" height="48" patternUnits="userSpaceOnUse">
                <g fill="none" stroke-linecap="round">
                    <path d="M-10 13h58" stroke="#E2E8F0" stroke-width="5" opacity=".25"/>
                    <path d="M34 23h76" stroke="#CBD5E1" stroke-width="4" opacity=".3"/>
                    <path d="M-20 34h72" stroke="#F1F5F9" stroke-width="5" opacity=".35"/>
                    <path d="M57 43h58" stroke="#94A3B8" stroke-width="3" opacity=".2"/>
                </g>
                <animateTransform attributeName="patternTransform" type="translate"
                    from="-100 0" to="100 0" dur="18s" repeatCount="indefinite"/>
            </pattern>

            <!-- Clear sky: Elegant golden dust and sun glints -->
            <pattern id="pattern-weather-clear" width="72" height="72" patternUnits="userSpaceOnUse">
                <defs>
                    <radialGradient id="patternGoldenGlow">
                        <stop offset="0" stop-color="#FDE68A" stop-opacity=".5"/>
                        <stop offset="1" stop-color="#F59E0B" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <circle cx="20" cy="20" r="14" fill="url(#patternGoldenGlow)"/>
                <circle cx="20" cy="20" r="2" fill="#FBBF24" opacity=".6"/>
                <circle cx="54" cy="48" r="1.5" fill="#FDE68A" opacity=".6"/>
                <circle cx="43" cy="9" r="1" fill="#FFFFFF" opacity=".8"/>
                <g stroke="#FBBF24" stroke-linecap="round" opacity=".35">
                    <path d="M20 14v-3M20 26v3M14 20h-3M26 20h3" stroke-width="1.2"/>
                    <path d="M48 34l2 2M50 34l-2 2" stroke-width="1.4"/>
                </g>
                <animateTransform attributeName="patternTransform" type="translate"
                    from="0 0" to="18 18" dur="12s" repeatCount="indefinite"/>
            </pattern>
        </defs>
    `;
    }

    // Convert GeoJSON [lng, lat] to Web Mercator normalized coords [0..1, 0..1]
    project([lng, lat]) {
        const l = Number(lng);
        const b = Number(lat);

        const radLat = (b * Math.PI) / 180;
        const x = (l + 180) / 360;
        const y = (1 - Math.log(Math.tan(radLat) + 1 / Math.cos(radLat)) / Math.PI) / 2;
        return [x, y];
    }

    geoToPixel(coords) {
        const [x, y] = this.project(coords);
        const px = (x - this.baseCenterX) * this.baseScale;
        const py = (y - this.baseCenterY) * this.baseScale;
        return [px, py];
    }

    autoFitBounds() {
        if (this.cityBounds.length === 0) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.cityBounds.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });

        const width = this.container.clientWidth || 1000;
        const height = this.container.clientHeight || 800;

        const rangeX = maxX - minX || 0.01;
        const rangeY = maxY - minY || 0.01;

        const padding = 80;
        const isMobile = window.innerWidth <= 992;
        const availableHeight = isMobile ? height * 0.48 : height;
        const scaleX = (width - padding * 2) / rangeX;
        const scaleY = (availableHeight - padding * 2) / rangeY;

        this.baseScale = Math.min(scaleX, scaleY);
        this.baseCenterX = (minX + maxX) / 2;
        this.baseCenterY = (minY + maxY) / 2;

        this.panX = isMobile ? (width / 2) : (width / 2 + 380);
        this.panY = isMobile ? (height * 0.24) : (height / 2);
        this.scale = 1;

        this.updateTransform();
        this.rebuildPolygons();
    }

    updateTransform() {
        if (!this.g || !this.markersContainer) return;

        this.g.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.scale})`);
        this.markersContainer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;

        // Scale town markers
        const invScale = Math.min(1.2, Math.max(0.12, 1 / Math.pow(this.scale, 0.65)));
        this.markersContainer.querySelectorAll('.marker').forEach(marker => {
            const activeMult = marker.classList.contains('active') ? 1.1 : 1.0;
            marker.style.transform = `translate(-50%, -50%) scale(${invScale * activeMult})`;
        });

        // Adaptively scale temperature text font size so it remains clear and non-intrusive at any zoom
        const tempFontScale = Math.min(1.35, Math.max(0.65, 1 / Math.pow(this.scale, 0.45)));
        const effectiveFontSize = 13.5 * tempFontScale;
        this.svg.querySelectorAll('.district-polygon-temp').forEach(textEl => {
            textEl.setAttribute('font-size', `${effectiveFontSize.toFixed(1)}px`);
        });
    }

    addCity(cityData, onCityClick) {
        this.addPolygon(cityData, onCityClick);
        this.addMarker(cityData, onCityClick);
    }

    addPolygon(cityData, onClick) {
        if (!cityData.coordinates || !cityData.coordinates.length) return;

        cityData.coordinates.forEach(coord => {
            this.cityBounds.push(this.project(coord));
        });

        // 1. Base District Polygon
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('custom-map-polygon');
        path.dataset.cityId = cityData._id;
        this.polygonsLayer.appendChild(path);
        this.polygons.set(cityData._id, { path, cityData });

        // 2. Animated Weather Pattern Overlay on the Polygon
        const weatherPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        weatherPath.classList.add('custom-map-weather-overlay');
        weatherPath.dataset.cityId = cityData._id;
        weatherPath.setAttribute('fill', 'none');
        weatherPath.setAttribute('pointer-events', 'none');
        this.weatherLayer.appendChild(weatherPath);
        this.weatherOverlays.set(cityData._id, { path: weatherPath, cityData });

        // 3. Temperature text printed directly onto the polygon surface
        const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tempText.classList.add('district-polygon-temp');
        tempText.dataset.cityId = cityData._id;
        tempText.id = `poly_temp_${cityData._id}`;
        tempText.textContent = '';
        this.tempLayer.appendChild(tempText);
        this.tempLabels.set(cityData._id, { text: tempText, cityData });

        // Event Listeners for Polygon
        path.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(cityData._id, 'polygon');
        });

        path.addEventListener('mouseenter', () => {
            const m = this.markers.get(cityData._id);
            if (m && m.element) m.element.classList.add('hover');
            tempText.classList.add('hover');
        });

        path.addEventListener('mouseleave', () => {
            const m = this.markers.get(cityData._id);
            if (m && m.element) m.element.classList.remove('hover');
            tempText.classList.remove('hover');
        });

        // Event Listeners for Temperature text
        tempText.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(cityData._id, 'temp');
        });

        tempText.addEventListener('mouseenter', () => {
            path.classList.add('hover');
            const m = this.markers.get(cityData._id);
            if (m && m.element) m.element.classList.add('hover');
            tempText.classList.add('hover');
        });

        tempText.addEventListener('mouseleave', () => {
            path.classList.remove('hover');
            const m = this.markers.get(cityData._id);
            if (m && m.element) m.element.classList.remove('hover');
            tempText.classList.remove('hover');
        });

        this.autoFitBounds();
    }

    rebuildPolygons() {
        if (!this.baseScale) return;

        // Rebuild base polygons and weather overlays with matching path data
        this.polygons.forEach(({ path, cityData }) => {
            const points = cityData.coordinates.map(coord => this.geoToPixel(coord));
            if (points.length === 0) return;

            const d = points.reduce((acc, [x, y], i) => `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`, '') + ' Z';
            path.setAttribute('d', d);

            const w = this.weatherOverlays.get(cityData._id);
            if (w && w.path) {
                w.path.setAttribute('d', d);
            }
        });

        // Position temperature labels at open areas of each polygon
        this.tempLabels.forEach(({ text, cityData }) => {
            const anchorCoord = DISTRICT_TEMP_ANCHORS[cityData.name] || cityData.center;
            if (!anchorCoord) return;

            const [tx, ty] = this.geoToPixel(anchorCoord);
            text.setAttribute('x', tx.toFixed(1));
            text.setAttribute('y', ty.toFixed(1));
        });

        // Position town markers
        this.markers.forEach(({ element, cityData }) => {
            if (!cityData.center) return;
            const [px, py] = this.geoToPixel(cityData.center);
            element.style.left = `${px}px`;
            element.style.top = `${py}px`;
        });
    }

    addMarker(cityData, onClick) {
        if (!cityData.center) return;

        const markerElement = this.createMarkerElement(cityData);

        markerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(cityData._id, 'marker');
        });

        markerElement.addEventListener('mouseenter', () => {
            const poly = this.polygons.get(cityData._id);
            if (poly && poly.path) poly.path.classList.add('hover');
            const t = this.tempLabels.get(cityData._id);
            if (t && t.text) t.text.classList.add('hover');
        });

        markerElement.addEventListener('mouseleave', () => {
            const poly = this.polygons.get(cityData._id);
            if (poly && poly.path) poly.path.classList.remove('hover');
            const t = this.tempLabels.get(cityData._id);
            if (t && t.text) t.text.classList.remove('hover');
        });

        this.markersContainer.appendChild(markerElement);
        this.markers.set(cityData._id, { element: markerElement, cityData });

        if (this.baseScale) {
            const [px, py] = this.geoToPixel(cityData.center);
            markerElement.style.left = `${px}px`;
            markerElement.style.top = `${py}px`;
        }
    }

    createMarkerElement(cityData) {
        const divMarker = document.createElement('div');
        divMarker.classList.add('marker', 'custom-svg-marker');
        divMarker.id = `marker_${cityData._id}`;

        const imgMarker = document.createElement('img');
        imgMarker.src = cityData.imageUrl;
        imgMarker.classList.add('marker-img');
        divMarker.appendChild(imgMarker);

        const nameMarker = document.createElement('p');
        nameMarker.innerText = cityData.name;
        nameMarker.classList.add('marker-text');
        divMarker.appendChild(nameMarker);

        return divMarker;
    }

    /**
     * Apply real-time weather to each district:
     * - Animated pattern across the entire polygon (rain, snow, clouds, etc.)
     * - Clean temperature degrees (+8°, -5°) written on the polygon surface
     */
    setCitiesWeather(weatherMap = {}) {
        if (!weatherMap) return;

        this.polygons.forEach(({ path, cityData }, cityId) => {
            const weather = weatherMap[cityId] || weatherMap[cityData.name];
            if (!weather) return;

            // 1. Activate animated weather overlay on the polygon
            const overlay = this.weatherOverlays.get(cityId);
            if (overlay && overlay.path) {
                const weatherType = weather.type || 'clear';
                overlay.path.setAttribute('fill', `url(#pattern-weather-${weatherType})`);
            }

            // 2. Set temperature on the polygon surface
            const tempItem = this.tempLabels.get(cityId);
            if (tempItem && tempItem.text) {
                tempItem.text.textContent = weather.formattedTemp;
                tempItem.text.setAttribute('class', `district-polygon-temp ${weather.tempClass || ''}`);
                tempItem.text.setAttribute('title', `${cityData.name}: ${weather.description}, ${weather.formattedTemp}`);
            }

            path.setAttribute('title', `${cityData.name}: ${weather.description}, ${weather.formattedTemp}`);
        });
    }

    updatePolygonStyle(cityId, isActive) {
        const poly = this.polygons.get(cityId);
        if (poly && poly.path) {
            poly.path.classList.toggle('active', isActive);
        }
        const tempItem = this.tempLabels.get(cityId);
        if (tempItem && tempItem.text) {
            tempItem.text.classList.toggle('active', isActive);
        }
    }

    zoomDelta(factor) {
        const newScale = Math.max(0.4, Math.min(25, this.scale * factor));
        const width = this.container.clientWidth / 2;
        const height = this.container.clientHeight / 2;

        this.panX = width - (width - this.panX) * (newScale / this.scale);
        this.panY = height - (height - this.panY) * (newScale / this.scale);
        this.scale = newScale;

        this.updateTransform();
    }

    setupInteractions() {
        // Drag / Pan
        this.container.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.custom-map-controls') || e.target.closest('.marker')) return;
            this.isDragging = true;
            this.startX = e.clientX - this.panX;
            this.startY = e.clientY - this.panY;
            this.container.style.cursor = 'grabbing';
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            this.panX = e.clientX - this.startX;
            this.panY = e.clientY - this.startY;
            this.updateTransform();
        });

        window.addEventListener('pointerup', () => {
            this.isDragging = false;
            if (this.container) this.container.style.cursor = 'default';
        });

        // Wheel Zoom
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.15 : 0.87;
            const newScale = Math.max(0.4, Math.min(25, this.scale * factor));

            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
            this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
            this.scale = newScale;

            this.updateTransform();
        }, { passive: false });

        window.addEventListener('resize', () => {
            this.autoFitBounds();
        });
    }
}