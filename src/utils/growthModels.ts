// src/utils/growthModels.ts
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
 * Resultado de uma trajetória logística (curva do 0 até idade adulta)
 * com banda de confiança percentual.
 */
export interface LogisticResult extends ConfidenceBand {
  predictedAdultHeight: number;
  curve: { age: number; height: number }[];
  adultAge: number;
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
      m: 11.5,   // pico de crescimento ~11–12
      k: 0.30,   // taxa
      maxAgeAdult: 17, // estabiliza altura até ~17
    };
  }
  return {
    m: 13,      // pico ~13
    k: 0.27,
    maxAgeAdult: 19, // estabiliza até ~19
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

    // se já está a menos de 0.1 cm do platô, paramos
    if (h >= L - 0.1) break;
  }

  return curve;
}

// =========================================================
// ====== Banda de Confiança Percentual (± %) ==============
// =========================================================

function applyConfidenceBandPercent(
  curve: { age: number; height: number }[],
  percent: number
): ConfidenceBand {
  const lowerCurve = curve.map((p) => ({
    age: p.age,
    height: p.height * (1 - percent),
  }));

  const upperCurve = curve.map((p) => ({
    age: p.age,
    height: p.height * (1 + percent),
  }));

  const last = curve[curve.length - 1];
  const ciLowerAdult = last.height * (1 - percent);
  const ciUpperAdult = last.height * (1 + percent);

  return { lowerCurve, upperCurve, ciLowerAdult, ciUpperAdult };
}

// =========================================================
// === 2) Modelo Populacional (Pais + Referência) ==========
// =========================================================
//
// - Usa MPH como base da altura adulta.
// - Ajusta levemente em direção à média populacional OMS/CDC
//   (valores aproximados para adultos).
// - NÃO usa histórico individual.
// =========================================================

export function predictLogisticMixed(
  history: GrowthPoint[],         // mantido apenas por compatibilidade (IGNORADO)
  mph: number | null,
  sex: "M" | "F"
): LogisticResult | null {
  if (mph == null) return null;

  const { m, k, maxAgeAdult } = getSexParams(sex);

  // médias populacionais aproximadas (OMS/CDC, adulto)
  const popMean = sex === "F" ? 162 : 176;

  // traz a altura alvo um pouco em direção à média populacional,
  // mas mantendo MUITO próxima do MPH.
  const L = 0.7 * mph + 0.3 * popMean;

  const curve = generateLogisticCurve(L, k, m, maxAgeAdult);
  const last = curve[curve.length - 1];

  // IC de ±2.5% em torno da curva
  const band = applyConfidenceBandPercent(curve, 0.025);

  return {
    predictedAdultHeight: last.height,
    adultAge: last.age,
    curve,
    ...band,
  };
}

// =========================================================
// === 3) Curva de Referência de Crescimento ===============
// =========================================================
//
// - Usa MPH como base, mas aplica um ajuste leve
//   para simular um percentil um pouco acima/abaixo.
// - NÃO usa histórico individual (apenas sexo + MPH).
// =========================================================

export function predictLogisticHistory( // nome mantido só p/ compatibilidade
  history: GrowthPoint[],              // IGNORADO
  mph: number | null,
  sex: "M" | "F"
): LogisticResult | null {
  if (mph == null) return null;

  const { m, k, maxAgeAdult } = getSexParams(sex);

  // Curva "de referência" levemente diferente do MPH
  // (ex.: um percentil ~75 se MPH já está perto da média).
  const L = mph * 1.02; // 2% acima do MPH, bem próximo

  const curve = generateLogisticCurve(L, k, m, maxAgeAdult);
  const last = curve[curve.length - 1];

  // IC de ±3% em torno da curva
  const band = applyConfidenceBandPercent(curve, 0.03);

  return {
    predictedAdultHeight: last.height,
    adultAge: last.age,
    curve,
    ...band,
  };
}

// =========================================================
// === 4) Modelo Bayesiano (Pais + População) ==============
// =========================================================
//
// - Prior: altura adulta da população (OMS/CDC).
// - "Observação": MPH (altura dos pais).
// - Posterior: combinação das duas fontes (sem histórico).
// =========================================================

export function predictBayesianTrajectory(
  history: GrowthPoint[],         // IGNORADO
  mph: number | null,
  sex: "M" | "F"
): LogisticResult | null {
  if (mph == null) return null;

  // Prior (população)
  const popMean = sex === "F" ? 162 : 176;
  const priorMean = popMean;
  const priorSd = 6;
  const priorVar = priorSd * priorSd;

  // "Observação" = MPH
  const obsMean = mph;
  const obsSd = 4;
  const obsVar = obsSd * obsSd;

  // Combinação bayesiana simples (normal-normal)
  const posteriorMean =
    (priorMean / priorVar + obsMean / obsVar) / (1 / priorVar + 1 / obsVar);
  const posteriorVar = 1 / (1 / priorVar + 1 / obsVar);
  const posteriorSd = Math.sqrt(posteriorVar);

  const { m, k, maxAgeAdult } = getSexParams(sex);

  const L = posteriorMean;
  const curve = generateLogisticCurve(L, k, m, maxAgeAdult);
  const last = curve[curve.length - 1];

  // IC baseado no desvio posterior, com mínimo de ±2.5%
  const pctFromSd = posteriorSd / last.height;
  const percent = Math.max(0.025, pctFromSd);
  const band = applyConfidenceBandPercent(curve, percent);

  return {
    predictedAdultHeight: last.height,
    adultAge: last.age,
    curve,
    ...band,
  };
}

// =========================================================
// ========= Curva Real (apenas liga os pontos) =============
// =========================================================

export function generateRealCurve(history: GrowthPoint[]) {
  return [...history]
    .sort((a, b) => a.age - b.age)
    .map((h) => ({ age: h.age, height: h.height }));
}
