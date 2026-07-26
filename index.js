// ============================================================
// COTIZADOR DE ENVÍO — proxy seguro hacia la API de MiCorreo
// (Correo Argentino).
// ------------------------------------------------------------
// Este archivo corre en el servidor (Cloud Functions), nunca en
// el navegador. Por eso es el único lugar donde es seguro tener
// el usuario/contraseña de la API: no viajan al sitio público.
//
// Ver /functions/README.md para las instrucciones de puesta en
// marcha (cuenta MiCorreo, credenciales, deploy).
// ============================================================

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const MICORREO_USER = defineSecret("MICORREO_USER");
const MICORREO_PASSWORD = defineSecret("MICORREO_PASSWORD");
const MICORREO_CUSTOMER_ID = defineSecret("MICORREO_CUSTOMER_ID");

const BASE_URL = "https://api.correoargentino.com.ar/micorreo/v1";

// El token JWT dura horas; lo guardamos en memoria entre invocaciones
// "calientes" de la función para no pedir uno nuevo en cada cotización.
let tokenCache = { token: null, expiraEn: 0 };

async function obtenerToken(usuario, password) {
  const ahora = Date.now();
  if (tokenCache.token && tokenCache.expiraEn > ahora + 5000) {
    return tokenCache.token;
  }

  const auth = Buffer.from(`${usuario}:${password}`).toString("base64");
  const resp = await fetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: { "Authorization": `Basic ${auth}` }
  });

  if (!resp.ok) {
    throw new Error("No se pudo autenticar con MiCorreo. Revisá las credenciales configuradas.");
  }

  const data = await resp.json();
  tokenCache = { token: data.token, expiraEn: new Date(data.expires).getTime() };
  return data.token;
}

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

exports.cotizarEnvio = onRequest(
  {
    secrets: [MICORREO_USER, MICORREO_PASSWORD, MICORREO_CUSTOMER_ID],
    region: "southamerica-east1",
    cors: true
  },
  async (req, res) => {
    setCors(res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido." });
      return;
    }

    const { postalCodeOrigin, postalCodeDestination, weight, height, width, length } = req.body || {};

    if (!postalCodeOrigin || !postalCodeDestination) {
      res.status(400).json({ error: "Faltan los códigos postales de origen o destino." });
      return;
    }

    try {
      const token = await obtenerToken(MICORREO_USER.value(), MICORREO_PASSWORD.value());

      const rateResp = await fetch(`${BASE_URL}/rates`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: MICORREO_CUSTOMER_ID.value(),
          postalCodeOrigin: String(postalCodeOrigin),
          postalCodeDestination: String(postalCodeDestination),
          dimensions: {
            weight: Math.round(Number(weight) || 1000),
            height: Math.round(Number(height) || 10),
            width: Math.round(Number(width) || 20),
            length: Math.round(Number(length) || 30)
          }
        })
      });

      const data = await rateResp.json();

      if (!rateResp.ok) {
        res.status(rateResp.status).json({ error: data.message || "No se pudo cotizar el envío." });
        return;
      }

      res.status(200).json(data);
    } catch (err) {
      console.error("Error al cotizar envío:", err);
      res.status(500).json({ error: "Error interno al cotizar el envío. Probá de nuevo en unos minutos." });
    }
  }
);