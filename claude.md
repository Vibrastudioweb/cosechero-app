# Cosechero — brief del proyecto

## Que es
Marketplace B2B agricola. Conecta compradores y productores de un mercado mayorista para
que cualquiera pueda saber "que llego hoy" sin ir fisicamente a preguntar puesto por puesto.

Primer mercado: Makroval, Valera, Venezuela.
Vision a futuro: vender la plataforma como suscripcion mensual/anual a otros mercados
mayoristas de Venezuela.

## Lo que la app NO hace
- No procesa pagos de ningun tipo. Cosechero solo conecta; la transaccion de compra-venta
  (papa, tomate, etc.) queda fuera de la app, normalmente por WhatsApp.
- No cobra a productores ni compradores. El unico cobro es la suscripcion que el DUEÑO de
  Cosechero le cobra a cada MERCADO por usar la plataforma — eso vive completamente fuera
  del producto (factura aparte, no una funcion de software).

## Estructura de datos (pensar multi-mercado desde el dia 1)
Aunque el lanzamiento es solo en Makroval, cada registro debe estar asociado a un
`mercado_id` desde el inicio, para poder activar mercados nuevos sin reconstruir nada.

Entidades principales:
- **Mercado**: id, nombre, ciudad, estado (activo/pausado), fecha de vencimiento de pago
- **Usuario**: id, telefono, rol (productor | comprador), mercado_id
- **Publicacion "hoy"**: id, mercado_id, productor_id, producto, rubro, cantidad,
  presentacion, precio (numero o "consultar"), foto (opcional), telefono de contacto,
  fecha/hora de publicacion, estado (activo/expirado)
- **Busco** (comprador): id, mercado_id, comprador_id, producto, cantidad, entrega,
  urgencia, telefono
- **Ofrezco** (productor): id, mercado_id, productor_id, producto, cantidad, procedencia,
  disponibilidad, telefono

## Contexto de lanzamiento (importante para Claude Code)
Ya existen 10 productores y 2 compradores interesados en Makroval, organizados en grupos
de WhatsApp propios donde ya coordinan que llega cada dia. Cosechero no esta creando el
habito desde cero — le esta dando una cara mas organizada y publica a algo que ya sucede.
La primera version debe ser lo mas simple posible para mostrarles algo funcional pronto,
no una plataforma completa.

## Version 0 — la primera que se construye (minima, para mostrar ya)
Sin login por telefono todavia. Sin cuentas. Solo dos pantallas:
1. **Qué llegó hoy**: lista publica de publicaciones del dia en Makroval, boton
   "Contactar" que abre WhatsApp con el telefono del productor
2. **Publicar**: formulario corto y abierto (sin cuenta) — producto, cantidad,
   presentacion, precio o "consultar", telefono, foto opcional. Al publicar aparece
   automaticamente en "Qué llegó hoy"

Esto es intencionalmente basico: el objetivo es tener algo tangible para mostrarle a los
10 productores y 2 compradores ya interesados, no lanzar el producto completo.

## Pantallas del MVP (fase 1 completa — despues de probar la v0)
1. **Bienvenida**: logo + mensaje central + elegir rol (comprador / productor)
2. **Login por telefono**: numero + codigo de verificacion (patron tipo WhatsApp, sin
   contraseñas)
3. **Qué llegó hoy**: lista de publicaciones activas del mercado, filtro por categoria,
   boton "Contactar" que abre WhatsApp con el telefono del productor
4. **Publicar (productor)**: formulario corto — producto, cantidad, presentacion, precio o
   "consultar", telefono, foto opcional. Al publicar aparece automaticamente en "Qué llegó
   hoy"

## Pantallas de fase 2 (no construir en el MVP, pero la base de datos ya las contempla)
- **Busco**: comprador publica lo que necesita, productores lo ven
- **Ofrezco**: productor publica lo que tiene disponible sin esperar a estar en el mercado
- **Panel de administrador**: para el dueño de Cosechero — activar/pausar mercados, ver
  metricas (productores activos, publicaciones del dia), sin ningun cobro dentro del panel

## Marca
- Nombre: **Cosechero**
- Tagline: "Comercio mayorista"
- Paleta: naranja #E85D04 (color principal), amarillo #FFBA08 (acento), verde #2D6A4F
  (reservado solo para el boton de "Contactar"/WhatsApp), fondo crema #FFF8EC
- Logo: icono de una "C" con una hoja, estilo simple, en verde/naranja segun el fondo
- Tono de voz: cercano y directo, no corporativo — la audiencia principal no esta
  acostumbrada a apps complejas

## Prioridades de diseño (importante)
- Formularios cortos: la gente publica desde el celular, muchas veces parada junto a un
  camion, con conexion limitada
- Sin contraseñas — login por telefono
- Velocidad ante todo para el comprador: entrar, ver que hay hoy, contactar. Nada de
  catalogos que exploran de mas
- Foto siempre opcional, nunca obligatoria

## Que sigue despues del MVP
1. Validar con 10-15 productores/compradores reales de Makroval antes de invertir mas
2. Ajustar segun uso real (2-3 semanas)
3. Construir fase 2 (busco/ofrezco + panel admin)
4. Preparar material para vender a otros mercados mayoristas de Venezuela
