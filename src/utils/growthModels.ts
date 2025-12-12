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
 * (na prática usamos principalmente a última medida real)
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
// ====== Curvas de Referência (formato OMS-like) ==========
// =========================================================
//
// Em vez de usar função logística pura, definimos uma
// CURVA DE REFERÊNCIA por sexo como fração da altura adulta
// para cada idade. Depois, cada metodologia só muda a
// ALTURA ADULTA alvo e reaproveita o mesmo formato.
//
// Exemplo (meninas, valores aproximados):
//  - 5 anos  ~ 110 cm  (~67% da altura adulta ~164)
//  - 10 anos ~ 138 cm
//  - 14 anos ~ 160 cm
//  - 18 anos ~ 164 cm
// =========================================================

interface RefFraction {
  age: number;      // idade em anos
  fraction: number; // fração da altura adulta (0–1)
}

// Curva de referência aproximada para meninas (percentil ~50 OMS)
const femaleRefFractions: RefFraction[] = [
  { age: 5, fraction: 110 / 164 },
  { age: 6, fraction: 115 / 164 },
  { age: 7, fraction: 120 / 164 },
  { age: 8, fraction: 127 / 164 },
  { age: 9, fraction: 133 / 164 },
  { age: 10, fraction: 138 / 164 },
  { age: 11, fraction: 145 / 164 },
  { age: 12, fraction: 152 / 164 },
  { age: 13, fraction: 157 / 164 },
  { age: 14, fraction: 160 / 164 },
  { age: 15, fraction: 162 / 164 },
  { age: 16, fraction: 163 / 164 },
  { age: 17, fraction: 164 / 164 },
  { age: 18, fraction: 164 / 164 },
];

// Curva de referência aproximada para meninos (percentil ~50 OMS)
const maleRefFractions: RefFraction[] = [
  { age: 5, fraction: 112 / 178 },
  { age: 6, fraction: 117 / 178 },
  { age: 7, fraction: 122 / 178 },
  { age: 8, fraction: 127 / 178 },
  { age: 9, fraction: 133 / 178 },
  { age: 10, fraction: 138 / 178 },
  { age: 11, fraction: 145 / 178 },
  { age: 12, fraction: 152 / 178 },
  { age: 13, fraction: 160 / 178 },
  { age: 14, fraction: 167 / 178 },
  { age: 15, fraction: 173 / 178 },
  { age: 16, fraction: 176 / 178 },
  { age: 17, fraction: 178 / 178 },
  { age: 18, fraction: 178 / 178 },
];

function getRefTable(sex: "M" | "F"): RefFraction[] {
  return sex === "F" ? femaleRefFractions : maleRefFractions;
}

/**
 * Interpola a fração de altura adulta para uma idade qualquer,
 * usando a tabela de referência do sexo.
 */
function getReferenceFraction(sex: "M" | "F", age: number): number {
  const table = getRefTable(sex);

  if (age <= table[0].age) return table[0].fraction;
  const last = table[table.length - 1];
  if (age >= last.age) return last.fraction;

  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (age >= a.age && age <= b.age) {
      const t = (age - a.age) / (b.age - a.age);
      return a.fraction + t * (b.fraction - a.fraction);
    }
  }

  // fallback (não deveria chegar aqui)
  return last.fraction;
}

/**
 * Gera a curva "padrão" de crescimento para uma altura adulta
 * alvo, usando as frações de referência por idade.
 */
function buildReferenceCurve(
  adultHeight: number,
  sex: "M" | "F"
): { age: number; height: number }[] {
  const table = getRefTable(sex);
  const minAge = table[0].age;
  const maxAge = table[table.length - 1].age;

  const curve: { age: number; height: number }[] = [];
  const step = 0.25; // 3 meses

  for (let age = minAge; age <= maxAge + 1e-6; age += step) {
    const frac = getReferenceFraction(sex, age);
    curve.push({ age, height: adultHeight * frac });
  }

  return curve;
}

// =========================================================
// ====== Banda de Confiança Percentual (± %) ==============
// =========================================================

/**
 * Aplica banda percentual fixa a uma curva já gerada.
 * Mantém o MESMO formato/idades, apenas escala a altura.
 */
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

/**
 * Helper geral: a partir de uma altura adulta alvo,
 * monta a trajetória + intervalo de confiança (±1,5%).
 */
function buildResultFromAdultHeight(
  adultHeight: number,
  sex: "M" | "F"
): LogisticResult {
  const curve = buildReferenceCurve(adultHeight, sex);
  const adultAge =
    curve.length > 0 ? curve[curve.length - 1].age : getRefTable(sex).slice(-1)[0].age;

  const band = applyConfidenceBandPercent(curve, 0.015); // 1,5%

  return {
    predictedAdultHeight: adultHeight,
    curve,
    adultAge,
    ...band,
  };
}

// =========================================================
// =====  Função auxiliar: “altura adulta” da altura atual ==
// =========================================================

/**
 * Estima altura adulta a partir da altura atual.
 * - Para meninas com idade da menarca: usa "crescimento remanescente" típico.
 * - Caso contrário, usa fração de referência por idade.
 */
function estimateAdultFromCurrent(
  aux: AuxGrowthData,
  mph: number | null
): number | null {
  const { sex, currentAge, currentHeight, menarcaAge } = aux;
  if (!currentHeight || !currentAge) {
    return mph;
  }

  // Meninas com menarca informada: regras clínicas simples
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

  // Caso geral: usa fração de referência por idade
  const frac = getReferenceFraction(sex, currentAge);
  if (frac <= 0) return mph;

  return currentHeight / frac;
}

// =========================================================
// === 2) TRAJETÓRIA Clínica (Pais) =========================
// =========================================================
//
// Usa apenas o MPH como altura alvo. Curva de referência
// padrão + intervalo de confiança de ±1,5%.
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
// - Usa uma estimativa de altura adulta baseada na altura atual,
//   via fração de referência.
// - Não utiliza toda a curva histórica, apenas altura atual
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
  history: GrowthPoint[],              // IGNORADO
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
// ========= Curva Real (monótona, sem “encolher”) ==========
// =========================================================
//
// Ordena por idade e aplica um máximo cumulativo de altura,
// garantindo que a curva nunca diminui com o tempo.
// =========================================================

export function generateRealCurve(history: GrowthPoint[]) {
  const sorted = [...history].sort((a, b) => a.age - b.age);

  const curve: { age: number; height: number }[] = [];
  let maxHeight = -Infinity;

  for (const p of sorted) {
    if (p.height > maxHeight) {
      maxHeight = p.height;
    }
    curve.push({ age: p.age, height: maxHeight });
  }

  return curve;
}
