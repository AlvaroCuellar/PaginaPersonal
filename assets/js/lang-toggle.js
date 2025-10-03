/**
 * ===================================
 * LANGUAGE TOGGLE - Visual Animation
 * ===================================
 * Maneja SOLO la animación del slider de idioma
 * La navegación y preservación de scroll se manejan en navigation.js
 * Compatible con el sistema AJAX de cambio de idioma
 */

"use strict";

// Función para inicializar/reinicializar el toggle
function initLanguageToggle() {
    const langSwitcher = document.querySelector('.lang-switcher');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (!langSwitcher || langOptions.length === 0) return;
    
    // Configurar posición inicial del slider
    const currentLang = document.documentElement.lang || 'es';
    langSwitcher.setAttribute('data-active', currentLang);
    
    console.log(`🎨 Language toggle initialized with lang: ${currentLang}`);
    
    // Solo animación visual del slider
    langOptions.forEach(option => {
        // Remover listeners anteriores para evitar duplicados
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
        
        newOption.addEventListener('click', function(e) {
            const lang = this.getAttribute('data-lang');
            langSwitcher.setAttribute('data-active', lang);
            // La navegación y scroll se manejan en ajax-language-switcher.js
        });
    });
}

// Inicializar en carga inicial
document.addEventListener('DOMContentLoaded', initLanguageToggle);

// RE-INICIALIZAR cuando el sistema AJAX cambia el contenido
document.addEventListener('languageContentReplaced', function(event) {
    console.log('🔄 Reinitializing language toggle after AJAX change');
    // Esperar un poco para que el DOM se actualice
    setTimeout(initLanguageToggle, 100);
});