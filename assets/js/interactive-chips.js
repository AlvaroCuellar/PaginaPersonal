/* ═══════════════════════════════════════════════════════════
   INTERACTIVE CHIPS - Sistema genérico para chips expandibles
   Reutilizable para training, skills y otros componentes
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    
    // Configuración para diferentes tipos de chips
    const chipConfigs = {
        'training-chip': {
            container: '.training-chips',
            badgeSelector: '.chip-year',
            toggleSelector: null,
            console: 'Training chip'
        },
        'skill-chip': {
            container: '.skills-chips',
            badgeSelector: null,
            toggleSelector: '.chip-toggle',
            console: 'Skill chip'
        }
    };
    
    // Función genérica para inicializar chips
    function initializeChips(chipClass) {
        const config = chipConfigs[chipClass];
        if (!config) return;
        
        const chips = document.querySelectorAll(`.${chipClass}`);
        if (chips.length === 0) return;
        
        let currentExpandedChip = null;
        
        console.log(`${config.console} - Modo universal: Clic/Tap`);
        
        // Configuración inicial: asegurar que todos los chips estén cerrados
        chips.forEach(chip => {
            // Remover clase expanded y dejar que CSS controle la altura fija
            chip.classList.remove('expanded');
            chip.style.transition = 'background-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease';
            
            const details = chip.querySelector('.chip-details');
            if (details) {
                details.style.maxHeight = '0px';
                details.style.paddingTop = '0px';
                details.style.opacity = '0';
                details.style.overflow = 'hidden';
                details.style.transition = 'max-height 0.3s ease, padding-top 0.3s ease, opacity 0.3s ease';
            }
            
            // Inicializar toggle si existe
            if (config.toggleSelector) {
                const toggle = chip.querySelector(config.toggleSelector);
                if (toggle) {
                    toggle.textContent = '+';
                }
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
            // Remover clase expanded para volver a altura fija
            chip.classList.remove('expanded');
            
            const details = chip.querySelector('.chip-details');
            if (details) {
                details.style.maxHeight = '0px';
                details.style.paddingTop = '0px';
                details.style.opacity = '0';
            }
            
            // Actualizar toggle si existe
            if (config.toggleSelector) {
                const toggle = chip.querySelector(config.toggleSelector);
                if (toggle) {
                    toggle.textContent = '+';
                }
            }
            
            removeActiveStyles(chip);
            console.log(`Cerrando ${config.console.toLowerCase()} ${index + 1}`);
        }
        
        // Función para abrir un chip
        function openChip(chip, index) {
            // Agregar clase expanded para permitir altura automática
            chip.classList.add('expanded');
            
            const details = chip.querySelector('.chip-details');
            if (details) {
                const maxHeight = chipClass === 'skill-chip' ? '200px' : '300px';
                details.style.maxHeight = maxHeight;
                details.style.paddingTop = '16px';
                details.style.opacity = '1';
            }
            
            // Actualizar toggle si existe
            if (config.toggleSelector) {
                const toggle = chip.querySelector(config.toggleSelector);
                if (toggle) {
                    toggle.textContent = '−';
                }
            }
            
            applyActiveStyles(chip);
            const dataAttr = chipClass === 'training-chip' ? chip.dataset.training : chip.dataset.skill;
            console.log(`Expandiendo ${config.console.toLowerCase()} ${index + 1}:`, dataAttr);
        }
        
        // Función para cerrar todos los chips
        function closeAllChips() {
            chips.forEach((chip, index) => {
                closeChip(chip, index);
            });
        }
        
        // Configurar eventos de clic para todos los chips
        chips.forEach((chip, index) => {
            chip.addEventListener('click', function(e) {
                // No prevenir si el clic es en un enlace
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    console.log('Clic en enlace detectado, permitiendo navegación');
                    return;
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
            if (!e.target.closest(`.${chipClass}`) && currentExpandedChip) {
                closeAllChips();
                currentExpandedChip = null;
                console.log(`Cerrando ${config.console.toLowerCase()}s por clic fuera`);
            }
        });
        
        console.log(`${config.console}s initialized:`, chips.length);
    }
    
    // Inicializar todos los tipos de chips
    Object.keys(chipConfigs).forEach(chipClass => {
        initializeChips(chipClass);
    });
});
