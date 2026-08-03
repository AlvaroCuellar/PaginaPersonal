# Álvaro Cuéllar - Academic Portfolio
Academic portfolio designed and developed by [David Merino Recalde](https://dxvidmr.github.io).

## Despliegue Automático

Este sitio se despliega automáticamente a través de **Vercel**:
- **Rama `main`**: Se despliega automáticamente al dominio [alvarocuellar.com](https://alvarocuellar.com)
- **Desarrollo local**: Ejecutar `jekyll serve` para trabajar en local
- **Build**: Vercel compila automáticamente con Jekyll en cada push a `main`

## Citas automáticas

Cada lunes, GitHub Actions consulta OpenAlex, identifica nuevas citas externas, excluye autocitas y duplicados, y añade las referencias verificadas a `_data/home/publications.yml`. El mismo commit actualiza automáticamente el total, la distribución anual, los acumulados, la escala, los puntos y los tooltips de la gráfica; Vercel publica después el resultado desde `main`. Cada ejecución conserva además un informe descargable y actualiza el issue de seguimiento cuando incorpora citas.
