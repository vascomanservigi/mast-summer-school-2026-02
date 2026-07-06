const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => document.querySelectorAll(sel)

const esc = (str) => {
  const el = document.createElement('div')
  el.textContent = str
  return el.innerHTML
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}

const api = async (url, opts = {}) => {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error(res.status)
  return res.json()
}

async function init() {
  try {
    const [features, team, news] = await Promise.all([
      api('/api/features'),
      api('/api/team'),
      api('/api/news')
    ])

    $('#features').innerHTML = features.map(f => `
      <div class="card">
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.description)}</p>
      </div>
    `).join('')

    $('#team-list').innerHTML = team.map(t => `
      <div class="team-member">
        <div class="team-avatar">${esc(t.initials || '??')}</div>
        <h3>${esc(t.name)}</h3>
        <p>${esc(t.role)}</p>
      </div>
    `).join('')

    $('#news-list').innerHTML = news.length === 0
      ? '<p style="color:var(--text-muted)">Nessuna news.</p>'
      : news.map(n => `
        <a href="/news/${n.id}" class="news-item">
          <span class="news-date">${formatDate(n.created_at)}</span>
          <div>
            <h3>${esc(n.title)}</h3>
            <p>${esc(n.excerpt || '')}</p>
          </div>
        </a>
      `).join('')
  } catch (e) {
    console.error(e)
  }
}

document.addEventListener('DOMContentLoaded', init)
