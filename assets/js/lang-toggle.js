/**
 * ===================================
 * LANGUAGE TOGGLE - Visual Animation
 * ===================================
 * Maneja SOLO la animación del slider de idioma
 * La navegación y preservación de scroll se manejan en navigation.js
 */

"use strict";

document.addEventListener('DOMContentLoaded', function() {
    const langSwitcher = document.querySelector('.lang-switcher');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (!langSwitcher || langOptions.length === 0) return;
    
    // Configurar posición inicial del slider
    const currentLang = document.documentElement.lang || 'es';
    langSwitcher.setAttribute('data-active', currentLang);
    
    // Solo animación visual del slider
    langOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            const lang = this.getAttribute('data-lang');
            langSwitcher.setAttribute('data-active', lang);
            // La navegación y scroll se manejan en navigation.js
        });
    });
});