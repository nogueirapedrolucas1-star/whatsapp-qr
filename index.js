import express from 'express'
import qrcode from 'qrcode'
import { Client, LocalAuth } from 'whatsapp-web.js'
import { createClient } from '@supabase/supabase-js'

const app = express()

// Conexão com Supabase usando variáveis do Render
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Rota para gerar QR Code por usuário
app.get('/connect/:userId', async (req, res) => {
  const userId = req.params.userId

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId })
  })

  // Quando gerar o QR
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

  // Quando conectar com sucesso
  client.on('ready', async () => {
    console.log('WhatsApp conectado para o usuário:', userId)

    await supabase.from('whatsapp_sessions').insert({
      user_id: userId,
      session_name: userId
    })
  })

  // Quando receber mensagem
  client.on('message', async (msg) => {
    // Salva no banco
    await supabase.from('whatsapp_messages').insert({
      user_id: userId,
      from_number: msg.from,
      message: msg.body
    })

    // Resposta automática
    await msg.reply(
      `Olá! Recebemos sua mensagem:\n"${msg.body}"\n\nEm breve nosso sistema irá responder automaticamente 🤖`
    )
  })

  client.initialize()
})

// Porta exigida pelo Render
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT)
})

