// =========================================================
// =======  Modelos de Crescimento + Intervalo de CI  ======
// =========================================================

export interface GrowthPoint {
  age: number; // idade em anos (decimal)
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
 */
export interface AuxGrowthData {
  sex: "M" | "F";
  currentAge?: number; // idade atual em anos (decimal)
  currentHeight?: number; // altura atual em cm
  currentWeight?: number; // opcional – reservado para futuro
  menarcaAge?: number; // se for menina
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
// ===== Curva padrão de crescimento (tipo OMS/CDC) ========
// =========================================================
//
// Em vez de usar logística solta (que começava "colada" em 0),
// usamos uma curva padrão de fração da altura adulta por idade,
// baseada em valores aproximados das curvas OMS/CDC.
//
// A curva final da metodologia é:
//   altura(idade) = alturaAdultaPrevista * fração(sexo, idade)
// =========================================================

type FractionPoint = { age: number; frac: number };

// Pontos de referência para MENINAS (F)
// Valores aproximados da fração da altura adulta.
const femaleFractionTable: FractionPoint[] = [
  { age: 0, frac: 0.32 }, // ~50 cm para 157 cm
  { age: 1, frac: 0.52 },
  { age: 2, frac: 0.60 },
  { age: 4, frac: 0.76 },
  { age: 6, frac: 0.84 },
  { age: 8, frac: 0.90 },
  { age: 10, frac: 0.94 },
  { age: 12, frac: 0.97 },
  { age: 14, frac: 0.99 },
  { age: 16, frac: 1.0 },
];

// Pontos de referência para MENINOS (M)
const maleFractionTable: FractionPoint[] = [
  { age: 0, frac: 0.32 },
  { age: 1, frac: 0.50 },
  { age: 2, frac: 0.60 },
  { age: 4, frac: 0.74 },
  { age: 6, frac: 0.82 },
  { age: 8, frac: 0.88 },
  { age: 10, frac: 0.93 },
  { age: 12, frac: 0.96 },
  { age: 14, frac: 0.98 },
  { age: 16, frac: 0.995 },
  { age: 18, frac: 1.0 },
];

function getFractionTable(sex: "M" | "F"): FractionPoint[] {
  return sex === "F" ? femaleFractionTable : maleFractionTable;
}

/**
 * Interpola linearmente a fração da altura adulta para uma idade específica.
 * Retorna sempre um valor entre ~0.3 e 1.0, crescente com a idade.
 */
function growthFraction(sex: "M" | "F", age: number): number {
  const table = getFractionTable(sex);

  if (age <= table[0].age) return table[0].frac;
  if (age >= table[table.length - 1].age) return table[table.length - 1].frac;

  for (let i = 0; i < table.length - 1; i++) {
    const p1 = table[i];
    const p2 = table[i + 1];
    if (age >= p1.age && age <= p2.age) {
      const t = (age - p1.age) / (p2.age - p1.age);
      return p1.frac + t * (p2.frac - p1.frac);
    }
  }

  // fallback de segurança
  return table[table.length - 1].frac;
}

/**
 * Idade em que consideramos que a altura está essencialmente estável.
 */
function getAdultAgeLimit(sex: "M" | "F"): number {
  return sex === "F" ? 17 : 19;
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

  return {
    lowerCurve,
    upperCurve,
    ciLowerAdult,
    ciUpperAdult,
  };
}

/**
 * Helper geral: a partir de uma altura adulta alvo,
 * monta a trajetória baseada na curva padrão OMS/CDC
 * e aplica intervalo de confiança fixo de ±1,5%.
 */
function buildResultFromAdultHeight(
  adultHeight: number,
  sex: "M" | "F"
): LogisticResult {
  const adultAgeLimit = getAdultAgeLimit(sex);
  const step = 0.25;

  const curve: { age: number; height: number }[] = [];

  for (let age = 0; age <= adultAgeLimit; age += step) {
    const frac = growthFraction(sex, age);
    curve.push({
      age,
      height: adultHeight * frac,
    });
  }

  const last = curve[curve.length - 1];
  const band = applyConfidenceBandPercent(curve, 0.015); // ±1,5%

  return {
    predictedAdultHeight: adultHeight,
    curve,
    adultAge: last.age,
    ...band,
  };
}

// =========================================================
// =====  Função auxiliar para “altura atual”  =============
// =========================================================

/**
 * Estima altura adulta a partir da altura atual.
 * - Para meninas com idade da menarca: usa "crescimento remanescente" típico.
 * - Caso contrário, usa a fração da curva padrão (OMS/CDC) por idade.
 */
function estimateAdultFromCurrent(
  aux: AuxGrowthData,
  mph: number | null
): number | null {
  const { sex, currentAge, currentHeight, menarcaAge } = aux;
  if (!currentHeight || currentAge == null) {
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

  // Caso geral: aproxima pela fração da altura adulta da curva padrão
  const frac = growthFraction(sex, currentAge);
  if (frac <= 0) return mph;

  return currentHeight / frac;
}

// =========================================================
// === 2) TRAJETÓRIA Clínica (Pais) =========================
// =========================================================
//
// Usa apenas o MPH como altura alvo, com curva padrão
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
  history: GrowthPoint[], // mantido por compatibilidade (IGNORADO)
  mph: number | null,
  sex: "M" | "F",
  aux?: AuxGrowthData
): LogisticResult | null {
  if (mph == null) return null;

  const popMean = sex === "F" ? 162 : 176;

  const adultFromCurrent =
    aux != null ? estimateAdultFromCurrent(aux, mph) : mph;

  const base = adultFromCurrent != null ? adultFromCurrent : mph;

  // mistura: 40% MPH, 40% baseAtual, 20% média populacional
  const adultHeight = 0.4 * mph + 0.4 * base + 0.2 * popMean;

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
  history: GrowthPoint[], // IGNORADO
  mph: number | null,
  sex: "M" | "F",
  aux?: AuxGrowthData
): LogisticResult | null {
  if (mph == null) return null;

  const adultFromCurrent =
    aux != null ? estimateAdultFromCurrent(aux, mph) : mph;

  const base = adultFromCurrent != null ? adultFromCurrent : mph;

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
  history: GrowthPoint[], // IGNORADO
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
//
// Importante: a curva real é forçada a ser NÃO-DECRESCENTE,
// para evitar o efeito irreal de "diminuir de altura".
// =========================================================

export function generateRealCurve(history: GrowthPoint[]) {
  const sorted = [...history].sort((a, b) => a.age - b.age);

  const monotone: { age: number; height: number }[] = [];
  let maxSoFar = -Infinity;

  for (const p of sorted) {
    if (!Number.isFinite(p.height)) continue;
    if (maxSoFar < 0) {
      maxSoFar = p.height;
    } else {
      if (p.height < maxSoFar) {
        // força a não diminuir
        maxSoFar = maxSoFar;
      } else {
        maxSoFar = p.height;
      }
    }

    monotone.push({ age: p.age, height: maxSoFar });
  }

  return monotone;
}
