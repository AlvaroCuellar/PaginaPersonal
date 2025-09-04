// ===============================
// Carrusel de imágenes con dots y auto-focus
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa todos los carruseles de la página
  document.querySelectorAll('.carrusel-container').forEach(container => {
    // --- Elementos principales del carrusel ---
    const track   = container.querySelector('.carrusel-images');
    const slides  = track ? Array.from(track.children) : [];
    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');
    const dotsNav = container.querySelector('.dots');
    if (!track || slides.length === 0 || !prevBtn || !nextBtn) return;

    let slideWidth;       // Ancho en px de cada slide
    let currentIndex = 0; // Índice de la slide activa

    // --- 1) Recalcula anchos para pantallas fluidas ---
    function recalcSizes() {
      slideWidth = container.clientWidth; // Ancho real del contenedor
      track.style.width = `${slideWidth * slides.length}px`;
      slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
      });
      moveTo(currentIndex, false); // Reposiciona sin animación
    }

    // --- 2) Mueve la pista al slide indicado ---
    function moveTo(idx, animate = true) {
      currentIndex = Math.max(0, Math.min(idx, slides.length - 1));
      track.style.transition = animate
        ? 'transform 0.5s ease-in-out'
        : 'none';
      track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
      updateDots();
    }

    // --- 3) Crea y actualiza los dots de navegación ---
    if (dotsNav) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => moveTo(i));
        dotsNav.appendChild(dot);
      });
    }
    function updateDots() {
      if (!dotsNav) return;
      dotsNav.querySelectorAll('.dot').forEach((d, i) =>
        d.classList.toggle('active', i === currentIndex)
      );
    }

    // --- 4) Botones de navegación y control por teclado (con foco) ---
    prevBtn.addEventListener('click', () => moveTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => moveTo(currentIndex + 1));

    // Permite control por teclado solo cuando el carrusel tiene el foco
    container.tabIndex = 0;
    container.addEventListener('mouseenter', () => container.focus());
    container.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  moveTo(currentIndex - 1);
      if (e.key === 'ArrowRight') moveTo(currentIndex + 1);
    });

    // --- 5) Ajuste automático en resize ---
    window.addEventListener('resize', recalcSizes);

    // --- Inicialización del carrusel ---
    recalcSizes();
    moveTo(0, false);
  });
});

// ===============================
// AUTO-FOCUS: Da el foco al carrusel más visible en pantalla
// ===============================
const carContainers = Array.from(document.querySelectorAll('.carrusel-container'));
carContainers.forEach(c => c._visRatio = 0);

const io = new IntersectionObserver(entries => {
  // Actualiza el ratio de visibilidad de cada carrusel
  entries.forEach(e => e.target._visRatio = e.intersectionRatio);

  // Busca el carrusel más visible
  let max = 0, best = null;
  carContainers.forEach(c => {
    if (c._visRatio > max) {
      max = c._visRatio;
      best = c;
    }
  });

  // Da el foco sin desplazar la página si cambia el más visible
  if (best && document.activeElement !== best) {
    best.focus({ preventScroll: true });
  }
}, {
  threshold: [0, 0.25, 0.5, 0.75, 1]  // Dispara al cruzar estos umbrales
});

// Observa cada carrusel
carContainers.forEach(c => io.observe(c));

// ===============================
// ACORDEÓN: Funcionalidad para abrir/cerrar secciones
// ===============================
function toggleAccordion(element) {
  const parent = element.parentElement;
  const content = parent.querySelector(".accordion-content");
  const isOpen = parent.classList.contains("open");

  // Cierra todos los acordeones
  document.querySelectorAll(".accordion-item").forEach(item => {
    item.classList.remove("open");
    item.querySelector(".accordion-content").style.display = "none";
  });

  // Abre el acordeón actual si estaba cerrado
  if (!isOpen) {
    parent.classList.add("open");
    content.style.display = "block";
  }
}

// ===============================
// PRODUCTION HEROES: Sistema dinámico automático
// ===============================

/* 
 * ===== GUÍA PARA AÑADIR NUEVAS PRODUCCIONES =====
 * 
 * Para añadir una nueva producción teatral, sigue estos pasos:
 * 
 * 1. CONFIGURACIÓN JAVASCRIPT (en este archivo):
 *    - Agrega una nueva entrada en 'productionsConfig' con la configuración de tu producción
 *    - Crea las funciones específicas para la nueva producción (ver ejemplos al final del archivo)
 *    - Agrega la nueva producción en el inicializador DOMContentLoaded
 * 
 * 2. ESTRUCTURA DE CARPETAS (images/production/):
 *    - Crea una carpeta con el nombre de tu producción
 *    - Sube las imágenes con numeración secuencial (01, 02, 03...)
 *    - Estructura esperada: images/production/[NombreCarpeta]/[prefix][numero][extension]
 * 
 * 3. HTML (index.html):
 *    - Agrega el contenedor .production-hero con la información de la producción
 *    - Agrega el modal correspondiente para la galería
 *    - Usa la clase .reverse si quieres layout invertido (imagen derecha, texto izquierda)
 * 
 * 4. CSS (si es necesario):
 *    - Los estilos base ya están definidos en components.css
 *    - Solo necesitas ajustar si quieres estilos específicos para esta producción
 * 
 * ===== CONVENCIÓN DE NOMENCLATURA DE IMÁGENES =====
 * 
 * El sistema busca imágenes automáticamente siguiendo este patrón:
 * [prefix][numero_con_ceros][extension]
 * 
 * Ejemplos:
 * - cueva01.jpeg, cueva02.jpeg, cueva03.jpeg...
 * - fo01.jpg, fo02.jpg, fo03.jpg...
 * - hamlet01.png, hamlet02.png, hamlet03.png...
 * 
 * IMPORTANTE: 
 * - Los números DEBEN tener ceros a la izquierda (01, 02, 03... no 1, 2, 3)
 * - DEBEN ser secuenciales sin huecos (si falta una imagen, se para la búsqueda)
 * - Todas las imágenes de una producción deben tener la misma extensión
 */

// Configuración de producciones teatrales
const productionsConfig = {
    // === EJEMPLO 1: La Cueva de Salamanca ===
    cueva: {
        folder: 'LaCuevaDeSalamanca',        // Nombre de la carpeta en images/production/
        prefix: 'cueva',                     // Prefijo de los archivos de imagen
        extension: '.jpeg',                  // Extensión de las imágenes
        maxImages: 50,                       // Límite máximo de imágenes a buscar
        title: 'La Cueva de Salamanca',      // Título para los alt de las imágenes
        modalId: 'productionModal',          // ID del modal en el HTML
        sliderSelector: '.production-hero:not(.reverse) .production-slider', // Selector CSS del slider
        index: 0,                            // Índice actual (no cambiar)
        timer: null,                         // Timer del autoplay (no cambiar)
        images: []                           // Array de imágenes detectadas (no cambiar)
    },
    
    // === EJEMPLO 2: Fuenteovejuna (con layout invertido) ===
    fuenteovejuna: {
        folder: 'Fuenteovejuna',             // Carpeta: images/production/Fuenteovejuna/
        prefix: 'fo',                        // Archivos: fo01.jpg, fo02.jpg, etc.
        extension: '.jpg',                   // Todas las imágenes en .jpg
        maxImages: 50,                       // Buscar hasta 50 imágenes máximo
        title: 'Fuenteovejuna',              // Título para accesibilidad
        modalId: 'fuenteovejunaModal',       // ID único del modal
        sliderSelector: '.production-hero.reverse .production-slider', // Selector para layout invertido
        index: 0,                            // Estado interno
        timer: null,                         // Estado interno
        images: []                           // Estado interno
    }
    
    /* 
     * === PLANTILLA PARA NUEVA PRODUCCIÓN ===
     * 
     * Descomenta y modifica esta plantilla para añadir una nueva producción:
     * 
     * nombreProduccion: {
     *     folder: 'NombreCarpetaImagenes',      // Sin espacios, carpeta en images/production/
     *     prefix: 'prefijo',                    // Prefijo corto sin espacios
     *     extension: '.jpg',                    // .jpg, .jpeg, .png, etc.
     *     maxImages: 50,                        // Número máximo a buscar
     *     title: 'Título de la Producción',    // Nombre completo con espacios
     *     modalId: 'nombreProduccionModal',    // ID único para el modal
     *     sliderSelector: '.production-hero:not(.reverse) .production-slider', // O .reverse si quieres invertido
     *     index: 0,
     *     timer: null,
     *     images: []
     * }
     * 
     * DESPUÉS DE AGREGAR LA CONFIGURACIÓN:
     * 1. Añade las funciones específicas (ver sección "Funciones específicas" al final)
     * 2. Agrega la inicialización en el DOMContentLoaded
     * 3. Crea el HTML correspondiente en index.html
     */
};

// Función para detectar cuántas imágenes existen
async function detectImages(prodKey) {
    const config = productionsConfig[prodKey];
    const validImages = [];
    
    // Buscar imágenes secuencialmente hasta encontrar un fallo
    // El sistema construye rutas como: images/production/[folder]/[prefix][numero][extension]
    // Ejemplo: images/production/Fuenteovejuna/fo01.jpg
    for (let i = 1; i <= config.maxImages; i++) {
        const paddedNum = i.toString().padStart(2, '0'); // Convierte 1 en "01", 2 en "02", etc.
        const imagePath = `/assets/images/production/${config.folder}/${config.prefix}${paddedNum}${config.extension}`;

        try {
            const exists = await checkImageExists(imagePath);
            if (exists) {
                validImages.push({
                    path: imagePath,
                    alt: config.title,
                    number: i
                });
            } else {
                // Si una imagen no existe, se asume que no hay más (SECUENCIAL)
                break;
            }
        } catch (error) {
            // Si hay error al cargar, se para la búsqueda
            break;
        }
    }
    
    config.images = validImages;
    return validImages;
}

// Función para verificar si una imagen existe
function checkImageExists(imagePath) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imagePath;
    });
}

// Generar HTML del slider
function generateSliderHTML(prodKey) {
    const config = productionsConfig[prodKey];
    const slider = document.querySelector(config.sliderSelector);
    
    if (!slider || config.images.length === 0) return;
    
    slider.innerHTML = config.images.map((img, index) => 
        `<img src="${img.path}" alt="${img.alt}" ${index === 0 ? 'class="active"' : ''}>`
    ).join('');
}

// Generar HTML del modal
function generateModalHTML(prodKey) {
    const config = productionsConfig[prodKey];
    const modal = document.getElementById(config.modalId);
    
    if (!modal || config.images.length === 0) return;
    
    const carousel = modal.querySelector('.modal-carousel');
    const counter = modal.querySelector('.modal-counter');
    const dotsContainer = modal.querySelector('.modal-dots');
    
    // Generar slides
    const slidesHTML = config.images.map((img, index) => 
        `<img src="${img.path}" class="modal-slide ${index === 0 ? 'active' : ''}">`
    ).join('');
    
    // Generar dots
    const dotsHTML = config.images.map((img, index) => 
        `<span class="modal-dot ${index === 0 ? 'active' : ''}" onclick="${prodKey}GoToSlide(event, ${index})"></span>`
    ).join('');
    
    // Limpiar carousel y agregar contenido
    carousel.querySelectorAll('.modal-slide').forEach(slide => slide.remove());
    
    // Insertar nuevas imágenes antes del primer botón
    const firstButton = carousel.querySelector('.modal-prev');
    if (firstButton) {
        firstButton.insertAdjacentHTML('beforebegin', slidesHTML);
    } else {
        carousel.insertAdjacentHTML('afterbegin', slidesHTML);
    }
    
    // Actualizar contador y dots
    if (counter) {
        counter.textContent = `1 / ${config.images.length}`;
    }
    
    if (dotsContainer) {
        dotsContainer.innerHTML = dotsHTML;
    }
}

// Inicializar producción
async function initProduction(prodKey) {
    const images = await detectImages(prodKey);
    
    if (images.length > 0) {
        generateSliderHTML(prodKey);
        generateModalHTML(prodKey);
        showProdSlide(prodKey, 0);
        
        // Iniciar autoplay si hay más de una imagen
        if (images.length > 1) {
            productionsConfig[prodKey].timer = setTimeout(() => autoProdSlide(prodKey), 4000);
        }
    }
}

function showProdSlide(prodKey, idx) {
    const config = productionsConfig[prodKey];
    const images = document.querySelectorAll(`${config.sliderSelector} img`);
    
    if (images.length === 0) return;
    
    config.index = idx;
    images.forEach((img, i) => {
        img.classList.toggle('active', i === idx);
    });
}

function autoProdSlide(prodKey) {
    const config = productionsConfig[prodKey];
    const images = document.querySelectorAll(`${config.sliderSelector} img`);
    
    if (images.length === 0) return;
    
    config.index = (config.index + 1) % images.length;
    showProdSlide(prodKey, config.index);
    config.timer = setTimeout(() => autoProdSlide(prodKey), 4000);
}

// Modal functionality
let mouseIdleTimers = {};

function showModalControls(modalId) {
    const modal = document.getElementById(modalId);
    const navigation = modal.querySelectorAll('.modal-prev, .modal-next');
    const indicators = modal.querySelector('.modal-indicators');
    
    navigation.forEach(nav => nav.classList.add('visible'));
    if (indicators) indicators.classList.add('visible');
}

function hideModalControls(modalId) {
    const modal = document.getElementById(modalId);
    const navigation = modal.querySelectorAll('.modal-prev, .modal-next');
    const indicators = modal.querySelector('.modal-indicators');
    
    navigation.forEach(nav => nav.classList.remove('visible'));
    if (indicators) indicators.classList.remove('visible');
}

function resetMouseIdleTimer(modalId) {
    clearTimeout(mouseIdleTimers[modalId]);
    showModalControls(modalId);
    mouseIdleTimers[modalId] = setTimeout(() => hideModalControls(modalId), 500);
}

function openModal(modalId, prodKey) {
    document.getElementById(modalId).classList.add('active');
    showModalSlide(modalId, productionsConfig[prodKey].index);
    resetMouseIdleTimer(modalId);
    document.body.classList.add('modal-open'); // Añadido para ocultar hamburguesa
    document.getElementById(modalId).addEventListener('mousemove', () => resetMouseIdleTimer(modalId));
    if(productionsConfig[prodKey].timer) {
        clearTimeout(productionsConfig[prodKey].timer);
        productionsConfig[prodKey].timer = null;
    }
}

function closeModal(modalId, prodKey, e) {
    if (!e || e.target === document.getElementById(modalId) || e.target.classList.contains('close-modal')) {
        document.getElementById(modalId).classList.remove('active');
        document.body.classList.remove('modal-open'); // Quitado para mostrar hamburguesa
        clearTimeout(mouseIdleTimers[modalId]);
        hideModalControls(modalId);
        const config = productionsConfig[prodKey];
        if(config.images.length > 1) {
            config.timer = setTimeout(() => autoProdSlide(prodKey), 4000);
        }
    }
}

function showModalSlide(modalId, idx) {
    const modal = document.getElementById(modalId);
    const slides = modal.querySelectorAll('.modal-slide');
    const dots = modal.querySelectorAll('.modal-dot');
    const counter = modal.querySelector('.modal-counter');
    
    slides.forEach((img, i) => {
        img.classList.toggle('active', i === idx);
    });
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === idx);
    });
    if (counter) {
        counter.textContent = `${idx + 1} / ${slides.length}`;
    }
}

// ===============================
// FUNCIONES ESPECÍFICAS POR PRODUCCIÓN
// ===============================

/* 
 * Para cada nueva producción, necesitas crear funciones específicas siguiendo este patrón:
 * 
 * 1. open[NombreProduccion]Modal() - Abre el modal
 * 2. close[NombreProduccion]Modal(e) - Cierra el modal  
 * 3. [nombreProduccion]ModalPrev(e) - Imagen anterior en modal
 * 4. [nombreProduccion]ModalNext(e) - Imagen siguiente en modal
 * 5. [nombreProduccion]GoToSlide(e, idx) - Va a imagen específica
 * 
 * IMPORTANTE: Estas funciones deben ser globales para que el HTML pueda llamarlas
 * con onclick="nombreFuncion()"
 */

// === FUNCIONES PARA LA CUEVA DE SALAMANCA ===
function openProductionModal() {
    openModal('productionModal', 'cueva');
}

function closeProductionModal(e) {
    closeModal('productionModal', 'cueva', e);
}

function modalPrev(e) {
    e.stopPropagation();
    const config = productionsConfig.cueva;
    const slides = document.querySelectorAll('#productionModal .modal-slide');
    config.index = (config.index - 1 + slides.length) % slides.length;
    showModalSlide('productionModal', config.index);
    resetMouseIdleTimer('productionModal');
}

function modalNext(e) {
    e.stopPropagation();
    const config = productionsConfig.cueva;
    const slides = document.querySelectorAll('#productionModal .modal-slide');
    config.index = (config.index + 1) % slides.length;
    showModalSlide('productionModal', config.index);
    resetMouseIdleTimer('productionModal');
}

function goToSlide(e, idx) {
    e.stopPropagation();
    productionsConfig.cueva.index = idx;
    showModalSlide('productionModal', idx);
    resetMouseIdleTimer('productionModal');
}

// === FUNCIONES PARA FUENTEOVEJUNA ===
function openFuenteovejunaModal() {
    openModal('fuenteovejunaModal', 'fuenteovejuna');
}

function closeFuenteovejunaModal(e) {
    closeModal('fuenteovejunaModal', 'fuenteovejuna', e);
}

function fuenteovejunaModalPrev(e) {
    e.stopPropagation();
    const config = productionsConfig.fuenteovejuna;
    const slides = document.querySelectorAll('#fuenteovejunaModal .modal-slide');
    config.index = (config.index - 1 + slides.length) % slides.length;
    showModalSlide('fuenteovejunaModal', config.index);
    resetMouseIdleTimer('fuenteovejunaModal');
}

function fuenteovejunaModalNext(e) {
    e.stopPropagation();
    const config = productionsConfig.fuenteovejuna;
    const slides = document.querySelectorAll('#fuenteovejunaModal .modal-slide');
    config.index = (config.index + 1) % slides.length;
    showModalSlide('fuenteovejunaModal', config.index);
    resetMouseIdleTimer('fuenteovejunaModal');
}

function fuenteovejunaGoToSlide(e, idx) {
    e.stopPropagation();
    productionsConfig.fuenteovejuna.index = idx;
    showModalSlide('fuenteovejunaModal', idx);
    resetMouseIdleTimer('fuenteovejunaModal');
}

// Alias para compatibilidad con dots generados dinámicamente
function cuevaGoToSlide(e, idx) {
    goToSlide(e, idx);
}

/* 
 * === PLANTILLA PARA FUNCIONES DE NUEVA PRODUCCIÓN ===
 * 
 * Copia y modifica estas funciones para cada nueva producción:
 * 
 * function open[NombreProduccion]Modal() {
 *     openModal('[nombreProduccion]Modal', 'claveConfig');
 * }
 * 
 * function close[NombreProduccion]Modal(e) {
 *     closeModal('[nombreProduccion]Modal', 'claveConfig', e);
 * }
 * 
 * function [nombreProduccion]ModalPrev(e) {
 *     e.stopPropagation();
 *     const config = productionsConfig.claveConfig;
 *     const slides = document.querySelectorAll('#[nombreProduccion]Modal .modal-slide');
 *     config.index = (config.index - 1 + slides.length) % slides.length;
 *     showModalSlide('[nombreProduccion]Modal', config.index);
 *     resetMouseIdleTimer('[nombreProduccion]Modal');
 * }
 * 
 * function [nombreProduccion]ModalNext(e) {
 *     e.stopPropagation();
 *     const config = productionsConfig.claveConfig;
 *     const slides = document.querySelectorAll('#[nombreProduccion]Modal .modal-slide');
 *     config.index = (config.index + 1) % slides.length;
 *     showModalSlide('[nombreProduccion]Modal', config.index);
 *     resetMouseIdleTimer('[nombreProduccion]Modal');
 * }
 * 
 * function [nombreProduccion]GoToSlide(e, idx) {
 *     e.stopPropagation();
 *     productionsConfig.claveConfig.index = idx;
 *     showModalSlide('[nombreProduccion]Modal', idx);
 *     resetMouseIdleTimer('[nombreProduccion]Modal');
 * }
 * 
 * EJEMPLO CONCRETO para "Hamlet":
 * function openHamletModal() { openModal('hamletModal', 'hamlet'); }
 * function closeHamletModal(e) { closeModal('hamletModal', 'hamlet', e); }
 * function hamletModalPrev(e) { ... }
 * function hamletModalNext(e) { ... }
 * function hamletGoToSlide(e, idx) { ... }
 */

// Keyboard navigation for modals
document.addEventListener('keydown', function(e) {
    // === NAVEGACIÓN POR TECLADO ===
    // Para cada nueva producción, agrega una condición aquí
    
    if (document.getElementById('productionModal').classList.contains('active')) {
        // La Cueva de Salamanca
        if (e.key === 'Escape') {
            closeProductionModal(e);
        } else if (e.key === 'ArrowLeft') {
            modalPrev(e);
        } else if (e.key === 'ArrowRight') {
            modalNext(e);
        }
    } else if (document.getElementById('fuenteovejunaModal').classList.contains('active')) {
        // Fuenteovejuna
        if (e.key === 'Escape') {
            closeFuenteovejunaModal(e);
        } else if (e.key === 'ArrowLeft') {
            fuenteovejunaModalPrev(e);
        } else if (e.key === 'ArrowRight') {
            fuenteovejnaModalNext(e);
        }
    }
    
    /* 
     * === PLANTILLA PARA NUEVA PRODUCCIÓN ===
     * 
     * Agrega esto para cada nueva producción:
     * 
     * } else if (document.getElementById('[nombreProduccion]Modal').classList.contains('active')) {
     *     if (e.key === 'Escape') {
     *         close[NombreProduccion]Modal(e);
     *     } else if (e.key === 'ArrowLeft') {
     *         [nombreProduccion]ModalPrev(e);
     *     } else if (e.key === 'ArrowRight') {
     *         [nombreProduccion]ModalNext(e);
     *     }
     * }
     * 
     * EJEMPLO para "Hamlet":
     * } else if (document.getElementById('hamletModal').classList.contains('active')) {
     *     if (e.key === 'Escape') {
     *         closeHamletModal(e);
     *     } else if (e.key === 'ArrowLeft') {
     *         hamletModalPrev(e);
     *     } else if (e.key === 'ArrowRight') {
     *         hamletModalNext(e);
     *     }
     * }
     */
});

// ===============================
// INICIALIZACIÓN DE PRODUCCIONES
// ===============================

// Inicializar todas las producciones cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    // === AGREGAR NUEVAS PRODUCCIONES AQUÍ ===
    // Para cada nueva producción, agrega una línea: await initProduction('claveConfig');
    
    await initProduction('cueva');        // La Cueva de Salamanca
    await initProduction('fuenteovejuna'); // Fuenteovejuna
    
    /* 
     * === PLANTILLA PARA NUEVA PRODUCCIÓN ===
     * 
     * Agrega esta línea por cada nueva producción:
     * await initProduction('claveConfig');
     * 
     * Donde 'claveConfig' es la clave que uses en productionsConfig
     * 
     * EJEMPLO:
     * await initProduction('hamlet');
     * await initProduction('bodas');
     * await initProduction('casa');
     */
});

/* 
 * ===== RESUMEN COMPLETO PARA AÑADIR UNA NUEVA PRODUCCIÓN =====
 * 
 * Supongamos que quieres añadir "Hamlet":
 * 
 * 1. CONFIGURACIÓN (productionsConfig):
 * hamlet: {
 *     folder: 'Hamlet',
 *     prefix: 'hamlet',
 *     extension: '.jpg',
 *     maxImages: 50,
 *     title: 'Hamlet',
 *     modalId: 'hamletModal',
 *     sliderSelector: '.production-hero:not(.reverse) .production-slider',
 *     index: 0,
 *     timer: null,
 *     images: []
 * }
 * 
 * 2. FUNCIONES ESPECÍFICAS:
 * function openHamletModal() { openModal('hamletModal', 'hamlet'); }
 * function closeHamletModal(e) { closeModal('hamletModal', 'hamlet', e); }
 * function hamletModalPrev(e) { ... }
 * function hamletModalNext(e) { ... }
 * function hamletGoToSlide(e, idx) { ... }
 * 
 * 3. NAVEGACIÓN POR TECLADO:
 * } else if (document.getElementById('hamletModal').classList.contains('active')) {
 *     // código de navegación
 * }
 * 
 * 4. INICIALIZACIÓN:
 * await initProduction('hamlet');
 * 
 * 5. ESTRUCTURA DE ARCHIVOS:
 * images/production/Hamlet/hamlet01.jpg
 * images/production/Hamlet/hamlet02.jpg
 * images/production/Hamlet/hamlet03.jpg
 * ... (secuencial, sin huecos)
 * 
 * 6. HTML (index.html):
 * <div class="production-hero" onclick="openHamletModal()">
 *     <div class="production-content">
 *         <h3>Hamlet</h3>
 *         <p>Descripción...</p>
 *     </div>
 *     <div class="production-slider">
 *         <!-- Las imágenes se generan automáticamente -->
 *     </div>
 * </div>
 * 
 * <div id="hamletModal" class="modal" onclick="closeHamletModal(event)">
 *     <!-- Estructura del modal -->
 * </div>
 */
