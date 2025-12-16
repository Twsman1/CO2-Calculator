(function(){
  const EF = (window.CONFIG && window.CONFIG.EMISSION_FACTORS) || {
    car: 0.192,
    bus: 0.105,
    train: 0.041,
    flight: 0.255
  }

  const CARBON = (window.CONFIG && window.CONFIG.CARBON_CREDIT) || { pricePerTon: 12.5, currency: 'USD' }

  /**
   * Calculate emissions (kg CO₂) for given distance (km) and transport mode
   * @param {number} km
   * @param {string} mode
   * @returns {number} kg CO2
   */
  function calculateEmission(km, mode){
    const _km = Number(km) || 0
    const factor = (EF && EF[mode]) || EF.car || 0
    return Math.max(0, _km * factor)
  }

  /**
   * Calculate emissions for all known modes
   * @param {number} km
   * @returns {Object} { mode: kg }
   */
  function calculateAllModes(km){
    const out = {}
    Object.keys(EF).forEach(m=>{ out[m] = calculateEmission(km,m) })
    return out
  }

  /**
   * Calculate savings (kg and percent) switching from baseline -> compare
   * @param {number} km
   * @param {string} baselineMode
   * @param {string} compareMode
   * @returns {Object} { baselineKg, compareKg, savingsKg, savingsPct }
   */
  function calculateSavings(km, baselineMode, compareMode){
    const base = calculateEmission(km, baselineMode)
    const comp = calculateEmission(km, compareMode)
    const savings = Math.max(0, base - comp)
    const pct = base > 0 ? (savings / base) * 100 : 0
    return { baselineKg: base, compareKg: comp, savingsKg: savings, savingsPct: pct }
  }

  /**
   * Convert kg CO2 to carbon credits (tons)
   * @param {number} kg
   * @returns {number} tons
   */
  function calculateCarbonCredits(kg){
    const _kg = Number(kg) || 0
    return Math.max(0, _kg / 1000)
  }

  /**
   * Estimate credit price in R$ (Brazilian Real) by converting stored pricePerTon (assumed USD)
   * @param {number} kg
   * @param {Object} opts { usdToBrl: number }
   * @returns {Object} { amount: number, currency: 'BRL' }
   */
  function estimateCreditPrice(kg, opts={ usdToBrl: 5.0 }){
    const tons = calculateCarbonCredits(kg)
    const pricePerTonUSD = (CARBON && CARBON.pricePerTon) || 0
    const totalUSD = tons * pricePerTonUSD
    const rate = (opts && opts.usdToBrl) || 5.0
    const totalBRL = totalUSD * rate
    return { amount: Number(totalBRL.toFixed(2)), currency: 'BRL' }
  }

  window.Calculator = Object.freeze({
    calculateEmission,
    calculateAllModes,
    calculateSavings,
    calculateCarbonCredits,
    estimateCreditPrice
  })
})();
