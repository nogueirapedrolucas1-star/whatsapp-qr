const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');

const app = express();
let qrImage = null;

// Cria o cliente do WhatsApp (igual WhatsApp Web)
const client = new Client({
    authStrategy: new LocalAuth()
});

// Quando o WhatsApp gerar o QR Code
client.on('qr', async (qr) => {
    qrImage = await qrcode.toDataURL(qr);
    console.log('QR Code gerado, abra /qr no navegador');
});

// Quando conectar
client.on('ready', () => {
    console.log('WhatsApp conectado com sucesso!');
});

// Inicia o WhatsApp
client.initialize();

// Página que mostra o QR Code
app.get('/qr', (req, res) => {
    if (!qrImage) {
        return res.send('QR Code ainda não foi gerado, aguarde...');
    }

    res.send(`
        <html>
            <head>
                <title>Conectar WhatsApp</title>
            </head>
            <body style="text-align:center; font-family:Arial">
                <h2>Escaneie o QR Code com seu WhatsApp</h2>
                <img src="${qrImage}" />
            </body>
        </html>
    `);
});

// Liga o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
