// ===============================
// GALLERY SYSTEM
// ===============================

/* 
 * ===== GUÍA PARA AÑADIR NUEVOS ITEMS DE GALERÍA =====
 * 
 * Para añadir un nuevo item a la galería, sigue estos pasos:
 * 
 * 1. CONFIGURACIÓN YAML (_data/gallery.yml):
 *    - Agrega una nueva entrada en 'items' con toda la información del item
 *    - Especifica la carpeta de imágenes, prefijo y extensión
 *    - Elige el layout ("normal" o "reverse")
 * 
 * 2. ESTRUCTURA DE CARPETAS (assets/images/gallery/):
 *    - Crea una carpeta con el nombre especificado en images_folder
 *    - Sube las imágenes con numeración secuencial (01, 02, 03...)
 *    - Estructura: assets/images/gallery/[images_folder]/[images_prefix][numero][images_extension]
 * 
 * 3. EL JAVASCRIPT SE GENERA AUTOMÁTICAMENTE:
 *    - No necesitas tocar este archivo
 *    - El sistema detecta automáticamente las imágenes
 *    - Se crean los sliders y modales dinámicamente
 * 
 * ===== CONVENCIÓN DE NOMENCLATURA DE IMÁGENES =====
 * 
 * [images_prefix][numero_con_ceros][images_extension]
 * 
 * Ejemplos:
 * - cueva01.jpeg, cueva02.jpeg, cueva03.jpeg...
 * - fo01.jpg, fo02.jpg, fo03.jpg...
 * - art01.png, art02.png, art03.png...
 * 
 * IMPORTANTE: 
 * - Los números DEBEN tener ceros a la izquierda (01, 02, 03... no 1, 2, 3)
 * - DEBEN ser secuenciales sin huecos
 * - Todas las imágenes de un item deben tener la misma extensión
 */

// Configuración global de la galería
let galleryConfig = {};

// Función para detectar cuántas imágenes existen
async function detectGalleryImages(itemIndex, folder, prefix, extension) {
    const images = [];
    const maxImages = 50;
    
    for (let i = 1; i <= maxImages; i++) {
        const num = i.toString().padStart(2, '0');
        const imagePath = `/assets/images/gallery/${folder}/${prefix}${num}${extension}`;
        
        const exists = await checkImageExists(imagePath);
        if (exists) {
            images.push(imagePath);
        } else {
            break; // Para cuando no encuentra una imagen secuencial
        }
    }
    
    return images;
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
function generateGallerySliderHTML(itemIndex, images, title) {
    if (images.length === 0) return '';
    
    let html = '';
    images.forEach((imagePath, index) => {
        const activeClass = index === 0 ? ' active' : '';
        html += `<img src="${imagePath}" alt="${title} - Imagen ${index + 1}" class="gallery-slide${activeClass}">`;
    });
    
    return html;
}

// Generar HTML del modal
function generateGalleryModalHTML(itemIndex, images, title) {
    if (images.length === 0) return '';
    
    let slidesHTML = '';
    let dotsHTML = '';
    
    images.forEach((imagePath, index) => {
        const activeClass = index === 0 ? ' active' : '';
        slidesHTML += `<img src="${imagePath}" alt="${title} - Imagen ${index + 1}" class="modal-slide${activeClass}">`;
        dotsHTML += `<span class="modal-dot${activeClass}" onclick="galleryGoToSlide(event, ${itemIndex}, ${index})"></span>`;
    });
    
    const modal = document.getElementById(`galleryModal${itemIndex}`);
    if (modal) {
        const carousel = modal.querySelector('.modal-carousel');
        const counter = modal.querySelector('.modal-counter');
        const dots = modal.querySelector('.modal-dots');
        
        // Insertar slides antes de los botones
        const prevButton = carousel.querySelector('.modal-prev');
        carousel.insertAdjacentHTML('afterbegin', slidesHTML);
        
        // Actualizar contador y dots
        if (counter) counter.textContent = `1 / ${images.length}`;
        if (dots) dots.innerHTML = dotsHTML;
    }
}

// Inicializar item de galería
async function initGalleryItem(itemIndex, folder, prefix, extension, title) {
    const images = await detectGalleryImages(itemIndex, folder, prefix, extension);
    
    if (images.length === 0) {
        console.warn(`No se encontraron imágenes para el item ${itemIndex} de la galería`);
        return;
    }
    
    // Guardar configuración
    galleryConfig[itemIndex] = {
        images: images,
        index: 0,
        timer: null,
        title: title
    };
    
    // Generar HTML del slider - usar selector más específico
    const sliders = document.querySelectorAll('.gallery-slider');
    const slider = sliders[itemIndex];
    if (slider) {
        slider.innerHTML = generateGallerySliderHTML(itemIndex, images, title);
        // Iniciar autoplay
        autoGallerySlide(itemIndex);
    }
    
    // Generar HTML del modal
    generateGalleryModalHTML(itemIndex, images, title);
}

// Mostrar slide específico en el slider
function showGallerySlide(itemIndex, slideIndex) {
    const config = galleryConfig[itemIndex];
    if (!config) return;
    
    const sliders = document.querySelectorAll('.gallery-slider');
    const slider = sliders[itemIndex];
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.gallery-slide');
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === slideIndex);
    });
    
    config.index = slideIndex;
}

// Autoplay del slider
function autoGallerySlide(itemIndex) {
    const config = galleryConfig[itemIndex];
    if (!config) return;
    
    if (config.timer) {
        clearInterval(config.timer);
    }
    
    config.timer = setInterval(() => {
        const nextIndex = (config.index + 1) % config.images.length;
        showGallerySlide(itemIndex, nextIndex);
    }, 4000);
}

// ===============================
// MODAL FUNCTIONALITY
// ===============================

let mouseIdleTimers = {};

function showModalControls(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const navigation = modal.querySelectorAll('.modal-prev, .modal-next');
        const indicators = modal.querySelector('.modal-indicators');
        
        navigation.forEach(nav => nav.classList.add('visible'));
        if (indicators) indicators.classList.add('visible');
    }
}

function hideModalControls(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const navigation = modal.querySelectorAll('.modal-prev, .modal-next');
        const indicators = modal.querySelector('.modal-indicators');
        
        navigation.forEach(nav => nav.classList.remove('visible'));
        if (indicators) indicators.classList.remove('visible');
    }
}

function resetMouseIdleTimer(modalId) {
    showModalControls(modalId);
    
    if (mouseIdleTimers[modalId]) {
        clearTimeout(mouseIdleTimers[modalId]);
    }
    
    mouseIdleTimers[modalId] = setTimeout(() => {
        hideModalControls(modalId);
    }, 500); 
}

function openGalleryModal(itemIndex) {
    const modalId = `galleryModal${itemIndex}`;
    const modal = document.getElementById(modalId);
    const config = galleryConfig[itemIndex];
    
    if (modal && config) {
        // Parar autoplay del slider
        if (config.timer) {
            clearInterval(config.timer);
            config.timer = null;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open'); // Para ocultar hamburguesa
        
        // Mostrar slide actual
        showGalleryModalSlide(modalId, config.index);
        
        // Configurar timer de inactividad del mouse
        resetMouseIdleTimer(modalId);
        
        // Event listener para movimiento del mouse
        modal.addEventListener('mousemove', () => resetMouseIdleTimer(modalId));
    }
}

function closeGalleryModal(itemIndex, e) {
    const modalId = `galleryModal${itemIndex}`;
    const modal = document.getElementById(modalId);
    const config = galleryConfig[itemIndex];
    
    // Solo cerrar si se hace clic en el modal (fondo) o en el botón de cerrar
    if (!e || e.target === modal || e.target.classList.contains('close-modal')) {
        if (modal && config) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
            
            // Limpiar timer de inactividad
            if (mouseIdleTimers[modalId]) {
                clearTimeout(mouseIdleTimers[modalId]);
                delete mouseIdleTimers[modalId];
            }
            
            hideModalControls(modalId);
            
            // Reiniciar autoplay del slider si hay más de una imagen
            if (config.images.length > 1) {
                config.timer = setTimeout(() => autoGallerySlide(itemIndex), 4000);
            }
        }
    }
}

function showGalleryModalSlide(modalId, slideIndex) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const slides = modal.querySelectorAll('.modal-slide');
    const dots = modal.querySelectorAll('.modal-dot');
    const counter = modal.querySelector('.modal-counter');
    
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === slideIndex);
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
    
    if (counter) {
        counter.textContent = `${slideIndex + 1} / ${slides.length}`;
    }
}

// ===============================
// FUNCIONES GLOBALES PARA HTML
// ===============================

function galleryModalPrev(itemIndex, e) {
    if (e) e.stopPropagation();
    
    const config = galleryConfig[itemIndex];
    const modalId = `galleryModal${itemIndex}`;
    
    if (config) {
        const slides = document.querySelectorAll(`#${modalId} .modal-slide`);
        config.index = (config.index - 1 + slides.length) % slides.length;
        showGalleryModalSlide(modalId, config.index);
        resetMouseIdleTimer(modalId);
    }
}

function galleryModalNext(itemIndex, e) {
    if (e) e.stopPropagation();
    
    const config = galleryConfig[itemIndex];
    const modalId = `galleryModal${itemIndex}`;
    
    if (config) {
        const slides = document.querySelectorAll(`#${modalId} .modal-slide`);
        config.index = (config.index + 1) % slides.length;
        showGalleryModalSlide(modalId, config.index);
        resetMouseIdleTimer(modalId);
    }
}

function galleryGoToSlide(e, itemIndex, slideIndex) {
    if (e) e.stopPropagation();
    
    const config = galleryConfig[itemIndex];
    const modalId = `galleryModal${itemIndex}`;
    
    if (config) {
        config.index = slideIndex;
        showGalleryModalSlide(modalId, slideIndex);
        resetMouseIdleTimer(modalId);
    }
}

// ===============================
// KEYBOARD NAVIGATION
// ===============================

document.addEventListener('keydown', function(e) {
    // Encontrar qué modal está activo
    const activeModal = document.querySelector('.gallery-modal.active');
    if (!activeModal) return;
    
    const modalId = activeModal.id;
    const itemIndex = parseInt(modalId.replace('galleryModal', ''));
    
    switch(e.key) {
        case 'Escape':
            closeGalleryModal(itemIndex);
            break;
        case 'ArrowLeft':
            galleryModalPrev(itemIndex);
            break;
        case 'ArrowRight':
            galleryModalNext(itemIndex);
            break;
    }
});

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener datos de la galería desde el HTML (inyectados por Jekyll)
    const galleryData = window.galleryData || [];
    
    // Inicializar cada item de la galería
    for (let i = 0; i < galleryData.length; i++) {
        const item = galleryData[i];
        await initGalleryItem(
            i,
            item.images_folder,
            item.images_prefix,
            item.images_extension,
            item.title
        );
    }
});
