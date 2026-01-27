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
    deleteSessionData: true // força gerar QR code novo
  })
  .then(client => start(client))
  .catch(erro => console.log('Erro ao iniciar Venom:', erro));

function start(client) {
  console.log('Venom-bot iniciado');

  // Captura o QR code assim que o WhatsApp Web pedir login
  client.onStateChange((state) => {
    if (state === 'QR') {
      client.onQr((qr) => {
        qrCodeGlobal = qr;
        console.log('QR code gerado');
      });
    }
  });
}

// Rota principal
app.get('/', (req, res) => {
  res.send(`
    <h1>WhatsApp QR Code</h1>
    <p id="status">${qrCodeGlobal ? 'Escaneie com seu WhatsApp' : 'QR code carregando, aguarde alguns segundos...'}</p>
    <img id="qr" src="" />
    <script>
      async function atualizarQR() {
        try {
          const response = await fetch('/qr');
          const data = await response.text();
          const qrImg = document.getElementById('qr');
          const status = document.getElementById('status');
          if(data) {
            qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?data=" + encodeURIComponent(data) + "&size=200x200&rand=" + Math.random();
            status.innerText = "Escaneie com seu WhatsApp";
          } else {
            status.innerText = "QR code carregando, aguarde alguns segundos...";
          }
        } catch(e) {
          console.log("Erro ao atualizar QR:", e);
        }
      }

      // Atualiza QR a cada 5 segundos
      setInterval(atualizarQR, 5000);
      atualizarQR(); // roda na primeira vez
    </script>
  `);
});

// Rota que retorna o QR code atual
app.get('/qr', (req, res) => {
  res.send(qrCodeGlobal || '');
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
