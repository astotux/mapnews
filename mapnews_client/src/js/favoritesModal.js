/**
 * Favorites Modal Component
 * Displays favorite events, sources, and regions.
 */

(function () {
    let overlayElement = null;
    let currentType = 'news';

    // Берём базовый URL динамически — работает и локально и на сервере
    const API_BASE = `${window.location.protocol}//${window.location.hostname}${window.location.port && window.location.port !== '80' && window.location.port !== '443' ? ':' + window.location.port : ''}`;

    const TITLES = {
        news: 'Избранные события',
        sources: 'Избранные источники',
        cities: 'Избранные регионы'
    };

    function ensureModalElement() {
        if (overlayElement && document.body.contains(overlayElement)) {
            return overlayElement;
        }

        const overlay = document.createElement('div');
        overlay.id = 'favoritesModalOverlay';
        overlay.className = 'favorites-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'favModalTitle');

        overlay.innerHTML = `
            <div class="favorites-modal">
                <div class="favorites-modal__header">
                    <h2 class="favorites-modal__title" id="favModalTitle">Избранные события</h2>
                    <button type="button" class="favorites-modal__close-btn" id="favModalCloseBtn" aria-label="Закрыть">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div class="favorites-modal__tabs">
                    <button type="button" class="favorites-modal__tab" data-tab="news">
                        <img src="./src/images/icons/news.svg" alt="" class="favorites-modal__tab-icon">
                        <span>События</span>
                    </button>
                    <button type="button" class="favorites-modal__tab" data-tab="sources">
                        <img src="./src/images/icons/sources.svg" alt="" class="favorites-modal__tab-icon">
                        <span>Источники</span>
                    </button>
                    <button type="button" class="favorites-modal__tab" data-tab="cities">
                        <img src="./src/images/icons/region.svg" alt="" class="favorites-modal__tab-icon">
                        <span>Регионы</span>
                    </button>
                </div>

                <div class="favorites-modal__body">
                    <div class="favorites-modal__list news_container" id="favModalList">
                        <!-- Rendered items -->
                    </div>
                </div>
            </div>
        `;

        // Close on background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeFavoritesModal();
            }
        });

        // Close button
        const closeBtn = overlay.querySelector('#favModalCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeFavoritesModal);
        }

        // Tab buttons
        const tabBtns = overlay.querySelectorAll('.favorites-modal__tab');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                if (tab && tab !== currentType) {
                    currentType = tab;
                    updateActiveTabUI();
                    loadFavorites(currentType);
                }
            });
        });

        // Esc key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeFavoritesModal();
            }
        });

        document.body.appendChild(overlay);
        overlayElement = overlay;
        return overlay;
    }

    function updateActiveTabUI() {
        if (!overlayElement) return;
        const tabs = overlayElement.querySelectorAll('.favorites-modal__tab');
        tabs.forEach(tab => {
            const isActive = tab.dataset.tab === currentType;
            tab.classList.toggle('active', isActive);
        });

        const titleEl = overlayElement.querySelector('#favModalTitle');
        if (titleEl) {
            titleEl.textContent = TITLES[currentType] || 'Избранное';
        }
    }

    async function ensureCitiesData() {
        if (window.citiesList && window.citiesList.length) {
            return window.citiesList;
        }
        if (window.allCities && window.allCities.length) {
            window.citiesList = window.allCities;
            return window.allCities;
        }
        try {
            const res = await fetch(`${API_BASE}/api/cities`);
            if (res.ok) {
                const data = await res.json();
                window.citiesList = data;
                window.allCities = data;
                return data;
            }
        } catch (e) { }
        return [];
    }

    async function ensureSourcesData() {
        if (window.sourcesList && window.sourcesList.length) {
            return window.sourcesList;
        }
        try {
            const res = await fetch(`${API_BASE}/api/sources`);
            if (res.ok) {
                const data = await res.json();
                window.sourcesList = data;
                return data;
            }
        } catch (e) { }
        return [];
    }

    async function fetchFavoritesData(type) {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            return { unauthorized: true, data: [] };
        }

        const res = await fetch(`${API_BASE}/api/favorites/${type}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.status === 401) {
            return { unauthorized: true, data: [] };
        }
        if (!res.ok) {
            throw new Error(`Ошибка сервера: ${res.status}`);
        }

        const data = await res.json();
        return { unauthorized: false, data: Array.isArray(data) ? data : [] };
    }

    function formatItemDate(isoString) {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return '';
            const hh = String(d.getUTCHours()).padStart(2, '0');
            const mm = String(d.getUTCMinutes()).padStart(2, '0');
            const dd = String(d.getUTCDate()).padStart(2, '0');
            const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
            return `${dd}.${mo} ${hh}:${mm}`;
        } catch (e) {
            return '';
        }
    }

    function resolveImgUrl(url, fallback = '') {
        if (!url || typeof url !== 'string' || !url.trim()) return fallback;
        const clean = url.trim();
        if (clean.startsWith('/images/')) {
            return `${API_BASE}${clean}`;
        }
        if (clean.startsWith('images/')) {
            return `${API_BASE}/${clean}`;
        }
        return clean;
    }

    function getCityFromDB(cityItem, allCities) {
        const cityId = cityItem?._id ? cityItem._id.toString() : (cityItem || '').toString();
        const cityName = cityItem?.name || '';

        // Match by _id from allCities (fetched from DB)
        let doc = (allCities || []).find(c => c && c._id && c._id.toString() === cityId);

        // If not found by _id, match by name from allCities
        if (!doc && cityName) {
            doc = (allCities || []).find(c => c && c.name && c.name.toLowerCase().trim() === cityName.toLowerCase().trim());
        }

        // If cityItem is already a populated object with imageUrl, use it
        if (!doc && typeof cityItem === 'object' && cityItem !== null) {
            doc = cityItem;
        }

        return doc || {};
    }

    function getSourceFromDB(sourceItem, allSources) {
        const sourceId = sourceItem?._id ? sourceItem._id.toString() : (sourceItem || '').toString();
        const sourceTitle = sourceItem?.title || '';

        // Match by _id from allSources (fetched from DB)
        let doc = (allSources || []).find(s => s && s._id && s._id.toString() === sourceId);

        // If not found by _id, match by title from allSources
        if (!doc && sourceTitle) {
            doc = (allSources || []).find(s => s && s.title && s.title.toLowerCase().trim() === sourceTitle.toLowerCase().trim());
        }

        // If sourceItem is already a populated object with imageUrl, use it
        if (!doc && typeof sourceItem === 'object' && sourceItem !== null) {
            doc = sourceItem;
        }

        return doc || {};
    }

    function renderNewsItemHTML(item, allCities, allSources) {
        const cityDoc = getCityFromDB(item.place_id, allCities);
        const placeName = cityDoc.name || item.place_id?.name || 'Коми';
        const placeImg = resolveImgUrl(cityDoc.imageUrl || item.place_id?.imageUrl, './src/images/komi.png');

        const sourceDoc = getSourceFromDB(item.source_id, allSources);
        const sourceTitle = sourceDoc.title || item.source_id?.title || 'Источник';
        const sourceImg = resolveImgUrl(sourceDoc.imageUrl || item.source_id?.imageUrl, './src/images/icons/sources.svg');

        const newsImg = resolveImgUrl(item.imageUrl, './src/images/new.png');
        const formattedTime = formatItemDate(item.dateTime) || 'Недавно';

        return `
            <div class="new__item" data-item-id="${item._id}" data-item-type="news">
                <div class="new__item-left">
                    <img src="${newsImg}" alt="news" class="new__item-img" onerror="this.onerror=null; this.src='./src/images/new.png';">
                    <div class="new__item-img-info">
                        <button type="button" data-type="news" data-id="${item._id}" class="new__like-btn active" title="Удалить из избранного">
                            <img src="./src/images/icons/like.svg" alt="" class="like-img">
                        </button>
                        <div class="new-time-container">
                            <p class="new-time">${formattedTime}</p>
                        </div>
                        <div class="new-city-container">
                            <img src="${placeImg}" alt="" class="new-city-img" onerror="this.onerror=null; this.src='./src/images/komi.png';">
                            <p class="new-city-title">${placeName}</p>
                        </div>
                    </div>
                </div>
                <div class="new__item-right">
                    <div class="top__item">
                        <p class="new__title">${item.title || 'Без названия'}</p>
                        <p class="new__text">${item.text || 'Нет текста'}</p>
                    </div>
                    <div class="new__bottom">
                        <div class="new-source-container">
                            <img src="${sourceImg}" alt="" class="new-source-img" onerror="this.onerror=null; this.src='./src/images/icons/sources.svg';">
                            <p class="new-source-title">${sourceTitle}</p>
                        </div>
                        <div class="new__bottom__right">
                            ${item.newsUrl ? `
                                <div class="share-btn" onclick="clipboard('${item.newsUrl}', this)" title="Скопировать ссылку">
                                    <img src="./src/images/icons/copy.png" width="18" height="18" alt="" class="share-img">
                                </div>
                                <a href="${item.newsUrl}" class="open-new" target="_blank" rel="noopener noreferrer">Перейти</a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderSourceItemHTML(source, allSources) {
        const sourceDoc = getSourceFromDB(source, allSources);
        const sourceId = sourceDoc._id ? sourceDoc._id.toString() : (source?._id ? source._id.toString() : (source || '').toString());
        const sourceTitle = sourceDoc.title || source?.title || 'Источник';
        const rawImg = sourceDoc.imageUrl || source?.imageUrl || '';
        const sourceImg = resolveImgUrl(rawImg, './src/images/icons/sources.svg');
        const description = sourceDoc.description || source?.description || '';
        const siteUrl = sourceDoc.siteUrl || source?.siteUrl || '';

        return `
            <div class="new__item" data-item-id="${sourceId}" data-item-type="sources">
                <div class="new__item-left">
                    <img src="${sourceImg}" alt="${sourceTitle}" class="new__item-img new__item-img--contain" onerror="this.onerror=null; this.src='./src/images/icons/sources.svg';">
                    <div class="new__item-img-info">
                        <button type="button" data-type="sources" data-id="${sourceId}" class="new__like-btn active" title="Удалить из избранного">
                            <img src="./src/images/icons/like.svg" alt="" class="like-img">
                        </button>
                    </div>
                </div>
                <div class="new__item-right">
                    <div class="top__item">
                        <p class="new__title">${sourceTitle}</p>
                        <p class="new__text">${description || 'Описание отсутствует'}</p>
                    </div>
                    <div class="new__bottom">
                        <div class="new-source-container">
                            <img src="${sourceImg}" alt="" class="new-source-img" onerror="this.onerror=null; this.src='./src/images/icons/sources.svg';">
                            <p class="new-source-title">${sourceTitle}</p>
                        </div>
                        <div class="new__bottom__right">
                            ${siteUrl ? `
                                <div class="share-btn" onclick="clipboard('${siteUrl}', this)" title="Скопировать ссылку">
                                    <img src="./src/images/icons/copy.png" width="18" height="18" alt="" class="share-img">
                                </div>
                                <a href="${siteUrl}" class="open-new" target="_blank" rel="noopener noreferrer">Перейти</a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCityItemHTML(city, allCities) {
        const cityDoc = getCityFromDB(city, allCities);
        const cityId = cityDoc._id ? cityDoc._id.toString() : (city?._id ? city._id.toString() : (city || '').toString());
        const cityName = cityDoc.name || city?.name || 'Район';
        const rawImg = cityDoc.imageUrl || city?.imageUrl || '';
        const cityImg = resolveImgUrl(rawImg, './src/images/komi.png');

        // По требованию: "а в районе не надо описание делать вообще"
        return `
            <div class="new__item" data-item-id="${cityId}" data-item-type="cities">
                <div class="new__item-left">
                    <img src="${cityImg}" alt="${cityName}" class="new__item-img new__item-img--contain" onerror="this.onerror=null; this.src='./src/images/komi.png';">
                    <div class="new__item-img-info">
                        <button type="button" data-type="cities" data-id="${cityId}" class="new__like-btn active" title="Удалить из избранного">
                            <img src="./src/images/icons/like.svg" alt="" class="like-img">
                        </button>
                    </div>
                </div>
                <div class="new__item-right">
                    <div class="top__item">
                        <p class="new__title">${cityName}</p>
                    </div>
                    <div class="new__bottom">
                        <div class="new-city-container" style="position: static; margin: 0;">
                            <img src="${cityImg}" alt="" class="new-city-img" onerror="this.onerror=null; this.src='./src/images/komi.png';">
                            <p class="new-city-title">${cityName}</p>
                        </div>
                        <div class="new__bottom__right">
                            <button type="button" class="open-new fav-select-city-btn" data-city-id="${cityId}">Показать на карте</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadFavorites(type) {
        const listEl = overlayElement.querySelector('#favModalList');
        if (!listEl) return;

        listEl.innerHTML = `
            <div class="favorites-modal__loading">
                <div class="favorites-modal__spinner"></div>
                <p>Загрузка...</p>
            </div>
        `;

        try {
            const [favResult, allCities, allSources] = await Promise.all([
                fetchFavoritesData(type),
                ensureCitiesData(),
                ensureSourcesData()
            ]);

            if (favResult.unauthorized) {
                listEl.innerHTML = `
                    <div class="favorites-modal__empty">
                        <p class="favorites-modal__empty-text">Для просмотра избранного необходимо авторизоваться</p>
                        <a href="/login.html" class="open-new" style="margin-top: 14px; display: inline-block;">Войти в аккаунт</a>
                    </div>
                `;
                return;
            }

            const data = favResult.data;

            if (!data || data.length === 0) {
                let emptyMsg = 'В избранном пока ничего нет';
                if (type === 'news') emptyMsg = 'У вас пока нет сохраненных событий в избранном';
                if (type === 'sources') emptyMsg = 'У вас пока нет сохраненных источников в избранном';
                if (type === 'cities') emptyMsg = 'У вас пока нет сохраненных регионов в избранном';

                listEl.innerHTML = `
                    <div class="favorites-modal__empty">
                        <p class="favorites-modal__empty-text">${emptyMsg}</p>
                    </div>
                `;
                return;
            }

            let html = '';
            data.forEach(item => {
                if (type === 'news') {
                    html += renderNewsItemHTML(item, allCities, allSources);
                } else if (type === 'sources') {
                    html += renderSourceItemHTML(item, allSources);
                } else if (type === 'cities') {
                    html += renderCityItemHTML(item, allCities);
                }
            });

            listEl.innerHTML = html;
            attachModalItemListeners(listEl, type);

        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);
            listEl.innerHTML = `
                <div class="favorites-modal__empty">
                    <p class="favorites-modal__empty-text">Не удалось загрузить избранное. Пожалуйста, попробуйте позже.</p>
                </div>
            `;
        }
    }

    function attachModalItemListeners(container, type) {
        // Remove from favorites button handler
        const likeBtns = container.querySelectorAll('.new__like-btn');
        likeBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const itemId = btn.dataset.id;
                const itemType = btn.dataset.type || type;
                if (!itemId) return;

                const card = btn.closest('.new__item');
                btn.classList.remove('active');

                try {
                    const token = localStorage.getItem('jwt_token');
                    if (token) {
                        await fetch(`${API_BASE}/api/favorites/${itemType}/${itemId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    }

                    if (window.newsItemManager) {
                        window.newsItemManager.removeFavoriteLocally(itemType, itemId);
                    }

                    if (card) {
                        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.96)';
                        setTimeout(() => {
                            if (card.parentNode) {
                                card.parentNode.removeChild(card);
                            }
                            const remaining = container.querySelectorAll('.new__item').length;
                            if (remaining === 0) {
                                container.innerHTML = `
                                    <div class="favorites-modal__empty">
                                        <p class="favorites-modal__empty-text">В избранном пока ничего нет</p>
                                    </div>
                                `;
                            }
                        }, 200);
                    }

                    if (window.newsManager && itemType === 'news') {
                        window.newsManager.updateNews();
                    }

                } catch (err) {
                    console.error('Ошибка удаления из избранного:', err);
                    btn.classList.add('active');
                }
            });
        });

        // "Показать на карте" button handler
        const selectCityBtns = container.querySelectorAll('.fav-select-city-btn');
        selectCityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cityId = btn.dataset.cityId;
                if (cityId) {
                    closeFavoritesModal();
                    if (window.newsManager) {
                        window.newsManager.selectedCities = [cityId];
                        window.newsManager.resetAndFetch();
                    }
                    if (window.mapManager) {
                        window.mapManager.updatePolygonStyle(cityId, true);
                    }
                }
            });
        });
    }

    window.openFavoritesModal = function (type = 'news') {
        currentType = type;
        const modal = ensureModalElement();

        if (window.closeAllMenus) {
            window.closeAllMenus();
        }

        updateActiveTabUI();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        loadFavorites(currentType);
    };

    window.closeFavoritesModal = function () {
        if (!overlayElement) return;
        overlayElement.classList.remove('active');
        document.body.style.overflow = '';
    };

    function initTriggerBindings() {
        const eventsBtn = document.getElementById('fav_events_btn');
        const sourcesBtn = document.getElementById('fav_sources_btn');
        const regionsBtn = document.getElementById('fav_regions_btn');

        if (eventsBtn) {
            eventsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openFavoritesModal('news');
            });
        }
        if (sourcesBtn) {
            sourcesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openFavoritesModal('sources');
            });
        }
        if (regionsBtn) {
            regionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openFavoritesModal('cities');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTriggerBindings);
    } else {
        initTriggerBindings();
    }
})();
