# Flujo de Trabajo del Sitio Jekyll

## Estrategia de Ramas

Este repositorio utiliza el siguiente flujo de trabajo:

### 🌿 **Rama `main`**
- **Propósito**: Código de producción
- **Comportamiento**: Se compila automáticamente y se despliega a GitHub Pages
- **URL**: Tu sitio web público

### 🧪 **Rama `develop` o `testing`**
- **Propósito**: Desarrollo y pruebas
- **Comportamiento**: Se compila automáticamente pero NO se despliega
- **Verificación**: Puedes ver si la compilación fue exitosa en las GitHub Actions

## 🚀 Flujo de Trabajo Recomendado

1. **Para nuevas funcionalidades**:
   ```bash
   git checkout -b develop
   # Hacer tus cambios
   git add .
   git commit -m "Añadir nueva funcionalidad"
   git push origin develop
   ```

2. **Verificar que compila correctamente**:
   - Ve a la pestaña "Actions" en GitHub
   - Verifica que el build sea exitoso ✅

3. **Fusionar a producción**:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

4. **El sitio se actualiza automáticamente** 🎉

## 📋 Qué hace la GitHub Action

### En TODAS las ramas (main, develop, testing):
- ✅ Instala Ruby y las dependencias (con caché para velocidad)
- ✅ Compila el sitio Jekyll
- ✅ Verifica que no hay errores de compilación
- ✅ Muestra información del build

### Solo en la rama `main`:
- 🚀 Configura GitHub Pages
- 🚀 Sube el sitio compilado
- 🚀 Despliega automáticamente a tu URL de Pages

## 🔧 Configuración Adicional

Si quieres usar una rama diferente para desarrollo, simplemente:

1. Cambia `"develop", "testing"` por el nombre de tu rama en `.github/workflows/jekyll.yml`
2. O crea la rama con uno de los nombres ya configurados:
   ```bash
   git checkout -b develop
   ```

## 🎯 Ventajas de este Setup

- ✅ **Compilación automática**: No más `bundle exec jekyll build` manual
- ✅ **Detección de errores**: Sabes inmediatamente si algo está roto
- ✅ **Despliegue seguro**: Solo main se publica
- ✅ **Caché inteligente**: Las compilaciones son más rápidas
- ✅ **Flexibilidad**: Múltiples ramas de desarrollo soportadas