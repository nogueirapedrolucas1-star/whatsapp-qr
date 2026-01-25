const express = require('express')
const venom = require('venom-bot')
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const app = express()

// Conexão Supabase via variáveis do Render
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Guarda clientes ativos
const clients = {}

// Página inicial → gera ID automático
app.get('/', async (req, res) => {
  const userId = crypto.randomBytes(4).toString('hex')
  res.redirect(`/connect/${userId}`)
})

// Rota principal para conectar WhatsApp
app.get('/connect/:userId', async (req, res) => {
  const userId = req.params.userId

  if (clients[userId]) {
    return res.send(`
      <h2>WhatsApp já conectado para ${userId}</h2>
      <p>Você pode enviar mensagens normalmente.</p>
    `)
  }

  // Inicializa cliente do Venom
  venom.create(
    userId,
    (base64Qr) => {
      // QR Code em base64
      const qrImage = `data:image/png;base64,${base64Qr}`
      res.send(`
        <html>
          <body style="text-align:center;font-family:Arial">
            <h2>Escaneie o QR Code para conectar seu WhatsApp</h2>
            <img src="${qrImage}" />
          </body>
        </html>
      `)
    },
    undefined, // status session callback opcional
    {
      headless: true,
      useChrome: false, // não precisa do Chrome instalado
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  ).then((client) => {
    clients[userId] = client
    console.log('WhatsApp conectado para:', userId)

    // Mensagens recebidas
    client.onMessage(async (msg) => {
      await supabase.from('whatsapp_messages').insert({
        user_id: userId,
        from_number: msg.from,
        message: msg.body
      })

      await client.sendText(msg.from, 'Olá! Sua mensagem foi recebida e a IA vai responder em breve 🤖')
    })
  }).catch((err) => {
    console.error('Erro ao iniciar o cliente Venom:', err)
    res.send(`<p>Erro ao iniciar o WhatsApp: ${err}</p>`)
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT)
})


