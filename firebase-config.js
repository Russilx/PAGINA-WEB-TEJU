// ============================================================
// CONFIGURACIÓN DE FIREBASE — TEJU SHOES
// ------------------------------------------------------------
// 1. Andá a https://console.firebase.google.com/
// 2. Creá un proyecto nuevo (gratis, no pide tarjeta).
// 3. Adentro del proyecto: ⚙️ Configuración del proyecto > "Tus apps"
//    > ícono </> (Web) > registrá una app.
// 4. Te va a mostrar un objeto firebaseConfig como el de abajo.
//    Copiá esos valores y pegalos acá reemplazando los de ejemplo.
// 5. En el menú lateral: Firestore Database > Crear base de datos
//    (elegí "modo de prueba" para arrancar rápido).
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyC4DkV5HNuXODT8NEWCDxJo0aU7jgKvUUc",
  authDomain: "tejushoes.firebaseapp.com",
  projectId: "tejushoes",
  storageBucket: "tejushoes.firebasestorage.app",
  messagingSenderId: "156925657370",
  appId: "1:156925657370:web:4e830243c906256fa5eca3"
};

// Clave para entrar al panel de administración (cambiala).
export const ADMIN_PASSWORD = "elestu2.0";

// ============================================================
// IMGBB — se usa para subir las fotos de los productos desde el
// panel de administración (así no depende del plan pago de Firebase).
// ------------------------------------------------------------
// Conseguida gratis en https://api.imgbb.com/
// ============================================================
export const IMGBB_API_KEY = "c87b83b1381fb0eb3984df2d0f485e95";

// ============================================================
// WHATSAPP — número al que le llega la coordinación de cada
// pedido (envío/pago) y el botón de "Soporte" del sitio.
// Poné tu número completo, sin espacios ni el "+", con código
// de país y de área. Ej: Argentina 11 1234-5678 -> "5491112345678"
// ============================================================
export const WHATSAPP_PEDIDOS = "5491164535290";

// ============================================================
// INSTAGRAM — se usa en el pie de página del sitio.
// ============================================================
export const INSTAGRAM_TEJU = "https://www.instagram.com/teju.shoes/";

// ============================================================
// DATOS DE PAGO — se muestran en el paso final del carrito para
// que la clienta sepa cómo pagar. No hay saldo ni cuentas: cada
// pedido se paga por fuera (transferencia, efectivo contra
// entrega, u otro método que definas) y vos lo confirmás a mano
// desde el panel de administración.
// ============================================================
export const DATOS_PAGO = {
  transferencia: {
    titular: "Nombre Apellido",
    cbu: "0000000000000000000000",
    alias: "TEJU.SHOES"
  },
  efectivo: {
    nota: "Pago en efectivo al recibir el pedido (contra entrega)."
  },
  otro: {
    nota: "Coordinamos el medio de pago por WhatsApp."
  }
};

// ============================================================
// TELEGRAM (opcional) — aviso automático a vos cuando entra un
// pedido nuevo. Si no lo querés usar, dejá los valores como están;
// el sitio funciona igual, simplemente no manda el aviso.
// ------------------------------------------------------------
// 1. Abrí Telegram y buscá el contacto @BotFather.
// 2. Mandale el mensaje: /newbot
//    Te va a pedir un nombre (cualquiera) y un username que termine
//    en "bot" (ej: teju_shoes_avisos_bot).
// 3. Al terminar te da un "token" con este formato:
//    123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// 4. Buscá tu bot recién creado por su username y mandale
//    cualquier mensaje (ej: "hola") para "activar" la conversación.
// 5. Buscá el contacto @userinfobot, hablale, y te va a devolver
//    tu "Id" (un número). Ese es tu TELEGRAM_CHAT_ID.
// ============================================================
export const TELEGRAM_BOT_TOKEN = "";
export const TELEGRAM_CHAT_ID = "";
