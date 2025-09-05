/* ═══════════════════════════════════════════════════════════
   TRAINING CHIPS - Control individual de expansión con JavaScript
   Funciona con clic/tap en todos los dispositivos
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    const trainingChips = document.querySelectorAll('.training-chip');
    const CLOSED_HEIGHT = '60px';
    const EXPANDED_HEIGHT = 'auto';
    
    // Variable para trackear el chip actualmente expandido
    let currentExpandedChip = null;
    
    console.log('Training chips - Modo universal: Clic/Tap');
    
    // Configuración inicial: asegurar que todos los chips estén cerrados
    trainingChips.forEach(chip => {
        chip.style.minHeight = CLOSED_HEIGHT;
        chip.style.height = CLOSED_HEIGHT;
        chip.style.transition = 'background-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, height 0.3s ease, min-height 0.3s ease';
        
        const details = chip.querySelector('.chip-details');
        if (details) {
            details.style.maxHeight = '0px';
            details.style.paddingTop = '0px';
            details.style.opacity = '0';
            details.style.overflow = 'hidden';
            details.style.transition = 'max-height 0.3s ease, padding-top 0.3s ease, opacity 0.3s ease';
        }
    });
    
    // Función para aplicar estilos de activo
    function applyActiveStyles(chip) {
        chip.style.background = 'var(--primary-color)';
        chip.style.color = 'white';
        chip.style.transform = 'translateY(-2px)';
        chip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    }
    
    // Función para quitar estilos de activo
    function removeActiveStyles(chip) {
        chip.style.background = '';
        chip.style.color = '';
        chip.style.transform = '';
        chip.style.boxShadow = '';
    }
    
    // Función para cerrar un chip
    function closeChip(chip, index) {
        chip.style.height = CLOSED_HEIGHT;
        chip.style.minHeight = CLOSED_HEIGHT;
        
        const details = chip.querySelector('.chip-details');
        if (details) {
            details.style.maxHeight = '0px';
            details.style.paddingTop = '0px';
            details.style.opacity = '0';
        }
        
        removeActiveStyles(chip);
        console.log(`Cerrando chip ${index + 1}`);
    }
    
    // Función para abrir un chip
    function openChip(chip, index) {
        chip.style.height = EXPANDED_HEIGHT;
        chip.style.minHeight = EXPANDED_HEIGHT;
        
        const details = chip.querySelector('.chip-details');
        if (details) {
            details.style.maxHeight = '300px';
            details.style.paddingTop = '16px';
            details.style.opacity = '1';
        }
        
        applyActiveStyles(chip);
        console.log(`Expandiendo chip ${index + 1}:`, chip.dataset.training);
    }
    
    // Función para cerrar todos los chips
    function closeAllChips() {
        trainingChips.forEach((chip, index) => {
            closeChip(chip, index);
        });
    }
    
    // Configurar eventos de clic para todos los chips
    trainingChips.forEach((chip, index) => {
        chip.addEventListener('click', function(e) {
            // No prevenir si el clic es en un enlace
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                console.log('Clic en enlace detectado, permitiendo navegación');
                return; // Permitir que el enlace funcione normalmente
            }
            
            e.preventDefault();
            
            if (currentExpandedChip === this) {
                // Si este chip ya está expandido, cerrarlo
                closeChip(this, index);
                currentExpandedChip = null;
            } else {
                // Cerrar cualquier chip abierto
                closeAllChips();
                currentExpandedChip = null;
                
                // Abrir este chip
                openChip(this, index);
                currentExpandedChip = this;
            }
        });
        
        // Añadir cursor pointer para indicar que es clickeable
        chip.style.cursor = 'pointer';
    });
    
    // Cerrar chips al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.training-chip') && currentExpandedChip) {
            closeAllChips();
            currentExpandedChip = null;
            console.log('Cerrando chips por clic fuera');
        }
    });
    
    console.log('Training chips initialized:', trainingChips.length);
});
