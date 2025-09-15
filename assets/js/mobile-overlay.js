/**
 * ===================================
 * MOBILE MENU OVERLAY SYSTEM
 * ===================================
 * Sistema de menú móvil unificado con overlay para toda la web
 */

(function() {
    'use strict';
    
    let isMenuOpen = false;
    
    /**
     * Inicializa el sistema de menú móvil overlay
     */
    function initMobileMenuOverlay() {
        // Crear elementos del menú si no existen
        createMobileMenuElements();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Configurar detección de color del hamburger
        handleHamburgerColor();
    }
    
    /**
     * Crea los elementos HTML del menú móvil overlay
     */
    function createMobileMenuElements() {
        // Verificar si ya existen los elementos
        if (document.querySelector('.hamburger-menu')) {
            return;
        }
        
        // Crear botón hamburger
        const hamburgerButton = document.createElement('button');
        hamburgerButton.className = 'hamburger-menu';
        hamburgerButton.innerHTML = '<span class="hamburger-icon"></span>';
        
        // Crear overlay del menú
        const menuOverlay = document.createElement('div');
        menuOverlay.className = 'mobile-menu-overlay';
        
        // Crear contenido del menú
        const menuContent = document.createElement('div');
        menuContent.className = 'mobile-menu-content';
        
        // Determinar qué tipo de menú crear según la página
        if (window.location.pathname.includes('/cv') || document.querySelector('.cv-container')) {
            // Menú para CV
            createCVMenu(menuContent);
        } else {
            // Menú para página principal
            createHomeMenu(menuContent);
        }
        
        menuOverlay.appendChild(menuContent);
        
        // Añadir elementos al DOM
        document.body.appendChild(hamburgerButton);
        document.body.appendChild(menuOverlay);
        
        console.log('Mobile menu elements created successfully');
    }
    
    /**
     * Crea el menú para la página principal
     */
    function createHomeMenu(menuContent) {
        const navMain = document.querySelector('#nav-main ul');
        if (navMain) {
            let menuHTML = '<ul>';
            
            // Copiar todos los elementos li del nav original
            const navItems = navMain.querySelectorAll('li');
            navItems.forEach(item => {
                menuHTML += item.outerHTML;
            });
            
            menuHTML += '</ul>';
            menuContent.innerHTML = menuHTML;
            console.log('Home menu created with', navItems.length, 'items');
        } else {
            console.warn('Nav main not found - home overlay menu not created');
            // Sin fallback - si no hay nav-main, no crear menú
            menuContent.innerHTML = '<ul></ul>';
        }
    }
    
    /**
     * Crea el menú para el CV
     */
    function createCVMenu(menuContent) {
        // Obtener enlaces del menú lateral del CV (generado dinámicamente desde YAML)
        const sideMenu = document.querySelector('.side-menu ul');
        if (sideMenu) {
            let menuHTML = '<ul>';
            
            // Añadir icono Back al principio
            menuHTML += '<li><a href="/index.html" class="cv-back-link" title="Volver al inicio"><svg class="back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5L3 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10H11C16.5228 10 21 14.4772 21 20V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></li>';
            
            // Copiar todos los elementos li del menú lateral (dinámico desde YAML)
            const menuItems = sideMenu.querySelectorAll('li');
            menuItems.forEach(item => {
                menuHTML += item.outerHTML;
            });
            
            menuHTML += '</ul>';
            menuContent.innerHTML = menuHTML;
            console.log('CV menu created from side-menu with', menuItems.length, 'items');
        } else {
            console.warn('Side menu not found - CV overlay menu not created');
            // Sin fallback - si no hay side-menu, no crear menú
            menuContent.innerHTML = '<ul><li><a href="/index.html" class="cv-back-link" title="Volver al inicio"><svg class="back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5L3 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10H11C16.5228 10 21 14.4772 21 20V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></li></ul>';
        }
    }
    
    /**
     * Configura los event listeners del overlay
     */
    function setupEventListeners() {
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const menuOverlay = document.querySelector('.mobile-menu-overlay');
        
        if (!hamburgerButton || !menuOverlay) {
            console.warn('Mobile menu overlay elements not found');
            return;
        }
        
        // Toggle menú al hacer clic en hamburger
        hamburgerButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenuOverlay();
        });
        
        // Cerrar menú al hacer clic en el overlay (fuera del contenido)
        menuOverlay.addEventListener('click', function(e) {
            if (e.target === menuOverlay) {
                closeMenuOverlay();
            }
        });
        
        // Configurar event listeners para enlaces
        updateMenuEventListeners();
    }
    
    /**
     * Actualiza los event listeners de los enlaces del menú overlay
     */
    function updateMenuEventListeners() {
        const menuLinks = document.querySelectorAll('.mobile-menu-content a:not(.menu-button)');
        
        // Cerrar menú al hacer clic en enlaces
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Solo cerrar el menú - usar navegación nativa del navegador
                closeMenuOverlay();
            });
        });
        
        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenuOverlay();
            }
        });
    }
    
    /**
     * Alterna el estado del menú overlay
     */
    function toggleMenuOverlay() {
        if (isMenuOpen) {
            closeMenuOverlay();
        } else {
            openMenuOverlay();
        }
    }
    
    /**
     * Abre el menú overlay
     */
    function openMenuOverlay() {
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const menuOverlay = document.querySelector('.mobile-menu-overlay');
        
        if (!hamburgerButton || !menuOverlay) return;
        
        isMenuOpen = true;
        
        // Añadir clases activas
        hamburgerButton.classList.add('active');
        menuOverlay.classList.add('show');
        
        // Prevenir scroll del body
        document.body.classList.add('menu-open');
        
        // Foco en el overlay para accesibilidad
        menuOverlay.focus();
    }
    
    /**
     * Cierra el menú overlay
     */
    function closeMenuOverlay() {
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const menuOverlay = document.querySelector('.mobile-menu-overlay');
        
        if (!hamburgerButton || !menuOverlay) return;
        
        isMenuOpen = false;
        
        // Remover clases activas
        hamburgerButton.classList.remove('active');
        menuOverlay.classList.remove('show');
        
        // Restaurar scroll del body
        document.body.classList.remove('menu-open');
    }
    
    /**
     * Maneja el color del hamburger menu según la posición del scroll
     */
    function handleHamburgerColor() {
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const banner = document.querySelector('#banner');
        
        if (!hamburgerButton || !banner) return;
        
        // Configurar waypoint para detectar cuando sales del banner
        if (typeof $ !== 'undefined' && $.fn.waypoint) {
            $('#banner').waypoint(function (direction) {
                if (direction === 'down') {
                    // Fuera del banner: usar primary
                    hamburgerButton.classList.add('over-content');
                } else {
                    // Sobre el banner: usar accent
                    hamburgerButton.classList.remove('over-content');
                }
            }, {
                offset: '-90%'
            });
        }
    }
    
    // Exponer funciones para uso externo
    window.MobileMenuOverlay = {
        init: initMobileMenuOverlay,
        open: openMenuOverlay,
        close: closeMenuOverlay,
        toggle: toggleMenuOverlay
    };
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenuOverlay);
    } else {
        initMobileMenuOverlay();
    }
    
})();
