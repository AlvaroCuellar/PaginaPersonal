/**
 * Press Carousel - Una noticia a la vez
 * Carrusel simple con navegación por flechas e indicadores
 */

document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.getElementById('pressCarousel');
  const slides = document.querySelectorAll('.press-slide');
  const indicators = document.querySelectorAll('.indicator');
  const prevArrow = document.getElementById('prevArrow');
  const nextArrow = document.getElementById('nextArrow');
  
  if (!carousel || !slides.length) return;
  
  let currentIndex = 0;
  const totalSlides = slides.length;
  
  // Función para mostrar slide específico
  function showSlide(index) {
    // Ocultar todos los slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Mostrar slide actual
    slides[index].classList.add('active');
    
    // Actualizar indicadores
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    // Actualizar botones de navegación
    updateNavigationButtons();
  }
  
  // Función para actualizar botones
  function updateNavigationButtons() {
    if (prevArrow) {
      prevArrow.disabled = currentIndex === 0;
    }
    if (nextArrow) {
      nextArrow.disabled = currentIndex === totalSlides - 1;
    }
  }
  
  // Navegar al siguiente slide
  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      currentIndex++;
      showSlide(currentIndex);
    }
  }
  
  // Navegar al slide anterior
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      showSlide(currentIndex);
    }
  }
  
  // Event listeners para botones de navegación
  if (nextArrow) {
    nextArrow.addEventListener('click', nextSlide);
  }
  
  if (prevArrow) {
    prevArrow.addEventListener('click', prevSlide);
  }
  
  // Event listeners para indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentIndex = index;
      showSlide(currentIndex);
    });
  });
  
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
  //     if (currentIndex < totalSlides - 1) {
  //       nextSlide();
  //     } else {
  //       currentIndex = 0;
  //       showSlide(currentIndex);
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
  showSlide(currentIndex);
  // startAutoPlay(); // Descomentar para activar auto-play
});