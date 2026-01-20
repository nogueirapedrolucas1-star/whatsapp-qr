const express = require("express");
const cors = require("cors");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");

const app = express();
app.use(cors());

let sessions = {};
let latestQR = null;

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ["Chrome", "Linux", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr) {
      latestQR = await QRCode.toDataURL(qr);
      console.log("QR Code gerado");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startWhatsApp();
    }

    if (connection === "open") {
      console.log("WhatsApp conectado com sucesso!");
    }
  });
}

startWhatsApp();

app.get("/", (req, res) => {
  res.send("Servidor WhatsApp rodando");
});

app.get("/qr", (req, res) => {
  if (!latestQR) {
    return res.status(404).json({ error: "QR ainda não gerado" });
  }
  res.json({ qr: latestQR });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor iniciado");
});
