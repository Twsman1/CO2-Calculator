(function(){
  function formatNumber(num, decimals=2){
    const n = Number(num) || 0
    return n.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals})
  }

  function formatCurrency(amount, currency='BRL', locale='pt-BR'){
    const a = Number(amount) || 0
    try{
      return a.toLocaleString(locale, {style:'currency', currency})
    }catch(e){
      return `${currency} ${a.toFixed(2)}`
    }
  }

  function showElement(el){
    if(!el) return
    el.classList.remove('co2-calc__section--hidden')
    el.setAttribute('aria-hidden','false')
  }

  function hideElement(el){
    if(!el) return
    el.classList.add('co2-calc__section--hidden')
    el.setAttribute('aria-hidden','true')
  }

  function scrollToElement(el, opts={behavior:'smooth', block:'center'}){
    if(!el) return
    try{ el.scrollIntoView(opts) }catch(e){}
  }

  /* Rendering helpers */
  function renderResults({kg, km, mode} = {}){
    const resultSection = document.getElementById('result')
    if(!resultSection) return
    // build cards: Emission, Distance, Mode
    const cardsContainer = document.createElement('div')
    cardsContainer.className = 'co2-calc__cards'

    const emissionCard = document.createElement('div')
    emissionCard.className = 'co2-calc__card co2-calc__card--highlight'
    emissionCard.innerHTML = `<div class="co2-calc__meta">Emissions</div><div class="co2-calc__value">${formatNumber(kg,2)} kg CO₂</div><div class="co2-calc__meta">Estimated</div>`

    const distanceCard = document.createElement('div')
    distanceCard.className = 'co2-calc__card'
    distanceCard.innerHTML = `<div class="co2-calc__meta">Distance</div><div class="co2-calc__value">${formatNumber(km,1)} km</div>`

    const modeCard = document.createElement('div')
    modeCard.className = 'co2-calc__card'
    // pick icon/color from CONFIG if available
    let icon = ''
    let label = mode || ''
    let color = ''
    if(window.CONFIG && Array.isArray(window.CONFIG.TRANSPORT_MODES)){
      const m = window.CONFIG.TRANSPORT_MODES.find(x=>x.value===mode)
      if(m){ icon = m.icon || ''; label = m.label || label; color = m.color || '' }
    }
    modeCard.innerHTML = `<div class="co2-calc__meta">Mode</div><div class="co2-calc__value">${icon} ${label}</div>`

    cardsContainer.appendChild(emissionCard)
    cardsContainer.appendChild(distanceCard)
    cardsContainer.appendChild(modeCard)

    // clear and attach
    resultSection.innerHTML = '<h2 class="co2-calc__section-title">Result</h2>'
    resultSection.appendChild(cardsContainer)
    resultSection.classList.remove('co2-calc__section--hidden')
    resultSection.classList.add('co2-calc__section--visible')
    resultSection.setAttribute('aria-hidden','false')
  }

  function renderComparison(allModes){
    const comp = document.getElementById('comparison')
    if(!comp) return
    // create structured comparison with bars
    const list = document.createElement('ul')
    list.className = 'co2-calc__comp-list'

    const modeMeta = (window.CONFIG && window.CONFIG.TRANSPORT_MODES) || []
    const values = Object.keys(allModes || {}).map(k=>({ mode:k, kg: Number(allModes[k]||0) }))
    const max = values.reduce((m,v)=>Math.max(m,v.kg), 0) || 1

    values.forEach(v=>{
      const li = document.createElement('li')
      li.className = 'co2-calc__comp-item'
      const strong = document.createElement('strong')
      // friendly label and color
      const meta = modeMeta.find(x=>x.value===v.mode) || {label:v.mode, color:'#ccc'}
      strong.textContent = meta.label || v.mode
      const barWrap = document.createElement('div')
      barWrap.className = 'co2-calc__comp-bar'
      const inner = document.createElement('i')
      const pct = Math.round((v.kg / max) * 100)
      inner.style.width = pct + '%'
      inner.style.background = meta.color || 'linear-gradient(90deg,var(--eco-leaf),var(--eco-forest))'
      barWrap.appendChild(inner)
      const valueNode = document.createElement('span')
      valueNode.className = 'co2-calc__meta'
      valueNode.textContent = `${formatNumber(v.kg,2)} kg`
      li.appendChild(strong)
      li.appendChild(barWrap)
      li.appendChild(valueNode)
      list.appendChild(li)
    })

    // tip
    const tip = document.createElement('div')
    tip.className = 'co2-calc__comparison-tip'
    tip.textContent = 'Tip: choose lower-emission modes to reduce your footprint.'

    comp.innerHTML = '<h2 class="co2-calc__section-title">Comparison</h2>'
    comp.appendChild(list)
    comp.appendChild(tip)
    comp.classList.remove('co2-calc__section--hidden')
    comp.classList.add('co2-calc__section--visible')
    showElement(comp)
  }

  function renderCarbonCredits(kg, opts={ usdToBrl:5.0 }){
    const creditsSection = document.getElementById('credits')
    if(!creditsSection) return
    const tons = window.Calculator ? window.Calculator.calculateCarbonCredits(kg) : (Number(kg)||0)/1000
    const price = window.Calculator ? window.Calculator.estimateCreditPrice(kg, opts) : { amount: 0, currency: 'BRL' }

    const grid = document.createElement('div')
    grid.className = 'co2-calc__credits-grid'

    const infoCard = document.createElement('div')
    infoCard.className = 'co2-calc__credits-info'
    infoCard.textContent = `You can offset ${formatNumber(tons,3)} t CO₂ by purchasing carbon credits.`

    const priceCard = document.createElement('div')
    priceCard.className = 'co2-calc__credits-card'
    priceCard.innerHTML = `<div class="co2-calc__meta">Estimated price</div><div class="co2-calc__value">${formatCurrency(price.amount, price.currency)}</div><a class="co2-calc__credits-cta" href="#">Buy credits</a>`

    grid.appendChild(infoCard)
    grid.appendChild(priceCard)

    creditsSection.innerHTML = '<h2 class="co2-calc__section-title">Credits</h2>'
    creditsSection.appendChild(grid)
    creditsSection.classList.remove('co2-calc__section--hidden')
    creditsSection.classList.add('co2-calc__section--visible')
    showElement(creditsSection)
  }

  /* Loading control: insert/remove spinner near main actions */
  function showLoading(targetSelector='.co2-calc__actions'){
    const container = document.querySelector(targetSelector) || document.body
    if(container.querySelector('.ui-spinner')) return
    const s = document.createElement('div')
    s.className = 'spinner ui-spinner'
    s.setAttribute('aria-hidden','true')
    container.appendChild(s)
  }

  function hideLoading(targetSelector='.co2-calc__actions'){
    const container = document.querySelector(targetSelector) || document.body
    const s = container.querySelector('.ui-spinner')
    if(s && s.parentNode) s.parentNode.removeChild(s)
  }

  window.UI = Object.freeze({
    formatNumber,
    formatCurrency,
    showElement,
    hideElement,
    scrollToElement,
    renderResults,
    renderComparison,
    renderCarbonCredits,
    showLoading,
    hideLoading
  })
})();
