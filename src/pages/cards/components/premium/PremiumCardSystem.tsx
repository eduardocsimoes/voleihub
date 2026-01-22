// PremiumCardSystem.tsx - Sistema Completo de Raridade e Configuração

import React from 'react';

/* =========================
   TIPOS DE RARIDADE
========================== */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/* =========================
   TIPOS DE COMPETIÇÃO
========================== */
export type CompetitionTier = 'internacional' | 'nacional' | 'estadual' | 'regional';

/* =========================
   TIPOS DE CONQUISTA
========================== */
export type AchievementType = 'collective' | 'individual';

/* =========================
   TIPOS DE COLOCAÇÃO (Coletivo)
========================== */
export type PlacementType = 'gold' | 'silver' | 'bronze';

/* =========================
   TIPOS DE PRÊMIO (Individual)
========================== */
export type AwardType = 'mvp' | 'best_position' | 'highlight' | 'revelation';

/* =========================
   CONFIGURAÇÃO DE RARIDADE
========================== */
interface RarityConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  gradient: string;
  shine: string;
  border: string;
  shadow: string;
  particles: number;
  animation: 'none' | 'subtle' | 'medium' | 'intense' | 'legendary' | 'mythic';
}

export const RARITY_CONFIGS: Record<CardRarity, RarityConfig> = {
  common: {
    name: 'Comum',
    colors: {
      primary: '#8B7355',
      secondary: '#6B5A45',
      accent: '#A08060',
      glow: 'rgba(139, 115, 85, 0.3)',
    },
    gradient: 'linear-gradient(135deg, #8B7355 0%, #6B5A45 50%, #A08060 100%)',
    shine: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1), transparent 50%)',
    border: '2px solid #8B7355',
    shadow: '0 8px 25px rgba(139, 115, 85, 0.25)',
    particles: 0,
    animation: 'subtle',
  },
  
  rare: {
    name: 'Raro',
    colors: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#60A5FA',
      glow: 'rgba(59, 130, 246, 0.5)',
    },
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
    shine: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 50%)',
    border: '3px solid #3B82F6',
    shadow: '0 12px 35px rgba(59, 130, 246, 0.4), 0 0 25px rgba(59, 130, 246, 0.2)',
    particles: 8,
    animation: 'medium',
  },
  
  epic: {
    name: 'Épico',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      glow: 'rgba(139, 92, 246, 0.6)',
    },
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)',
    shine: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35), transparent 50%)',
    border: '4px solid #8B5CF6',
    shadow: '0 15px 50px rgba(139, 92, 246, 0.5), 0 0 35px rgba(139, 92, 246, 0.3)',
    particles: 12,
    animation: 'intense',
  },
  
  legendary: {
    name: 'Lendário',
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FFED4E',
      glow: 'rgba(255, 215, 0, 0.8)',
    },
    gradient: 'linear-gradient(135deg, #FFED4E 0%, #FFD700 35%, #FFA500 65%, #FF8C00 100%)',
    shine: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5), transparent 40%)',
    border: '5px solid #FFD700',
    shadow: '0 20px 60px rgba(255, 215, 0, 0.6), 0 0 45px rgba(255, 215, 0, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2)',
    particles: 16,
    animation: 'legendary',
  },
  
  mythic: {
    name: 'Mítico',
    colors: {
      primary: '#FF006E',
      secondary: '#8338EC',
      accent: '#00F5FF',
      glow: 'rgba(255, 0, 110, 1)',
    },
    gradient: 'linear-gradient(135deg, #FF006E 0%, #8338EC 20%, #3A86FF 40%, #06FFA5 60%, #FFD60A 80%, #FF006E 100%)',
    shine: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.7), transparent 35%)',
    border: '6px solid transparent',
    shadow: '0 25px 80px rgba(255, 0, 110, 0.8), 0 0 60px rgba(131, 56, 236, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.3)',
    particles: 24,
    animation: 'mythic',
  },
};

/* =========================
   CONFIGURAÇÃO DE COMPETIÇÃO
========================== */
interface CompetitionConfig {
  name: string;
  icon: string;
  baseScore: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gradient: string;
}

export const COMPETITION_CONFIGS: Record<CompetitionTier, CompetitionConfig> = {
  internacional: {
    name: 'Internacional',
    icon: '🌍',
    baseScore: 15,
    colors: {
      primary: '#0099FF',
      secondary: '#0066CC',
      accent: '#00CCFF',
    },
    gradient: 'linear-gradient(135deg, #00CCFF 0%, #0099FF 50%, #0066CC 100%)',
  },
  
  nacional: {
    name: 'Nacional',
    icon: '🇧🇷',
    baseScore: 10,
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FFED4E',
    },
    gradient: 'linear-gradient(135deg, #FFED4E 0%, #FFD700 50%, #FFA500 100%)',
  },
  
  estadual: {
    name: 'Estadual',
    icon: '🏛️',
    baseScore: 6,
    colors: {
      primary: '#C0C0C0',
      secondary: '#A8A8A8',
      accent: '#E0E0E0',
    },
    gradient: 'linear-gradient(135deg, #E0E0E0 0%, #C0C0C0 50%, #A8A8A8 100%)',
  },
  
  regional: {
    name: 'Regional',
    icon: '🏙️',
    baseScore: 3,
    colors: {
      primary: '#CD7F32',
      secondary: '#A0522D',
      accent: '#DEB887',
    },
    gradient: 'linear-gradient(135deg, #DEB887 0%, #CD7F32 50%, #A0522D 100%)',
  },
};

/* =========================
   SISTEMA DE DOMINÂNCIA
========================== */
export interface Dominance {
  count: number;
  label: string;
  isDominant: boolean;
  bonus: number;
  icon: string;
  color: string;
}

export function calculateDominance(count: number): Dominance {
  if (count < 2) {
    return {
      count,
      label: '',
      isDominant: false,
      bonus: 0,
      icon: '',
      color: '',
    };
  }

  const labels: Record<number, string> = {
    2: 'Bicampeão',
    3: 'Tricampeão',
    4: 'Tetracampeão',
    5: 'Pentacampeão',
  };

  const label = count <= 5 ? labels[count] : `${count}x Campeão`;
  const bonus = Math.min(count, 5);

  return {
    count,
    label,
    isDominant: true,
    bonus,
    icon: count === 2 ? '🔥' : count === 3 ? '⚡' : count === 4 ? '💫' : '👑',
    color: count === 2 ? '#FF6B35' : count === 3 ? '#FFD23F' : count === 4 ? '#9D4EDD' : '#FF006E',
  };
}

/* =========================
   CÁLCULO DE SCORE E RARIDADE
========================== */
interface ScoreCalculation {
  competitionScore: number;
  achievementScore: number;
  dominanceBonus: number;
  totalScore: number;
  rarity: CardRarity;
}

export function calculateCollectiveScore(
  competition: CompetitionTier,
  placement: PlacementType,
  dominance?: Dominance
): ScoreCalculation {
  const competitionScore = COMPETITION_CONFIGS[competition].baseScore;
  
  const placementScores: Record<PlacementType, number> = {
    gold: 6,
    silver: 4,
    bronze: 2,
  };
  
  const achievementScore = placementScores[placement];
  const dominanceBonus = dominance?.bonus || 0;
  const totalScore = competitionScore + achievementScore + dominanceBonus;
  
  let rarity: CardRarity;
  if (totalScore >= 24) rarity = 'mythic';
  else if (totalScore >= 19) rarity = 'legendary';
  else if (totalScore >= 14) rarity = 'epic';
  else if (totalScore >= 9) rarity = 'rare';
  else rarity = 'common';
  
  return {
    competitionScore,
    achievementScore,
    dominanceBonus,
    totalScore,
    rarity,
  };
}

export function calculateIndividualScore(
  competition: CompetitionTier,
  award: AwardType,
  dominance?: Dominance
): ScoreCalculation {
  const competitionScore = COMPETITION_CONFIGS[competition].baseScore;
  
  const awardScores: Record<AwardType, number> = {
    mvp: 10,
    best_position: 7,
    highlight: 5,
    revelation: 3,
  };
  
  const achievementScore = awardScores[award];
  const dominanceBonus = dominance?.bonus || 0;
  const totalScore = competitionScore + achievementScore + dominanceBonus;
  
  let rarity: CardRarity;
  if (totalScore >= 24) rarity = 'mythic';
  else if (totalScore >= 19) rarity = 'legendary';
  else if (totalScore >= 14) rarity = 'epic';
  else if (totalScore >= 9) rarity = 'rare';
  else rarity = 'common';
  
  return {
    competitionScore,
    achievementScore,
    dominanceBonus,
    totalScore,
    rarity,
  };
}

/* =========================
   DETECÇÃO AUTOMÁTICA
========================== */

export function detectCompetitionTier(achievement: any): CompetitionTier {
  const typeStr = String(achievement?.championshipType || '').toLowerCase();
  
  if (typeStr.includes('internacional') || typeStr.includes('mundial') || typeStr.includes('pan-americano')) {
    return 'internacional';
  }
  
  if (typeStr.includes('nacional') || typeStr.includes('brasileiro') || typeStr.includes('brasil')) {
    return 'nacional';
  }
  
  if (typeStr.includes('estadual') || typeStr.includes('state')) {
    return 'estadual';
  }
  
  return 'regional';
}

export function detectAchievementType(achievement: any): AchievementType {
  const typeStr = String(achievement?.type || '').toLowerCase();
  const placementStr = String(achievement?.placement || '').toLowerCase();
  
  if (
    placementStr.includes('mvp') ||
    placementStr.includes('melhor') ||
    placementStr.includes('destaque') ||
    placementStr.includes('revelação') ||
    placementStr.includes('artilheira')
  ) {
    return 'individual';
  }
  
  if (typeStr.includes('individual')) {
    return 'individual';
  }
  
  return 'collective';
}

export function detectPlacement(achievement: any): PlacementType {
  const placementStr = String(achievement?.placement || '').toLowerCase();
  
  if (placementStr.includes('1º') || placementStr.includes('1o') || placementStr.includes('primeiro') || placementStr.includes('campeão')) {
    return 'gold';
  }
  
  if (placementStr.includes('2º') || placementStr.includes('2o') || placementStr.includes('segundo') || placementStr.includes('vice')) {
    return 'silver';
  }
  
  return 'bronze';
}

export function detectAward(achievement: any): AwardType {
  const placementStr = String(achievement?.placement || '').toLowerCase();
  const titleStr = String(achievement?.title || '').toLowerCase();
  const combined = `${placementStr} ${titleStr}`;
  
  if (combined.includes('mvp')) {
    return 'mvp';
  }
  
  if (combined.includes('melhor')) {
    return 'best_position';
  }
  
  if (combined.includes('revelação') || combined.includes('revelacao')) {
    return 'revelation';
  }
  
  return 'highlight';
}

export function calculateAthleteDominance(achievement: any, allAchievements: any[]): Dominance {
  const buildKey = (ach: any) => {
    const parts = [
      ach?.championship,
      ach?.championshipType,
      ach?.championshipCategory,
      ach?.state,
    ].filter(Boolean);
    return parts.join('|').toLowerCase();
  };
  
  const currentKey = buildKey(achievement);
  
  const count = allAchievements.filter(ach => {
    const achKey = buildKey(ach);
    return achKey === currentKey;
  }).length;
  
  return calculateDominance(count);
}

/* =========================
   CONFIGURAÇÃO COMPLETA DO CARD
========================== */
export interface CardConfig {
  competition: CompetitionTier;
  achievementType: AchievementType;
  placement?: PlacementType;
  award?: AwardType;
  dominance: Dominance;
  score: ScoreCalculation;
  rarity: CardRarity;
  rarityConfig: RarityConfig;
  competitionConfig: CompetitionConfig;
}

export function buildCardConfig(achievement: any, allAchievements: any[]): CardConfig {
  const competition = detectCompetitionTier(achievement);
  const achievementType = detectAchievementType(achievement);
  const dominance = calculateAthleteDominance(achievement, allAchievements);
  
  let score: ScoreCalculation;
  let placement: PlacementType | undefined;
  let award: AwardType | undefined;
  
  if (achievementType === 'collective') {
    placement = detectPlacement(achievement);
    score = calculateCollectiveScore(competition, placement, dominance);
  } else {
    award = detectAward(achievement);
    score = calculateIndividualScore(competition, award, dominance);
  }
  
  const rarity = score.rarity;
  const rarityConfig = RARITY_CONFIGS[rarity];
  const competitionConfig = COMPETITION_CONFIGS[competition];
  
  return {
    competition,
    achievementType,
    placement,
    award,
    dominance,
    score,
    rarity,
    rarityConfig,
    competitionConfig,
  };
}