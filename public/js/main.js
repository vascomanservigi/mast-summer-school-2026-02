async function loadJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function createFeatureCard(item) {
  return `
    <div class="feature-card">
      <div class="feature-icon"><i data-lucide="${item.icon}"></i></div>
      <div class="feature-text">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    </div>
  `
}

function createTeamCard(item) {
  return `
    <div class="team-card">
      <div class="team-avatar">${item.initials}</div>
      <h3>${item.name}</h3>
      <p>${item.role}</p>
    </div>
  `
}

function createNewsCard(item) {
  const date = new Date(item.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  return `
    <div class="news-card">
      <div class="news-date">${date}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.content)}</p>
    </div>
  `
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function renderIcons() {
  if (typeof lucide !== 'undefined') lucide.createIcons()
}

async function init() {
  try {
    const [features, team, news] = await Promise.all([
      loadJSON('/api/features'),
      loadJSON('/api/team'),
      loadJSON('/api/news'),
    ])
    document.getElementById('features-grid').innerHTML = features.map(createFeatureCard).join('')
    document.getElementById('team-grid').innerHTML = team.map(createTeamCard).join('')
    const newsGrid = document.getElementById('news-grid')
    if (news.length === 0) {
      newsGrid.innerHTML = '<p style="color:var(--gray-400)">Nessuna news al momento.</p>'
    } else {
      newsGrid.innerHTML = news.map(createNewsCard).join('')
    }
    renderIcons()
    loadQuiz()
  } catch (err) {
    console.error('Errore:', err)
  }
}

async function loadQuiz() {
  try {
    const quiz = await loadJSON('/api/quiz')
    renderQuiz(quiz)
  } catch (err) {
    console.error('Errore quiz:', err)
  }
}

function renderQuiz(quiz) {
  const questionEl = document.getElementById('quiz-question')
  const optionsEl = document.getElementById('quiz-options')
  const resultEl = document.getElementById('quiz-result')

  questionEl.textContent = quiz.question
  optionsEl.innerHTML = quiz.options.map((opt, i) => 
    `<div class="quiz-option" data-index="${i}">${opt}</div>`
  ).join('')
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
        resultEl.textContent = 'Corretto! Ottimo lavoro.'
      } else {
        resultEl.className = 'quiz-result show wrong'
        resultEl.textContent = 'Sbagliato. La risposta corretta è evidenziata.'
      }
    })
  })
}

document.addEventListener('DOMContentLoaded', init)

document.querySelector('.nav-toggle').addEventListener('click', () => {
  document.querySelector('.nav').classList.toggle('open')
})
