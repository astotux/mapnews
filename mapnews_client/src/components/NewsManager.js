import { fetchNews } from '../api/news.js';
import { newsItemManager } from './NewsItem.js';

export class NewsManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.selectedCities = [];
        this.selectedSources = [];
        this.isLoading = false;
        this.hasMore = true;

        this.initializeListeners();
        this.setupInfiniteScroll();
    }

    initializeListeners() {
        const dateStart = document.getElementById('date-start');
        const dateEnd = document.getElementById('date-end');
        const filterSentiment = document.getElementById('filter-sentiment');
        const filterCategory = document.getElementById('filter-category');
        const filterToggleBtn = document.getElementById('events-filter-toggle');
        const filterPanel = document.getElementById('events-filter-panel');
        const filterResetBtn = document.getElementById('events-filter-reset-btn');

        if (dateStart) dateStart.addEventListener('change', () => {
            this.updateFilterBadge();
            this.resetAndFetch();
        });
        if (dateEnd) dateEnd.addEventListener('change', () => {
            this.updateFilterBadge();
            this.resetAndFetch();
        });
        if (filterSentiment) filterSentiment.addEventListener('change', () => {
            this.updateFilterBadge();
            this.resetAndFetch();
        });
        if (filterCategory) filterCategory.addEventListener('change', () => {
            this.updateFilterBadge();
            this.resetAndFetch();
        });

        if (filterToggleBtn && filterPanel) {
            filterToggleBtn.addEventListener('click', () => {
                const isOpen = filterPanel.classList.toggle('is-open');
                filterToggleBtn.classList.toggle('active', isOpen);
                filterToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        }

        if (filterResetBtn) {
            filterResetBtn.addEventListener('click', () => {
                if (dateStart) dateStart.value = '';
                if (dateEnd) dateEnd.value = '';
                if (filterSentiment) filterSentiment.value = '';
                if (filterCategory) filterCategory.value = '';
                this.updateFilterBadge();
                this.resetAndFetch();
            });
        }

        this.updateFilterBadge();
    }

    updateFilterBadge() {
        const dateStart = document.getElementById('date-start')?.value;
        const dateEnd = document.getElementById('date-end')?.value;
        const filterSentiment = document.getElementById('filter-sentiment')?.value;
        const filterCategory = document.getElementById('filter-category')?.value;
        const filterBadge = document.getElementById('events-filter-badge');
        const filterResetBtn = document.getElementById('events-filter-reset-btn');
        const filterToggleBtn = document.getElementById('events-filter-toggle');

        let count = 0;
        if (filterSentiment) count++;
        if (filterCategory) count++;
        if (dateStart || dateEnd) count++;

        if (filterBadge) {
            if (count > 0) {
                filterBadge.textContent = count;
                filterBadge.style.display = 'inline-flex';
            } else {
                filterBadge.textContent = '';
                filterBadge.style.display = 'none';
            }
        }

        if (filterResetBtn) {
            filterResetBtn.style.display = count > 0 ? 'inline-flex' : 'none';
        }

        if (filterToggleBtn) {
            if (count > 0) {
                filterToggleBtn.classList.add('has-filters');
            } else {
                filterToggleBtn.classList.remove('has-filters');
            }
        }
    }

    setupInfiniteScroll() {
        const checkAndLoad = () => {
            if (this.isLoading || !this.hasMore || this.currentPage >= this.totalPages) return;

            const main = document.querySelector('.main');
            let scrollBottom = 1000;

            if (main && main.scrollHeight > main.clientHeight) {
                // Scroll container is .main
                scrollBottom = main.scrollHeight - main.scrollTop - main.clientHeight;
            } else {
                // Fallback to window scroll
                scrollBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
            }

            // Only trigger when user is within 150px from the bottom of the scroll container
            if (scrollBottom < 150) {
                this.loadNextPage();
            }
        };

        const mainEl = document.querySelector('.main');
        if (mainEl) {
            mainEl.addEventListener('scroll', checkAndLoad, { passive: true });
        }
        window.addEventListener('scroll', checkAndLoad, { passive: true });

        const setupObserver = () => {
            const sentinel = document.getElementById('news-scroll-sentinel');
            const mainContainer = document.querySelector('.main');

            if (sentinel && 'IntersectionObserver' in window) {
                if (this.observer) {
                    this.observer.disconnect();
                }

                this.observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !this.isLoading && this.hasMore && this.currentPage < this.totalPages) {
                        this.loadNextPage();
                    }
                }, {
                    root: mainContainer || null,
                    rootMargin: '100px',
                    threshold: 0.1
                });

                this.observer.observe(sentinel);
            }
        };

        setTimeout(setupObserver, 300);
    }

    async resetAndFetch() {
        this.currentPage = 1;
        this.hasMore = true;
        const newsContainer = document.querySelector('.news_container');
        if (newsContainer) newsContainer.innerHTML = '';
        await this.updateNews(1, false);
    }

    async loadNextPage() {
        if (this.isLoading || !this.hasMore || this.currentPage >= this.totalPages) return;
        await this.updateNews(this.currentPage + 1, true);
    }

    async updateNews(page = 1, append = false) {
        if (this.isLoading) return;
        this.isLoading = true;
        this.showLoader(true);

        try {
            const startDate = document.getElementById('date-start')?.value;
            const endDate = document.getElementById('date-end')?.value;
            const sentiment = document.getElementById('filter-sentiment')?.value;
            const category = document.getElementById('filter-category')?.value;

            const response = await fetchNews({
                cities: this.selectedCities,
                sources: this.selectedSources,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                endDate: endDate ? new Date(endDate + 'T23:59:59.999Z').toISOString() : undefined,
                sentiment: sentiment || undefined,
                category: category || undefined,
                page,
                limit: 10
            });

            await newsItemManager.loadFavorites();

            this.currentPage = response.page || page;
            this.totalPages = response.totalPages || 1;
            this.hasMore = this.currentPage < this.totalPages;

            this.renderNews(response.news, append);
            newsItemManager.initializeLikeHandlers();
        } catch (error) {
            console.error('Ошибка при загрузке новостей:', error);
        } finally {
            this.isLoading = false;
            this.showLoader(false);
        }
    }

    showLoader(show) {
        const loader = document.getElementById('news-loader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    renderNews(news, append = false) {
        const newsContainer = document.querySelector('.news_container');
        if (!newsContainer) return;

        if (!append) {
            newsContainer.innerHTML = '';
        }

        if (!Array.isArray(news)) {
            console.error('Полученные данные не являются массивом:', news);
            return;
        }

        if (news.length === 0 && !append) {
            newsContainer.innerHTML = '<div class="news-empty">Нет новостей по выбранным фильтрам</div>';
            return;
        }

        news.forEach(item => {
            if (item && typeof item === 'object') {
                newsContainer.insertAdjacentHTML('beforeend', newsItemManager.createNewsItem(item));
            }
        });
    }

    updateCity(cityId, isActive) {
        if (isActive) {
            this.selectedCities = this.selectedCities.filter(id => id !== cityId);
        } else {
            this.selectedCities.push(cityId);
        }
        this.resetAndFetch();
    }

    updateSource(sourceId, isActive) {
        if (isActive) {
            this.selectedSources = this.selectedSources.filter(id => id !== sourceId);
        } else {
            this.selectedSources.push(sourceId);
        }
        this.resetAndFetch();
    }
}

