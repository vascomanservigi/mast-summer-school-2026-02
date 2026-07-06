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
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        initials TEXT,
        "order" INTEGER DEFAULT 0
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS features (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT DEFAULT "check-circle",
        "order" INTEGER DEFAULT 0
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT,
        category TEXT DEFAULT 'documento',
        "order" INTEGER DEFAULT 0
      )
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        read BOOLEAN DEFAULT FALSE
      )
    `)

    const settingsCheck = await pool.query("SELECT value FROM settings WHERE key = 'site_title'")
    if (settingsCheck.rows.length === 0) {
      await pool.query(`INSERT INTO settings (key, value) VALUES 
        ('site_title', 'CyberGuard'),
        ('site_subtitle', 'Piattaforma di Cybersecurity'),
        ('site_description', 'Impara a proteggerti nel mondo digitale con corsi interattivi e quiz sulla cybersecurity.'),
        ('contact_email', 'cyberguard@example.it'),
        ('contact_address', 'Bologna, Italia')
      `)
    }

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

// === PUBLIC API ===

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings')
    const settings = {}
    result.rows.forEach(r => settings[r.key] = r.value)
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
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
    if (result.rows.length === 0) return res.status(404).json({ error: 'News non trovata' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.get('/api/team', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team ORDER BY "order", id')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.get('/api/features', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM features ORDER BY "order", id')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.get('/api/resources', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM resources ORDER BY "order", id')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) return res.status(400).json({ error: 'Tutti i campi sono obbligatori' })
  try {
    await pool.query('INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)', [name, email, message])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

// === AUTH ===

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

// === ADMIN API ===

// Settings
app.get('/api/admin/settings', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings')
    const settings = {}
    result.rows.forEach(r => settings[r.key] = r.value)
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.put('/api/admin/settings', requireAuth, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await pool.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value])
    }
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

// News CRUD
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
    if (result.rows.length === 0) return res.status(404).json({ error: 'News non trovata' })
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

// Team CRUD
app.post('/api/admin/team', requireAuth, async (req, res) => {
  const { name, role, bio, initials, order } = req.body
  if (!name || !role) return res.status(400).json({ error: 'Nome e ruolo obbligatori' })
  const init = initials || name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  try {
    const result = await pool.query('INSERT INTO team (name, role, bio, initials, "order") VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, role, bio || '', init, order || 0])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.put('/api/admin/team/:id', requireAuth, async (req, res) => {
  const { name, role, bio, initials, order } = req.body
  if (!name || !role) return res.status(400).json({ error: 'Nome e ruolo obbligatori' })
  try {
    const result = await pool.query('UPDATE team SET name = $1, role = $2, bio = $3, initials = $4, "order" = $5 WHERE id = $6 RETURNING *', [name, role, bio || '', initials, order || 0, req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Membro non trovato' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.delete('/api/admin/team/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM team WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

// Features CRUD
app.post('/api/admin/features', requireAuth, async (req, res) => {
  const { title, description, icon, order } = req.body
  if (!title || !description) return res.status(400).json({ error: 'Titolo e descrizione obbligatori' })
  try {
    const result = await pool.query('INSERT INTO features (title, description, icon, "order") VALUES ($1, $2, $3, $4) RETURNING *', [title, description, icon || 'check-circle', order || 0])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.put('/api/admin/features/:id', requireAuth, async (req, res) => {
  const { title, description, icon, order } = req.body
  if (!title || !description) return res.status(400).json({ error: 'Titolo e descrizione obbligatori' })
  try {
    const result = await pool.query('UPDATE features SET title = $1, description = $2, icon = $3, "order" = $4 WHERE id = $5 RETURNING *', [title, description, icon || 'check-circle', order || 0, req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Feature non trovata' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.delete('/api/admin/features/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM features WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

// Resources CRUD
app.post('/api/admin/resources', requireAuth, async (req, res) => {
  const { title, description, url, category, order } = req.body
  if (!title) return res.status(400).json({ error: 'Titolo obbligatorio' })
  try {
    const result = await pool.query('INSERT INTO resources (title, description, url, category, "order") VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, description || '', url || '', category || 'documento', order || 0])
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.put('/api/admin/resources/:id', requireAuth, async (req, res) => {
  const { title, description, url, category, order } = req.body
  if (!title) return res.status(400).json({ error: 'Titolo obbligatorio' })
  try {
    const result = await pool.query('UPDATE resources SET title = $1, description = $2, url = $3, category = $4, "order" = $5 WHERE id = $6 RETURNING *', [title, description || '', url || '', category || 'documento', order || 0, req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Risorsa non trovata' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.delete('/api/admin/resources/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM resources WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

// Contacts
app.get('/api/admin/contacts', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.put('/api/admin/contacts/:id/read', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE contacts SET read = TRUE WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

app.delete('/api/admin/contacts/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM contacts WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Errore database' })
  }
})

// === PAGES ===

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
