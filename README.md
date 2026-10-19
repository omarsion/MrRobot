# Mr. Robot Bolivia — landing page

Landing en React, TypeScript, Tailwind CSS y GSAP ScrollTrigger.

## Desarrollo

```bash
npm install
npm run dev
```

## Verificación

```bash
npm run lint
npm run build
```

## Publicación en GitHub Pages

La URL del sitio es https://omarsion.github.io/MrRobot/. En Settings → Pages del repositorio, selecciona **GitHub Actions** como origen. El flujo `.github/workflows/pages.yml` compila y publica `dist/` automáticamente después de cada push a `main`.

Las capturas de proyectos aportadas para esta página están en `public/images/`. Los datos y descripciones comerciales de los casos deben ser aprobados por el equipo antes de publicar. La visualización animada del panel es conceptual.

Completar `canonical`, `og:url` y una imagen Open Graph cuando se conozcan el dominio y la identidad visual definitiva.

## Optimización de imágenes en el navegador

`src/services/svg-optimizer.client.ts` observa todos los elementos `<img>` actuales y futuros. Cuando se acercan al viewport, lee IndexedDB y, si aún no hay resultado, envía la URL a `src/workers/svg-converter.worker.ts`. El Worker decodifica con `createImageBitmap`, usa `OffscreenCanvas` y comprime a WebP dentro de un SVG responsivo. Para gráficos planos pequeños intenta un trazado vectorial limitado. Solo sustituye la imagen cuando el SVG pesa menos que el archivo original; en caso contrario conserva el `<img>` inicial. El trabajo nuevo se pausa mientras la escena de scroll está visible.

Para nuevas imágenes React, se puede usar `SmartSvgImage` con `src`, `alt` y, preferiblemente, `width` y `height`. Este componente muestra un SVG ligero mientras consulta la caché, por lo que una visita repetida puede evitar la descarga del raster original. Un `<img>` normal también entra en el flujo automáticamente, aunque el navegador puede descargar su `src` antes de que el observador actúe. Las imágenes de `public/` se detectan cuando se renderizan; el navegador no puede enumerar archivos sin usar de esa carpeta y `import.meta.glob` añadiría imágenes no usadas al bundle. El servicio se ejecuta completamente en el navegador; Vite y Node solo se usan para desarrollo y generación del sitio estático.

La caché usa la URL y `CACHE_VERSION` como clave. Si se sustituye un archivo conservando su URL, cambia su nombre, añade un parámetro de versión o incrementa `CACHE_VERSION` para invalidar el resultado anterior. Los `blob:` URL de imágenes visibles se revocan al sustituirlas o desmontarlas; revocarlos durante su visualización podría romper la imagen. IndexedDB es asíncrono y no garantiza una lectura de 0 ms. Ningún Worker puede garantizar por sí solo 60 FPS: hay que medir en dispositivos reales.

Los SVG de entrada se reconstruyen en el Worker con una lista estricta de formas y atributos seguros. Si contienen CSS, filtros, transformaciones o referencias complejas, se conserva el archivo original en vez de alterar su apariencia. `DOMParser` no está disponible en un Dedicated Worker, por eso no se usa para esa ruta.
