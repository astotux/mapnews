const menu_bar = document.getElementById('menu_bar');
const head_menu = document.getElementById('head_menu');
const liked_menu_bar = document.getElementById('liked_menu_bar');
const liked_menu = document.getElementById('liked_menu');
const contact_menu_bar = document.getElementById('contact_menu_bar');
const contact_menu = document.getElementById('contact_menu');
const settings_menu_bar = document.getElementById('settings_menu_bar');
const settings_menu = document.getElementById('settings_menu');
const theme_toggle = document.getElementById('theme_toggle');
const weather_toggle = document.getElementById('weather_toggle');

window.closeAllMenus = () => {
    if (menu_bar) menu_bar.classList.remove('active');
    if (head_menu) head_menu.classList.remove('active');
    if (liked_menu) liked_menu.classList.remove('active');
    if (contact_menu) contact_menu.classList.remove('active');
    if (settings_menu) settings_menu.classList.remove('active');
    if (liked_menu_bar) liked_menu_bar.classList.remove('active');
    if (contact_menu_bar) contact_menu_bar.classList.remove('active');
    if (settings_menu_bar) settings_menu_bar.classList.remove('active');
};

// Main Burger Menu toggle
if (menu_bar && head_menu) {
    menu_bar.addEventListener('click', (e) => {
        menu_bar.classList.toggle('active');
        head_menu.classList.toggle('active');
        if (!head_menu.classList.contains('active')) {
            if (liked_menu) liked_menu.classList.remove('active');
            if (contact_menu) contact_menu.classList.remove('active');
            if (settings_menu) settings_menu.classList.remove('active');
            if (liked_menu_bar) liked_menu_bar.classList.remove('active');
            if (contact_menu_bar) contact_menu_bar.classList.remove('active');
            if (settings_menu_bar) settings_menu_bar.classList.remove('active');
        }
    });
}

// Liked submenu toggle
if (liked_menu_bar && liked_menu) {
    liked_menu_bar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (contact_menu) {
            contact_menu.classList.remove('active');
            if (contact_menu_bar) contact_menu_bar.classList.remove('active');
        }
        if (settings_menu) {
            settings_menu.classList.remove('active');
            if (settings_menu_bar) settings_menu_bar.classList.remove('active');
        }
        const willBeActive = !liked_menu.classList.contains('active');
        liked_menu.classList.toggle('active', willBeActive);
        liked_menu_bar.classList.toggle('active', willBeActive);
    });
}

// Contacts submenu toggle (opens underneath on mobile)
if (contact_menu_bar && contact_menu) {
    contact_menu_bar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (liked_menu) {
            liked_menu.classList.remove('active');
            if (liked_menu_bar) liked_menu_bar.classList.remove('active');
        }
        if (settings_menu) {
            settings_menu.classList.remove('active');
            if (settings_menu_bar) settings_menu_bar.classList.remove('active');
        }
        const willBeActive = !contact_menu.classList.contains('active');
        contact_menu.classList.toggle('active', willBeActive);
        contact_menu_bar.classList.toggle('active', willBeActive);
    });
}

// Settings submenu toggle (opens underneath on mobile)
if (settings_menu_bar && settings_menu) {
    settings_menu_bar.addEventListener('click', (e) => {
        e.stopPropagation();
        if (liked_menu) {
            liked_menu.classList.remove('active');
            if (liked_menu_bar) liked_menu_bar.classList.remove('active');
        }
        if (contact_menu) {
            contact_menu.classList.remove('active');
            if (contact_menu_bar) contact_menu_bar.classList.remove('active');
        }
        const willBeActive = !settings_menu.classList.contains('active');
        settings_menu.classList.toggle('active', willBeActive);
        settings_menu_bar.classList.toggle('active', willBeActive);
    });
}

// Close submenus on click outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu')) {
        if (liked_menu) liked_menu.classList.remove('active');
        if (contact_menu) contact_menu.classList.remove('active');
        if (settings_menu) settings_menu.classList.remove('active');
        if (liked_menu_bar) liked_menu_bar.classList.remove('active');
        if (contact_menu_bar) contact_menu_bar.classList.remove('active');
        if (settings_menu_bar) settings_menu_bar.classList.remove('active');
    }
});

// 1. Dark Theme switch logic
const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    if (isDark) {
        document.body.classList.add('dark-theme');
        document.documentElement.classList.add('dark-theme');
        if (theme_toggle) theme_toggle.checked = true;
    } else {
        document.body.classList.remove('dark-theme');
        document.documentElement.classList.remove('dark-theme');
        if (theme_toggle) theme_toggle.checked = false;
    }
};

const savedTheme = localStorage.getItem('mapnews_theme') || 'light';
applyTheme(savedTheme);

if (theme_toggle) {
    theme_toggle.addEventListener('change', () => {
        const nextTheme = theme_toggle.checked ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem('mapnews_theme', nextTheme);
    });
}

// 2. Weather Display switch logic
const applyWeatherDisplay = (show) => {
    if (!show) {
        document.body.classList.add('hide-map-weather');
        document.documentElement.classList.add('hide-map-weather');
        if (weather_toggle) weather_toggle.checked = false;
    } else {
        document.body.classList.remove('hide-map-weather');
        document.documentElement.classList.remove('hide-map-weather');
        if (weather_toggle) weather_toggle.checked = true;
    }
};

const savedWeather = localStorage.getItem('mapnews_show_weather');
const showWeather = savedWeather === null ? true : savedWeather === 'true';
applyWeatherDisplay(showWeather);

if (weather_toggle) {
    weather_toggle.addEventListener('change', () => {
        applyWeatherDisplay(weather_toggle.checked);
        localStorage.setItem('mapnews_show_weather', weather_toggle.checked ? 'true' : 'false');
    });
}