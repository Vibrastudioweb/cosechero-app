const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'publicaciones.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// V0: un solo mercado. Cada registro igual guarda mercado_id para poder
// activar mercados nuevos despues sin tocar el modelo de datos.
const MERCADO_ID = 'makroval';
const MERCADO_NOMBRE = 'Makroval, Valera';

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

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

function esDeHoy(fechaISO) {
  const fecha = new Date(fechaISO);
  const hoy = new Date();
  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
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

app.get('/', (req, res) => {
  const todas = leerPublicaciones().filter((p) => p.mercado_id === MERCADO_ID);
  const deHoy = todas
    .filter((p) => esDeHoy(p.fecha_publicacion))
    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
    .map((p) => ({
      ...p,
      whatsappHref: `https://wa.me/${normalizarTelefonoWhatsapp(p.telefono)}?text=${encodeURIComponent(
        `Hola! Vi tu publicacion de ${p.producto} en Cosechero, ¿todavia esta disponible?`
      )}`,
    }));

  res.render('index', {
    mercadoNombre: MERCADO_NOMBRE,
    publicaciones: deHoy,
    ok: req.query.ok === '1',
  });
});

app.get('/publicar', (req, res) => {
  res.render('publicar', { error: null, valores: {} });
});

app.post('/publicar', (req, res, next) => {
  upload.single('foto')(req, res, (err) => {
    if (err) {
      return res.status(400).render('publicar', { error: err.message, valores: req.body });
    }

    const { producto, cantidad, presentacion, tipoPrecio, precio, telefono } = req.body;

    if (!producto || !cantidad || !presentacion || !telefono) {
      return res.status(400).render('publicar', {
        error: 'Falta llenar producto, cantidad, presentacion o telefono.',
        valores: req.body,
      });
    }

    const precioFinal = tipoPrecio === 'consultar' ? 'consultar' : (precio || '').trim();
    if (!precioFinal) {
      return res.status(400).render('publicar', {
        error: 'Pon un precio o marca "Consultar precio".',
        valores: req.body,
      });
    }

    const nueva = {
      id: crypto.randomUUID(),
      mercado_id: MERCADO_ID,
      productor_id: null,
      producto: producto.trim(),
      rubro: null,
      cantidad: cantidad.trim(),
      presentacion: presentacion.trim(),
      precio: precioFinal,
      foto: req.file ? `/uploads/${req.file.filename}` : null,
      telefono: telefono.trim(),
      fecha_publicacion: new Date().toISOString(),
      estado: 'activo',
    };

    const lista = leerPublicaciones();
    lista.push(nueva);
    guardarPublicaciones(lista);

    res.redirect('/?ok=1');
  });
});

app.listen(PORT, () => {
  console.log(`Cosechero corriendo en http://localhost:${PORT}`);
});
