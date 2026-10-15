function initializeSliders() {
    document.querySelectorAll('.slider__bottom').forEach(slider => {
        const slidesContainer = slider.querySelector('.slides-container');
        const slides = slider.querySelector('.slides');
        const prevButton = slider.querySelector('.prev-btn');
        const nextButton = slider.querySelector('.next-btn');

        let currentOffset = 0;
        const scrollAmount = 740;

        function getMaxOffset() {
            return Math.max(0, slides.scrollWidth - slidesContainer.offsetWidth);
        }

        function clamp(val) {
            return Math.max(0, Math.min(val, getMaxOffset()));
        }

        function setOffset(val, animate = true) {
            currentOffset = clamp(val);
            slides.style.transition = animate ? 'transform 0.3s ease' : 'none';
            slides.style.transform = `translateX(-${currentOffset}px)`;
            updateButtons();
        }

        function updateButtons() {
            prevButton.disabled = currentOffset <= 0;
            nextButton.disabled = currentOffset >= getMaxOffset();
        }

        prevButton.addEventListener('click', () => setOffset(currentOffset - scrollAmount));
        nextButton.addEventListener('click', () => setOffset(currentOffset + scrollAmount));

        // ── Mouse drag ──────────────────────────────────────────────
        let isMouseDown = false;
        let mouseStartX = 0;
        let mouseScrollStart = 0;

        slidesContainer.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseStartX = e.pageX;
            mouseScrollStart = currentOffset;
            slides.style.transition = 'none';
            slidesContainer.style.cursor = 'grabbing';
        });

        slidesContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            const delta = mouseStartX - e.pageX;
            currentOffset = clamp(mouseScrollStart + delta);
            slides.style.transform = `translateX(-${currentOffset}px)`;
            updateButtons();
        });

        const onMouseUp = () => {
            if (!isMouseDown) return;
            isMouseDown = false;
            slidesContainer.style.cursor = 'grab';
        };
        slidesContainer.addEventListener('mouseup', onMouseUp);
        slidesContainer.addEventListener('mouseleave', onMouseUp);

        // ── Touch swipe — следует за пальцем ────────────────────────
        let touchStartX = 0;
        let touchScrollStart = 0;
        let touchLastX = 0;
        let touchLastTime = 0;
        let touchVelocity = 0;
        let rafId = null;

        slidesContainer.addEventListener('touchstart', (e) => {
            if (rafId) cancelAnimationFrame(rafId);
            touchStartX = e.touches[0].clientX;
            touchScrollStart = currentOffset;
            touchLastX = touchStartX;
            touchLastTime = Date.now();
            touchVelocity = 0;
            slides.style.transition = 'none'; // убираем transition — следует за пальцем
        }, { passive: true });

        slidesContainer.addEventListener('touchmove', (e) => {
            const x = e.touches[0].clientX;
            const now = Date.now();
            const dt = now - touchLastTime || 1;

            // скорость в px/ms для инерции
            touchVelocity = (touchLastX - x) / dt;
            touchLastX = x;
            touchLastTime = now;

            const delta = touchStartX - x;
            currentOffset = clamp(touchScrollStart + delta);
            slides.style.transform = `translateX(-${currentOffset}px)`;
            updateButtons();
        }, { passive: true });

        slidesContainer.addEventListener('touchend', () => {
            // Инерция после отпускания пальца
            const friction = 0.92;
            let velocity = touchVelocity * 16; // px/frame при 60fps

            function inertia() {
                if (Math.abs(velocity) < 0.5) {
                    updateButtons();
                    return;
                }
                currentOffset = clamp(currentOffset + velocity);
                slides.style.transform = `translateX(-${currentOffset}px)`;
                velocity *= friction;
                rafId = requestAnimationFrame(inertia);
            }

            rafId = requestAnimationFrame(inertia);
        }, { passive: true });

        // ── Init ─────────────────────────────────────────────────────
        function initializeSlider() {
            currentOffset = 0;
            slides.style.transition = 'none';
            slides.style.transform = 'translateX(0)';
            updateButtons();
        }

        initializeSlider();
        window.addEventListener('resize', initializeSlider);
    });
}

window.initializeSliders = initializeSliders;
