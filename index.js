import express from 'express'
import qrcode from 'qrcode'
import { Client, LocalAuth } from 'whatsapp-web.js'
import { createClient } from '@supabase/supabase-js'

const app = express()

const supabase = createClient(
  'SUA_SUPABASE_URL',
  'SUA_SUPABASE_SERVICE_ROLE_KEY'
)

// Rota para gerar QR por usuário
app.get('/connect/:userId', async (req, res) => {
  const userId = req.params.userId

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId })
  })

  client.on('qr', async (qr) => {
    const qrImage = await qrcode.toDataURL(qr)
    res.send(`
      <h2>Escaneie para conectar seu WhatsApp</h2>
      <img src="${qrImage}" />
    `)
  })

  client.on('ready', async () => {
    await supabase.from('whatsapp_sessions').insert({
      user_id: userId,
      session_name: userId
    })

    console.log('WhatsApp conectado para o usuário:', userId)
  })

  client.initialize()
})

app.listen(3000, () => {
  console.log('Sistema de QR rodando na porta 3000')
})


// Liga o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
