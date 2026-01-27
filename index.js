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
  res.send(`
    <h1>WhatsApp QR Code</h1>
    <p>${qrCodeGlobal ? 'Escaneie com seu WhatsApp' : 'QR code carregando, aguarde alguns segundos...'}</p>
    <img id="qr" src="${qrCodeGlobal ? 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent(qrCodeGlobal) + '&size=200x200' : ''}" />
    <script>
      // Atualiza a imagem do QR code a cada 5 segundos
      setInterval(() => {
        const qr = document.getElementById('qr');
        if (${qrCodeGlobal ? 'true' : 'false'}) {
          qr.src = "https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeGlobal)}&size=200x200&rand=" + Math.random();
        }
      }, 5000);
    </script>
  `);
});

// Inicializa o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
