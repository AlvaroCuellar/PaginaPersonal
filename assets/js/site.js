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
		$.scrollUp({
			zIndex: 9000  // Por debajo del overlay de citas (2147483646)
		});
	}
	
	/* Inicializar estado de logros según tamaño de pantalla */
	initAchievementsState();
	initProfileMatrixRain();
	
	// Reinicializar al cambiar tamaño de ventana
	let resizeTimer;
	$(window).on('resize', function() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			initAchievementsState();
			initProfileMatrixRain();
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
   Matrix rain en foto de perfil
   ········································· */

function initProfileMatrixRain() {
	const frames = document.querySelectorAll('.profile-matrix-frame');
	const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	
	frames.forEach(function(frame) {
		const canvas = frame.querySelector('.profile-matrix-canvas');
		if (!canvas || canvas.dataset.matrixReady === 'true') return;
		
		canvas.dataset.matrixReady = 'true';
		
		let ctx;
		let width = 0;
		let height = 0;
		let fontSize = 10;
		let drops = [];
		let animationId = null;
		
		function setupCanvas() {
			const rect = frame.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			
			width = Math.max(1, Math.round(rect.width));
			height = Math.max(1, Math.round(rect.height));
			fontSize = Math.max(13, Math.round(width / 21));
			
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			
			ctx = canvas.getContext('2d');
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			
			const columns = Math.ceil(width / fontSize) + 8;
			const startRows = Math.ceil(height / fontSize);
			drops = Array.from({ length: columns }, function() {
				return Math.floor(Math.random() * startRows) - startRows;
			});
			
			ctx.clearRect(0, 0, width, height);
		}
		
		function drawStaticMatrix() {
			if (!ctx) setupCanvas();
			ctx.clearRect(0, 0, width, height);
			ctx.font = fontSize + 'px "Courier New", monospace';
			ctx.textAlign = 'center';
			
			for (let x = 0; x < width + fontSize; x += fontSize) {
				for (let y = 0; y < height + fontSize; y += fontSize) {
					ctx.fillStyle = 'rgba(92, 255, 156, 0.62)';
					ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
				}
			}
		}
		
		function drawMatrix() {
			ctx.fillStyle = 'rgba(0, 18, 8, 0.12)';
			ctx.fillRect(0, 0, width, height);
			ctx.font = fontSize + 'px "Courier New", monospace';
			ctx.textAlign = 'center';
			
			for (let i = 0; i < drops.length; i++) {
				const x = (i - 3) * fontSize;
				const y = drops[i] * fontSize;
				const isHead = Math.random() > 0.78;
				
				ctx.fillStyle = isHead ? 'rgba(214, 255, 224, 0.95)' : 'rgba(92, 255, 156, 0.72)';
				ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
				
				if (y > height + fontSize && Math.random() > 0.965) {
					drops[i] = -Math.floor(Math.random() * 10);
				} else {
					drops[i] += 1;
				}
			}
			
			animationId = requestAnimationFrame(drawMatrix);
		}
		
		function startMatrix() {
			setupCanvas();
			
			if (prefersReducedMotion) {
				drawStaticMatrix();
				return;
			}
			
			if (!animationId) {
				drawMatrix();
			}
		}
		
		function stopMatrix() {
			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}
			
			if (ctx) {
				ctx.clearRect(0, 0, width, height);
			}
		}
		
		frame.addEventListener('mouseenter', startMatrix);
		frame.addEventListener('mouseleave', stopMatrix);
		frame.addEventListener('touchstart', startMatrix, { passive: true });
	});
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
