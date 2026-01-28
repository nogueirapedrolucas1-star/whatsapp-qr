const express = require("express");
const { create } = require("venom-bot");

const app = express();
let qrCodeGlobal = "";

create({
  session: "whatsapp-session",
  multidevice: true,
  headless: true,
  disableWelcome: true,
  autoClose: 0
}, (base64Qr) => {
  console.log("QR Code recebido!");
  qrCodeGlobal = base64Qr;
}).then((client) => {
  console.log("WhatsApp conectado com sucesso!");
}).catch((err) => {
  console.log("Erro ao iniciar Venom:", err);
});

app.get("/", (req, res) => {
  res.send("Servidor online. Acesse /qr para ver o QR code.");
});

app.get("/qr", (req, res) => {
  if (!qrCodeGlobal) {
    return res.send("");
  }
  res.send(qrCodeGlobal);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
