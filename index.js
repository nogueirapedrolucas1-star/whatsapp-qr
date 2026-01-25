const express = require('express')
const qrcode = require('qrcode')
const { Client, LocalAuth } = require('whatsapp-web.js')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto') // Para gerar ID único

const app = express()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const clients = {} // Clientes ativos

// Página inicial
app.get('/', async (req, res) => {
  // Gera ID único automático
  const userId = crypto.randomBytes(4).toString('hex')
  res.redirect(`/connect/${userId}`)
})

// Rota principal para gerar QR Code
app.get('/connect/:userId', async (req, res) => {
  const userId = req.params.userId

  // Se cliente já existe, mostra mensagem
  if (clients[userId]) {
    return res.send(`
      <h2>WhatsApp já conectado para ${userId}</h2>
      <p>Você pode enviar mensagens normalmente.</p>
    `)
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId })
  })
  clients[userId] = client

  let sent = false

  // QR Code
  client.on('qr', async (qr) => {
    if (!sent) {
      const qrImage = await qrcode.toDataURL(qr)
      res.send(`
        <html>
          <body style="text-align:center;font-family:Arial">
            <h2>Escaneie o QR Code para conectar seu WhatsApp</h2>
            <img src="${qrImage}" />
          </body>
        </html>
      `)
      sent = true
    }
  })

  // Quando o WhatsApp estiver pronto
  client.on('ready', async () => {
    console.log('WhatsApp conectado para:', userId)

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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT)
})


