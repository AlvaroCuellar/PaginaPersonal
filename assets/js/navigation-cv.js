/**
 * ===================================
 * CV NAVIGATION SYSTEM
 * ===================================
 * Sistema de navegación específico para el CV con scroll spy
 */

document.addEventListener('DOMContentLoaded', () => {
    // Solo ejecutar en páginas del CV
    if (!document.querySelector('.cv-container') && !window.location.pathname.includes('/cv')) {
        return;
    }

    console.log('CV Navigation System initialized');

    const sections = document.querySelectorAll('.cv-section');
    const menuItems = document.querySelectorAll('.side-menu ul a');
    
    /**
     * ===================================
     * SCROLL SPY SYSTEM
     * ===================================
     */
    function updateActiveMenuItem() {
        const currentScroll = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight - windowHeight;

        // Resetear todos los items del menú
        menuItems.forEach(item => {
            item.classList.remove('active');
        });

        // Verificar si estamos cerca del final
        const nearBottom = (currentScroll + windowHeight) >= (docHeight - 300);

        if (nearBottom) {
            const distanceToBottom = docHeight - currentScroll;
            
            if (distanceToBottom < 100) {
                const lastItem = menuItems[menuItems.length - 1]; // LANGUAGES
                if (lastItem) lastItem.classList.add('active');
            } 
            else if (distanceToBottom < 200) {
                const skillsItem = menuItems[menuItems.length - 2]; // SKILLS
                if (skillsItem) skillsItem.classList.add('active');
            }
            else {
                const activitiesItem = menuItems[menuItems.length - 3]; // ACTIVITIES
                if (activitiesItem) activitiesItem.classList.add('active');
            }
            return;
        }

        // Comportamiento normal para el resto de la página
        let activeSection = null;
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                activeSection = index;
            }
        });

        if (activeSection !== null && menuItems[activeSection]) {
            menuItems[activeSection].classList.add('active');
        }
    }

    /**
     * ===================================
     * INITIALIZATION (solo scroll spy)
     * ===================================
     */
    
    // Configurar scroll spy
    window.addEventListener('scroll', updateActiveMenuItem);
    updateActiveMenuItem(); // Llamada inicial
    
    console.log(`CV Navigation initialized with ${sections.length} sections and ${menuItems.length} menu items`);
});
