// =========================================================
// =======  Modelos de Crescimento + Intervalo de CI  ======
// =========================================================

export interface GrowthPoint {
  age: number;    // idade em anos (decimal)
  height: number; // altura em cm
}

export interface ConfidenceBand {
  lowerCurve: { age: number; height: number }[];
  upperCurve: { age: number; height: number }[];
  ciLowerAdult: number;
  ciUpperAdult: number;
}

/**
 * Resultado de uma trajetória (curva do 0 até idade adulta)
 * com banda de confiança percentual.
 */
export interface LogisticResult extends ConfidenceBand {
  predictedAdultHeight: number;
  curve: { age: number; height: number }[];
  adultAge: number;
}

/**
 * Dados auxiliares para refinar as previsões.
 * (na prática vamos usar principalmente a última medida real)
 */
export interface AuxGrowthData {
  sex: "M" | "F";
  currentAge?: number;    // idade atual em anos (decimal)
  currentHeight?: number; // altura atual em cm
  currentWeight?: number; // opcional – por enquanto não usamos
  menarcaAge?: number;    // se for menina
}

// =========================================================
// === 1) Modelo Clínico (Pais) - Mid Parental Height ======
// =========================================================

export function predictMidParentalHeight({
  sex,
  fatherHeight,
  motherHeight,
}: {
  sex: "M" | "F";
  fatherHeight?: number;
  motherHeight?: number;
}): number | null {
  if (!fatherHeight || !motherHeight) return null;

  // Fórmula clássica MPH
  return sex === "M"
    ? (fatherHeight + motherHeight + 13) / 2
    : (fatherHeight + motherHeight - 13) / 2;
}

// =========================================================
// =============== Funções Logísticas Básicas ==============
// =========================================================
//
// H(age) = L / (1 + e^( -k (age - m) ))
//
// L = altura adulta (platô)
// k = taxa de crescimento
// m = idade do "estirão" (inflection point)
// =========================================================

function logisticHeight(age: number, L: number, k: number, m: number): number {
  return L / (1 + Math.exp(-k * (age - m)));
}

// parâmetros típicos por sexo (aprox. OMS/CDC)
function getSexParams(sex: "M" | "F") {
  if (sex === "F") {
    return {
      m: 11.5,     // pico de crescimento ~11–12 anos
      k: 0.32,     // taxa de crescimento
      maxAgeAdult: 17, // estabiliza altura até ~17 anos
    };
  }
  return {
    m: 13,        // pico ~13 anos
    k: 0.30,
    maxAgeAdult: 19, // estabiliza até ~19 anos
  };
}

/**
 * Curva logística do 0 até o platô (ou até maxAge),
 * usando passo de 0.25 ano para ficar suave.
 */
function generateLogisticCurve(
  L: number,
  k: number,
  m: number,
  maxAgeOverride?: number
): { age: number; height: number }[] {
  const maxAge = maxAgeOverride ?? 22; // fallback de segurança
  const curve: { age: number; height: number }[] = [];

  for (let age = 0; age <= maxAge; age += 0.25) {
    const h = logisticHeight(age, L, k, m);
    curve.push({ age, height: h });

    // se já está a menos de 0.1 cm do platô, podemos parar
    if (h >= L - 0.1) break;
  }

  return curve;
}

// =========================================================
// ====== Banda de Confiança Percentual (± %) ==============
// =========================================================

function buildBandFromAdultHeight(
  adultHeight: number,
  sex: "M" | "F",
  percent: number
): ConfidenceBand {
  const { m, k, maxAgeAdult } = getSexParams(sex);
  const lowerL = adultHeight * (1 - percent);
  const upperL = adultHeight * (1 + percent);

  const lowerCurve = generateLogisticCurve(lowerL, k, m, maxAgeAdult);
  const upperCurve = generateLogisticCurve(upperL, k, m, maxAgeAdult);

  return {
    lowerCurve,
    upperCurve,
    ciLowerAdult: lowerL,
    ciUpperAdult: upperL,
  };
}

/**
 * Helper geral: a partir de uma altura adulta alvo,
 * monta a trajetória logística + intervalo de confiança.
 * CI fixo de ±1,5%.
 */
function buildResultFromAdultHeight(
  adultHeight: number,
  sex: "M" | "F"
): LogisticResult {
  const { m, k, maxAgeAdult } = getSexParams(sex);
  const curve = generateLogisticCurve(adultHeight, k, m, maxAgeAdult);
  const adultAge =
    curve.length > 0 ? curve[curve.length - 1].age : maxAgeAdult;

  const band = buildBandFromAdultHeight(adultHeight, sex, 0.015); // 1,5%

  return {
    predictedAdultHeight: adultHeight,
    curve,
    adultAge,
    ...band,
  };
}

// =========================================================
// =====  Funções auxiliares para “altura atual”  ==========
// =========================================================

/**
 * Fração aproximada da altura adulta para meninas, por idade.
 * Valores grosseiros, inspirados em curvas OMS/CDC.
 */
function approximateFemaleFraction(age: number): number {
  if (age <= 8) return 0.80;
  if (age <= 10) return 0.88 + 0.01 * (age - 8);   // 8→0.88, 10→0.90
  if (age <= 12) return 0.90 + 0.025 * (age - 10); // 10→0.90, 12→0.95
  if (age <= 14) return 0.95 + 0.015 * (age - 12); // 12→0.95, 14→0.98
  if (age <= 17) return 0.98 + 0.007 * (age - 14); // 14→0.98, 17→0.999
  return 1.0;
}

/**
 * Fração aproximada da altura adulta para meninos, por idade.
 */
function approximateMaleFraction(age: number): number {
  if (age <= 10) return 0.78;
  if (age <= 12) return 0.85 + 0.02 * (age - 10);  // 10→0.85, 12→0.89
  if (age <= 14) return 0.89 + 0.02 * (age - 12);  // 12→0.89, 14→0.93
  if (age <= 18) return 0.93 + 0.018 * (age - 14); // 14→0.93, 18→1.00
  return 1.0;
}

/**
 * Estima altura adulta a partir da altura atual.
 * - Para meninas com idade da menarca: usa "crescimento remanescente" típico.
 * - Caso contrário, usa fração aproximada da altura adulta por idade.
 */
function estimateAdultFromCurrent(
  aux: AuxGrowthData,
  mph: number | null
): number | null {
  const { sex, currentAge, currentHeight, menarcaAge } = aux;
  if (!currentHeight || !currentAge) {
    return mph;
  }

  // Meninas com menarca informada: usa regras de crescimento pós-menarca.
  if (sex === "F" && menarcaAge != null) {
    const yearsSinceMenarca = currentAge - menarcaAge;
    let remaining: number;

    if (yearsSinceMenarca <= 0) {
      remaining = 8;
    } else if (yearsSinceMenarca <= 1) {
      // 6 → 4 cm conforme se aproxima de 1 ano pós-menarca
      remaining = 6 - 2 * yearsSinceMenarca;
    } else if (yearsSinceMenarca <= 2) {
      // 4 → 2 cm entre 1 e 2 anos pós-menarca
      remaining = 4 - 2 * (yearsSinceMenarca - 1);
    } else if (yearsSinceMenarca <= 3) {
      // 2 → 1 cm entre 2 e 3 anos
      remaining = 2 - 1 * (yearsSinceMenarca - 2);
    } else {
      remaining = 1;
    }

    if (remaining < 0) remaining = 0;
    return currentHeight + remaining;
  }

  // Caso geral: aproxima pela fração da altura adulta.
  const frac =
    sex === "F"
      ? approximateFemaleFraction(currentAge)
      : approximateMaleFraction(currentAge);

  if (frac <= 0) return mph;
  return currentHeight / frac;
}

// =========================================================
// === 2) TRAJETÓRIA Clínica (Pais) =========================
// =========================================================
//
// Usa apenas o MPH como altura alvo. Curva logística padrão
// e intervalo de confiança de ±1,5%.
// =========================================================

export function buildClinicalTrajectory(
  mphAdult: number | null,
  sex: "M" | "F"
): LogisticResult | null {
  if (mphAdult == null) return null;
  return buildResultFromAdultHeight(mphAdult, sex);
}

// =========================================================
// === 3) Modelo Populacional (Pais + Referência) ==========
// =========================================================
//
// - Usa MPH como base da altura adulta.
// - Usa uma estimativa de altura adulta baseada em dados
//   populacionais aproximados (fração da altura por idade).
// - NÃO utiliza toda a curva histórica, apenas altura atual
//   (última medida) se disponível.
// =========================================================

export function predictLogisticMixed(
  history: GrowthPoint[],         // mantido por compatibilidade (IGNORADO)
  mph: number | null,
  sex: "M" | "F",
  aux?: AuxGrowthData
): LogisticResult | null {
  if (mph == null) return null;

  const popMean = sex === "F" ? 162 : 176;

  const adultFromCurrent =
    aux != null ? estimateAdultFromCurrent(aux, mph) : mph;

  // Combina MPH, população e altura atual – levemente otimista
  const base =
    adultFromCurrent != null ? adultFromCurrent : mph;

  // mistura: 40% MPH, 40% baseAtual, 20% média populacional
  const adultHeight =
    0.4 * mph + 0.4 * base + 0.2 * popMean;

  return buildResultFromAdultHeight(adultHeight, sex);
}

// =========================================================
// === 4) Curva de Crescimento de Referência ===============
// =========================================================
//
// - Usa MPH como base.
// - Ajusta um pouco na direção da altura estimada pela
//   altura atual, simulando um percentil próximo.
// =========================================================

export function predictLogisticHistory( // nome mantido só p/ compatibilidade
  history: GrowthPoint[],              // IGNORADO
  mph: number | null,
  sex: "M" | "F",
  aux?: AuxGrowthData
): LogisticResult | null {
  if (mph == null) return null;

  const adultFromCurrent =
    aux != null ? estimateAdultFromCurrent(aux, mph) : mph;

  const base =
    adultFromCurrent != null ? adultFromCurrent : mph;

  // mais "colado" ao MPH, puxando 40% para a altura atual
  const adultHeight = 0.6 * mph + 0.4 * base;

  return buildResultFromAdultHeight(adultHeight, sex);
}

// =========================================================
// === 5) Modelo Bayesiano (Pais + População) ==============
// =========================================================
//
// - Prior implícito no MPH (altura dos pais).
// - "Evidência" forte na estimativa baseada na altura atual.
// - Não usa toda a série histórica, apenas o ponto atual.
// =========================================================

export function predictBayesianTrajectory(
  history: GrowthPoint[],         // IGNORADO
  mph: number | null,
  sex: "M" | "F",
  aux?: AuxGrowthData
): LogisticResult | null {
  if (mph == null) return null;

  const adultFromCurrent =
    aux != null ? estimateAdultFromCurrent(aux, mph) : mph;

  if (adultFromCurrent == null) {
    return buildResultFromAdultHeight(mph, sex);
  }

  // combinação bayesiana simples: 25% MPH, 75% "altura atual"
  const adultHeight = (mph + 3 * adultFromCurrent) / 4;

  return buildResultFromAdultHeight(adultHeight, sex);
}

// =========================================================
// ========= Curva Real (apenas liga os pontos) =============
// =========================================================

export function generateRealCurve(history: GrowthPoint[]) {
  return [...history]
    .sort((a, b) => a.age - b.age)
    .map((h) => ({ age: h.age, height: h.height }));
}
