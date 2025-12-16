(function(){
  const EMISSION_FACTORS = {
    car: 0.192,
    bus: 0.105,
    train: 0.041,
    flight: 0.255
  }

  const TRANSPORT_MODES = [
    { value: 'car', label: 'Car', icon: '🚗', color: '#2b8a3e' },
    { value: 'bus', label: 'Bus', icon: '🚌', color: '#1f6fb2' },
    { value: 'train', label: 'Train', icon: '🚆', color: '#7b3ff2' },
    { value: 'flight', label: 'Flight', icon: '✈️', color: '#d9464a' }
  ]

  const CARBON_CREDIT = {
    pricePerTon: 12.50,
    currency: 'USD',
    minAmount: 0.01
  }

  const SAMPLE_CITIES = [
    'Lisbon, Portugal',
    'London, UK',
    'Paris, France',
    'Berlin, Germany',
    'Madrid, Spain',
    'New York, USA',
    'São Paulo, Brazil',
    'Tokyo, Japan',
    'Sydney, Australia',
    'Cape Town, South Africa'
  ]

  function populateDatalist({inputIds=['origin','destination'], listId='co2-cities', cities=SAMPLE_CITIES}={}){
    // create datalist and options
    let dl = document.getElementById(listId)
    if(!dl){
      dl = document.createElement('datalist')
      dl.id = listId
      document.body.appendChild(dl)
    }
    dl.innerHTML = ''
    cities.forEach(c=>{
      const opt = document.createElement('option')
      opt.value = c
      dl.appendChild(opt)
    })

    // attach to inputs
    inputIds.forEach(id=>{
      const el = document.getElementById(id)
      if(el) el.setAttribute('list', listId)
    })
  }

  function setupDistanceAutofill({originEl, destinationEl, manualCheckbox, distanceEl, onAutoCompute, debounceMs=600}={}){
    if(!originEl || !destinationEl || !distanceEl) return
    let timer = null

    function trigger(){
      if(manualCheckbox && manualCheckbox.checked) return
      if(typeof onAutoCompute === 'function'){
        clearTimeout(timer)
        timer = setTimeout(()=>onAutoCompute(), debounceMs)
      }
    }

    // run when inputs change or when option selected from datalist
    originEl.addEventListener('input', trigger)
    destinationEl.addEventListener('input', trigger)
    originEl.addEventListener('change', trigger)
    destinationEl.addEventListener('change', trigger)

    // expose a small helper to force compute
    return {
      triggerImmediate: async ()=>{
        if(typeof onAutoCompute === 'function') await onAutoCompute()
      }
    }
  }

  window.CONFIG = Object.freeze({
    EMISSION_FACTORS,
    TRANSPORT_MODES,
    CARBON_CREDIT,
    populateDatalist,
    setupDistanceAutofill
  })
})();
