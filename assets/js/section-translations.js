/**
 * ═══════════════════════════════════════════════════════════
 * SECTION TRANSLATIONS
 * ═══════════════════════════════════════════════════════════
 * Mapeo de IDs de sección a slugs de URL traducidos
 * Generado dinámicamente desde los datos de Jekyll
 */

window.sectionTranslations = {
    'es': {
        {% for item in site.data.home.menu %}
        {% if item.show != false and item.key != "cv" %}
        {% assign data_file = site.data.home[item.section_id] %}
        {% if data_file.url_slug %}
        '{{ item.section_id }}': '{{ data_file.url_slug.es }}'{% unless forloop.last %},{% endunless %}
        {% endif %}
        {% endif %}
        {% endfor %}
    },
    'en': {
        {% for item in site.data.home.menu %}
        {% if item.show != false and item.key != "cv" %}
        {% assign data_file = site.data.home[item.section_id] %}
        {% if data_file.url_slug %}
        '{{ item.section_id }}': '{{ data_file.url_slug.en }}'{% unless forloop.last %},{% endunless %}
        {% endif %}
        {% endif %}
        {% endfor %}
    }
};

// Log para debug
if (console && console.log) {
    console.log('📍 Section translations loaded:', window.sectionTranslations);
}
