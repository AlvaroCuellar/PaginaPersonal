document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.cv-section');
    const menuItems = document.querySelectorAll('.side-menu ul a');
    
    // Crear el indicador de scroll (TEMPORALMENTE DESACTIVADO)
    // const scrollIndicator = document.createElement('div');
    // scrollIndicator.className = 'scroll-indicator';
    // document.querySelector('.side-menu ul').appendChild(scrollIndicator);

    function updateScroll() {
        const currentScroll = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = (currentScroll / docHeight) * 100;
        // scrollIndicator.style.height = `${scrolled}%`; // TEMPORALMENTE DESACTIVADO

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
                lastItem.classList.add('active');
            } 
            else if (distanceToBottom < 200) {
                const skillsItem = menuItems[menuItems.length - 2]; // SKILLS
                skillsItem.classList.add('active');
            }
            else {
                const activitiesItem = menuItems[menuItems.length - 3]; // ACTIVITIES
                activitiesItem.classList.add('active');
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

    window.addEventListener('scroll', updateScroll);
    updateScroll();
});