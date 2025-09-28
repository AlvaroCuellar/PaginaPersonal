---
layout: default
permalink: /
---

<script>
// Detectar idioma del navegador y redirigir
var userLang = navigator.language || navigator.userLanguage;
var isSpanish = userLang.toLowerCase().startsWith('es');

if (isSpanish) {
    window.location.href = '{{ site.baseurl }}/es/';
} else {
    window.location.href = '{{ site.baseurl }}/en/';
}
</script>

<noscript>
<!-- Fallback para navegadores sin JavaScript -->
<div style="text-align: center; margin-top: 100px; font-family: Arial, sans-serif;">
    <h1>Bienvenido / Welcome</h1>
    <p>Por favor, selecciona tu idioma / Please select your language:</p>
    <p>
        <a href="{{ site.baseurl }}/es/" style="display: inline-block; margin: 10px; padding: 15px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            🇪🇸 Español
        </a>
        <a href="{{ site.baseurl }}/en/" style="display: inline-block; margin: 10px; padding: 15px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            🇺🇸 English
        </a>
    </p>
</div>
</noscript>