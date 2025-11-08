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
    // Buscar TODOS los lang-switchers (header y mobile menu)
    const langSwitchers = document.querySelectorAll('.lang-switcher');
    
    if (langSwitchers.length === 0) {
        console.warn('⚠️ No lang-switcher found');
        return;
    }
    
    const currentLang = document.documentElement.lang || 'es';
    console.log(`🎨 Language toggle initialized with lang: ${currentLang}`);
    
    langSwitchers.forEach(langSwitcher => {
        // Configurar posición inicial del slider
        langSwitcher.setAttribute('data-active', currentLang);
        
        const langOptions = langSwitcher.querySelectorAll('.lang-option');
        
        // Solo animación visual del slider
        langOptions.forEach(option => {
            // Remover listeners anteriores para evitar duplicados
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            newOption.addEventListener('click', function(e) {
                const lang = this.getAttribute('data-lang');
                
                // Actualizar TODOS los switchers en la página
                document.querySelectorAll('.lang-switcher').forEach(sw => {
                    sw.setAttribute('data-active', lang);
                });
                
                console.log(`🎨 Visual toggle updated to: ${lang}`);
                // La navegación y scroll se manejan en ajax-language-switcher.js
            });
        });
    });
    
    console.log(`✅ ${langSwitchers.length} language toggle(s) initialized`);
}

// Inicializar en carga inicial
document.addEventListener('DOMContentLoaded', initLanguageToggle);

// RE-INICIALIZAR cuando el sistema AJAX cambia el contenido
document.addEventListener('languageContentReplaced', function(event) {
    console.log('🔄 Reinitializing language toggle after AJAX change');
    // Esperar un poco para que el DOM se actualice
    setTimeout(initLanguageToggle, 100);
});