async function loadJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function createCard(item) {
  return `
    <div class="card">
      <div class="card-icon"><i data-lucide="${item.icon}"></i></div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `
}

function createTimelineItem(item) {
  return `
    <div class="timeline-item">
      <div class="timeline-day">Giorno ${item.day}</div>
      <div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-desc">${item.desc}</div>
      </div>
    </div>
  `
}

function createToolCard(item) {
  return `
    <div class="tool-card">
      <div class="card-icon"><i data-lucide="${item.icon}"></i></div>
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
    </div>
  `
}

function renderIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons()
  }
}

async function init() {
  try {
    const [program, schedule, tools] = await Promise.all([
      loadJSON('/api/program'),
      loadJSON('/api/schedule'),
      loadJSON('/api/tools'),
    ])
    document.getElementById('program-cards').innerHTML = program.map(createCard).join('')
    document.getElementById('timeline').innerHTML = schedule.map(createTimelineItem).join('')
    document.getElementById('tools-grid').innerHTML = tools.map(createToolCard).join('')
    renderIcons()
  } catch (err) {
    console.error('Errore nel caricamento dei dati:', err)
  }
}

document.addEventListener('DOMContentLoaded', init)

document.querySelector('.nav-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open')
})

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open')
  })
})

document.getElementById('contact-form').addEventListener('submit', async e => {
  e.preventDefault()
  const btn = e.target.querySelector('.btn')
  const data = {
    name: e.target.querySelectorAll('input')[0].value,
    email: e.target.querySelectorAll('input')[1].value,
    message: e.target.querySelector('textarea').value,
  }

  btn.textContent = 'Invio in corso...'
  btn.disabled = true

  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    btn.textContent = 'Inviato'
    e.target.reset()
    setTimeout(() => { btn.textContent = 'Invia messaggio'; btn.disabled = false }, 2000)
  } catch {
    btn.textContent = 'Errore, riprova'
    btn.disabled = false
  }
})
