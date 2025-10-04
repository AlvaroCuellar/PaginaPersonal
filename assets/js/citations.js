/**
 * Citations Overlay Functionality
 * Maneja la apertura y cierre de overlays de citaciones
 */

function toggleCitationOverlay(overlayId) {
    const overlay = document.getElementById(overlayId + '-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden');
        
        // Prevenir scroll del body cuando el overlay está abierto
        if (!overlay.classList.contains('hidden')) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }
    }
}

// Cerrar overlay al hacer clic fuera del contenido
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('citation-overlay')) {
        event.target.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
    }
});

// Cerrar overlay con tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openOverlay = document.querySelector('.citation-overlay:not(.hidden)');
        if (openOverlay) {
            openOverlay.classList.add('hidden');
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }
    }
});