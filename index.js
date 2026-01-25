import express from 'express'
import qrcode from 'qrcode'
import { Client, LocalAuth } from 'whatsapp-web.js'
import { createClient } from '@supabase/supabase-js'

const app = express()

const supabase = createClient(
  'SUA_SUPABASE_URL',
  'SUA_SUPABASE_SERVICE_ROLE_KEY'
)

// Conectar WhatsApp por usuário
app.get('/connect/:userId', async (req, res) => {
  const userId = req.params.userId

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId })
  })

  client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr)
    res.send(`<h2>Escaneie o QR</h2><img src="${qrImage}" />`)
  })

  client.on('ready', async () => {
    console.log('WhatsApp conectado:', userId)
  })

  // Quando receber mensagem
  client.on('message', async (msg) => {
    // Salva no Supabase
    await supabase.from('whatsapp_messages').insert({
      user_id: userId,
      from_number: msg.from,
      message: msg.body
    })

    // Resposta automática
    const resposta = `Olá! Recebemos sua mensagem: "${msg.body}"
Em breve nosso sistema irá responder automaticamente 😊`

    await msg.reply(resposta)
  })

  client.initialize()
})

app.listen(3000, () => {
  console.log('Automação WhatsApp ativa na porta 3000')
})
