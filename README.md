# Cosechero — versión 0

Dos pantallas para mostrar en Makroval:

1. **Qué llegó hoy** (`/`) — lista pública de lo publicado hoy, con botón para
   contactar por WhatsApp.
2. **Publicar** (`/publicar`) — formulario corto, sin cuenta, para que un
   productor suba lo que tiene.

Sin base de datos: las publicaciones se guardan en [`data/publicaciones.json`](data/publicaciones.json).
Las fotos (opcionales) se guardan en `public/uploads/`.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) (versión LTS) instalado.

```bash
npm install
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador. Para
probarlo desde el celular en la misma red, usa la IP de tu computadora en
vez de `localhost` (ej: `http://192.168.1.5:3000`).

## Notas

- Todo queda asociado a `mercado_id: "makroval"` para poder agregar otros
  mercados más adelante sin rediseñar nada.
- Una publicación aparece en "Qué llegó hoy" solo el mismo día en que se
  publicó.
- El botón "Contactar" abre WhatsApp (`wa.me`) con el teléfono que puso el
  productor.
