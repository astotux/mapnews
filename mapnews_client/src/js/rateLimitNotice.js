(function () {
    let currentToast = null;
    let countdownInterval = null;
    let autoCloseTimeout = null;

    function createToastElement() {
        const toast = document.createElement('div');
        toast.id = 'rate-limit-toast';
        toast.className = 'rate-limit-toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        toast.innerHTML = `
            <div class="rate-limit-toast__content">
                <div class="rate-limit-toast__icon-wrap">
                    <svg class="rate-limit-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>
                <div class="rate-limit-toast__text-wrap">
                    <div class="rate-limit-toast__title">Слишком много запросов</div>
                    <div class="rate-limit-toast__message" id="rate-limit-toast-msg">Пожалуйста, подождите.</div>
                    <div class="rate-limit-toast__timer-badge" id="rate-limit-toast-badge">
                        Повторите попытку через: <span class="rate-limit-toast__seconds" id="rate-limit-toast-sec">15</span> сек
                    </div>
                </div>
                <button type="button" class="rate-limit-toast__close" id="rate-limit-toast-close" aria-label="Закрыть">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="rate-limit-toast__progress-track">
                <div class="rate-limit-toast__progress-bar" id="rate-limit-toast-bar"></div>
            </div>
        `;

        const closeBtn = toast.querySelector('#rate-limit-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeToast(toast);
            });
        }

        return toast;
    }

    function closeToast(toast) {
        if (!toast) return;
        if (countdownInterval) clearInterval(countdownInterval);
        if (autoCloseTimeout) clearTimeout(autoCloseTimeout);

        toast.classList.remove('active');
        toast.classList.add('closing');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            if (currentToast === toast) {
                currentToast = null;
            }
        }, 320);
    }

    window.showRateLimitNotice = function (customMessage, retrySeconds = 15) {
        let remaining = Math.max(1, parseInt(retrySeconds, 10) || 15);
        const totalDuration = remaining;

        // Vibrate gently if mobile browser supports it
        try {
            if (navigator.vibrate) navigator.vibrate(60);
        } catch (e) { }

        if (!currentToast || !document.body.contains(currentToast)) {
            currentToast = createToastElement();
            document.body.appendChild(currentToast);
            // Trigger animation in next frame
            requestAnimationFrame(() => {
                currentToast.classList.add('active');
            });
        } else {
            currentToast.classList.remove('closing', 'success');
            currentToast.classList.add('active');
        }

        const msgEl = currentToast.querySelector('#rate-limit-toast-msg');
        const secEl = currentToast.querySelector('#rate-limit-toast-sec');
        const badgeEl = currentToast.querySelector('#rate-limit-toast-badge');
        const barEl = currentToast.querySelector('#rate-limit-toast-bar');
        const iconWrap = currentToast.querySelector('.rate-limit-toast__icon-wrap');

        if (msgEl && customMessage) {
            msgEl.textContent = customMessage;
        }
        if (secEl) {
            secEl.textContent = remaining;
        }

        // Reset progress bar
        if (barEl) {
            barEl.style.transition = 'none';
            barEl.style.width = '100%';
            requestAnimationFrame(() => {
                barEl.style.transition = `width ${remaining}s linear`;
                barEl.style.width = '0%';
            });
        }

        if (countdownInterval) clearInterval(countdownInterval);
        if (autoCloseTimeout) clearTimeout(autoCloseTimeout);

        countdownInterval = setInterval(() => {
            remaining -= 1;
            if (secEl) {
                secEl.textContent = Math.max(0, remaining);
            }

            if (remaining <= 0) {
                clearInterval(countdownInterval);
                if (badgeEl) {
                    badgeEl.innerHTML = 'Ограничение снято, можете продолжать!';
                }
                if (currentToast) {
                    currentToast.classList.add('success');
                }
                autoCloseTimeout = setTimeout(() => {
                    closeToast(currentToast);
                }, 1600);
            }
        }, 1000);
    };

    window.testRateLimit = function (seconds = 10) {
        window.showRateLimitNotice('Пожалуйста, подождите.', seconds);
    };

    // Install global fetch interceptor
    if (!window.__rateLimitInterceptorInstalled) {
        window.__rateLimitInterceptorInstalled = true;
        const origFetch = window.fetch;
        window.fetch = async function (...args) {
            try {
                const response = await origFetch.apply(this, args);
                if (response.status === 429) {
                    try {
                        const clone = response.clone();
                        const data = await clone.json().catch(() => ({}));
                        const retry = data.retryAfter || parseInt(response.headers.get('Retry-After'), 10) || 15;
                        const msg = data.message || 'Пожалуйста, подождите.';
                        window.showRateLimitNotice(msg, retry);
                    } catch (e) {
                        const retry = parseInt(response.headers.get('Retry-After'), 10) || 15;
                        window.showRateLimitNotice('Пожалуйста, подождите.', retry);
                    }
                }
                return response;
            } catch (err) {
                throw err;
            }
        };
    }
})();
