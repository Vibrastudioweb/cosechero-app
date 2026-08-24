const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'publicaciones.json');
const USERS_FILE = path.join(__dirname, 'data', 'usuarios.json');
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'cosechero-dev-secret';
const COOKIE_NOMBRE = 'cosechero_usuario';

// V0: un solo mercado/tenant interno. Cada registro igual guarda mercado_id
// para poder activar mercados nuevos despues sin tocar el modelo de datos.
// La ubicacion real de cada publicacion ya no depende de esto: cada
// productor dice donde esta (por ahora, limitado a estos estados).
const MERCADO_ID = 'makroval';
const ESTADOS_DISPONIBLES = ['Trujillo', 'Mérida'];

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

app.use((req, res, next) => {
  const usuarioId = req.signedCookies[COOKIE_NOMBRE];
  req.usuario = usuarioId ? leerUsuarios().find((u) => u.id === usuarioId) || null : null;
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error('La foto debe ser una imagen'), ok);
  },
});

function leerPublicaciones() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function guardarPublicaciones(lista) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(lista, null, 2));
}

function leerUsuarios() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function guardarUsuarios(lista) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(lista, null, 2));
}

function soloDigitos(telefono) {
  return String(telefono).replace(/\D/g, '');
}

function encontrarOCrearUsuario(telefono, rol) {
  const digitos = soloDigitos(telefono);
  const usuarios = leerUsuarios();
  const existente = usuarios.find(
    (u) => soloDigitos(u.telefono) === digitos && u.mercado_id === MERCADO_ID
  );

  if (existente) {
    existente.rol = rol;
    guardarUsuarios(usuarios);
    return existente;
  }

  const nuevo = {
    id: crypto.randomUUID(),
    mercado_id: MERCADO_ID,
    telefono: telefono.trim(),
    rol,
    creado_en: new Date().toISOString(),
  };
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);
  return nuevo;
}

function esDeHoy(fechaISO) {
  const fecha = new Date(fechaISO);
  const hoy = new Date();
  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
}

// Icono por producto cuando no hay foto. La lista es de reglas ordenadas: la
// primera palabra clave que aparezca en el nombre del producto gana.
const ICONOS_PRODUCTO = [
  { palabras: ['tomate'], icono: '🍅' },
  { palabras: ['papa', 'patata'], icono: '🥔' },
  { palabras: ['cebolla'], icono: '🧅' },
  { palabras: ['zanahoria'], icono: '🥕' },
  { palabras: ['maiz', 'elote', 'choclo', 'jojoto'], icono: '🌽' },
  { palabras: ['platano', 'cambur', 'banana'], icono: '🍌' },
  { palabras: ['lechuga', 'repollo', 'col', 'espinaca'], icono: '🥬' },
  { palabras: ['pimenton', 'pimiento', 'aji'], icono: '🫑' },
  { palabras: ['ajo'], icono: '🧄' },
  { palabras: ['limon'], icono: '🍋' },
  { palabras: ['naranja', 'mandarina'], icono: '🍊' },
  { palabras: ['manzana'], icono: '🍎' },
  { palabras: ['pera'], icono: '🍐' },
  { palabras: ['uva'], icono: '🍇' },
  { palabras: ['sandia', 'patilla'], icono: '🍉' },
  { palabras: ['melon'], icono: '🍈' },
  { palabras: ['pina', 'ananas'], icono: '🍍' },
  { palabras: ['mango'], icono: '🥭' },
  { palabras: ['fresa', 'frutilla'], icono: '🍓' },
  { palabras: ['aguacate', 'palta'], icono: '🥑' },
  { palabras: ['pepino'], icono: '🥒' },
  { palabras: ['auyama', 'calabaza', 'zapallo'], icono: '🎃' },
  { palabras: ['brocoli', 'coliflor'], icono: '🥦' },
  { palabras: ['caraota', 'frijol', 'frijoles', 'poroto', 'habichuela'], icono: '🫘' },
  { palabras: ['arveja', 'guisante'], icono: '🫛' },
  { palabras: ['yuca', 'mandioca'], icono: '🍠' },
  { palabras: ['coco'], icono: '🥥' },
  { palabras: ['huevo'], icono: '🥚' },
  { palabras: ['pollo'], icono: '🍗' },
  { palabras: ['carne', 'res'], icono: '🥩' },
  { palabras: ['pescado'], icono: '🐟' },
  { palabras: ['berenjena'], icono: '🍆' },
  { palabras: ['cilantro', 'perejil', 'albahaca'], icono: '🌿' },
];
const ICONO_PRODUCTO_DEFAULT = '🧺';

function iconoParaProducto(producto) {
  const texto = String(producto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const regla = ICONOS_PRODUCTO.find((r) => r.palabras.some((palabra) => texto.includes(palabra)));
  return regla ? regla.icono : ICONO_PRODUCTO_DEFAULT;
}

// Numero venezolano -> formato que entiende wa.me (codigo de pais 58, sin el 0 inicial)
function normalizarTelefonoWhatsapp(telefono) {
  let digitos = String(telefono).replace(/\D/g, '');
  if (digitos.startsWith('58')) {
    // ya viene con codigo de pais
  } else if (digitos.startsWith('0')) {
    digitos = '58' + digitos.slice(1);
  } else {
    digitos = '58' + digitos;
  }
  return digitos;
}

// Mientras la app no este lanzada, la raiz muestra la pantalla "Proximamente"
// y el resto de la app queda protegido por una clave (solo el equipo entra).
// Para activar la app en produccion: define la variable de entorno APP_LANZADA=1
const APP_LANZADA = process.env.APP_LANZADA === '1';
// Clave para entrar a construir. Cambiala definiendo ACCESO_CLAVE en el hosting.
const ACCESO_CLAVE = process.env.ACCESO_CLAVE || 'cosechero-2026';
const COOKIE_ACCESO = 'cosechero_acceso';

// Deja pasar si la app ya esta lanzada o si el visitante tiene el acceso privado.
function requiereAcceso(req, res, next) {
  if (APP_LANZADA) return next();
  if (req.signedCookies[COOKIE_ACCESO] === 'ok') return next();
  return res.redirect('/');
}

app.get('/', (req, res) => {
  res.render(APP_LANZADA ? 'bienvenida' : 'proximamente');
});

app.get('/acceso', (req, res) => {
  if (APP_LANZADA || req.signedCookies[COOKIE_ACCESO] === 'ok') {
    return res.redirect('/bienvenida');
  }
  res.render('acceso', { error: null });
});

app.post('/acceso', (req, res) => {
  const { clave } = req.body;
  if (!clave || clave !== ACCESO_CLAVE) {
    return res.status(401).render('acceso', { error: 'Clave incorrecta.' });
  }
  res.cookie(COOKIE_ACCESO, 'ok', {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.redirect('/bienvenida');
});

app.get('/bienvenida', requiereAcceso, (req, res) => {
  res.render('bienvenida');
});

app.get('/entrar', requiereAcceso, (req, res) => {
  const rol = req.query.rol;
  if (rol !== 'comprador' && rol !== 'productor') {
    return res.redirect('/');
  }
  res.render('entrar', {
    rol,
    telefono: req.usuario ? req.usuario.telefono : '',
    error: null,
  });
});

app.post('/entrar', requiereAcceso, (req, res) => {
  const { rol, telefono } = req.body;
  if (rol !== 'comprador' && rol !== 'productor') {
    return res.redirect('/');
  }
  if (!telefono || !telefono.trim()) {
    return res.status(400).render('entrar', { rol, telefono: '', error: 'Falta tu número.' });
  }

  const usuario = encontrarOCrearUsuario(telefono, rol);
  res.cookie(COOKIE_NOMBRE, usuario.id, {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });

  res.redirect(rol === 'productor' ? '/publicar' : '/hoy');
});

app.get('/hoy', requiereAcceso, (req, res) => {
  const todas = leerPublicaciones().filter((p) => p.mercado_id === MERCADO_ID);
  const deHoy = todas
    .filter((p) => esDeHoy(p.fecha_publicacion))
    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
    .map((p) => ({
      ...p,
      icono: iconoParaProducto(p.producto),
      whatsappHref: `https://wa.me/${normalizarTelefonoWhatsapp(p.telefono)}?text=${encodeURIComponent(
        `Hola! Vi tu publicacion de ${p.producto} en Cosechero, ¿todavia esta disponible?`
      )}`,
    }));

  res.render('index', {
    publicaciones: deHoy,
    ok: req.query.ok === '1',
  });
});

app.get('/publicar', requiereAcceso, (req, res) => {
  res.render('publicar', {
    error: null,
    estados: ESTADOS_DISPONIBLES,
    valores: { telefono: req.usuario ? req.usuario.telefono : '' },
  });
});

app.post('/publicar', requiereAcceso, (req, res, next) => {
  upload.single('foto')(req, res, (err) => {
    if (err) {
      return res.status(400).render('publicar', { error: err.message, estados: ESTADOS_DISPONIBLES, valores: req.body });
    }

    const { producto, cantidad, presentacion, tipoPrecio, precio, telefono, estadoUbicacion, ciudad } = req.body;

    if (!producto || !cantidad || !presentacion || !telefono || !estadoUbicacion || !ciudad) {
      return res.status(400).render('publicar', {
        error: 'Falta llenar producto, cantidad, presentacion, ubicacion o telefono.',
        estados: ESTADOS_DISPONIBLES,
        valores: req.body,
      });
    }

    if (!ESTADOS_DISPONIBLES.includes(estadoUbicacion)) {
      return res.status(400).render('publicar', {
        error: 'Por ahora solo cubrimos Trujillo y Mérida.',
        estados: ESTADOS_DISPONIBLES,
        valores: req.body,
      });
    }

    const precioFinal = tipoPrecio === 'consultar' ? 'consultar' : (precio || '').trim();
    if (!precioFinal) {
      return res.status(400).render('publicar', {
        error: 'Pon un precio o marca "Consultar precio".',
        estados: ESTADOS_DISPONIBLES,
        valores: req.body,
      });
    }

    const nueva = {
      id: crypto.randomUUID(),
      mercado_id: MERCADO_ID,
      productor_id: req.usuario ? req.usuario.id : null,
      producto: producto.trim(),
      rubro: null,
      cantidad: cantidad.trim(),
      presentacion: presentacion.trim(),
      precio: precioFinal,
      foto: req.file ? `/uploads/${req.file.filename}` : null,
      telefono: telefono.trim(),
      ubicacion: { estado: estadoUbicacion, ciudad: ciudad.trim() },
      fecha_publicacion: new Date().toISOString(),
      estado: 'activo',
    };

    const lista = leerPublicaciones();
    lista.push(nueva);
    guardarPublicaciones(lista);

    res.redirect('/hoy?ok=1');
  });
});

app.get('/salud', (req, res) => {
  res.status(200).send('ok');
});

app.listen(PORT, () => {
  console.log(`Cosechero corriendo en http://localhost:${PORT}`);
});

// En Render (plan gratis) el servicio se duerme a los 15 min sin trafico
// entrante, y al despertar pierde los datos guardados en archivo. Esto lo
// mantiene despierto haciendose un ping a si mismo antes de ese limite.
// No sustituye un disco persistente, pero evita el caso mas comun de perdida
// de datos (inactividad de un rato) sin costo.
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    fetch(`${process.env.RENDER_EXTERNAL_URL}/salud`).catch(() => {});
  }, 10 * 60 * 1000);
}
