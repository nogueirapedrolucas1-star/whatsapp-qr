const express = require('express')
const qrcode = require('qrcode')
const { Client, LocalAuth } = require('whatsapp-web.js')
const { createClient } = require('@supabase/supabase-js')

const app = express()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

app.get('/connect/:userId', async (req, res) => {
  const userId = req.params.userId

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId })
  })

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

  client.on('ready', async () => {
    console.log('WhatsApp conectado para:', userId)

    await supabase.from('whatsapp_sessions').insert({
      user_id: userId,
      session_name: userId
    })
  })

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

