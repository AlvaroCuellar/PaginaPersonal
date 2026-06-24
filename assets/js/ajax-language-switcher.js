/**
 * ═══════════════════════════════════════════════════════════
 * AJAX LANGUAGE SWITCHER
 * ═══════════════════════════════════════════════════════════
 * Sistema AJAX para cambio de idioma sin recarga
 * Intercepta los clics del cambio de idioma ANTES de la navegación tradicional
 * Fallback automático al sistema actual si hay errores
 */

"use strict";

// ═══════════════════════════════════════════════════════════
// SISTEMA AJAX DE CAMBIO DE IDIOMA
// ═══════════════════════════════════════════════════════════

class AjaxLanguageSwitcher {
    constructor() {
        this.isLoading = false;
        this.currentLang = document.documentElement.lang || 'es';
        this.languageClickHandler = null;
        this.init();
    }

    init() {
        console.log('🚀 AJAX Language Switcher initialized');
        this.attachLanguageEvents();
        this.handleBackButton();
    }

    getSupportedLanguages() {
        const languages = window.sectionTranslations ? Object.keys(window.sectionTranslations) : ['es', 'en'];
        return languages.length ? languages : ['es', 'en'];
    }

    detectLanguageFromPath(pathname = window.location.pathname) {
        const firstSegment = pathname.split('/').filter(Boolean)[0];
        return this.getSupportedLanguages().includes(firstSegment) ? firstSegment : 'es';
    }

    // ───────────────────────────────────────────────────────
    // INTERCEPTAR CLICS DE CAMBIO DE IDIOMA
    // ───────────────────────────────────────────────────────
    
    attachLanguageEvents() {
        // Remover listener anterior si existe
        if (this.languageClickHandler) {
            document.removeEventListener('click', this.languageClickHandler, true);
        }
        
        // Crear nuevo handler
        this.languageClickHandler = (e) => {
            const langLink = e.target.closest('.lang-switcher a, .lang-option');
            
            if (langLink && !this.isLoading) {
                e.preventDefault(); // ¡Evitar navegación tradicional!
                e.stopPropagation();
                
                const targetLang = langLink.getAttribute('data-lang') || 
                                 this.detectLanguageFromPath(new URL(langLink.href, window.location.origin).pathname);
                
                if (targetLang && targetLang !== this.currentLang) {
                    console.log(`🔄 Switching from ${this.currentLang} to ${targetLang}`);
                    this.switchLanguage(targetLang);
                }
            }
        };
        
        // Interceptar clics en el switcher de idioma
        document.addEventListener('click', this.languageClickHandler, true); // Usar capture=true para interceptar ANTES que otros handlers
        
        console.log('✅ Language click events attached');
    }

    // ───────────────────────────────────────────────────────
    // FUNCIÓN PRINCIPAL DE CAMBIO DE IDIOMA
    // ───────────────────────────────────────────────────────
    
    async switchLanguage(newLang) {
        return this.switchLanguageContent(newLang, true);
    }

    // ───────────────────────────────────────────────────────
    // CONSTRUIR NUEVA URL
    // ───────────────────────────────────────────────────────
    
    buildNewUrl(newLang) {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // Cambiar el idioma en la URL: /es/ → /fr/ → /zh/, etc.
        let newPath;
        const languagePattern = new RegExp(`^/(${this.getSupportedLanguages().join('|')})(/|$)`);
        if (languagePattern.test(currentPath)) {
            newPath = currentPath.replace(languagePattern, `/${newLang}$2`);
        } else if (currentPath === '/' || currentPath === '') {
            newPath = `/${newLang}/`;
        } else {
            newPath = `/${newLang}${currentPath}`;
        }
        
        // Traducir hash si existe
        let newHash = '';
        if (currentHash && window.sectionTranslations) {
            const hashSlug = currentHash.substring(1); // Quitar el #
            const currentLangSlug = hashSlug;
            
            // Encontrar el section_id correspondiente al slug actual
            let sectionId = null;
            const currentTranslations = window.sectionTranslations[this.currentLang];
            if (currentTranslations) {
                for (const [id, slug] of Object.entries(currentTranslations)) {
                    if (slug === currentLangSlug) {
                        sectionId = id;
                        break;
                    }
                }
            }
            
            // Si encontramos el section_id, obtener el slug en el nuevo idioma
            if (sectionId && window.sectionTranslations[newLang] && window.sectionTranslations[newLang][sectionId]) {
                newHash = '#' + window.sectionTranslations[newLang][sectionId];
                console.log(`🔗 Hash translation: ${currentHash} (${this.currentLang}) → ${newHash} (${newLang})`);
            } else {
                // Si no hay traducción, mantener el hash original
                newHash = currentHash;
                console.log(`🔗 Hash preserved: ${currentHash} (no translation found)`);
            }
        }
        
        return window.location.origin + newPath + newHash;
    }

    // ───────────────────────────────────────────────────────
    // DESCARGAR CONTENIDO VIA AJAX
    // ───────────────────────────────────────────────────────
    
    async fetchLanguageContent(url) {
        console.log(`📥 Fetching content from: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/html',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log(`✅ Content fetched successfully (${html.length} chars)`);
        
        return html;
    }

    // ───────────────────────────────────────────────────────
    // EXTRAER SECCIONES DEL HTML
    // ───────────────────────────────────────────────────────
    
    extractSections(html) {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        console.log('🔍 Extracting sections from new document...');
        
        // Extraer las secciones que necesitamos reemplazar
        const sections = {
            title: newDoc.querySelector('title')?.outerHTML || '',
            wrapper: newDoc.querySelector('#wrapper')?.innerHTML || '',
            navMain: newDoc.querySelector('#nav-main')?.innerHTML || '',
            langSwitcher: newDoc.querySelector('.lang-switcher')?.outerHTML || '',
            htmlLang: newDoc.documentElement.getAttribute('lang') || 'es',
            htmlDir: newDoc.documentElement.getAttribute('dir') || 'ltr'
        };
        
        // Verificar que tenemos el contenido principal
        if (!sections.wrapper) {
            // Fallback: buscar otras posibilidades
            const main = newDoc.querySelector('main');
            const body = newDoc.querySelector('body');
            
            if (main) {
                sections.wrapper = main.outerHTML;
                console.log('📍 Using <main> element as wrapper');
            } else if (body) {
                // Extraer solo el contenido del body, excluyendo scripts
                const bodyClone = body.cloneNode(true);
                // Remover scripts para evitar conflictos
                bodyClone.querySelectorAll('script').forEach(script => script.remove());
                sections.wrapper = bodyClone.innerHTML;
                console.log('📍 Using <body> content as wrapper');
            } else {
                throw new Error('Could not extract main content - no wrapper, main, or body found');
            }
        }
        
        console.log('✅ Sections extracted:', Object.keys(sections));
        console.log('📏 Wrapper content length:', sections.wrapper.length);
        
        return sections;
    }

    // ───────────────────────────────────────────────────────
    // REEMPLAZAR CONTENIDO SIN PERDER SCROLL
    // ───────────────────────────────────────────────────────
    
    replaceContent(sections, newLang) {
        console.log('🔄 Replacing page content...');
        
        // Guardar posición de scroll actual
        const currentScroll = window.pageYOffset;
        console.log(`💾 Current scroll position: ${currentScroll}px`);
        
        // 1. Reemplazar título de la página
        if (sections.title) {
            document.head.querySelector('title').outerHTML = sections.title;
        }
        
        // 2. Reemplazar contenido principal (#wrapper)
        if (sections.wrapper) {
            const wrapperElement = document.querySelector('#wrapper');
            if (wrapperElement) {
                wrapperElement.innerHTML = sections.wrapper;
                console.log('✅ Wrapper content replaced');
            } else {
                console.warn('⚠️ #wrapper not found, trying body');
                // Fallback: reemplazar todo el body (más agresivo)
                const bodyClone = document.body.cloneNode(false);
                bodyClone.innerHTML = sections.wrapper;
                document.body.replaceWith(bodyClone);
            }
        }
        
        // 3. Reemplazar navegación (por si no está incluida en wrapper)
        if (sections.navMain) {
            const navMain = document.querySelector('#nav-main');
            if (navMain) {
                navMain.innerHTML = sections.navMain;
                console.log('✅ Navigation replaced');
            }
            
            // También actualizar navegación móvil
            const navMobile = document.querySelector('#nav-mobile');
            if (navMobile) {
                navMobile.innerHTML = sections.navMain;
                console.log('✅ Mobile navigation replaced');
            }
        }
        
        // 4. Reemplazar lang switcher (por si no está incluido en wrapper)
        if (sections.langSwitcher) {
            const currentSwitcher = document.querySelector('.lang-switcher');
            if (currentSwitcher) {
                currentSwitcher.outerHTML = sections.langSwitcher;
                console.log('✅ Language switcher replaced');
            }
        }
        
        // 5. Actualizar atributos de idioma del HTML
        document.documentElement.setAttribute('lang', newLang);
        document.documentElement.setAttribute('dir', sections.htmlDir || (newLang === 'ar' ? 'rtl' : 'ltr'));
        
        // 6. Re-attachar eventos ANTES de restaurar scroll
        this.reattachEvents();
        
        // 7. MANTENER posición de scroll EXACTA (después de re-attachar eventos)
        setTimeout(() => {
            window.scrollTo(0, currentScroll);
            console.log(`📍 Scroll restored to: ${currentScroll}px`);
            
            // Forzar re-cálculo del header después del scroll
            if (window.$ && $.fn.trigger) {
                $(window).trigger('scroll');
            }
        }, 50); // Dar tiempo a que se re-inicialicen los componentes
        
        console.log('✅ Content replacement completed');
    }

    // ───────────────────────────────────────────────────────
    // ACTUALIZAR URL SIN RECARGAR
    // ───────────────────────────────────────────────────────
    
    updateUrl(newUrl, newLang) {
        console.log(`🔗 Updating URL to: ${newUrl}`);
        
        // Usar pushState para cambiar URL sin recargar
        const state = { 
            lang: newLang, 
            timestamp: Date.now(),
            ajax: true 
        };
        
        history.pushState(state, '', newUrl);
        
        console.log('✅ URL updated successfully');
    }

    // ───────────────────────────────────────────────────────
    // MANEJAR BOTÓN ATRÁS/ADELANTE
    // ───────────────────────────────────────────────────────
    
    handleBackButton() {
        window.addEventListener('popstate', (event) => {
            console.log('🔙 Browser back/forward button pressed', event.state);
            
            // Detectar el idioma de la URL actual
            const urlLang = this.detectLanguageFromPath(window.location.pathname);
            
            console.log(`🔍 URL language detected: ${urlLang}, current: ${this.currentLang}`);
            
            // Si el idioma cambió, hacer switch AJAX
            if (urlLang !== this.currentLang && !this.isLoading) {
                console.log(`🔄 Language changed via back/forward: ${this.currentLang} → ${urlLang}`);
                
                // Hacer el cambio sin actualizar la URL (ya está actualizada por popstate)
                this.switchLanguageContent(urlLang, false);
            } else {
                console.log('📍 Same language, just scroll position change');
                
                // Solo es un cambio de scroll, manejar hash si existe
                if (window.location.hash) {
                    const hash = window.location.hash.substring(1);
                    let sectionId = hash;
                    
                    // Convertir slug a ID si es necesario
                    if (window.sectionTranslations && window.sectionTranslations[this.currentLang]) {
                        const translations = window.sectionTranslations[this.currentLang];
                        for (const [id, slug] of Object.entries(translations)) {
                            if (slug === hash) {
                                sectionId = id;
                                break;
                            }
                        }
                    }
                    
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
    }

    // ───────────────────────────────────────────────────────
    // FUNCIÓN AUXILIAR: CAMBIO DE IDIOMA SIN ACTUALIZAR URL
    // ───────────────────────────────────────────────────────
    
    async switchLanguageContent(newLang, updateUrl = true) {
        if (this.isLoading) return;
        
        console.log(`🌐 Switching language content to: ${newLang}`);
        
        try {
            this.isLoading = true;
            this.showLoadingIndicator();
            
            // Construir URL del nuevo idioma
            const newUrl = this.buildNewUrl(newLang);
            console.log(`📍 Target URL: ${newUrl}`);
            
            // Descargar contenido
            const newContent = await this.fetchLanguageContent(newUrl);
            
            // Extraer secciones
            const sections = this.extractSections(newContent);
            
            // Actualizar estado interno PRIMERO
            this.currentLang = newLang;
            document.documentElement.lang = newLang;
            document.documentElement.dir = sections.htmlDir || (newLang === 'ar' ? 'rtl' : 'ltr');
            
            // Reemplazar contenido
            this.replaceContent(sections, newLang);
            
            // Actualizar URL solo si se solicita
            if (updateUrl) {
                this.updateUrl(newUrl, newLang);
            }
            
            console.log('✅ Language content switch completed');
            
        } catch (error) {
            console.error('❌ Language content switch failed:', error);
            
            if (updateUrl) {
                // Solo hacer fallback si estamos actualizando URL
                this.fallbackToTraditionalNavigation(newLang);
            } else {
                // Si no actualizamos URL, simplemente recargar
                console.log('🔄 Reloading page as fallback...');
                window.location.reload();
            }
            
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }

    // ───────────────────────────────────────────────────────
    // RE-ATTACHAR EVENTOS DESPUÉS DEL REEMPLAZO
    // ───────────────────────────────────────────────────────
    
    reattachEvents() {
        console.log('🔗 Re-attaching events and reinitializing components...');
        
        // Cerrar menú móvil overlay si está abierto
        if (window.MobileMenuOverlay && typeof window.MobileMenuOverlay.close === 'function') {
            window.MobileMenuOverlay.close();
        }
        
        // 1. Re-calcular estado del header (navbar)
        if (window.$ && $.fn.trigger) {
            // Forzar re-cálculo del estado del header
            const scroll = $(window).scrollTop();
            const bannerHeight = $('#banner').height() || 0;
            
            if (scroll >= bannerHeight) {
                $('#header').addClass('nav-solid');
            } else {
                $('#header').removeClass('nav-solid');
            }
            
            console.log(`🏠 Header state recalculated (scroll: ${scroll}, banner: ${bannerHeight})`);
        }
        
        // 2. Nota: La navegación se reinicializa en unified-navigation.js
        // mediante el evento 'languageContentReplaced'
        
        // 3. Re-attachar eventos de este sistema AJAX
        // (Se hace automáticamente por el constructor, pero asegurémonos)
        this.attachLanguageEvents();
        
        // 4. Disparar evento personalizado para otros scripts
        // IMPORTANTE: Este evento activa la reinicialización en unified-navigation.js y lang-toggle.js
        console.log('📢 Dispatching languageContentReplaced event...');
        
        const event = new CustomEvent('languageContentReplaced', {
            detail: { 
                lang: this.currentLang,
                timestamp: Date.now()
            },
            bubbles: true,
            cancelable: false
        });
        document.dispatchEvent(event);
        
        // 5. También disparar evento jQuery si está disponible
        if (window.$ && $.fn.trigger) {
            $(document).trigger('languageContentReplaced', [this.currentLang]);
        }
        
        console.log('✅ All components reinitialized');
    }

    // ───────────────────────────────────────────────────────
    // INDICADORES VISUALES
    // ───────────────────────────────────────────────────────
    
    showLoadingIndicator() {
        console.log('⏳ Showing loading indicator...');
        
        // Agregar clase de loading al body
        document.body.classList.add('language-switching');
        
        // Barra de progreso discreta en la parte superior
        const progressBar = document.createElement('div');
        progressBar.id = 'language-loading-indicator';
        progressBar.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                z-index: 9999;
                background: rgba(0,0,0,0.05);
                overflow: hidden;
            ">
                <div style="
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        var(--accent-color, #2C5F7C) 0%, 
                        var(--accent-color-light, #4A8FB0) 50%, 
                        var(--accent-color, #2C5F7C) 100%);
                    animation: loading-slide 1.5s ease-in-out infinite;
                    transform: translateX(-100%);
                ">
                </div>
            </div>
        `;
        document.body.appendChild(progressBar);
        
        // Agregar animación si no existe
        if (!document.getElementById('loading-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-animation-styles';
            style.textContent = `
                @keyframes loading-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    hideLoadingIndicator() {
        console.log('✅ Hiding loading indicator...');
        
        document.body.classList.remove('language-switching');
        
        const indicator = document.getElementById('language-loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // ───────────────────────────────────────────────────────
    // FALLBACK A NAVEGACIÓN TRADICIONAL
    // ───────────────────────────────────────────────────────
    
    fallbackToTraditionalNavigation(newLang) {
        console.log('🔄 Using traditional navigation as fallback...');
        
        // Construir URL y navegar tradicionalmente
        const newUrl = this.buildNewUrl(newLang);
        
        // Guardar scroll para el sistema tradicional (como backup)
        const currentScroll = window.pageYOffset;
        sessionStorage.setItem('langChangeScroll', currentScroll.toString());
        sessionStorage.setItem('isLanguageChange', 'true'); // Bandera para distinguir de recarga normal
        
        // Navegar
        window.location.href = newUrl;
    }
}

// ═══════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AjaxLanguageSwitcher();
    });
} else {
    new AjaxLanguageSwitcher();
}

// CSS para el estado de loading
const loadingStyles = `
    <style>
    .language-switching {
        cursor: wait !important;
    }
    .language-switching * {
        pointer-events: none !important;
    }
    .language-switching .lang-switcher {
        pointer-events: auto !important;
    }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', loadingStyles);
