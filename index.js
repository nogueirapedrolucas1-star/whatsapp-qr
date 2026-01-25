const express = require('express')
const qrcode = require('qrcode')
const { Client, LocalAuth } = require('whatsapp-web.js')
const { createClient } = require('@supabase/supabase-js')

const app = express()

// Conexão Supabase via variáveis do Render
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Página inicial
app.get('/', (req, res) => {
  res.send(`
    <h2>Bem-vindo ao WhatsApp QR</h2>
    <p>Para gerar seu QR Code, acesse <code>/connect/SEU_ID</code></p>
    <p>Exemplo: <a href="/connect/teste1">/connect/teste1</a></p>
  `)
})

// Rota para gerar QR Code
app.get('/connect/:userId', async (req, res) => {
  const userId = req.params.userId

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId })
  })

  // QR Code
  client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr)
    res.send(`
      <html>
        <body style="text-align:center;font-family:Arial">
          <h2>Escaneie o QR Code para conectar seu WhatsApp</h2>
          <img src="${qrImage}" />
        </body>
      </html>
    `)
  })

  // Quando conectado
  client.on('ready', async () => {
    console.log('WhatsApp conectado para:', userId)

    // Salva no Supabase
    await supabase.from('whatsapp_sessions').insert({
      user_id: userId,
      session_name: userId
    })
  })

  // Mensagens recebidas
  client.on('message', async (msg) => {
    await supabase.from('whatsapp_messages').insert({
      user_id: userId,
      from_number: msg.from,
      message: msg.body
    })

    await msg.reply('Olá! Sua mensagem foi recebida e a IA vai responder em breve 🤖')
  })

  client.initialize()
})

// Porta exigida pelo Render
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT)
})
