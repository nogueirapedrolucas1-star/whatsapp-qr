const venom = require('venom-bot');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

let qrCodeGlobal = null;

// Cria a sessão do WhatsApp
venom
  .create({
    session: 'whatsapp-session', // nome da sessão
    puppeteerOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ],
    },
    multidevice: true
  })
  .then(client => start(client))
  .catch(erro => console.log('Erro ao iniciar Venom:', erro));

// Função para capturar eventos
function start(client) {
  console.log('Venom-bot iniciado');

  // Captura o QR code
  client.onStateChange((state) => {
    if (state === 'QR') {
      client.onQr((qr) => {
        qrCodeGlobal = qr; // salva o QR code
        console.log('QR code gerado');
      });
    }
  });
}

// Rota principal para mostrar QR code
app.get('/', (req, res) => {
  if (qrCodeGlobal) {
    // Usa serviço externo para gerar a imagem do QR code
    res.send(`
      <h1>WhatsApp QR Code</h1>
      <p>Escaneie com seu WhatsApp para testar</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeGlobal)}&size=200x200" />
    `);
  } else {
    res.send(`<h1>Servidor rodando na porta ${PORT}</h1><p>QR code ainda não gerado, recarregue a página em alguns segundos</p>`);
  }
});

// Inicializa o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

