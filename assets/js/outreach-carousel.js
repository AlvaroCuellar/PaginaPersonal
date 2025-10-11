/**
 * Outreach Featured Carousel
 * Carrusel para artículos destacados de divulgación
 */

(function() {
    'use strict';
    
    let currentSlide = 0;
    let slides = [];
    let indicators = [];
    let autoplayInterval = null;
    const AUTOPLAY_DELAY = 3000; // 3 segundos
    
    function initOutreachCarousel() {
        const carousel = document.querySelector('.outreach-featured-carousel');
        if (!carousel) return;
        
        slides = Array.from(document.querySelectorAll('.outreach-featured-slide'));
        indicators = Array.from(document.querySelectorAll('.outreach-indicator'));
        
        if (slides.length === 0) return;
        
        // Mostrar el primer slide
        showSlide(0);
        
        // Configurar navegación con flechas
        const prevButton = document.querySelector('.outreach-carousel-prev');
        const nextButton = document.querySelector('.outreach-carousel-next');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                stopAutoplay();
                previousSlide();
                startAutoplay();
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                stopAutoplay();
                nextSlide();
                startAutoplay();
            });
        }
        
        // Configurar indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                stopAutoplay();
                goToSlide(index);
                startAutoplay();
            });
        });
        
        // Iniciar autoplay
        startAutoplay();
        
        // Pausar autoplay cuando el mouse está sobre el carrusel
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        
        // Soporte para teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                stopAutoplay();
                previousSlide();
                startAutoplay();
            } else if (e.key === 'ArrowRight') {
                stopAutoplay();
                nextSlide();
                startAutoplay();
            }
        });
    }
    
    function showSlide(index) {
        // Desplazar el track
        const track = document.querySelector('.outreach-carousel-track');
        if (track) {
            track.style.transform = `translateX(-${index * 100}%)`;
        }
        
        // Actualizar clases active
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        // Actualizar indicadores
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    function previousSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    function goToSlide(index) {
        showSlide(index);
    }
    
    function startAutoplay() {
        if (slides.length <= 1) return; // No autoplay si solo hay un slide
        
        stopAutoplay(); // Limpiar cualquier intervalo existente
        autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
    }
    
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOutreachCarousel);
    } else {
        initOutreachCarousel();
    }
    
    // Reinicializar después de cambio de idioma AJAX
    document.addEventListener('languageContentReplaced', function(e) {
        console.log('🔄 Outreach Carousel: Reinitializing after language change');
        setTimeout(initOutreachCarousel, 200);
    });
})();
