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
            itemsToShow: 4
        }
    };

    // Función universal para inicializar cualquier sección
    function initializeShowMore(sectionName, config) {
        const button = document.getElementById(config.buttonId);
        const items = document.querySelectorAll(config.itemSelector);
        
        if (!button || items.length <= config.itemsToShow) return;
        
        let isExpanded = false;
        
        // Obtener textos según idioma (desde elementos data o fallback)
        const lang = document.documentElement.lang || 'es';
        const showMoreText = getTranslation(config.showMoreKey, config.defaultShowMore);
        const showLessText = getTranslation(config.showLessKey, config.defaultShowLess);
        
        button.addEventListener('click', function() {
            if (!isExpanded) {
                // Mostrar todos los elementos
                for (let i = config.itemsToShow; i < items.length; i++) {
                    items[i].classList.remove('hidden');
                }
                button.textContent = showLessText;
                isExpanded = true;
            } else {
                // Verificar si necesitamos hacer scroll antes de ocultar
                const shouldScroll = checkIfScrollNeeded(items, config.itemsToShow);
                
                // Ocultar elementos extras
                for (let i = config.itemsToShow; i < items.length; i++) {
                    items[i].classList.add('hidden');
                }
                button.textContent = showMoreText;
                isExpanded = false;
                
                // Solo hacer scroll si el usuario está viendo contenido que va a desaparecer
                if (shouldScroll) {
                    const section = document.getElementById(config.scrollToSection);
                    if (section) {
                        section.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
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
    
    // Función para verificar si es necesario hacer scroll al colapsar
    function checkIfScrollNeeded(items, itemsToShow) {
        // Obtener la posición actual del scroll
        const currentScrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const currentViewBottom = currentScrollY + viewportHeight;
        
        // Verificar si algún elemento que va a desaparecer está visible
        for (let i = itemsToShow; i < items.length; i++) {
            const item = items[i];
            if (!item.classList.contains('hidden')) {
                const itemRect = item.getBoundingClientRect();
                const itemTop = itemRect.top + currentScrollY;
                const itemBottom = itemRect.bottom + currentScrollY;
                
                // Si el elemento está parcialmente visible, necesitamos scroll
                if (itemTop < currentViewBottom && itemBottom > currentScrollY) {
                    return true;
                }
            }
        }
        
        return false;
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