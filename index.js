const express = require('express')
const path = require('path')
const { Pool } = require('pg')

const app = express()
const PORT = process.env.PORT || 3000

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://prova1_user:SJh7gMZ546v5ahmmOzTjb1thZaHgZfwy@dpg-d95o4sgjs32c7384qdtg-a/prova1'

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY DEFAULT 1,
        count INTEGER DEFAULT 0
      )
    `)
    const result = await pool.query('SELECT count FROM visits WHERE id = 1')
    if (result.rows.length === 0) {
      await pool.query('INSERT INTO visits (id, count) VALUES (1, 0)')
    }
    console.log('Database inizializzato')
  } catch (err) {
    console.error('Errore database:', err.message)
  }
}

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const messages = []

const features = [
  { icon: 'brain', title: 'Quiz interattivi', desc: 'Domande su phishing, malware, password e social engineering.' },
  { icon: 'book-open', title: 'Moduli formativi', desc: 'Contenuti chiari e aggiornati sulle ultime minacce.' },
  { icon: 'bar-chart-2', title: 'Progressi personali', desc: 'Traccia i tuoi miglioramenti nel tempo.' },
  { icon: 'award', title: 'Badge e certificati', desc: 'Riconoscimenti per completare i percorsi.' },
  { icon: 'users', title: 'Modalità classe', desc: 'Quiz per gruppi e sfide tra studenti.' },
  { icon: 'smartphone', title: 'Mobile friendly', desc: 'Impara ovunque, dallo smartphone.' },
]

const team = [
  { name: 'Marco R.', role: 'Backend & API', initials: 'MR' },
  { name: 'Giulia T.', role: 'Frontend & UI', initials: 'GT' },
  { name: 'Alessandro B.', role: 'Content & Quiz', initials: 'AB' },
  { name: 'Sofia L.', role: 'Design', initials: 'SL' },
]

const quiz = [
  {
    question: 'Ricevi un\'email dalla tua banca che ti chiede di cliccare un link per verificare il conto. Cosa fai?',
    options: [
      'Clicco subito il link',
      'Verifico il mittente e vado sul sito ufficiale manualmente',
      'Rispondo chiedendo info',
      'Inoltro a tutti i contatti'
    ],
    correct: 1
  }
]

app.get('/api/features', (req, res) => res.json(features))
app.get('/api/team', (req, res) => res.json(team))
app.get('/api/quiz', (req, res) => res.json(quiz[0]))

app.get('/api/visits', async (req, res) => {
  try {
    await pool.query('UPDATE visits SET count = count + 1 WHERE id = 1')
    const result = await pool.query('SELECT count FROM visits WHERE id = 1')
    res.json({ count: result.rows[0].count })
  } catch (err) {
    console.error('Errore visite:', err.message)
    res.status(500).json({ error: 'Errore database' })
  }
})

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' })
  }
  messages.push({ name, email, message, date: new Date().toISOString() })
  console.log(`Messaggio da ${name} <${email}>: ${message}`)
  res.json({ ok: true })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
