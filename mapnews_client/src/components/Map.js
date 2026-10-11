export class MapManager {
    constructor(containerId, location, layers) {
        this.container = document.getElementById(containerId);
        this.markers = new Map();
        this.polygons = new Map();
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

        // SVG layer for vector region polygons
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.classList.add('custom-map-svg');
        this.container.appendChild(this.svg);

        // Group element inside SVG for transform
        this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.g.classList.add('custom-map-group');
        this.svg.appendChild(this.g);

        // HTML Layer for markers overlay
        this.markersContainer = document.createElement('div');
        this.markersContainer.classList.add('custom-map-markers-layer');
        this.container.appendChild(this.markersContainer);

        // Pan and Zoom event listeners
        this.setupInteractions();
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

        const invScale = Math.min(1.2, Math.max(0.12, 1 / Math.pow(this.scale, 0.65)));
        this.markersContainer.querySelectorAll('.marker').forEach(marker => {
            const activeMult = marker.classList.contains('active') ? 1.1 : 1.0;
            marker.style.transform = `translate(-50%, -50%) scale(${invScale * activeMult})`;
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

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('custom-map-polygon');
        path.dataset.cityId = cityData._id;

        this.g.appendChild(path);
        this.polygons.set(cityData._id, { path, cityData });

        path.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(cityData._id, 'polygon');
        });

        path.addEventListener('mouseenter', () => {
            const m = this.markers.get(cityData._id);
            if (m && m.element) m.element.classList.add('hover');
        });

        path.addEventListener('mouseleave', () => {
            const m = this.markers.get(cityData._id);
            if (m && m.element) m.element.classList.remove('hover');
        });

        this.autoFitBounds();
    }

    rebuildPolygons() {
        if (!this.baseScale) return;

        this.polygons.forEach(({ path, cityData }) => {
            const points = cityData.coordinates.map(coord => this.geoToPixel(coord));
            if (points.length === 0) return;

            const d = points.reduce((acc, [x, y], i) => `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`, '') + ' Z';
            path.setAttribute('d', d);
        });

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
        });

        markerElement.addEventListener('mouseleave', () => {
            const poly = this.polygons.get(cityData._id);
            if (poly && poly.path) poly.path.classList.remove('hover');
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

    updatePolygonStyle(cityId, isActive) {
        const poly = this.polygons.get(cityId);
        if (poly && poly.path) {
            poly.path.classList.toggle('active', isActive);
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