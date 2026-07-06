const quiz = {
  question: 'Ricevi un\'email dalla tua banca che ti chiede di cliccare un link per "verificare il tuo conto entro 24 ore". Cosa fai?',
  options: [
    'Clicco subito il link per non perdere l\'accesso',
    'Verifico il mittente e vado sul sito ufficiale della banca manualmente',
    'Rispondo all\'email chiedendo conferma',
    'Inoltro l\'email a tutti i miei contatti per avvisarli'
  ],
  correct: 1
}

async function loadJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function createNewsCard(item) {
  const date = new Date(item.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  const excerpt = item.excerpt ? item.excerpt + (item.excerpt.length >= 200 ? '...' : '') : ''
  return `
    <a href="/news/${item.id}" class="news-card">
      <div class="news-date">${date}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(excerpt)}</p>
      <span class="news-read">Leggi di più →</span>
    </a>
  `
}

function renderQuiz() {
  const questionEl = document.getElementById('quiz-question')
  const optionsEl = document.getElementById('quiz-options')
  const resultEl = document.getElementById('quiz-result')

  if (!questionEl) return

  questionEl.textContent = quiz.question
  optionsEl.innerHTML = quiz.options.map((opt, i) => `<div class="quiz-option" data-index="${i}">${opt}</div>`).join('')
  resultEl.className = 'quiz-result'
  resultEl.style.display = 'none'

  optionsEl.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const index = parseInt(opt.dataset.index)
      const options = optionsEl.querySelectorAll('.quiz-option')
      options.forEach((o, i) => {
        o.style.pointerEvents = 'none'
        if (i === quiz.correct) o.classList.add('correct')
        if (i === index && i !== quiz.correct) o.classList.add('wrong')
      })
      resultEl.style.display = 'block'
      if (index === quiz.correct) {
        resultEl.className = 'quiz-result show correct'
        resultEl.textContent = 'Risposta corretta. Hai riconosciuto una potenziale truffa.'
      } else {
        resultEl.className = 'quiz-result show wrong'
        resultEl.textContent = 'Risposta errata. La risposta corretta è evidenziata.'
      }
    })
  })
}

async function init() {
  try {
    const news = await loadJSON('/api/news')
    const newsGrid = document.getElementById('news-grid')
    if (newsGrid) {
      if (news.length === 0) {
        newsGrid.innerHTML = '<p style="color:var(--gray-500);grid-column:1/-1">Nessuna news al momento.</p>'
      } else {
        newsGrid.innerHTML = news.map(createNewsCard).join('')
      }
    }
    renderQuiz()
    lucide.createIcons()
  } catch (err) {
    console.error('Errore:', err)
  }
}

document.addEventListener('DOMContentLoaded', init)

document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  document.getElementById('main-nav')?.classList.toggle('open')
})

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href')
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        document.getElementById('main-nav')?.classList.remove('open')
      }
    }
  })
})

document.getElementById('contact-form')?.addEventListener('submit', async e => {
  e.preventDefault()
  const btn = e.target.querySelector('button[type="submit"]')
  const data = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    message: document.getElementById('contact-message').value
  }
  btn.textContent = 'Invio...'
  btn.disabled = true
  try {
    await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    btn.textContent = 'Messaggio inviato'
    e.target.reset()
    setTimeout(() => { btn.textContent = 'Invia messaggio'; btn.disabled = false }, 3000)
  } catch {
    btn.textContent = 'Errore'
    btn.disabled = false
  }
})
