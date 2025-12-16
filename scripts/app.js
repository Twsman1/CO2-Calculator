document.addEventListener('DOMContentLoaded',()=>{
  const origin = document.getElementById('origin')
  const destination = document.getElementById('destination')
  const distance = document.getElementById('distance')
  const manualCheckbox = document.getElementById('manual-distance')
  const calculateBtn = document.getElementById('calculate')
  const resultSection = document.getElementById('result')
  const comparisonSection = document.getElementById('comparison')
  const creditsSection = document.getElementById('credits')
  const resultValue = document.getElementById('result-value')
  const comparisonText = document.getElementById('comparison-text')
  let debounceTimer = null
  let currentGeocodeRequest = null


  function setDistance(val){
    distance.value = (Math.round(val*10)/10) || ''
  }

  async function computeAutoDistanceAsync(){
    const a = origin.value.trim()
    const b = destination.value.trim()
    if(!a||!b) return 0

    // try real geocoding first (Nominatim). If it fails, fallback to string heuristic.
    if(window.CO2Utils && window.CO2Utils.geocode && window.CO2Utils.haversineKm){
      try{
        currentGeocodeRequest = Promise.all([window.CO2Utils.geocode(a), window.CO2Utils.geocode(b)])
        const [ga, gb] = await currentGeocodeRequest
        currentGeocodeRequest = null
        if(ga && gb){
          const km = window.CO2Utils.haversineKm(ga.lat, ga.lon, gb.lat, gb.lon)
          return Math.max(0.1, Math.round(km*10)/10)
        }
      }catch(e){
        currentGeocodeRequest = null
      }
    }

    // fallback estimate
    const d = (window.CO2Utils && window.CO2Utils.estimateDistanceFromStrings)
      ? window.CO2Utils.estimateDistanceFromStrings(a,b)
      : Math.max(1, Math.abs(a.length - b.length)*5)
    return d
  }

  function showSpinner(){
    if(window.UI && typeof window.UI.showLoading === 'function'){
      window.UI.showLoading()
      return
    }
    const s = document.createElement('div')
    s.className = 'spinner'
    s.id = 'geocode-spinner'
    s.setAttribute('aria-hidden','true')
    calculateBtn.parentNode.appendChild(s)
  }
  function removeSpinner(){
    if(window.UI && typeof window.UI.hideLoading === 'function'){
      window.UI.hideLoading()
      return
    }
    const s = document.getElementById('geocode-spinner')
    if(s && s.parentNode) s.parentNode.removeChild(s)
  }

  async function toggleManual(){
    const manual = manualCheckbox.checked
    distance.readOnly = !manual
    if(!manual){
      // compute and set asynchronously with spinner
      removeSpinner()
      showSpinner()
      const d = await computeAutoDistanceAsync()
      setDistance(d)
      removeSpinner()
    }
  }

  // populate datalist and wire smart autofill via CONFIG if present
  if(window.CONFIG && typeof window.CONFIG.populateDatalist === 'function'){
    try{ window.CONFIG.populateDatalist() }catch(e){}
  }

  if(window.CONFIG && typeof window.CONFIG.setupDistanceAutofill === 'function'){
    try{
      window.CONFIG.setupDistanceAutofill({
        originEl: origin,
        destinationEl: destination,
        manualCheckbox: manualCheckbox,
        distanceEl: distance,
        debounceMs: 650,
        onAutoCompute: async ()=>{
          removeSpinner()
          showSpinner()
          const d = await computeAutoDistanceAsync()
          setDistance(d)
          removeSpinner()
        }
      })
    }catch(e){}
  } else {
    // fallback: simple input listeners
    origin.addEventListener('input',()=>{ if(!manualCheckbox.checked){ removeSpinner(); showSpinner(); computeAutoDistanceAsync().then(d=>{ setDistance(d); removeSpinner() }) } })
    destination.addEventListener('input',()=>{ if(!manualCheckbox.checked){ removeSpinner(); showSpinner(); computeAutoDistanceAsync().then(d=>{ setDistance(d); removeSpinner() }) } })
  }
  manualCheckbox.addEventListener('change',toggleManual)

  const form = document.getElementById('co2-form')

  // Make calculate button trigger form submission for consistent behaviour
  calculateBtn.addEventListener('click', ()=>{
    if(typeof form.requestSubmit === 'function') form.requestSubmit()
    else form.dispatchEvent(new Event('submit', {cancelable:true}))
  })

  // helper to await a timeout
  function delay(ms){ return new Promise(res=>setTimeout(res, ms)) }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault()

    // basic validation
    const a = origin.value.trim()
    const b = destination.value.trim()
    if(!a){ origin.focus(); return }
    if(!b){ destination.focus(); return }
    if(manualCheckbox.checked){ const v = parseFloat(distance.value); if(!v || v <= 0){ distance.focus(); return } }

    try{
      // show loading and compute distance/emissions
      showSpinner()
      const d = parseFloat(distance.value) || await computeAutoDistanceAsync()
      const mode = (document.querySelector('input[name="mode"]:checked')||{}).value || 'car'
      const emissions = window.Calculator ? window.Calculator.calculateEmission(d, mode) : Math.max(0, d * 0.192)

      // simulate processing time and sequential rendering
      if(window.UI && typeof window.UI.renderResults === 'function'){
        window.UI.renderResults({ kg: emissions, km: d, mode })
      }
      await delay(450)

      if(window.UI && typeof window.UI.renderComparison === 'function'){
        const allModes = window.Calculator ? window.Calculator.calculateAllModes(d) : { car: d*0.192 }
        window.UI.renderComparison(allModes)
      }
      await delay(350)

      if(window.UI && typeof window.UI.renderCarbonCredits === 'function'){
        window.UI.renderCarbonCredits(emissions, { usdToBrl: 5.0 })
      }

      // fallbacks for when UI is not present
      if(!window.UI){
        resultValue.textContent = `${emissions.toFixed(2)} kg CO₂`
        resultSection.classList.remove('co2-calc__section--hidden')
        comparisonText.textContent = `This trip emits about ${emissions.toFixed(2)} kg CO₂ for ${d} km by ${mode}.`
        comparisonSection.classList.remove('co2-calc__section--hidden')
        creditsSection.classList.remove('co2-calc__section--hidden')
      }

      // scroll to results
      const resultsNode = document.getElementById('result')
      if(resultsNode) resultsNode.scrollIntoView({behavior:'smooth', block:'center'})

    }catch(err){
      console.error('Calculation error', err)
      alert('An error occurred while calculating. Please try again.')
    }finally{
      removeSpinner()
    }
  })

  toggleManual()
})
