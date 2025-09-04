"use strict";

/**
 * ===================================
 * TIMELINE ANIMATIONS
 * ===================================
 * Animaciones de timeline basadas en scroll para la sección bio
 */

/**
 * Inicializa las animaciones de timeline basadas en scroll
 * Los elementos .timeline-item se activan cuando están cerca del centro de la pantalla
 */
function animateTimelineOnScroll() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length === 0) {
        return; // No hay elementos timeline
    }
    
    /**
     * Verifica qué elemento del timeline está visible y lo activa
     */
    function checkTimelineVisibility() {
        let activeIndex = -1;
        
        // Encontrar el item más cercano al centro de la pantalla
        timelineItems.forEach(function(item, index) {
            const rect = item.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const itemCenter = rect.top + (rect.height / 2);
            const screenCenter = windowHeight / 2;
            
            // Si el item está en el centro de la pantalla (±200px)
            if (Math.abs(itemCenter - screenCenter) < 200) {
                activeIndex = index;
            }
        });

        // Activar solo el item actual y desactivar los demás
        timelineItems.forEach(function(item, index) {
            if (index === activeIndex) {
                item.classList.add('visible');
            } else {
                item.classList.remove('visible');
            }
        });
    }

    // Ejecutar al cargar la página
    checkTimelineVisibility();
    
    // Ejecutar al hacer scroll con throttling para mejor rendimiento
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(checkTimelineVisibility);
            ticking = true;
            setTimeout(() => { ticking = false; }, 16); // ~60fps
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Inicializar automáticamente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay timeline en la página antes de inicializar
    if (document.querySelector('.timeline-container')) {
        animateTimelineOnScroll();
    }
});
