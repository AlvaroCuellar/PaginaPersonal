/**
 * ═══════════════════════════════════════════════════════════
 * UNIFIED NAVIGATION SYSTEM
 * ═══════════════════════════════════════════════════════════
 * Sistema completo de navegación que maneja:
 * - Mobile menu
 * - Header state (solid/transparent)
 * - Active section marker
 * - URL hash con slugs traducidos
 * - Smooth scroll navigation
 * - Fallback de scroll para navegación tradicional (cuando AJAX falla)
 * 
 * NOTA: El cambio de idioma con AJAX se maneja en ajax-language-switcher.js
 */

"use strict";

// ═══════════════════════════════════════════════════════════
// 1. RESTAURACIÓN DE SCROLL - FALLBACK para navegación tradicional
// ═══════════════════════════════════════════════════════════
// NOTA: Este código solo se ejecuta cuando el sistema AJAX falla y se usa
// navegación tradicional con recarga de página. En condiciones normales,
// el AJAX mantiene el scroll automáticamente sin necesidad de guardarlo.

(function() {
    const isLanguageChange = sessionStorage.getItem('isLanguageChange') === 'true';
    const savedScroll = sessionStorage.getItem('langChangeScroll');
    
    // Solo restaurar si fue un cambio de idioma con navegación tradicional (fallback)
    if (savedScroll && isLanguageChange) {
        console.log('⚠️ FALLBACK: Restoring scroll after traditional navigation to:', savedScroll);
        
        // Temporalmente desactivar restauración automática del navegador
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        const scrollValue = parseInt(savedScroll);
        
        // Aplicar scroll inmediatamente
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, scrollValue);
        
        // Reactivar smooth scroll y restauración normal del navegador
        setTimeout(() => {
            document.documentElement.style.scrollBehavior = '';
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto'; // ¡Restaurar comportamiento normal!
            }
        }, 100);
        
        // Limpiar
        sessionStorage.removeItem('langChangeScroll');
        sessionStorage.removeItem('isLanguageChange');
    } else {
        // Si NO es cambio de idioma, asegurar comportamiento normal del navegador
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'auto'; // ¡Comportamiento normal del navegador!
        }
        
        // Limpiar cualquier dato residual
        sessionStorage.removeItem('langChangeScroll');
        sessionStorage.removeItem('isLanguageChange');
    }
})();

// ═══════════════════════════════════════════════════════════
// 2. FUNCIONALIDAD PRINCIPAL
// ═══════════════════════════════════════════════════════════

$(document).ready(function () {
    
    // Variables globales
    let isScrolling = false;
    let scrollTimeout;
    let isAnimating = false; // Para mobile menu
    
    // ───────────────────────────────────────────────────────
    // SECTION MAPPING - Mapeo de IDs a URLs traducidas
    // ───────────────────────────────────────────────────────
    
    function getCurrentLanguage() {
        return $('html').attr('lang') || 'es';
    }
    
    function getSectionTranslations() {
        return window.sectionTranslations || { 'es': {}, 'en': {} };
    }
    
    function getSectionSlug(sectionId, lang) {
        const translations = getSectionTranslations();
        return translations[lang]?.[sectionId] || sectionId;
    }
    
    function getSectionIdFromSlug(slug, lang) {
        const translations = getSectionTranslations();
        const mapping = translations[lang];
        
        if (!mapping) return slug;
        
        // Buscar el ID que corresponde a este slug
        for (const [id, urlSlug] of Object.entries(mapping)) {
            if (urlSlug === slug) {
                return id;
            }
        }
        return slug;
    }
    
    // ───────────────────────────────────────────────────────
    // MOBILE MENU
    // ───────────────────────────────────────────────────────
    // NOTA: El menú móvil ahora se maneja completamente en mobile-overlay.js
    // Este archivo solo se encarga de la navegación y el scroll
    
    // ───────────────────────────────────────────────────────
    // HEADER STATE
    // ───────────────────────────────────────────────────────
    
    function updateHeaderState() {
        const scroll = $(window).scrollTop();
        const bannerHeight = $('#banner').height() || 0;
        const offset = 140;
        
        if (scroll >= (bannerHeight - offset)) {
            $('#header').addClass('nav-solid');
        } else {
            $('#header').removeClass('nav-solid');
        }
    }
    
    // ───────────────────────────────────────────────────────
    // ACTIVE SECTION MARKER
    // ───────────────────────────────────────────────────────
    
    function markActiveSection() {
        const scrollPos = $(window).scrollTop() + 100;
        const isNearBottom = ($(window).scrollTop() + $(window).height()) >= ($(document).height() - 50);
        let activeSectionFound = false;
        
        if (isNearBottom) {
            const $lastSection = $('.scrollto').last();
            if ($lastSection.length) {
                const lastSectionId = $lastSection.attr('id');
                $('#nav-main a').removeClass('active');
                $('#nav-main a[href*="' + lastSectionId + '"]').addClass('active');
                activeSectionFound = true;
            }
        } else {
            $('.scrollto').each(function() {
                const sectionTop = $(this).offset().top;
                const sectionBottom = sectionTop + $(this).outerHeight();
                const sectionId = $(this).attr('id');
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    $('#nav-main a').removeClass('active');
                    $('#nav-main a[href*="' + sectionId + '"]').addClass('active');
                    activeSectionFound = true;
                    return false;
                }
            });
        }
        
        if (!activeSectionFound && $('.scrollto').length) {
            const $lastSection = $('.scrollto').last();
            const lastSectionId = $lastSection.attr('id');
            $('#nav-main a').removeClass('active');
            $('#nav-main a[href*="' + lastSectionId + '"]').addClass('active');
        }
    }
    
    // ───────────────────────────────────────────────────────
    // URL HASH MANAGEMENT
    // ───────────────────────────────────────────────────────
    
    function detectActiveSection() {
        const scrollPos = $(window).scrollTop() + 150;
        const isNearBottom = ($(window).scrollTop() + $(window).height()) >= ($(document).height() - 50);
        let activeSection = null;
        
        if (isNearBottom) {
            const $lastSection = $('.scrollto').last();
            if ($lastSection.length) {
                activeSection = $lastSection.attr('id');
            }
        } else {
            $('.scrollto').each(function() {
                const sectionTop = $(this).offset().top;
                const sectionBottom = sectionTop + $(this).outerHeight();
                const sectionId = $(this).attr('id');
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    activeSection = sectionId;
                    return false;
                }
            });
        }
        
        if (!activeSection && $('.scrollto').length) {
            const $lastSection = $('.scrollto').last();
            activeSection = $lastSection.attr('id');
        }
        
        return activeSection;
    }
    
    function updateUrlHash() {
        const activeSection = detectActiveSection();
        
        if (activeSection) {
            const lang = getCurrentLanguage();
            const slug = getSectionSlug(activeSection, lang);
            const newHash = '#' + slug;
            
            if (window.location.hash !== newHash) {
                if (isScrolling) {
                    history.replaceState(null, null, newHash);
                } else {
                    history.pushState(null, null, newHash);
                }
            }
        }
    }
    
    // ───────────────────────────────────────────────────────
    // SCROLL EVENT
    // ───────────────────────────────────────────────────────
    
    $(window).on('scroll', function() {
        updateHeaderState();
        markActiveSection();
        
        isScrolling = true;
        clearTimeout(scrollTimeout);
        updateUrlHash();
        
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 150);
    });
    
    // ───────────────────────────────────────────────────────
    // SMOOTH SCROLL NAVIGATION
    // ───────────────────────────────────────────────────────
    
    $('a[href^="#"]:not([href="#"])').on('click', function(e) {
        const href = $(this).attr('href');
        const hash = href.substring(1);
        const lang = getCurrentLanguage();
        
        // Convertir slug a ID si es necesario
        const sectionId = getSectionIdFromSlug(hash, lang);
        const target = document.getElementById(sectionId);
        
        if (target) {
            e.preventDefault();
            isScrolling = false;
            
            // Usar scrollIntoView nativo para comportamiento más suave y consistente
            const headerOffset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
    
    // ───────────────────────────────────────────────────────
    // HASH CHANGE (botón atrás/adelante)
    // ───────────────────────────────────────────────────────
    
    $(window).on('hashchange', function() {
        if (!isScrolling) {
            const hash = window.location.hash.substring(1);
            if (hash) {
                const lang = getCurrentLanguage();
                const sectionId = getSectionIdFromSlug(hash, lang);
                const target = document.getElementById(sectionId);
                
                if (target) {
                    const headerOffset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });
    
    // ───────────────────────────────────────────────────────
    // LANGUAGE TOGGLE
    // ───────────────────────────────────────────────────────
    
    // NOTA: El manejo de cambio de idioma ahora se hace completamente en
    // ajax-language-switcher.js. Este archivo solo mantiene el código de
    // restauración de scroll como fallback para navegación tradicional.
    
    // ───────────────────────────────────────────────────────
    // INITIAL SETUP
    // ───────────────────────────────────────────────────────
    
    console.log('🚀 Unified navigation initialized');
    console.log('📍 Section translations:', window.sectionTranslations);
    console.log('🌐 Current language:', getCurrentLanguage());
    console.log('📍 Current scroll position:', $(window).scrollTop());
    
    updateHeaderState();
    markActiveSection();
    
    // Esperar a que todo esté cargado para actualizar el hash inicial
    $(window).on('load', function() {
        console.log('📦 Page fully loaded');
        
        setTimeout(() => {
            // Si hay un hash en la URL, navegar a esa sección
            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                const lang = getCurrentLanguage();
                const sectionId = getSectionIdFromSlug(hash, lang);
                const target = $('#' + sectionId);
                
                console.log('🔗 Found hash:', hash, '→ section:', sectionId);
                
                if (target.length) {
                    // Solo si NO venimos de un cambio de idioma
                    if (!sessionStorage.getItem('langChangeScroll')) {
                        console.log('📍 Navigating to section:', sectionId);
                        const headerOffset = 80;
                        const targetPosition = target[0].getBoundingClientRect().top + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        console.log('⏭️ Skipping navigation (came from language change)');
                    }
                }
            } else {
                // Actualizar hash basado en la posición actual
                console.log('🔄 Updating hash based on current position');
                updateUrlHash();
            }
        }, 100);
    });
    
    // ───────────────────────────────────────────────────────
    // REINICIALIZACIÓN después de cambio de idioma AJAX
    // ───────────────────────────────────────────────────────
    
    function reinitializeNavigation() {
        console.log('🔄 Reinitializing navigation after language change...');
        
        // 1. Re-attachar eventos de scroll suave
        $('a[href^="#"]:not([href="#"])').off('click.smoothScroll').on('click.smoothScroll', function(e) {
            const href = $(this).attr('href');
            const hash = href.substring(1);
            const lang = getCurrentLanguage();
            
            const sectionId = getSectionIdFromSlug(hash, lang);
            const target = document.getElementById(sectionId);
            
            if (target) {
                e.preventDefault();
                isScrolling = false;
                
                const headerOffset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
        
        // 2. Actualizar estado del header
        updateHeaderState();
        markActiveSection();
        
        console.log('✅ Navigation reinitialized');
    }
    
    // Escuchar evento de cambio de idioma
    $(document).on('languageContentReplaced', function(event, newLang) {
        console.log('🌐 Language changed to:', newLang);
        reinitializeNavigation();
    });
    
});

