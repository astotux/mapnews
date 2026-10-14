function clipboard(text, triggerEl) {
    navigator.clipboard.writeText(text)
        .then(() => {
            // Найти элемент который был нажат
            const el = triggerEl || (window.event && window.event.currentTarget) || null;
            if (!el) return;

            // Если уже показываем галочку — не дублируем
            if (el.dataset.checkActive) return;
            el.dataset.checkActive = '1';

            // Запомнить оригинальный HTML
            const originalHTML = el.innerHTML;

            // Показать галочку
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="#40C196" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>`;

            setTimeout(() => {
                el.innerHTML = originalHTML;
                delete el.dataset.checkActive;
            }, 2000);
        })
        .catch(err => console.log('Clipboard error:', err));
}
