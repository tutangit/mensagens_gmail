import { createClient } from '@supabase/supabase-js'
import './style.css'
import { initEmailBuilder, generateEmailHTML, loadTemplatesList } from './email-builder.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// App State
const state = {
  user: null,
  windows: {
    'compose-text': { x: 100, y: 50, z: 10 },
    'compose-html': { x: 150, y: 80, z: 11 },
    'history': { x: 200, y: 100, z: 9 },
    'settings': { x: 250, y: 120, z: 12 }
  },
  activeWindow: null
}

// UI Helpers
const ui = {
  loginScreen: document.getElementById('login-screen'),
  desktop: document.getElementById('desktop'),
  loginBtn: document.getElementById('login-btn'),
  signupBtn: document.getElementById('signup-btn'),
  emailInput: document.getElementById('email'),
  passwordInput: document.getElementById('password'),
  loginError: document.getElementById('login-error'),
  userEmail: document.getElementById('user-email'),
  gmailStatus: document.getElementById('gmail-status'),
  historyList: document.getElementById('history-list'),
  historyCount: document.getElementById('history-count')
}

// Window Management
function initWindows() {
  document.querySelectorAll('.window').forEach(win => {
    const titleBar = win.querySelector('.title-bar')
    let isDragging = false
    let startX, startY, initialLeft, initialTop

    // Bring to front on click
    win.addEventListener('mousedown', () => {
      bringToFront(win)
    })

    // Dragging logic
    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('title-bar-btn')) return
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      initialLeft = win.offsetLeft
      initialTop = win.offsetTop
      bringToFront(win)
    })

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      win.style.left = `${initialLeft + dx}px`
      win.style.top = `${initialTop + dy}px`
    })

    document.addEventListener('mouseup', () => {
      isDragging = false
    })
  })
}

function bringToFront(win) {
  let maxZ = 0
  document.querySelectorAll('.window').forEach(w => {
    const z = parseInt(w.style.zIndex || 0)
    if (z > maxZ) maxZ = z
    w.querySelector('.title-bar').classList.remove('active')
    w.querySelector('.title-bar').classList.add('inactive')
  })
  win.style.zIndex = maxZ + 1
  win.querySelector('.title-bar').classList.remove('inactive')
  win.querySelector('.title-bar').classList.add('active')
}

// Templates List Functions
async function loadTemplatesListUI() {
  const templates = await loadTemplatesList()
  const list = document.getElementById('templates-list')

  if (!templates || templates.length === 0) {
    list.innerHTML = '<p style="color: #808080; font-size: 10px; padding: 5px;">Nenhum template salvo</p>'
    return
  }

  list.innerHTML = templates.map(t => `
    <div class="component-item" style="cursor: default; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
      <div onclick="emailBuilder.loadTemplate('${t.id}')" style="cursor: pointer; flex-grow: 1; display: flex; align-items: center; gap: 5px;">
        <span>📄</span>
        <span style="font-size: 10px;">${t.name}</span>
      </div>
      <span onclick="emailBuilder.deleteTemplate('${t.id}', '${t.name}')" style="cursor: pointer; font-size: 10px; color: red; padding: 0 5px;" title="Excluir">🗑️</span>
    </div>
  `).join('')
}

// App Functions
window.app = {
  openWindow: (id) => {
    const win = document.getElementById(`window-${id}`)
    win.classList.remove('hidden')
    bringToFront(win)
    if (id === 'history') loadHistory()
    if (id === 'settings') checkGmailStatus()
    if (id === 'email-builder' && state.user) {
      initEmailBuilder(state.user.id)
      loadTemplatesListUI()
    }
  },

  closeWindow: (id) => {
    const win = document.getElementById(`window-${id}`)
    win.classList.add('hidden')
  },

  login: async () => {
    const email = ui.emailInput.value
    const password = ui.passwordInput.value
    ui.loginError.style.display = 'none'
    ui.loginBtn.disabled = true
    ui.loginBtn.textContent = 'Entrando...'

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      ui.loginError.textContent = error.message
      ui.loginError.style.display = 'block'
      ui.loginBtn.disabled = false
      ui.loginBtn.textContent = 'Entrar'
    } else {
      // Auth state change will handle the rest
    }
  },

  signup: async () => {
    const email = ui.emailInput.value
    const password = ui.passwordInput.value

    if (!email || !password) {
      ui.loginError.textContent = 'Preencha email e senha.'
      ui.loginError.style.display = 'block'
      return
    }

    ui.loginError.style.display = 'none'
    ui.signupBtn.disabled = true
    ui.signupBtn.textContent = 'Registrando...'

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      ui.loginError.textContent = error.message
      ui.loginError.style.display = 'block'
      ui.signupBtn.disabled = false
      ui.signupBtn.textContent = 'Registrar'
    } else {
      alert('Registro realizado! Verifique seu email ou faça login se o auto-confirm estiver ativo.')
      ui.signupBtn.disabled = false
      ui.signupBtn.textContent = 'Registrar'
    }
  },

  connectGmail: async () => {
    const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID || prompt('Por favor, insira seu Google Client ID:')
    if (!clientId || clientId === 'seu_client_id_aqui') {
      alert('Configure o VITE_GMAIL_CLIENT_ID no arquivo .env ou digite no prompt.')
      return
    }

    const redirectUrl = window.location.origin
    const scope = 'https://www.googleapis.com/auth/gmail.send'

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

    window.location.href = authUrl
  },

  handleOAuthCallback: async () => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      // Clear URL
      window.history.replaceState({}, document.title, window.location.pathname)

      const statusArea = document.getElementById('gmail-status-area')
      statusArea.innerHTML = '<p>Conectando ao Gmail...</p>'

      const { error } = await supabase.functions.invoke('gmail-oauth-callback', {
        body: { code, redirect_url: window.location.origin }
      })

      if (error) {
        alert('Erro ao conectar Gmail: ' + error.message)
      } else {
        alert('Gmail conectado com sucesso!')
        checkGmailStatus()
      }
    }
  },

  sendTextEmail: async () => {
    const to = document.getElementById('text-to').value
    const subject = document.getElementById('text-subject').value
    const body = document.getElementById('text-body').value
    const statusSpan = document.getElementById('text-status')

    if (!to || !subject || !body) {
      alert('Preencha todos os campos!')
      return
    }

    statusSpan.textContent = 'Enviando...'

    const { data, error } = await supabase.functions.invoke('send-email-text', {
      body: { to, subject, body }
    })

    if (error) {
      alert('Erro ao enviar: ' + error.message)
      statusSpan.textContent = 'Erro'
    } else {
      alert('Email enviado com sucesso!')
      statusSpan.textContent = 'Pronto'
      document.getElementById('text-body').value = ''
      app.closeWindow('compose-text')
      loadHistory()
    }
  },

  sendHtmlEmail: async () => {
    const to = document.getElementById('html-to').value
    const subject = document.getElementById('html-subject').value
    const body = document.getElementById('html-body').value
    const statusSpan = document.getElementById('html-status')

    if (!to || !subject || !body) {
      alert('Preencha todos os campos!')
      return
    }

    statusSpan.textContent = 'Enviando...'

    const { data, error } = await supabase.functions.invoke('send-email-html', {
      body: { to, subject, html: body }
    })

    if (error) {
      alert('Erro ao enviar: ' + error.message)
      statusSpan.textContent = 'Erro'
    } else {
      alert('Email HTML enviado com sucesso!')
      statusSpan.textContent = 'Pronto'
      app.closeWindow('compose-html')
      loadHistory()
    }
  },

  useBuilderHTML: () => {
    const html = generateEmailHTML()
    document.getElementById('html-body').value = html
    app.closeWindow('email-builder')
    app.openWindow('compose-html')
    alert('HTML gerado e inserido no editor!')
  },

  showTemplatesList: () => {
    loadTemplatesListUI()
  }
}

// Internal Logic
async function loadHistory() {
  if (!state.user) return

  const { data, error } = await supabase
    .from('sent_emails')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading history:', error)
    return
  }

  ui.historyList.innerHTML = ''
  data.forEach(email => {
    const date = new Date(email.created_at).toLocaleString()
    const row = document.createElement('div')
    row.className = 'grid-row'
    row.innerHTML = `
      <div class="grid-cell" style="width: 120px;">${date}</div>
      <div class="grid-cell" style="width: 150px;">${email.to}</div>
      <div class="grid-cell" style="flex-grow: 1;">${email.subject || '(Sem assunto)'}</div>
      <div class="grid-cell" style="width: 60px;">${email.status}</div>
    `
    ui.historyList.appendChild(row)
  })
  ui.historyCount.textContent = `${data.length} itens`
}

async function checkGmailStatus() {
  if (!state.user) return

  const { data, error } = await supabase
    .from('gmail_accounts')
    .select('id')
    .eq('user_id', state.user.id)
    .single()

  if (data) {
    ui.gmailStatus.textContent = 'Conectado'
    ui.gmailStatus.style.color = 'green'
    document.getElementById('connect-gmail-btn').disabled = true
  } else {
    ui.gmailStatus.textContent = 'Desconectado'
    ui.gmailStatus.style.color = 'red'
    document.getElementById('connect-gmail-btn').disabled = false
  }
}

// Event Listeners
ui.loginBtn.addEventListener('click', app.login)
ui.signupBtn.addEventListener('click', app.signup)

// Auth State Listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    state.user = session.user
    ui.userEmail.textContent = session.user.email
    ui.loginScreen.classList.add('hidden')
    ui.desktop.classList.remove('hidden')
    loadHistory()
  } else {
    state.user = null
    ui.loginScreen.classList.remove('hidden')
    ui.desktop.classList.add('hidden')
    ui.loginBtn.disabled = false
    ui.loginBtn.textContent = 'Entrar'
    ui.emailInput.value = ''
    ui.passwordInput.value = ''
  }
})

// Init
initWindows()
app.handleOAuthCallback()
