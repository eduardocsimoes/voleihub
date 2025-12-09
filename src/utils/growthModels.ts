// =========================================================
// ===============  growthModels.ts (ATUALIZADO)  ===========
// =========================================================

export interface GrowthPoint {
  age: number;      // idade em anos (decimal)
  height: number;   // altura em cm
}

export interface LogisticResult {
  predictedAdultHeight: number;
  curve: { age: number; height: number }[];
  adultAge: number;
}

// =========================================================
// === Função Base para o Modelo Clínico (Pais) - MPH =======
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
  return sex === "M"
    ? (fatherHeight + motherHeight + 13) / 2
    : (fatherHeight + motherHeight - 13) / 2;
}

// =========================================================
// =============== Logistic Growth Function =================
// =========================================================
// H(age) = L / (1 + e^( -k (age - m) ))
//
// L = altura adulta (platô)
// k = taxa de crescimento (quão rápido sobe)
// m = idade do estirão (inflection point)
// =========================================================

function logisticHeight(age: number, L: number, k: number, m: number): number {
  return L / (1 + Math.exp(-k * (age - m)));
}

// Gera curva completa dos 0 anos até o platô
function generateLogisticCurve(L: number, k: number, m: number): { age: number; height: number }[] {
  const curve: { age: number; height: number }[] = [];
  const maxAge = 22;

  for (let age = 0; age <= maxAge; age += 0.25) {
    const h = logisticHeight(age, L, k, m);
    if (h > L - 0.1) {
      curve.push({ age, height: h });
      return curve; // encerra no platô
    }
    curve.push({ age, height: h });
  }

  return curve;
}

// =========================================================
// ===== PREVISÃO 2: Logistic Misturado (Pais + Histórico) =====
// =========================================================
export function predictLogisticMixed(history: GrowthPoint[], mph: number | null): LogisticResult | null {
  if (!history.length || mph === null) return null;

  const L = mph;                          // platô vindo dos pais
  const m = 12 + Math.random() * 2;       // idade de estirão típica
  const k = 0.30 + Math.random() * 0.04;  // taxa média masculina/feminina

  const curve = generateLogisticCurve(L, k, m);
  const adultAge = curve[curve.length - 1].age;

  return {
    predictedAdultHeight: L,
    curve,
    adultAge,
  };
}

// =========================================================
// ===== PREVISÃO 3: Logistic Histórico Puro =================
// =========================================================
export function predictLogisticHistory(history: GrowthPoint[]): LogisticResult | null {
  if (!history.length) return null;

  const last = history[history.length - 1].height;

  // Platô baseado no comportamento histórico
  const L = Math.max(last + 8, last * 1.05);

  let m = 11;
  let k = 0.28;

  // Se já está próximo do platô
  if (history.length >= 5) {
    const slope = history[history.length - 1].height - history[history.length - 2].height;
    if (slope < 1) {
      m = history[history.length - 1].age + 1;
      k = 0.25;
    }
  }

  const curve = generateLogisticCurve(L, k, m);
  const adultAge = curve[curve.length - 1].age;

  return {
    predictedAdultHeight: L,
    curve,
    adultAge,
  };
}

// =========================================================
// ========= Curva Real (somente liga os pontos) ============
// =========================================================

export function generateRealCurve(history: GrowthPoint[]) {
  return history
    .sort((a, b) => a.age - b.age)
    .map(h => ({ age: h.age, height: h.height }));
}
