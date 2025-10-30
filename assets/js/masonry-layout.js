/**
 * Masonry Layout - Outreach Section
 * Sistema de layout tipo Pinterest que mantiene el orden horizontal
 * y permite alturas diferentes para cada tarjeta
 */

(function() {
    'use strict';
    
    let resizeTimeout;
    
    function initMasonryLayout() {
        const grid = document.querySelector('.outreach-masonry-grid');
        if (!grid) {
            console.log('Masonry: Grid not found, skipping initialization');
            return;
        }
        
        console.log('🧱 Masonry: Initializing layout');
        
        // Aplicar el layout masonry
        applyMasonryLayout(grid);
        
        // Reajustar al cambiar tamaño de ventana (con debounce)
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('🧱 Masonry: Reapplying layout after resize');
                applyMasonryLayout(grid);
            }, 250);
        });
        
        // Reajustar cuando se cargan imágenes
        const images = grid.querySelectorAll('img');
        images.forEach(img => {
            if (img.complete) {
                return;
            }
            img.addEventListener('load', () => {
                applyMasonryLayout(grid);
            });
        });
    }
    
    function applyMasonryLayout(grid) {
        const cards = Array.from(grid.querySelectorAll('.outreach-card:not(.hidden)'));
        
        if (cards.length === 0) return;
        
        // Obtener número de columnas según el viewport
        const columnCount = getColumnCount();
        
        // Si es 1 columna (mobile), no aplicar masonry
        if (columnCount === 1) {
            resetMasonryStyles(grid, cards);
            return;
        }
        
        // Resetear estilos previos
        grid.style.position = 'relative';
        
        // Inicializar arrays para tracking de alturas de columnas
        const columnHeights = new Array(columnCount).fill(0);
        const gap = parseFloat(getComputedStyle(grid).columnGap) || 20;
        
        // Obtener ancho de columna
        const gridWidth = grid.offsetWidth;
        const cardWidth = (gridWidth - (gap * (columnCount - 1))) / columnCount;
        
        // Posicionar cada tarjeta
        cards.forEach((card, index) => {
            // Determinar en qué columna va según el orden (horizontal)
            const columnIndex = index % columnCount;
            
            // Calcular posición
            const x = columnIndex * (cardWidth + gap);
            const y = columnHeights[columnIndex];
            
            // Aplicar posicionamiento absoluto
            card.style.position = 'absolute';
            card.style.width = `${cardWidth}px`;
            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
            card.style.transition = 'top 0.3s ease, left 0.3s ease';
            
            // Actualizar altura de la columna
            const cardHeight = card.offsetHeight;
            columnHeights[columnIndex] += cardHeight + gap;
        });
        
        // Ajustar altura del contenedor al contenido
        const maxHeight = Math.max(...columnHeights);
        grid.style.height = `${maxHeight}px`;
        
        console.log(`✅ Masonry: Layout applied (${columnCount} columns, ${cards.length} cards)`);
    }
    
    function getColumnCount() {
        const width = window.innerWidth;
        
        if (width >= 1400) {
            return 4; // Desktop XL
        } else if (width >= 1025) {
            return 3; // Desktop
        } else if (width >= 769) {
            return 2; // Tablet
        } else {
            return 1; // Mobile
        }
    }
    
    function resetMasonryStyles(grid, cards) {
        // Resetear estilos para mobile (1 columna)
        grid.style.position = '';
        grid.style.height = '';
        
        cards.forEach(card => {
            card.style.position = '';
            card.style.width = '';
            card.style.left = '';
            card.style.top = '';
        });
    }
    
    // ═══════════════════════════════════════════════════════════
    // INICIALIZACIÓN Y RE-INICIALIZACIÓN
    // ═══════════════════════════════════════════════════════════
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMasonryLayout);
    } else {
        // DOM ya está listo
        initMasonryLayout();
    }
    
    // RE-INICIALIZAR después de cambio de idioma AJAX
    document.addEventListener('languageContentReplaced', function(e) {
        console.log('🔄 Masonry: Reinitializing after language change');
        setTimeout(() => {
            initMasonryLayout();
        }, 200);
    });
    
    // RE-INICIALIZAR cuando se muestran más items (botón "Ver más")
    const showMoreButton = document.getElementById('show-more-outreach');
    if (showMoreButton) {
        showMoreButton.addEventListener('click', function() {
            setTimeout(() => {
                const grid = document.querySelector('.outreach-masonry-grid');
                if (grid) {
                    console.log('🔄 Masonry: Reapplying after showing more items');
                    applyMasonryLayout(grid);
                }
            }, 100);
        });
    }
    
    // Observer para detectar cambios en clases (hidden/visible)
    const grid = document.querySelector('.outreach-masonry-grid');
    if (grid && window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            let shouldReapply = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('outreach-card')) {
                        shouldReapply = true;
                    }
                }
            });
            
            if (shouldReapply) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    console.log('🔄 Masonry: Reapplying after visibility change');
                    applyMasonryLayout(grid);
                }, 50);
            }
        });
        
        observer.observe(grid, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }
    
})();

