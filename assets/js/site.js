/* ═══════════════════════════════════════════════════════════
   SITE.JS - Funcionalidad básica del sitio web
   ═══════════════════════════════════════════════════════════ */

"use strict";

/* ·········································
   Inicialización del DOM
   ········································· */

$(document).ready(function () {
	
	/* ScrollUp Button - Botón para volver arriba */
	if (!!$.prototype.scrollUp) {
		$.scrollUp();
	}
	
	/* Inicializar estado de logros según tamaño de pantalla */
	initAchievementsState();
	
	// Reinicializar al cambiar tamaño de ventana
	let resizeTimer;
	$(window).on('resize', function() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			initAchievementsState();
		}, 250);
	});

});

/* ·········································
   Inicializar estado de logros
   ········································· */

function initAchievementsState() {
	const block = document.querySelector('.achievements-block');
	const button = document.querySelector('.achievements-toggle');
	
	if (block && button) {
		// En desktop (>1024px), siempre mostrar; en tablet/móvil, colapsar
		if (window.innerWidth > 1024) {
			block.classList.remove('collapsed');
			button.classList.remove('active');
		} else {
			block.classList.add('collapsed');
			button.classList.remove('active');
			
			// Actualizar texto del botón
			const lang = document.documentElement.lang || 'es';
			const toggleText = button.querySelector('.toggle-text');
			const translations = {
				es: { show: 'Ver logros' },
				en: { show: 'View achievements' }
			};
			if (toggleText) {
				toggleText.textContent = translations[lang].show;
			}
		}
	}
}

/* ·········································
   Toggle de logros en banner (móvil/tablet)
   ········································· */

function toggleAchievements() {
	const block = document.querySelector('.achievements-block');
	const button = document.querySelector('.achievements-toggle');
	const toggleText = button.querySelector('.toggle-text');
	
	if (block && button) {
		block.classList.toggle('collapsed');
		button.classList.toggle('active');
		
		// Cambiar texto del botón según estado
		const lang = document.documentElement.lang || 'es';
		const translations = {
			es: {
				show: 'Ver logros',
				hide: 'Ocultar logros'
			},
			en: {
				show: 'View achievements',
				hide: 'Hide achievements'
			}
		};
		
		const isCollapsed = block.classList.contains('collapsed');
		toggleText.textContent = isCollapsed ? translations[lang].show : translations[lang].hide;
	}
}