const express = require('express')
const path = require('path')
const session = require('express-session')
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
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('Database inizializzato')
  } catch (err) {
    console.error('Errore database:', err.message)
  }
}

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: 'cyberguard-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}))

const ADMIN_USER = 'admin'
const ADMIN_PASS = '1234'

function requireAuth(req, res, next) {
  if (req.session.loggedIn) return next()
  res.status(401).json({ error: 'Non autorizzato' })
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true
    res.json({ ok: true })
  } else {
    res.status(401).json({ error: 'Credenziali errate' })
  }
})

app.post('/api/logout', (req, res) => {
  req.session.destroy()
  res.json({ ok: true })
})

app.get('/api/auth/check', (req, res) => {
  res.json({ loggedIn: !!req.session.loggedIn })
})

app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, LEFT(content, 200) as excerpt, created_at FROM news ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.get('/api/news/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News non trovata' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.post('/api/admin/news', requireAuth, async (req, res) => {
  const { title, content } = req.body
  if (!title || !content) return res.status(400).json({ error: 'Titolo e contenuto obbligatori' })
  try {
    const result = await pool.query('INSERT INTO news (title, content) VALUES ($1, $2) RETURNING *', [title, content])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.put('/api/admin/news/:id', requireAuth, async (req, res) => {
  const { title, content } = req.body
  if (!title || !content) return res.status(400).json({ error: 'Titolo e contenuto obbligatori' })
  try {
    const result = await pool.query('UPDATE news SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News non trovata' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.delete('/api/admin/news/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})

app.get('/news/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'news-detail.html'))
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
