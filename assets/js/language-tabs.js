/* ═══════════════════════════════════════════════════════════
   LANGUAGE TABS - Funcionalidad de cambio de idioma
   ═══════════════════════════════════════════════════════════ */

/**
 * Cambia entre las pestañas de idioma (Español/English)
 * @param {string} lang - 'esp' para español, 'eng' para inglés
 */
function switchLanguage(lang) {
    var bioEsp = document.getElementById("bioEsp");
    var bioEng = document.getElementById("bioEng");
    var tabEsp = document.getElementById("tabEsp");
    var tabEng = document.getElementById("tabEng");
    
    if (lang === 'esp') {
        bioEsp.style.display = "block";
        bioEng.style.display = "none";
        tabEsp.classList.add("active");
        tabEng.classList.remove("active");
    } else if (lang === 'eng') {
        bioEsp.style.display = "none";
        bioEng.style.display = "block";
        tabEsp.classList.remove("active");
        tabEng.classList.add("active");
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configuración inicial - mostrar español por defecto
    switchLanguage('esp');
});
