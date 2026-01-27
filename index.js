const venom = require('venom-bot');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

let qrCodeGlobal = null;

// Cria a sessão do WhatsApp, forçando geração de QR code
venom
  .create({
    session: 'whatsapp-session',
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
    multidevice: true,
    deleteSessionData: true // força gerar QR code sempre
  })
  .then(client => start(client))
  .catch(erro => console.log('Erro ao iniciar Venom:', erro));

// Função para capturar eventos
function start(client) {
  console.log('Venom-bot iniciado');

  // Evento para capturar o QR code
  client.onStateChange((state) => {
    if (state === 'QR') {
      client.onQr((qr) => {
        qrCodeGlobal = qr;
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
      <img id="qr" src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeGlobal)}&size=200x200" />
      <script>
        // Atualiza QR code a cada 15 segundos
        setInterval(() => {
          document.getElementById('qr').src = "https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeGlobal)}&size=200x200&rand=" + Math.random();
        }, 15000);
      </script>
    `);
  } else {
    res.send(`<h1>Servidor rodando na porta ${PORT}</h1><p>QR code ainda não gerado, recarregue a página em alguns segundos</p>`);
  }
});

// Inicializa o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
