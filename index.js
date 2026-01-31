const express = require("express");
const venom = require("venom-bot");

const app = express();
let qrCode = null;

venom.create(
  {
    session: "teste-cliente",
    headless: true
  },
  (base64Qr) => {
    qrCode = base64Qr;
    console.log("QR Code gerado");
  }
).then((client) => {
  console.log("WhatsApp conectado");

  client.onMessage(async (message) => {
    if (!message.isGroupMsg) {
      await client.sendText(
        message.from,
        "🤖 IA de teste ativa! Mensagem recebida com sucesso."
      );
    }
  });
}).catch((err) => {
  console.log("Erro ao iniciar WhatsApp:", err);
});

app.get("/", (req, res) => {
  res.send("Servidor online. Acesse /qr");
});

app.get("/qr", (req, res) => {
  if (!qrCode) {
    return res.send("QR code ainda não gerado, aguarde alguns segundos...");
  }

  res.send(`
    <h2>Escaneie o QR Code</h2>
    <img src="${qrCode}" />
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
