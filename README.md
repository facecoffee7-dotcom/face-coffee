# Face Coffee — Menú digital + Admin

Sitio estático (sin build, sin dependencias) para el menú de Face Coffee.

## Estructura
- `index.html` — página pública del menú (carrito + pedido por WhatsApp)
- `admin.html` — panel administrativo tipo tablero (editar categorías/productos)
- `data.js` — capa de datos (hoy: localStorage del navegador; preparado para migrar a Firebase)
- `styles.css` — sistema de diseño compartido (oscuro/dorado)
- `images/` — íconos de categoría generados (reemplázalos por fotos reales desde el admin)

## Publicar en GitHub Pages (una sola vez)

1. Crea un repositorio **nuevo y vacío** en GitHub (sin README, sin .gitignore) — por ejemplo `facecoffee-web`.
2. En esta carpeta, conecta el repo remoto y sube el código:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/facecoffee-web.git
   git push -u origin main
   ```
3. En GitHub → tu repo → **Settings → Pages** → en "Source" elige la rama `main` y la carpeta `/ (root)` → **Save**.
4. En 1–2 minutos tu sitio queda publicado en:
   `https://TU-USUARIO.github.io/facecoffee-web/`

## Importante sobre el almacenamiento de datos

Ahora mismo el menú se guarda en el **localStorage del navegador**. Eso significa:
- Los cambios que hagas en `admin.html` en TU computador/celular se ven en `index.html` del MISMO navegador.
- Si otra persona abre el sitio desde otro dispositivo, no verá tus cambios del admin (cada navegador tiene su propio localStorage).

Para que el admin funcione desde cualquier dispositivo (lo normal en producción), el siguiente paso es migrar `data.js` a Firebase Firestore — la interfaz de funciones (`FCData.loadData`, `addProduct`, etc.) ya está preparada para ese cambio sin tocar `index.html` ni `admin.html`.

## Configurar WhatsApp / datos del negocio

Todo se edita desde `admin.html` → botón **⚙ Configuración** (número de WhatsApp, nombre, dirección, horario, Instagram). No hace falta tocar código.
