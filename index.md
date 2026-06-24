---
layout: default
permalink: /
---

<script>
// Detectar idioma del navegador y redirigir
var userLang = navigator.language || navigator.userLanguage;
var supportedLangs = [{% for locale in site.data.locales.supported %}'{{ locale.code }}'{% unless forloop.last %}, {% endunless %}{% endfor %}];
var baseLang = (userLang || 'es').toLowerCase().split('-')[0];
var targetLang = supportedLangs.indexOf(baseLang) !== -1 ? baseLang : 'en';

window.location.href = '{{ site.baseurl }}/' + targetLang + '/';
</script>

<noscript>
<!-- Fallback para navegadores sin JavaScript -->
<div style="text-align: center; margin-top: 100px; font-family: Arial, sans-serif;">
    <h1>Álvaro Cuéllar</h1>
    <p>Por favor, selecciona tu idioma / Please select your language:</p>
    <p>
        {% for locale in site.data.locales.supported %}
        <a href="{{ site.baseurl }}/{{ locale.code }}/" style="display: inline-block; margin: 10px; padding: 15px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            {{ locale.label }}
        </a>
        {% endfor %}
    </p>
</div>
</noscript>
