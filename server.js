const express = require("express");
const cors = require("cors");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");

const app = express();
app.use(cors());

let sessions = {};

async function startSession(id) {
  const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${id}`);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    if (update.qr) {
      const qr = await QRCode.toDataURL(update.qr);
      sessions[id].qr = qr;
      console.log("QR gerado para:", id);
    }
  });

  sessions[id] = { sock, qr: null };
}

app.get("/", (req, res) => {
  res.send("Servidor WhatsApp QR rodando");
});

app.get("/connect/:id", async (req, res) => {
  const id = req.params.id;

  if (!sessions[id]) {
    await startSession(id);
  }

  const checkQR = setInterval(() => {
    if (sessions[id].qr) {
      clearInterval(checkQR);
      res.json({ qr: sessions[id].qr });
    }
  }, 1500);

  setTimeout(() => {
    clearInterval(checkQR);
    if (!sessions[id].qr) {
      res.status(500).json({ error: "QR não gerado ainda, recarregue a página." });
    }
  }, 20000);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
