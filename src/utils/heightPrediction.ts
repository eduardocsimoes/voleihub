// src/utils/heightPrediction.ts

/**
 * Um registro de altura simples usado para os cálculos
 */
export interface HeightRecord {
    height: number; // em cm
    date: string;   // string no formato 'YYYY-MM-DD'
  }
  
  /**
   * Converte birthDate e measurementDate em idade em anos (com casas decimais)
   */
  export function ageInYears(birthDate: string, measurementDate: string): number {
    const birth = new Date(birthDate);
    const measure = new Date(measurementDate);
  
    const diffMs = measure.getTime() - birth.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  
    return years;
  }
  
  /**
   * Regressão linear simples (y = a + b x)
   * Retorna null se não tiver pelo menos 2 pontos válidos.
   */
  export function linearRegression(
    xs: number[],
    ys: number[]
  ): { slope: number; intercept: number } | null {
    if (xs.length !== ys.length || xs.length < 2) return null;
  
    const n = xs.length;
    const meanX =
      xs.reduce((sum, v) => sum + v, 0) / n;
    const meanY =
      ys.reduce((sum, v) => sum + v, 0) / n;
  
    let num = 0;
    let den = 0;
  
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX;
      const dy = ys[i] - meanY;
      num += dx * dy;
      den += dx * dx;
    }
  
    if (den === 0) return null;
  
    const slope = num / den;
    const intercept = meanY - slope * meanX;
  
    return { slope, intercept };
  }
  
  /**
   * Prediz a altura adulta do atleta usando:
   * - histórico de medidas (altura x idade)
   * - data de nascimento
   * 
   * Estratégia v1:
   *  - converte cada medida em (idadeEmAnos, altura)
   *  - roda regressão linear
   *  - extrapola para idade-alvo (ex: 18 anos)
   */
  export function predictAdultHeight(
    records: HeightRecord[],
    birthDate: string,
    targetAgeYears: number = 18
  ): {
    predictedHeight: number;
    currentAge: number;
    regressionPoints: { age: number; height: number }[];
  } | null {
    if (!birthDate) return null;
    if (!records || records.length < 2) {
      // com menos de 2 pontos a regressão fica muito fraca
      return null;
    }
  
    // Ordena pelos mais antigos primeiro
    const ordered = [...records].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  
    const ages: number[] = [];
    const heights: number[] = [];
    const regressionPoints: { age: number; height: number }[] = [];
  
    for (const r of ordered) {
      if (!r.date || isNaN(r.height)) continue;
  
      const age = ageInYears(birthDate, r.date);
      ages.push(age);
      heights.push(r.height);
      regressionPoints.push({ age, height: r.height });
    }
  
    if (ages.length < 2) return null;
  
    const model = linearRegression(ages, heights);
    if (!model) return null;
  
    const { slope, intercept } = model;
  
    // idade atual aproximada = idade do último registro
    const currentAge = ages[ages.length - 1];
  
    const predictedHeight = intercept + slope * targetAgeYears;
  
    return {
      predictedHeight,
      currentAge,
      regressionPoints,
    };
  }
  