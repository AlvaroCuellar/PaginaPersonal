/**
 * Featured Carousel - Universal
 * Sistema unificado para carruseles con drag-to-scroll
 * Funciona con cualquier elemento con clase .featured-carousel
 */

document.addEventListener('DOMContentLoaded', function() {
    // Buscar todos los carruseles en la página
    const carousels = document.querySelectorAll('.featured-carousel');
    
    carousels.forEach(carousel => {
        if (!carousel) return;
        
        // Buscar el botón de scroll hint asociado (dentro del mismo contenedor padre)
        const container = carousel.closest('.featured-carousel-container');
        const scrollHintButton = container ? container.querySelector('.scroll-hint-button') : null;
        
        // ============================================
        // DRAG TO SCROLL FUNCTIONALITY
        // ============================================
        
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasDragged = false;
        let dragStartTime;
        
        // Configurar cursor inicial
        carousel.style.cursor = 'grab';
        
        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            hasDragged = false;
            dragStartTime = Date.now();
            carousel.style.cursor = 'grabbing';
            carousel.style.scrollBehavior = 'auto'; // Desactivar smooth durante drag
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            e.preventDefault(); // Prevenir selección de texto
        });
        
        carousel.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                carousel.style.cursor = 'grab';
                carousel.style.scrollBehavior = 'smooth';
            }
        });
        
        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
            carousel.style.scrollBehavior = 'smooth';
        });
        
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // Multiplicador para velocidad
            
            // Marcar que hubo drag si el movimiento es significativo
            if (Math.abs(walk) > 5 || (Date.now() - dragStartTime) > 200) {
                hasDragged = true;
            }
            
            carousel.scrollLeft = scrollLeft - walk;
        });
        
        // Prevenir clicks en links si hubo drag
        carousel.addEventListener('click', (e) => {
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
        
        // ============================================
        // KEYBOARD NAVIGATION
        // ============================================
        
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                carousel.scrollBy({
                    left: -300,
                    behavior: 'smooth'
                });
            } else if (e.key === 'ArrowRight') {
                carousel.scrollBy({
                    left: 300,
                    behavior: 'smooth'
                });
            }
        });
        
        // Hacer el carrusel focuseable para navegación por teclado
        carousel.setAttribute('tabindex', '0');
        
        // ============================================
        // SCROLL INDICATOR FUNCTIONALITY
        // ============================================
        
        if (scrollHintButton) {
            // Verificar si hay contenido scrolleable
            function updateScrollIndicator() {
                const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                const currentScroll = carousel.scrollLeft;
                
                // Ocultar el indicador si no hay scroll o si ya llegamos al final
                if (maxScroll <= 10 || currentScroll >= maxScroll - 10) {
                    scrollHintButton.parentElement.style.opacity = '0';
                    scrollHintButton.parentElement.style.pointerEvents = 'none';
                } else {
                    scrollHintButton.parentElement.style.opacity = '1';
                    scrollHintButton.parentElement.style.pointerEvents = 'auto';
                }
            }
            
            // Actualizar al cargar
            updateScrollIndicator();
            
            // Actualizar cuando se hace scroll
            carousel.addEventListener('scroll', updateScrollIndicator);
            
            // Actualizar al redimensionar
            window.addEventListener('resize', updateScrollIndicator);
            
            // Hacer scroll al hacer clic en el botón
            scrollHintButton.addEventListener('click', () => {
                const scrollAmount = 250; // Scroll incremental en píxeles
                carousel.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
        }
    });
});
