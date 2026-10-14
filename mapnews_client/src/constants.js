export const LOCATION = {
    center: [45.6, 64.2],
    zoom: 6
};

// Автоматически использует текущий хост — работает и локально и на сервере
export const API_BASE = `${window.location.protocol}//${window.location.hostname}${window.location.port && window.location.port !== '80' && window.location.port !== '443' ? ':' + window.location.port : ''}`;

export const POLYGON_STYLE = {
    fill: 'rgba(255, 255, 255, 0.12)',
    stroke: 'rgba(255, 255, 255, 0.6)',
    strokeWidth: 2
};

export const POLYGON_STYLE_ACTIVE = {
    fill: 'rgba(64, 193, 150, 0.55)',
    stroke: '#40C196',
    strokeWidth: 3
};

