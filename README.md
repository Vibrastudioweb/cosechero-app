# Cosechero — versión 0

Pantallas:

1. **Bienvenida** (`/`) — elegir rol (comprador/productor).
2. **Entrar** (`/entrar`) — solo el número de WhatsApp, sin código ni contraseña.
3. **Qué llegó hoy** (`/hoy`) — lista pública de lo publicado hoy, con botón para
   contactar por WhatsApp.
4. **Publicar** (`/publicar`) — formulario corto para que un productor suba lo
   que tiene, incluyendo dónde está (por ahora, Trujillo o Mérida).

Sin base de datos: las publicaciones se guardan en [`data/publicaciones.json`](data/publicaciones.json)
y los usuarios en [`data/usuarios.json`](data/usuarios.json).
Las fotos (opcionales) se guardan en `data/uploads/`.

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
