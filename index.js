const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const messages = []

const program = [
  { icon: 'globe', title: 'HTML & CSS', desc: 'Struttura e stile delle pagine web. Layout responsive, animazioni e best practices.' },
  { icon: 'zap', title: 'JavaScript & Node.js', desc: 'Dal frontend al backend: JS lato client e server con Node.js ed Express.' },
  { icon: 'shield', title: 'Cybersecurity', desc: 'OWASP Top 10, crittografia, attacchi comuni e come difendersi.' },
  { icon: 'database', title: 'Database & API', desc: 'Progettazione di database REST API e integrazione con il frontend.' },
  { icon: 'rocket', title: 'DevOps & Deploy', desc: 'Git, CI/CD, deployment su Render e cloud fundamentals.' },
  { icon: 'cpu', title: 'AI & Web', desc: 'Integrazione di LLM e AI nei siti web. Il futuro del web development.' },
]

const schedule = [
  { day: 1, title: 'Benvenuti nel Cyberworld', desc: 'Presentazione del corso, setup ambiente e primi passi con HTML.' },
  { day: 2, title: 'CSS & Design', desc: 'Styling avanzato, Flexbox, Grid, animazioni e design responsivo.' },
  { day: 3, title: 'JavaScript Fundamentals', desc: 'Variabili, funzioni, DOM manipulation ed eventi.' },
  { day: 4, title: 'Node.js & Express', desc: 'Server-side programming, routing e middleware.' },
  { day: 5, title: 'Database & API', desc: 'Database relazionali, REST API e integrazione frontend-backend.' },
  { day: 6, title: 'Cybersecurity', desc: 'OWASP Top 10, penetration testing e secure coding.' },
  { day: 7, title: 'Progetto Finale', desc: 'Sviluppo di un\'applicazione web completa in team.' },
  { day: 8, title: 'Presentazioni & Saluti', desc: 'Presentazione dei progetti, feedback e certificati.' },
]

const tools = [
  { icon: 'code-2', name: 'VS Code', desc: 'Editor di codice' },
  { icon: 'git-branch', name: 'Git & GitHub', desc: 'Version control' },
  { icon: 'server', name: 'Node.js', desc: 'Runtime JavaScript' },
  { icon: 'figma', name: 'Figma', desc: 'Design UI/UX' },
  { icon: 'search', name: 'OWASP ZAP', desc: 'Security testing' },
  { icon: 'cloud', name: 'Render', desc: 'Cloud deployment' },
]

app.get('/api/program', (req, res) => res.json(program))
app.get('/api/schedule', (req, res) => res.json(schedule))
app.get('/api/tools', (req, res) => res.json(tools))

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
