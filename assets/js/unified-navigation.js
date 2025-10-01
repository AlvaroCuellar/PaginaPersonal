/**
 * ═══════════════════════════════════════════════════════════
 * UNIFIED NAVIGATION SYSTEM
 * ═══════════════════════════════════════════════════════════
 * Sistema completo de navegación que maneja:
 * - Mobile menu
 * - Header state (solid/transparent)
 * - Active section marker
 * - URL hash con slugs traducidos
 * - Preservación de scroll al cambiar idioma
 * - Smooth scroll navigation
 */

"use strict";

// ═══════════════════════════════════════════════════════════
// 1. RESTAURACIÓN INMEDIATA DE SCROLL (antes de DOM ready)
// ═══════════════════════════════════════════════════════════

(function() {
    const savedScroll = sessionStorage.getItem('langChangeScroll');
    if (savedScroll) {
        sessionStorage.removeItem('langChangeScroll');
        const scrollValue = parseInt(savedScroll);
        
        // Aplicar inmediatamente
        window.scrollTo(0, scrollValue);
        
        // Repetir para asegurar
        setTimeout(() => window.scrollTo(0, scrollValue), 0);
        setTimeout(() => window.scrollTo(0, scrollValue), 10);
        
        window.addEventListener('load', () => window.scrollTo(0, scrollValue));
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
    
    $("#nav-mobile").html($("#nav-main").html());
    
    $("#nav-trigger span").on("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isAnimating) return false;
        
        const $menu = $("nav#nav-mobile ul");
        const $trigger = $(this);
        
        isAnimating = true;
        
        if ($menu.hasClass("expanded")) {
            $menu.removeClass("expanded expanding").addClass("collapsing");
            $trigger.removeClass("open");
            
            setTimeout(() => {
                $menu.removeClass("collapsing");
                isAnimating = false;
            }, 700);
        } else {
            $menu.removeClass("collapsing").addClass("expanding");
            $trigger.addClass("open");
            
            requestAnimationFrame(() => {
                $menu.addClass("expanded");
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            });
        }
        
        return false;
    });
    
    $("#nav-mobile ul a:not(.menu-button)").on("click", function(e) {
        const $menu = $("nav#nav-mobile ul");
        
        if ($menu.hasClass("expanded") && !isAnimating) {
            isAnimating = true;
            $menu.removeClass("expanded expanding").addClass("collapsing");
            $("#nav-trigger span").removeClass("open");
            
            setTimeout(() => {
                $menu.removeClass("collapsing");
                isAnimating = false;
            }, 700);
        }
    });
    
    // ───────────────────────────────────────────────────────
    // HEADER STATE
    // ───────────────────────────────────────────────────────
    
    function updateHeaderState() {
        const scroll = $(window).scrollTop();
        const bannerHeight = $('#banner').height() || 0;
        
        if (scroll >= bannerHeight) {
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
        const target = $('#' + sectionId);
        
        if (target.length) {
            e.preventDefault();
            isScrolling = false;
            
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 800);
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
                const target = $('#' + sectionId);
                
                if (target.length) {
                    $('html, body').animate({
                        scrollTop: target.offset().top - 80
                    }, 800);
                }
            }
        }
    });
    
    // ───────────────────────────────────────────────────────
    // LANGUAGE TOGGLE
    // ───────────────────────────────────────────────────────
    
    $(document).on('click', '.lang-switcher a', function(e) {
        const currentScroll = $(window).scrollTop();
        
        // Guardar SOLO el scroll, NO el hash
        // El hash se actualizará automáticamente al hacer scroll en la nueva página
        sessionStorage.setItem('langChangeScroll', currentScroll.toString());
    });
    
    // ───────────────────────────────────────────────────────
    // INITIAL SETUP
    // ───────────────────────────────────────────────────────
    
    updateHeaderState();
    markActiveSection();
    
    // Esperar a que todo esté cargado para actualizar el hash inicial
    $(window).on('load', function() {
        setTimeout(() => {
            // Si hay un hash en la URL, navegar a esa sección
            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                const lang = getCurrentLanguage();
                const sectionId = getSectionIdFromSlug(hash, lang);
                const target = $('#' + sectionId);
                
                if (target.length) {
                    // Solo si NO venimos de un cambio de idioma
                    if (!sessionStorage.getItem('langChangeScroll')) {
                        $('html, body').animate({
                            scrollTop: target.offset().top - 80
                        }, 800);
                    }
                }
            } else {
                // Actualizar hash basado en la posición actual
                updateUrlHash();
            }
        }, 100);
    });
});
