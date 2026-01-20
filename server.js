const express = require("express");
const QRCode = require("qrcode");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
let qrBase64 = null;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    if (update.qr) {
      qrBase64 = await QRCode.toDataURL(update.qr);
      console.log("QR CODE GERADO");
    }
  });
}

start();

app.get("/", (req, res) => {
  res.send("Servidor WhatsApp rodando");
});

app.get("/qr", (req, res) => {
  if (!qrBase64) return res.send("QR ainda não gerado, aguarde 10 segundos e recarregue.");
  res.json({ qr: qrBase64 });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor iniciado");
});

