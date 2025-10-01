/**
 * Show More/Less Functionality - Universal
 * Sistema unificado para manejar "ver más/menos" en cualquier sección
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configuración para cada sección
    const sectionsConfig = {
        'projects': {
            containerSelector: '#projects-container',
            itemSelector: '.project-item',
            buttonId: 'show-more-projects',
            showMoreKey: 'show_more_projects',
            showLessKey: 'show_less_projects',
            defaultShowMore: 'Ver más proyectos',
            defaultShowLess: 'Ver menos proyectos',
            scrollToSection: 'projects',
            itemsToShow: 5
        },
        'publications': {
            containerSelector: '.publication-grid',
            itemSelector: '.publication-item',
            buttonId: 'show-more-publications',
            showMoreKey: 'show_more_publications',
            showLessKey: 'show_less_publications',
            defaultShowMore: 'Ver más publicaciones',
            defaultShowLess: 'Ver menos publicaciones',
            scrollToSection: 'publications',
            itemsToShow: 5
        },
        'talks': {
            containerSelector: '.talks-grid',
            itemSelector: '.talk-item',
            buttonId: 'show-more-talks',
            showMoreKey: 'show_more_talks',
            showLessKey: 'show_less_talks',
            defaultShowMore: 'Ver más conferencias',
            defaultShowLess: 'Ver menos conferencias',
            scrollToSection: 'talks',
            responsive: true, // Enable responsive loading
            itemsToShow: {
                desktop: 6,  // Initial: 2 rows x 3 cols
                tablet: 4,   // Initial: 2 rows x 2 cols
                mobile: 2    // Initial: 2 rows x 1 col
            },
            itemsPerLoad: {
                desktop: 3,  // Load 3 at a time (1 row) on desktop
                tablet: 2,   // Load 2 at a time (1 row) on tablet
                mobile: 2    // Load 2 at a time (2 rows) on mobile
            }
        }
    };

    // Helper function to get current breakpoint
    function getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width <= 768) return 'mobile';
        if (width <= 900) return 'tablet';
        return 'desktop';
    }
    
    // Helper function to get initial items to show based on breakpoint
    function getInitialItemsToShow(config) {
        if (!config.responsive || typeof config.itemsToShow !== 'object') {
            return typeof config.itemsToShow === 'number' ? config.itemsToShow : 4;
        }
        const breakpoint = getCurrentBreakpoint();
        return config.itemsToShow[breakpoint] || 4;
    }
    
    // Helper function to get items per load based on breakpoint
    function getItemsPerLoad(config) {
        if (!config.responsive || !config.itemsPerLoad) {
            return typeof config.itemsToShow === 'number' ? config.itemsToShow : 4;
        }
        const breakpoint = getCurrentBreakpoint();
        return config.itemsPerLoad[breakpoint] || 4;
    }
    
    // Función universal para inicializar cualquier sección
    function initializeShowMore(sectionName, config) {
        const button = document.getElementById(config.buttonId);
        const items = document.querySelectorAll(config.itemSelector);
        
        let initialItemsToShow = getInitialItemsToShow(config);
        
        // Ajustar visibilidad inicial según breakpoint si es responsive
        if (config.responsive && typeof config.itemsToShow === 'object') {
            for (let i = 0; i < items.length; i++) {
                if (i < initialItemsToShow) {
                    items[i].classList.remove('hidden');
                } else {
                    items[i].classList.add('hidden');
                }
            }
        }
        
        if (!button || items.length <= initialItemsToShow) {
            if (button) button.style.display = 'none';
            return;
        }
        
        let currentVisibleCount = initialItemsToShow;
        let isExpanded = false;
        
        // Obtener textos según idioma (desde elementos data o fallback)
        const lang = document.documentElement.lang || 'es';
        const showMoreText = getTranslation(config.showMoreKey, config.defaultShowMore);
        const showLessText = getTranslation(config.showLessKey, config.defaultShowLess);
        
        // Manejar resize para responsive
        if (config.responsive && typeof config.itemsToShow === 'object') {
            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    const newInitialCount = getInitialItemsToShow(config);
                    
                    if (newInitialCount !== initialItemsToShow && !isExpanded) {
                        initialItemsToShow = newInitialCount;
                        currentVisibleCount = newInitialCount;
                        
                        // Ajustar visibilidad
                        for (let i = 0; i < items.length; i++) {
                            if (i < initialItemsToShow) {
                                items[i].classList.remove('hidden');
                            } else {
                                items[i].classList.add('hidden');
                            }
                        }
                        
                        // Mostrar/ocultar botón según sea necesario
                        if (items.length <= initialItemsToShow) {
                            button.style.display = 'none';
                        } else {
                            button.style.display = '';
                        }
                    }
                }, 250);
            });
        }
        
        button.addEventListener('click', function() {
            if (!isExpanded) {
                // Cargar más elementos según el breakpoint
                const itemsPerLoad = getItemsPerLoad(config);
                const newVisibleCount = Math.min(currentVisibleCount + itemsPerLoad, items.length);
                
                for (let i = currentVisibleCount; i < newVisibleCount; i++) {
                    items[i].classList.remove('hidden');
                }
                
                currentVisibleCount = newVisibleCount;
                
                // Si ya mostramos todos, cambiar a "ver menos"
                if (currentVisibleCount >= items.length) {
                    button.textContent = showLessText;
                    isExpanded = true;
                }
            } else {
                // Guardar posición actual antes de ocultar
                const currentScrollY = window.scrollY;
                
                // Ocultar elementos extras
                for (let i = initialItemsToShow; i < items.length; i++) {
                    items[i].classList.add('hidden');
                }
                
                currentVisibleCount = initialItemsToShow;
                button.textContent = showMoreText;
                isExpanded = false;
                
                // Verificar si después de ocultar, el usuario quedó en una zona sin contenido
                // Solo ajustar si el scroll actual está por debajo del último elemento visible
                const lastVisibleItem = items[initialItemsToShow - 1];
                if (lastVisibleItem) {
                    const lastItemRect = lastVisibleItem.getBoundingClientRect();
                    const lastItemBottom = lastItemRect.bottom + currentScrollY;
                    
                    // Si el usuario está viendo más abajo del último elemento visible,
                    // hacer un pequeño ajuste suave (no ir al inicio, solo ajustar un poco)
                    if (currentScrollY > lastItemBottom + 100) {
                        window.scrollTo({ 
                            top: lastItemBottom - 200, // Dejar un margen de 200px
                            behavior: 'smooth' 
                        });
                    }
                }
            }
            
            // Efecto visual en el botón
            const buttonContainer = button.parentElement;
            if (buttonContainer) {
                buttonContainer.style.opacity = '0.7';
                setTimeout(() => {
                    buttonContainer.style.opacity = '1';
                }, 150);
            }
        });
    }
    
    // Función auxiliar para obtener traducciones
    function getTranslation(key, fallback) {
        // Intentar obtener desde meta tags o elementos data
        const metaTranslation = document.querySelector(`meta[name="i18n-${key}"]`);
        if (metaTranslation) {
            return metaTranslation.getAttribute('content');
        }
        
        // Intentar desde un elemento global de traducciones
        const translationElement = document.querySelector(`[data-i18n="${key}"]`);
        if (translationElement) {
            return translationElement.textContent || translationElement.getAttribute('data-text');
        }
        
        return fallback;
    }
    
    // Inicializar todas las secciones configuradas
    Object.keys(sectionsConfig).forEach(sectionName => {
        initializeShowMore(sectionName, sectionsConfig[sectionName]);
    });
});

// Funciones globales para compatibilidad con llamadas directas
window.toggleProjects = function() {
    const button = document.getElementById('show-more-projects');
    if (button) button.click();
};

window.togglePublications = function() {
    const button = document.getElementById('show-more-publications');
    if (button) button.click();
};

window.toggleTalks = function() {
    const button = document.getElementById('show-more-talks');
    if (button) button.click();
};