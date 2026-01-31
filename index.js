const express = require("express");
const venom = require("venom-bot");

const app = express();
let qrCodeBase64 = null;

venom.create(
  {
    session: "ia-whatsapp",
    headless: true
  },
  (base64Qr) => {
    qrCodeBase64 = base64Qr;
    console.log("QR Code recebido");
  }
).then((client) => {
  console.log("WhatsApp conectado");
}).catch(err => {
  console.error("Erro:", err);
});

app.get("/", (req, res) => {
  res.send("Servidor online. Acesse /qr");
});

app.get("/qr", (req, res) => {
  if (!qrCodeBase64) {
    return res.send("QR ainda não gerado, aguarde...");
  }

  res.send(`
    <h2>Escaneie o QR Code</h2>
    <img src="${qrCodeBase64}" />
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
