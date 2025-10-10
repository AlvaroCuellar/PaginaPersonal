/**
 * Press Carousel - Carrusel verdadero con múltiples items visibles
 * Desktop: 3 items | Tablet: 2 items | Mobile: 1 item
 * Avanza de 1 en 1 con cada clic
 */

function initPressCarousel() {
  const carouselContainer = document.querySelector('.press-carousel-container');
  if (!carouselContainer) {
    console.log('Press Carousel: Container not found, skipping initialization');
    return;
  }
  
  const carousel = carouselContainer.querySelector('.press-carousel');
  const cards = carousel.querySelectorAll('.press-card');
  const prevArrow = carouselContainer.querySelector('.carousel-prev');
  const nextArrow = carouselContainer.querySelector('.carousel-next');
  const indicatorsContainer = carouselContainer.querySelector('.carousel-indicators');
  
  if (!carousel || !cards.length) return;
  
  let currentIndex = 0;
  const totalCards = cards.length;
  
  // Determinar items visibles según el ancho de pantalla
  function getVisibleItems() {
    const width = window.innerWidth;
    if (width > 1024) return 3; // Desktop: 3 items
    if (width > 768) return 2;  // Tablet: 2 items
    return 1;                   // Mobile: 1 item
  }
  
  // Crear indicadores dinámicamente
  function createIndicators() {
    const visibleItems = getVisibleItems();
    const maxIndex = totalCards - visibleItems;
    const numIndicators = maxIndex + 1; // Total de posiciones posibles
    
    indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i <= maxIndex; i++) {
      const indicator = document.createElement('button');
      indicator.classList.add('carousel-indicator');
      indicator.setAttribute('aria-label', `Go to position ${i + 1}`);
      
      indicator.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
      });
      
      indicatorsContainer.appendChild(indicator);
    }
  }
  
  // Función principal para actualizar el carrusel
  function updateCarousel() {
    const visibleItems = getVisibleItems();
    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    
    // Calcular el desplazamiento (avance de 1 en 1)
    const offset = -(cardWidth + gap) * currentIndex;
    carousel.style.transform = `translateX(${offset}px)`;
    
    // Actualizar indicadores
    const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentIndex);
    });
    
    // Actualizar estado de flechas
    updateNavigationButtons();
  }
  
  // Función para actualizar estado de botones de navegación
  function updateNavigationButtons() {
    const visibleItems = getVisibleItems();
    const maxIndex = totalCards - visibleItems;
    
    if (prevArrow) {
      prevArrow.disabled = currentIndex === 0;
    }
    if (nextArrow) {
      nextArrow.disabled = currentIndex >= maxIndex;
    }
  }
  
  // Navegar al siguiente (avanzar 1 posición)
  function nextSlide() {
    const visibleItems = getVisibleItems();
    const maxIndex = totalCards - visibleItems;
    
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  }
  
  // Navegar al anterior (retroceder 1 posición)
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }
  
  // Ajustar en resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Ajustar índice si es necesario
      const visibleItems = getVisibleItems();
      const maxIndex = totalCards - visibleItems;
      if (currentIndex > maxIndex) {
        currentIndex = Math.max(0, maxIndex);
      }
      
      // Recrear indicadores y actualizar
      createIndicators();
      updateCarousel();
    }, 250);
  });
  
  // Event listeners para botones de navegación
  if (nextArrow) {
    nextArrow.addEventListener('click', nextSlide);
  }
  
  if (prevArrow) {
    prevArrow.addEventListener('click', prevSlide);
  }
  
  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    // Solo funcionar si estamos en la sección de prensa
    const pressSection = document.getElementById('press');
    if (!pressSection) return;
    
    const rect = pressSection.getBoundingClientRect();
    const isInView = rect.top <= window.innerHeight && rect.bottom >= 0;
    
    if (isInView) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    }
  });
  
  // Navegación táctil (swipe)
  let startX = 0;
  let endX = 0;
  
  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  
  carousel.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const threshold = 50; // Mínimo de pixels para considerar swipe
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe hacia la izquierda - siguiente
        nextSlide();
      } else {
        // Swipe hacia la derecha - anterior
        prevSlide();
      }
    }
  }
  
  // Auto-play opcional (comentado por defecto)
  // let autoPlayInterval;
  // const autoPlayDelay = 5000; // 5 segundos
  
  // function startAutoPlay() {
  //   autoPlayInterval = setInterval(() => {
  //     const visibleItems = getVisibleItems();
  //     const maxIndex = totalCards - visibleItems;
  //     
  //     if (currentIndex < maxIndex) {
  //       nextSlide();
  //     } else {
  //       currentIndex = 0;
  //       updateCarousel();
  //     }
  //   }, autoPlayDelay);
  // }
  
  // function stopAutoPlay() {
  //   clearInterval(autoPlayInterval);
  // }
  
  // // Pausar auto-play al hacer hover
  // carousel.addEventListener('mouseenter', stopAutoPlay);
  // carousel.addEventListener('mouseleave', startAutoPlay);
  
  // Inicializar
  createIndicators();
  updateCarousel();
  
  // startAutoPlay(); // Descomentar para activar auto-play
  
  console.log('✅ Press Carousel initialized successfully');
}

// ═══════════════════════════════════════════════════════════
// INICIALIZACIÓN Y RE-INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initPressCarousel);

// Forzar recalcular después de que las imágenes carguen
window.addEventListener('load', () => {
  const carouselContainer = document.querySelector('.press-carousel-container');
  if (carouselContainer) {
    initPressCarousel();
  }
});

// RE-INICIALIZAR después de cambio de idioma AJAX
document.addEventListener('languageContentReplaced', function(e) {
  console.log('🔄 Press Carousel: Reinitializing after language change to', e.detail.lang);
  
  // Esperar un momento para que el DOM se actualice completamente
  setTimeout(() => {
    initPressCarousel();
  }, 150); // Delay para asegurar que el DOM esté completamente actualizado
});