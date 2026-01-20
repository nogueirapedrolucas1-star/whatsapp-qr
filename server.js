const express = require("express");
const cors = require("cors");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");

const app = express();
app.use(cors());

let sessions = {};

async function startSession(id) {
  const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${id}`);
  const sock = makeWASocket({ auth: state });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    if (update.qr) {
      const qr = await QRCode.toDataURL(update.qr);
      sessions[id].qr = qr;
    }
  });

  sessions[id] = { sock, qr: null };
}

app.get("/connect/:id", async (req, res) => {
  const id = req.params.id;
  if (!sessions[id]) await startSession(id);

  const interval = setInterval(() => {
    if (sessions[id].qr) {
      clearInterval(interval);
      res.json({ qr: sessions[id].qr });
    }
  }, 1000);
});

app.listen(process.env.PORT || 3000);
