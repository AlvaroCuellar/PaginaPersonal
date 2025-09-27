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
    
    // Agregar feedback visual al hover
    langOptions.forEach(option => {
        option.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'scale(1.05)';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        // Agregar efecto de click
        option.addEventListener('click', function(e) {
            // Pequeña animación antes de la navegación
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Agregar clase para animaciones mejoradas
    langSwitcher.classList.add('enhanced');
});