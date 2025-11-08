/**
 * MOBILE MENU OVERLAY SYSTEM
 */
(function() {
    'use strict';
    let isMenuOpen = false;
    
    function initMobileMenuOverlay() {
        console.log('Mobile menu init');
        createMobileMenuElements();
        setupEventListeners();
        handleHamburgerColor();
    }
    
    function createMobileMenuElements() {
        if (document.querySelector('.hamburger-menu')) return;
        
        const btn = document.createElement('button');
        btn.className = 'hamburger-menu';
        btn.innerHTML = '<span class="hamburger-icon"></span>';
        
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        
        const content = document.createElement('div');
        content.className = 'mobile-menu-content';
        
        const nav = document.querySelector('#nav-main ul');
        if (nav) {
            let html = '<ul>';
            nav.querySelectorAll('li').forEach(i => html += i.outerHTML);
            html += '</ul>';
            content.innerHTML = html;
        }
        
        overlay.appendChild(content);
        document.body.appendChild(btn);
        document.body.appendChild(overlay);
    }
    
    function setupEventListeners() {
        const btn = document.querySelector('.hamburger-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (!btn || !overlay) return;
        
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        document.querySelector('.hamburger-menu').addEventListener('click', e => {
            e.preventDefault();
            toggleMenuOverlay();
        });
        
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeMenuOverlay();
        });
        
        document.querySelectorAll('.mobile-menu-content a').forEach(link => {
            link.addEventListener('click', () => closeMenuOverlay());
        });
    }
    
    function toggleMenuOverlay() {
        isMenuOpen ? closeMenuOverlay() : openMenuOverlay();
    }
    
    function openMenuOverlay() {
        const btn = document.querySelector('.hamburger-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (!btn || !overlay) return;
        
        isMenuOpen = true;
        btn.classList.add('active');
        overlay.classList.add('show');
        document.body.classList.add('menu-open');
    }
    
    function closeMenuOverlay() {
        const btn = document.querySelector('.hamburger-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (!btn || !overlay) return;
        
        isMenuOpen = false;
        btn.classList.remove('active');
        overlay.classList.remove('show');
        document.body.classList.remove('menu-open');
    }
    
    function handleHamburgerColor() {
        const btn = document.querySelector('.hamburger-menu');
        const banner = document.querySelector('#banner');
        if (!btn || !banner) return;
        
        window.addEventListener('scroll', () => {
            const height = banner.offsetHeight;
            const scroll = window.pageYOffset;
            btn.classList.toggle('over-content', scroll >= height * 0.9);
        });
    }
    
    function reinitMobileMenu() {
        closeMenuOverlay();
        document.querySelector('.hamburger-menu')?.remove();
        document.querySelector('.mobile-menu-overlay')?.remove();
        createMobileMenuElements();
        setupEventListeners();
        handleHamburgerColor();
    }
    
    window.MobileMenuOverlay = { init: initMobileMenuOverlay, reinit: reinitMobileMenu, open: openMenuOverlay, close: closeMenuOverlay, toggle: toggleMenuOverlay };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenuOverlay);
    } else {
        initMobileMenuOverlay();
    }
    
    document.addEventListener('languageContentReplaced', () => {
        setTimeout(reinitMobileMenu, 100);
    });
})();
