const express = require("express");
const crypto = require("crypto");

const app = express();

// Rota de healthcheck (Render precisa disso)
app.get("/", (req, res) => {
  res.status(200).send("Servidor online");
});

// Rota que gera o usuário e redireciona pro QR
app.get("/start", (req, res) => {
  const userId = crypto.randomBytes(4).toString("hex");
  res.redirect(`/connect/${userId}`);
});

// Simulação da rota do QR (aqui entra o venom depois)
app.get("/connect/:userId", (req, res) => {
  const { userId } = req.params;
  res.send(`Gerando QR Code para o usuário: ${userId}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});

