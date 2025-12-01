// src/gamification/gamification.ts

import { Achievement, CareerExperience, AtletaProfile } from "../firebase/firestore";

/* ============================================================
   🎮 SISTEMA DE PONTOS DE GAMIFICAÇÃO – VÔLEI HUB
   ============================================================ */

/**
 * Tabela de pontos por tipo de conquista.
 */
export const GAMIFICATION_POINTS = {
  participation: 10,      // Participou (estadual, regional, copa, etc.)
  medal_bronze: 30,       // 3º lugar
  medal_silver: 50,       // 2º lugar
  medal_gold: 80,         // 1º lugar
  state_title: 120,       // Campeão Estadual
  national_title: 200,    // Campeão Nacional / CBS
  individual_award: 150,  // Prêmio individual
  national_call: 250,     // Convocação Seleção Brasileira
  state_call: 100         // Convocação Seleção Estadual
};

/**
 * Tabela de níveis de atleta.
 */
export const GAMIFICATION_LEVELS = [
  { level: 1, title: "Iniciante", minXP: 0 },
  { level: 2, title: "Competidor", minXP: 200 },
  { level: 3, title: "Promessa", minXP: 400 },
  { level: 4, title: "Avançado", minXP: 700 },
  { level: 5, title: "Elite Estadual", minXP: 1100 },
  { level: 6, title: "Elite Nacional", minXP: 1500 },
  { level: 7, title: "Talento Brasileiro", minXP: 2000 },
  { level: 8, title: "Lenda do Vôlei", minXP: 2600 }
];

/* ============================================================
   🧮 FUNÇÃO PRINCIPAL DE CÁLCULO
   ============================================================ */

/**
 * Calcula os pontos e nível do atleta com base no seu perfil.
 */
export function calculateAthleteGamification(atleta: AtletaProfile | null) {
  if (!atleta) {
    return {
      xp: 0,
      level: 1,
      nextLevelXP: 200,
      progress: 0
    };
  }

  let totalXP = 0;

  /* ============================================================
     🎖️ 1. Pontos por CONQUISTAS
     ============================================================ */
  for (const ach of atleta.achievements || []) {
    // Medalhas
    if (ach.placement === "1º Lugar") totalXP += GAMIFICATION_POINTS.medal_gold;
    else if (ach.placement === "2º Lugar") totalXP += GAMIFICATION_POINTS.medal_silver;
    else if (ach.placement === "3º Lugar") totalXP += GAMIFICATION_POINTS.medal_bronze;
    else if (ach.placement === "Participante") totalXP += GAMIFICATION_POINTS.participation;

    // Prêmios individuais
    if (ach.type === "Individual" && ach.award) {
      totalXP += GAMIFICATION_POINTS.individual_award;
    }

    // Campeonatos estaduais (heurística por nome)
    if (ach.championship.toLowerCase().includes("estadual") && ach.placement === "1º Lugar") {
      totalXP += GAMIFICATION_POINTS.state_title;
    }

    // Campeonatos nacionais (CBS / CBI)
    if (
      ach.championship.toLowerCase().includes("cbs") ||
      ach.championship.toLowerCase().includes("brasileiro")
    ) {
      if (ach.placement === "1º Lugar") {
        totalXP += GAMIFICATION_POINTS.national_title;
      }
    }
  }

  /* ============================================================
     🧩 2. Pontos por EXPERIÊNCIAS
     ============================================================ */
  const clubs = atleta.experiences?.length || 0;
  totalXP += clubs * 5; // cada clube dá +5 pontos

  /* ============================================================
     🧩 3. Convocações
     ============================================================ */

  const awards = atleta.achievements || [];

  const hasStateCall = awards.some(a => a.championship.toLowerCase().includes("seleção do estado"));
  const hasBrazilCall = awards.some(a => a.championship.toLowerCase().includes("seleção brasileira"));

  if (hasStateCall) totalXP += GAMIFICATION_POINTS.state_call;
  if (hasBrazilCall) totalXP += GAMIFICATION_POINTS.national_call;

  /* ============================================================
     📊 4. Determinar o nível
     ============================================================ */
  let currentLevel = GAMIFICATION_LEVELS[0];
  let nextLevel = GAMIFICATION_LEVELS[1];

  for (let i = 0; i < GAMIFICATION_LEVELS.length; i++) {
    if (totalXP >= GAMIFICATION_LEVELS[i].minXP) {
      currentLevel = GAMIFICATION_LEVELS[i];
      nextLevel = GAMIFICATION_LEVELS[i + 1] || GAMIFICATION_LEVELS[i];
    }
  }

  const progress =
    nextLevel.level === currentLevel.level
      ? 100
      : Math.floor(
          ((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
        );

  return {
    xp: totalXP,
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelXP: nextLevel.minXP,
    progress: Math.max(0, Math.min(progress, 100))
  };
}

/* ============================================================
   ✔ EXPORTS PRINCIPAIS
   ============================================================ */
export default {
  GAMIFICATION_POINTS,
  GAMIFICATION_LEVELS,
  calculateAthleteGamification
};
