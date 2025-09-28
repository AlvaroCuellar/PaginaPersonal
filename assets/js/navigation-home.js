"use strict";

/**
 * ===================================
 * HOME NAVIGATION SYSTEM
 * ===================================
 * Gestión de la navegación para la página principal
 */

$(document).ready(function () {
    /* Mantener scroll al cambiar de idioma */
    $(document).on('click', '.lang-switcher a', function(e) {
        // Guarda la posición actual del scroll
        localStorage.setItem('scrollPos', window.scrollY);
    });
	
	/* Responsive Navigation - Mobile Menu */
	$("#nav-mobile").html($("#nav-main").html());
	
	// Variable para prevenir clics múltiples
	var isAnimating = false;
	
	// Toggle mobile menu - Sistema de estados controlado con protección
	$("#nav-trigger span").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation(); // Evitar propagación del evento
		
		// Prevenir clics múltiples durante animación
		if (isAnimating) {
			return false;
		}
		
		var $menu = $("nav#nav-mobile ul");
		var $trigger = $(this);
		
		isAnimating = true; // Bloquear nuevos clics
		
		if ($menu.hasClass("expanded")) {
			// CERRAR: expanded -> collapsing -> (vacío)
			$menu.removeClass("expanded expanding").addClass("collapsing");
			$trigger.removeClass("open");
			
			// Después de la animación, limpiar clases y desbloquear
			setTimeout(function() {
				$menu.removeClass("collapsing");
				isAnimating = false;
			}, 700); // Usar el tiempo máximo de animación
			
		} else {
			// ABRIR: (vacío) -> expanding -> expanded
			$menu.removeClass("collapsing").addClass("expanding");
			$trigger.addClass("open");
			
			// Cambiar a expanded después de un frame para activar transición
			requestAnimationFrame(function() {
				$menu.addClass("expanded");
				
				// Desbloquear después de que la apertura esté completa
				setTimeout(function() {
					isAnimating = false;
				}, 500); // Tiempo de apertura
			});
		}
		
		return false; // Prevenir cualquier comportamiento adicional
	});

	// Close mobile menu when clicking on links (excepto el botón CV)
	$("#nav-mobile ul a:not(.menu-button)").on("click", function(e) {
		var $menu = $("nav#nav-mobile ul");
		
		if ($menu.hasClass("expanded") && !isAnimating) {
			isAnimating = true;
			
			$menu.removeClass("expanded expanding").addClass("collapsing");
			$("#nav-trigger span").removeClass("open");
			
			setTimeout(function() {
				$menu.removeClass("collapsing");
				isAnimating = false;
			}, 700);
		}
	});

	// Prevenir clics en el menú cuando está animando
	$("#nav-mobile").on("click", function(e) {
		if (isAnimating) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	});

	/* Sistema de navegación simplificado - Solo cambio de estado sin animaciones */
	$(window).scroll(function() {
		var scroll = $(window).scrollTop();
		var bannerHeight = $('#banner').height() || 0;
		
		// Cambio instantáneo de estado al terminar el banner (no al empezar el scroll)
		if (scroll >= bannerHeight) {
			if (!$('#header').hasClass('nav-solid')) {
				$('#header').addClass('nav-solid');
			}
		} else {
			if ($('#header').hasClass('nav-solid')) {
				$('#header').removeClass('nav-solid');
			}
		}
		
		// Marcar sección activa sin animaciones
		markActiveSection();
	});
	
	/* Función para marcar sección activa */
	function markActiveSection() {
		var scrollPos = $(window).scrollTop() + 100; // Offset para compensar header
		
		$('.scrollto').each(function() {
			var sectionTop = $(this).offset().top;
			var sectionBottom = sectionTop + $(this).outerHeight();
			var sectionId = $(this).attr('id');
			
			if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
				// Remover active de todos los enlaces
				$('#nav-main a').removeClass('active');
				// Agregar active al enlace correspondiente
				$('#nav-main a[href="#' + sectionId + '"]').addClass('active');
			}
		});
	}

    // Al cargar la página, restaurar el scroll si existe
    var scrollPos = localStorage.getItem('scrollPos');
    if (scrollPos !== null) {
        window.scrollTo(0, scrollPos);
        localStorage.removeItem('scrollPos');
    }

    /* Scroll instantáneo sin animaciones */
    $('a[href^="#"]:not([href="#"])').on('click', function(e) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            // Scroll instantáneo sin animación
            window.scrollTo(0, target.offset().top - 80);
        }
    });
});
