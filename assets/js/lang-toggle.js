/**
 * Language Toggle Enhancement
 * Mejora la experiencia visual del cambio de idioma
 */

document.addEventListener('DOMContentLoaded', function() {
    const langSwitcher = document.querySelector('.lang-switcher');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (!langSwitcher || langOptions.length === 0) return;
    
    // Asegurar que el slider esté en la posición correcta al cargar
    const activeOption = document.querySelector('.lang-option.active');
    if (activeOption) {
        const lang = activeOption.getAttribute('data-lang');
        langSwitcher.setAttribute('data-active', lang);
    }
    
    // Sistema simplificado - solo posicionamiento del slider
    langOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            // Actualizar data-active al hacer clic
            const lang = this.getAttribute('data-lang');
            langSwitcher.setAttribute('data-active', lang);
        });
    });
});