import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Email Builder State
const builderState = {
  elements: [],
  selectedElement: null,
  draggedComponent: null,
  currentTemplate: null,
  userId: null
}

// Component Definitions
const componentTypes = {
  text: {
    name: 'Text Block',
    icon: '📝',
    defaultProps: {
      content: 'Enter your text here',
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      textAlign: 'left',
      bold: false,
      italic: false,
      width: 'auto',
      height: 'auto'
    }
  },
  button: {
    name: 'Button',
    icon: '🔘',
    defaultProps: {
      text: 'Click Here',
      link: 'https://example.com',
      backgroundColor: '#0066cc',
      textColor: '#ffffff',
      borderRadius: '4px',
      padding: '10px 20px',
      width: 'auto',
      height: 'auto'
    }
  },
  image: {
    name: 'Image',
    icon: '🖼️',
    defaultProps: {
      src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23ddd" width="300" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E300 x 200%3C/text%3E%3C/svg%3E',
      alt: 'Image description',
      width: '300px',
      height: 'auto',
      textAlign: 'center'
    }
  },
  group: {
    name: 'Group (Div)',
    icon: '📦',
    defaultProps: {
      layout: 'column',
      backgroundColor: 'transparent',
      padding: '10px',
      border: 'none',
      textAlign: 'left',
      children: []
    }
  }
}

// Initialize Builder
export function initEmailBuilder(userId) {
  builderState.userId = userId
  renderComponentPalette()
  setupCanvasListeners()
  renderCanvas()
}

// Render Component Palette
function renderComponentPalette() {
  const palette = document.getElementById('component-palette')
  palette.innerHTML = `
    <div class="palette-title">Components</div>
    ${Object.entries(componentTypes).map(([type, config]) => `
      <div class="component-item" draggable="true" data-type="${type}">
        <span>${config.icon}</span>
        <span>${config.name}</span>
      </div>
    `).join('')}
  `

  // Add drag listeners
  palette.querySelectorAll('.component-item').forEach(item => {
    item.addEventListener('dragstart', handleDragStart)
  })
}

// Drag and Drop Handlers
function handleDragStart(e) {
  const type = e.target.closest('.component-item').dataset.type
  builderState.draggedComponent = type
  e.dataTransfer.effectAllowed = 'copy'
}

function setupCanvasListeners() {
  const canvas = document.getElementById('builder-canvas')

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  })

  canvas.addEventListener('drop', (e) => {
    e.preventDefault()
    if (builderState.draggedComponent) {
      addElement(builderState.draggedComponent)
      builderState.draggedComponent = null
    }
  })
}

// Add Element to Canvas
function addElement(type, parentId = null) {
  const element = {
    id: generateId(),
    type,
    props: { ...componentTypes[type].defaultProps },
    parentId
  }

  if (parentId) {
    const parent = findElement(parentId)
    if (parent && parent.type === 'group') {
      parent.props.children.push(element.id)
    }
  }

  builderState.elements.push(element)
  renderCanvas()
  selectElement(element.id)
}

// Find Element
function findElement(id) {
  return builderState.elements.find(el => el.id === id)
}

// Select Element
function selectElement(id) {
  builderState.selectedElement = id
  renderCanvas()
  renderProperties()
}

// Delete Element
function deleteElement(id) {
  // Remove from parent's children if nested
  builderState.elements.forEach(el => {
    if (el.type === 'group' && el.props.children) {
      el.props.children = el.props.children.filter(childId => childId !== id)
    }
  })

  // Remove element and its children
  const element = findElement(id)
  if (element && element.type === 'group' && element.props.children) {
    element.props.children.forEach(childId => deleteElement(childId))
  }

  builderState.elements = builderState.elements.filter(el => el.id !== id)
  builderState.selectedElement = null
  renderCanvas()
  renderProperties()
}

// Render Canvas
function renderCanvas() {
  const canvas = document.getElementById('builder-canvas')
  const rootElements = builderState.elements.filter(el => !el.parentId)

  if (rootElements.length === 0) {
    canvas.innerHTML = '<div class="canvas-empty">Arraste componentes aqui para começar</div>'
    return
  }

  canvas.innerHTML = rootElements.map(el => renderElement(el)).join('')

  // Add click listeners
  canvas.querySelectorAll('.canvas-element').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.stopPropagation()
      selectElement(elem.dataset.id)
    })
  })

  // Add drop listeners to group elements
  canvas.querySelectorAll('.element-group').forEach(group => {
    group.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'copy'
      group.classList.add('drop-active')
    })

    group.addEventListener('dragleave', (e) => {
      e.stopPropagation()
      group.classList.remove('drop-active')
    })

    group.addEventListener('drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
      group.classList.remove('drop-active')

      if (builderState.draggedComponent) {
        const parentId = group.dataset.id
        addElement(builderState.draggedComponent, parentId)
        builderState.draggedComponent = null
      }
    })
  })
}

// Render Element
function renderElement(element) {
  const isSelected = element.id === builderState.selectedElement
  const selectedClass = isSelected ? 'selected' : ''

  switch (element.type) {
    case 'text':
      return `
        <div class="canvas-element ${selectedClass}" data-id="${element.id}" style="width: ${element.props.width}; height: ${element.props.height};">
          <div style="
            font-size: ${element.props.fontSize};
            font-family: ${element.props.fontFamily};
            color: ${element.props.color};
            text-align: ${element.props.textAlign};
            font-weight: ${element.props.bold ? 'bold' : 'normal'};
            font-style: ${element.props.italic ? 'italic' : 'normal'};
          ">${element.props.content}</div>
        </div>
      `

    case 'button':
      return `
        <div class="canvas-element ${selectedClass}" data-id="${element.id}" style="width: ${element.props.width}; height: ${element.props.height};">
          <div style="text-align: center;">
            <a href="javascript:void(0)" onclick="return false" style="
              display: inline-block;
              background-color: ${element.props.backgroundColor};
              color: ${element.props.textColor};
              padding: ${element.props.padding};
              border-radius: ${element.props.borderRadius};
              text-decoration: none;
              font-family: Arial, sans-serif;
              cursor: default;
            ">${element.props.text}</a>
          </div>
        </div>
      `

    case 'image':
      return `
        <div class="canvas-element ${selectedClass}" data-id="${element.id}">
          <div style="text-align: ${element.props.textAlign};">
            <img src="${element.props.src}" alt="${element.props.alt}" 
              style="width: ${element.props.width}; height: ${element.props.height}; max-width: 100%;">
          </div>
        </div>
      `

    case 'group':
      const children = element.props.children
        .map(childId => findElement(childId))
        .filter(Boolean)
        .map(child => renderElement(child))
        .join('')

      const layoutClass = element.props.layout === 'row' ? 'layout-row' : 'layout-column'

      return `
        <div class="canvas-element element-group ${layoutClass} ${selectedClass}" 
          data-id="${element.id}"
          style="
            background-color: ${element.props.backgroundColor};
            padding: ${element.props.padding};
            border: ${element.props.border};
            text-align: ${element.props.textAlign};
          ">
          ${children || '<div class="drop-zone">Arraste componentes aqui</div>'}
        </div>
      `

    default:
      return ''
  }
}

// Render Properties Panel
function renderProperties() {
  const panel = document.getElementById('properties-panel')

  if (!builderState.selectedElement) {
    panel.innerHTML = '<p style="color: #808080; font-size: 11px;">Selecione um elemento para editar</p>'
    return
  }

  const element = findElement(builderState.selectedElement)
  if (!element) return

  const props = element.props
  let html = `<div class="prop-group"><strong>${componentTypes[element.type].name}</strong></div>`

  // Render properties based on type
  switch (element.type) {
    case 'text':
      html += `
        <div class="prop-group">
          <label class="prop-label">Conteúdo:</label>
          <textarea class="prop-input" rows="3" data-prop="content">${props.content}</textarea>
        </div>
        <div class="prop-group">
          <label class="prop-label">Largura:</label>
          <input type="text" class="prop-input" value="${props.width}" data-prop="width" placeholder="auto, 100px, 50%">
        </div>
        <div class="prop-group">
          <label class="prop-label">Altura:</label>
          <input type="text" class="prop-input" value="${props.height}" data-prop="height" placeholder="auto, 100px">
        </div>
        <div class="prop-group">
          <label class="prop-label">Tamanho da Fonte:</label>
          <input type="text" class="prop-input" value="${props.fontSize}" data-prop="fontSize">
        </div>
        <div class="prop-group">
          <label class="prop-label">Fonte:</label>
          <select class="prop-select" data-prop="fontFamily">
            <option value="Arial, sans-serif" ${props.fontFamily.includes('Arial') ? 'selected' : ''}>Arial</option>
            <option value="'Times New Roman', serif" ${props.fontFamily.includes('Times') ? 'selected' : ''}>Times New Roman</option>
            <option value="'Courier New', monospace" ${props.fontFamily.includes('Courier') ? 'selected' : ''}>Courier New</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">Cor:</label>
          <input type="color" class="prop-color" value="${props.color}" data-prop="color">
        </div>
        <div class="prop-group">
          <label class="prop-label">Alinhamento:</label>
          <select class="prop-select" data-prop="textAlign">
            <option value="left" ${props.textAlign === 'left' ? 'selected' : ''}>Esquerda</option>
            <option value="center" ${props.textAlign === 'center' ? 'selected' : ''}>Centro</option>
            <option value="right" ${props.textAlign === 'right' ? 'selected' : ''}>Direita</option>
          </select>
        </div>
        <div class="prop-group">
          <label><input type="checkbox" ${props.bold ? 'checked' : ''} data-prop="bold"> Negrito</label><br>
          <label><input type="checkbox" ${props.italic ? 'checked' : ''} data-prop="italic"> Itálico</label>
        </div>
      `
      break

    case 'button':
      html += `
        <div class="prop-group">
          <label class="prop-label">Texto:</label>
          <input type="text" class="prop-input" value="${props.text}" data-prop="text">
        </div>
        <div class="prop-group">
          <label class="prop-label">Link:</label>
          <input type="url" class="prop-input" value="${props.link}" data-prop="link">
        </div>
        <div class="prop-group">
          <label class="prop-label">Largura:</label>
          <input type="text" class="prop-input" value="${props.width}" data-prop="width" placeholder="auto, 100px, 50%">
        </div>
        <div class="prop-group">
          <label class="prop-label">Altura:</label>
          <input type="text" class="prop-input" value="${props.height}" data-prop="height" placeholder="auto, 100px">
        </div>
        <div class="prop-group">
          <label class="prop-label">Cor de Fundo:</label>
          <input type="color" class="prop-color" value="${props.backgroundColor}" data-prop="backgroundColor">
        </div>
        <div class="prop-group">
          <label class="prop-label">Cor do Texto:</label>
          <input type="color" class="prop-color" value="${props.textColor}" data-prop="textColor">
        </div>
        <div class="prop-group">
          <label class="prop-label">Borda Arredondada:</label>
          <input type="text" class="prop-input" value="${props.borderRadius}" data-prop="borderRadius">
        </div>
        <div class="prop-group">
          <label class="prop-label">Padding:</label>
          <input type="text" class="prop-input" value="${props.padding}" data-prop="padding">
        </div>
      `
      break

    case 'image':
      html += `
        <div class="prop-group">
          <label class="prop-label">URL da Imagem:</label>
          <input type="url" class="prop-input" value="${props.src}" data-prop="src">
        </div>
        <div class="prop-group">
          <label class="prop-label">Texto Alternativo:</label>
          <input type="text" class="prop-input" value="${props.alt}" data-prop="alt">
        </div>
        <div class="prop-group">
          <label class="prop-label">Largura:</label>
          <input type="text" class="prop-input" value="${props.width}" data-prop="width">
        </div>
        <div class="prop-group">
          <label class="prop-label">Altura:</label>
          <input type="text" class="prop-input" value="${props.height}" data-prop="height">
        </div>
        <div class="prop-group">
          <label class="prop-label">Alinhamento:</label>
          <select class="prop-select" data-prop="textAlign">
            <option value="left" ${props.textAlign === 'left' ? 'selected' : ''}>Esquerda</option>
            <option value="center" ${props.textAlign === 'center' ? 'selected' : ''}>Centro</option>
            <option value="right" ${props.textAlign === 'right' ? 'selected' : ''}>Direita</option>
          </select>
        </div>
      `
      break

    case 'group':
      html += `
        <div class="prop-group">
          <label class="prop-label">Layout:</label>
          <select class="prop-select" data-prop="layout">
            <option value="column" ${props.layout === 'column' ? 'selected' : ''}>Coluna</option>
            <option value="row" ${props.layout === 'row' ? 'selected' : ''}>Linha</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">Cor de Fundo:</label>
          <input type="color" class="prop-color" value="${props.backgroundColor === 'transparent' ? '#ffffff' : props.backgroundColor}" data-prop="backgroundColor">
        </div>
        <div class="prop-group">
          <label class="prop-label">Padding:</label>
          <input type="text" class="prop-input" value="${props.padding}" data-prop="padding">
        </div>
        <div class="prop-group">
          <label class="prop-label">Borda:</label>
          <input type="text" class="prop-input" value="${props.border}" data-prop="border" placeholder="1px solid #ccc">
        </div>
      `
      break
  }

  html += `
    <div class="prop-buttons">
      <button onclick="window.emailBuilder.deleteSelected()">Excluir</button>
    </div>
  `

  panel.innerHTML = html

  // Add change listeners
  panel.querySelectorAll('[data-prop]').forEach(input => {
    input.addEventListener('input', (e) => {
      const prop = e.target.dataset.prop
      let value = e.target.value

      if (e.target.type === 'checkbox') {
        value = e.target.checked
      }

      updateElementProp(builderState.selectedElement, prop, value)
    })
  })
}

// Update Element Property
function updateElementProp(id, prop, value) {
  const element = findElement(id)
  if (element) {
    element.props[prop] = value
    renderCanvas()
  }
}

// Generate HTML for Email
export function generateEmailHTML() {
  const rootElements = builderState.elements.filter(el => !el.parentId)

  const bodyContent = rootElements.map(el => generateElementHTML(el)).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              ${bodyContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Generate Element HTML
function generateElementHTML(element) {
  const props = element.props

  switch (element.type) {
    case 'text':
      return `<p style="font-size: ${props.fontSize}; font-family: ${props.fontFamily}; color: ${props.color}; text-align: ${props.textAlign}; font-weight: ${props.bold ? 'bold' : 'normal'}; font-style: ${props.italic ? 'italic' : 'normal'}; margin: 10px 0;">${props.content}</p>`

    case 'button':
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding: 10px 0;"><a href="${props.link}" style="display: inline-block; background-color: ${props.backgroundColor}; color: ${props.textColor}; padding: ${props.padding}; border-radius: ${props.borderRadius}; text-decoration: none; font-family: Arial, sans-serif;">${props.text}</a></td></tr></table>`

    case 'image':
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="${props.textAlign}" style="padding: 10px 0;"><img src="${props.src}" alt="${props.alt}" style="width: ${props.width}; height: ${props.height}; display: block; max-width: 100%;"></td></tr></table>`

    case 'group':
      const children = props.children
        .map(childId => findElement(childId))
        .filter(Boolean)
        .map(child => generateElementHTML(child))
        .join('')

      const isRow = props.layout === 'row'
      if (isRow) {
        const childCount = props.children.length
        const cellWidth = childCount > 0 ? `${100 / childCount}%` : '100%'
        const cells = props.children
          .map(childId => findElement(childId))
          .filter(Boolean)
          .map(child => `<td width="${cellWidth}" valign="top" style="padding: 5px;">${generateElementHTML(child)}</td>`)
          .join('')

        return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${props.backgroundColor}; padding: ${props.padding}; border: ${props.border};"><tr>${cells}</tr></table>`
      } else {
        return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${props.backgroundColor}; padding: ${props.padding}; border: ${props.border};"><tr><td>${children}</td></tr></table>`
      }

    default:
      return ''
  }
}

// Save Template
// Save Template
export async function saveTemplate() {
  console.log('Save button clicked. Current state:', builderState)

  // Fallback: Try to get user if missing
  if (!builderState.userId) {
    console.log('User ID missing in state, checking Supabase session...')
    const { data: { session } } = await supabase.auth.getSession()
    if (session && session.user) {
      console.log('User found in session:', session.user.id)
      builderState.userId = session.user.id
    } else {
      console.error('No active session found')
      alert('Erro: Você precisa estar logado para salvar. Recarregue a página e faça login novamente.')
      return
    }
  }

  // Get name from input field
  const nameInput = document.getElementById('template-name-input')
  const name = nameInput ? nameInput.value : null

  if (!name || name.trim() === '') {
    alert('Por favor, digite um nome para o template no campo ao lado do botão Salvar.')
    if (nameInput) nameInput.focus()
    return
  }

  console.log('Saving template:', name)

  try {
    const html = generateEmailHTML()
    const json = {
      elements: builderState.elements
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        user_id: builderState.userId,
        name: name.trim(),
        html_content: html,
        json_structure: json
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase Insert Error:', error)
      alert('Erro ao salvar template: ' + error.message)
    } else {
      console.log('Template saved:', data)
      alert('Template salvo com sucesso!')
      builderState.currentTemplate = data.id
      // Reload templates list
      if (window.app && window.app.showTemplatesList) {
        window.app.showTemplatesList()
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    alert('Erro inesperado ao salvar: ' + err.message)
  }
}

// Load Template
export async function loadTemplate(id) {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    alert('Erro ao carregar template: ' + error.message)
    return
  }

  builderState.elements = data.json_structure.elements || []
  builderState.currentTemplate = data.id
  builderState.selectedElement = null
  renderCanvas()
  renderProperties()
}

// List Templates
export async function loadTemplatesList() {
  if (!builderState.userId) {
    return []
  }

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('user_id', builderState.userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading templates:', error)
    return []
  }

  return data || []
}

// Delete Template
export function deleteTemplate(id, name) {
  console.log('Requesting delete for:', id, name)

  const modal = document.getElementById('window-confirm')
  const message = document.getElementById('confirm-message')
  const yesBtn = document.getElementById('confirm-yes')

  if (!modal || !message || !yesBtn) {
    console.error('Confirm modal elements not found')
    return
  }

  message.textContent = `Deseja excluir o template "${name}"?`

  // Remove old listeners to avoid duplicates
  const newYesBtn = yesBtn.cloneNode(true)
  yesBtn.parentNode.replaceChild(newYesBtn, yesBtn)

  newYesBtn.onclick = async () => {
    console.log('User confirmed deletion via modal')
    app.closeWindow('confirm')

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete error:', error)
      alert('Erro ao excluir template: ' + error.message)
    } else {
      console.log('Template deleted successfully')
      // Reload templates list
      if (window.app && window.app.showTemplatesList) {
        window.app.showTemplatesList()
      }

      // If the deleted template was loaded, clear canvas
      if (builderState.currentTemplate === id) {
        clearCanvas()
      }
    }
  }

  app.openWindow('confirm')
}

// Clear Canvas
export function clearCanvas() {
  if (confirm('Tem certeza que deseja limpar o canvas?')) {
    builderState.elements = []
    builderState.selectedElement = null
    builderState.currentTemplate = null
    renderCanvas()
    renderProperties()
  }
}

// Delete Selected
export function deleteSelected() {
  if (builderState.selectedElement) {
    deleteElement(builderState.selectedElement)
  }
}

// Utility
function generateId() {
  return 'el_' + Math.random().toString(36).substr(2, 9)
}

// Export to window for inline onclick handlers
window.emailBuilder = {
  deleteSelected,
  saveTemplate,
  deleteTemplate,
  loadTemplate,
  loadTemplatesList,
  clearCanvas,
  generateEmailHTML
}
