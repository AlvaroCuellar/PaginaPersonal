# GitHub Actions

## Estado actual

### `jekyll.yml.disabled`
**Estado:** Desactivado

El sitio se despliega automáticamente a través de Vercel desde la rama `main`. Esta acción de GitHub duplica el proceso de build y causa errores innecesarios.

**Deployment actual:**
- **Plataforma:** Vercel
- **Rama:** `main`
- **Build:** Automático en cada push
- **Desarrollo local:** `jekyll serve`

### ¿Cuándo reactivarla?

Si en el futuro se necesita:
- Validar builds en ramas de desarrollo antes de mergear
- Desplegar a GitHub Pages en lugar de Vercel
- CI/CD adicional para testing

Renombrar `jekyll.yml.disabled` → `jekyll.yml` y ajustar la configuración según necesites.

---

**Última actualización:** 9 de noviembre de 2025
