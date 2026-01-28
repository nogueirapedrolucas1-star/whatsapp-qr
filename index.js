const express = require("express");
const { create } = require("venom-bot");

const app = express();
let qrCodeGlobal = "";

create({
  session: "whatsapp-session",
  multidevice: true,
  headless: true
}, (base64Qr) => {
  qrCodeGlobal = base64Qr;
  console.log("QR Code gerado!");
}).then((client) => {
  console.log("WhatsApp conectado com sucesso!");
}).catch((err) => {
  console.log("Erro ao iniciar Venom:", err);
});

app.get("/", (req, res) => {
  res.send("Servidor rodando. Acesse /qr para pegar o QR code.");
});

app.get("/qr", (req, res) => {
  res.send(qrCodeGlobal);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
