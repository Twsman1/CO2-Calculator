# CO₂ Calculator — Projeto

Este repositório contém uma calculadora de emissões de CO₂ para viagens, com interface semântica HTML5, estilos responsivos e lógica modular em JavaScript.

Resumo das funcionalidades implementadas

- Estrutura HTML5 semântica (`header`, `main`, `footer`) com meta `viewport` para responsividade.
- Formulário com `origin`, `destination`, `distance` (readonly por padrão) e checkbox para entrada manual da distância.
- Seletor visual de modo de transporte com 4 opções: Car, Bus, Train, Flight.
- Autofill inteligente de distância usando geocoding (Nominatim) + cálculo haversine; fallback heurístico se o geocoding falhar.
- Seções de `Result`, `Comparison` e `Credits` ocultas por padrão e reveladas sequencialmente após o cálculo.
- Arquitetura modular de scripts carregados em ordem: `vendor.js`, `utils.js`, `calculator.js`, `config.js`, `ui.js`, `app.js`.
- CSS com convenção BEM, custom properties (cores eco-friendly, escala de espaçamento, sombras), utilitários, animações e regras responsivas.

Principais arquivos

- `index.html` — Estrutura semântica do app, links para `styles/styles.css` e scripts.
- `styles/styles.css` — Variáveis CSS, reset, utilitários, componentes, animações e media queries.
- `scripts/vendor.js` — Placeholder para bibliotecas externas (carregado primeiro).
- `scripts/utils.js` — Utilitários: `estimateDistanceFromStrings()`, `geocode()` (Nominatim) e `haversineKm()`.
- `scripts/calculator.js` — `Calculator` com: `calculateEmission()`, `calculateAllModes()`, `calculateSavings()`, `calculateCarbonCredits()`, `estimateCreditPrice()`.
- `scripts/config.js` — `CONFIG` contendo `EMISSION_FACTORS`, `TRANSPORT_MODES`, `CARBON_CREDIT`, além de `populateDatalist()` e `setupDistanceAutofill()`.
- `scripts/ui.js` — `UI` com formatação, renderização (`renderResults`, `renderComparison`, `renderCarbonCredits`) e controles de loading.
- `scripts/app.js` — Inicialização, debounce/autofill, handlers (submit), try/catch, simulação de processamento e chamadas sequenciais ao `UI`.

Como executar localmente

1. Abra `index.html` no navegador (duplo-clique ou via PowerShell):

```

2. Preencha `Origin` e `Destination`. A distância será preenchida automaticamente quando possível (usa Nominatim). Marque "Enter distance manually" para inserir um valor próprio.
3. Selecione o modo de transporte e clique em `Calculate`.
4. Os resultados, comparação e créditos serão exibidos em sequência.

Observações e limites

- Geocoding: o app usa o endpoint público do Nominatim (OpenStreetMap) em `scripts/utils.js`. Esse serviço possui limites e termos de uso — para produção, use provider com chave/API ou hospede Nominatim próprio.
- O cálculo de distância com `haversineKm()` fornece distância em linha reta; para distâncias reais por estrada/rota, use um serviço de rotas (Mapbox, Google/HERE).
- Fallback heurístico (`estimateDistanceFromStrings`) tenta fornecer um valor aproximado quando geocoding não está disponível.

Configuração e personalização

- Atualize fatores de emissão em `scripts/config.js` (`CONFIG.EMISSION_FACTORS`) com valores oficiais, se necessário.
- Ajuste `CARBON_CREDIT.pricePerTon` em `CONFIG` e a taxa USD→BRL usada em `Calculator.estimateCreditPrice()`.

Design e UI

- Convenção BEM aplicada ao CSS: ex. `co2-calc__form`, `co2-calc__modes`, `co2-calc__card`.
- Estilos responsivos: grade para modos, cards para resultados, barras coloridas na comparação, grid de créditos.
- Animação `fadeInUp` aplicada quando seções aparecem.

Possíveis melhorias

- Implementar cache/local rate-limiting para chamadas Nominatim.
- Substituir Nominatim por API de rotas para distâncias reais (driving/walking).
- Adicionar testes unitários para funções em `scripts/calculator.js` e `scripts/utils.js`.
- Persistência de preferências (moeda, taxa de conversão) e internacionalização.

Licença e créditos

MIT

---
Feito com 💚 — 
