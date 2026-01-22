// services/metaAchievements.ts - Sistema de Meta-Conquistas (Conquistas sobre Conquistas)

import { MetaAchievement, CollectionStats, CardData } from "../types/cardSystem";

/**
 * Define todas as meta-conquistas disponíveis
 */
export const META_ACHIEVEMENTS: Omit<MetaAchievement, "unlocked" | "unlockedAt">[] = [
  // ========== REVELAÇÃO DE CARDS ==========
  {
    id: "first_reveal",
    title: "🎊 Primeira Revelação",
    description: "Revele seu primeiro card",
    icon: "🎊",
    rarity: "common",
    condition: (stats) => stats.revealedCards >= 1,
  },
  {
    id: "reveal_5",
    title: "🌟 Colecionador Iniciante",
    description: "Revele 5 cards",
    icon: "🌟",
    rarity: "rare",
    condition: (stats) => stats.revealedCards >= 5,
  },
  {
    id: "reveal_10",
    title: "💎 Colecionador Dedicado",
    description: "Revele 10 cards",
    icon: "💎",
    rarity: "epic",
    condition: (stats) => stats.revealedCards >= 10,
  },
  {
    id: "reveal_25",
    title: "👑 Colecionador Master",
    description: "Revele 25 cards",
    icon: "👑",
    rarity: "legendary",
    condition: (stats) => stats.revealedCards >= 25,
  },

  // ========== COMPLETUDE DA COLEÇÃO ==========
  {
    id: "complete_50",
    title: "📈 Meio Caminho",
    description: "Revele 50% da sua coleção",
    icon: "📈",
    rarity: "rare",
    condition: (stats) => stats.completionPercentage >= 50,
  },
  {
    id: "complete_75",
    title: "🎯 Quase Lá",
    description: "Revele 75% da sua coleção",
    icon: "🎯",
    rarity: "epic",
    condition: (stats) => stats.completionPercentage >= 75,
  },
  {
    id: "complete_100",
    title: "🏆 Coleção Completa",
    description: "Revele 100% da sua coleção!",
    icon: "🏆",
    rarity: "legendary",
    condition: (stats) => stats.completionPercentage >= 100,
  },

  // ========== RARIDADES ==========
  {
    id: "legendary_collector",
    title: "⭐ Caçador de Lendários",
    description: "Possua 3 cards lendários",
    icon: "⭐",
    rarity: "legendary",
    condition: (stats) => stats.byRarity.legendary >= 3,
  },
  {
    id: "epic_collector",
    title: "💜 Colecionador Épico",
    description: "Possua 5 cards épicos",
    icon: "💜",
    rarity: "epic",
    condition: (stats) => stats.byRarity.epic >= 5,
  },
  {
    id: "rare_collector",
    title: "💙 Caçador de Raros",
    description: "Possua 5 cards raros",
    icon: "💙",
    rarity: "rare",
    condition: (stats) => stats.byRarity.rare >= 5,
  },

  // ========== DIVERSIDADE ==========
  {
    id: "all_rarities",
    title: "🌈 Coleção Diversificada",
    description: "Possua pelo menos 1 card de cada raridade",
    icon: "🌈",
    rarity: "epic",
    condition: (stats) => 
      stats.byRarity.legendary >= 1 &&
      stats.byRarity.epic >= 1 &&
      stats.byRarity.rare >= 1 &&
      stats.byRarity.common >= 1,
  },
  {
    id: "multi_year",
    title: "📅 Veterano",
    description: "Possua cards de pelo menos 3 anos diferentes",
    icon: "📅",
    rarity: "rare",
    condition: (stats) => Object.keys(stats.byYear).length >= 3,
  },
  {
    id: "multi_year_5",
    title: "🗓️ Lenda Viva",
    description: "Possua cards de pelo menos 5 anos diferentes",
    icon: "🗓️",
    rarity: "epic",
    condition: (stats) => Object.keys(stats.byYear).length >= 5,
  },

  // ========== STREAKS (SEQUÊNCIAS) ==========
  {
    id: "streak_3",
    title: "🔥 Em Chamas",
    description: "Revele cards por 3 dias consecutivos",
    icon: "🔥",
    rarity: "rare",
    condition: (stats) => stats.streakDays >= 3,
  },
  {
    id: "streak_7",
    title: "⚡ Imparável",
    description: "Revele cards por 7 dias consecutivos",
    icon: "⚡",
    rarity: "epic",
    condition: (stats) => stats.streakDays >= 7,
  },
  {
    id: "streak_30",
    title: "💫 Lendário",
    description: "Revele cards por 30 dias consecutivos",
    icon: "💫",
    rarity: "legendary",
    condition: (stats) => stats.streakDays >= 30,
  },

  // ========== CONQUISTAS ESPECÍFICAS ==========
  {
    id: "gold_hunter",
    title: "🥇 Caçador de Ouro",
    description: "Possua 5 cards de 1º lugar",
    icon: "🥇",
    rarity: "epic",
    condition: (stats, cards) => 
      cards.filter(c => 
        c.achievement.title?.toLowerCase().includes("1º") ||
        c.achievement.title?.toLowerCase().includes("campeão") ||
        c.achievement.placement === "1"
      ).length >= 5,
  },
  {
    id: "mvp_collector",
    title: "⭐ Colecionador de MVPs",
    description: "Possua 3 cards de MVP",
    icon: "⭐",
    rarity: "legendary",
    condition: (stats, cards) =>
      cards.filter(c =>
        c.achievement.title?.toLowerCase().includes("mvp")
      ).length >= 3,
  },

  // ========== QUANTIDADE TOTAL ==========
  {
    id: "collector_20",
    title: "📦 Arsenal Impressionante",
    description: "Possua 20 cards",
    icon: "📦",
    rarity: "epic",
    condition: (stats) => stats.totalCards >= 20,
  },
  {
    id: "collector_50",
    title: "🎁 Tesouro de Conquistas",
    description: "Possua 50 cards",
    icon: "🎁",
    rarity: "legendary",
    condition: (stats) => stats.totalCards >= 50,
  },

  // ========== META-CONQUISTAS ESPECIAIS ==========
  {
    id: "speed_revealer",
    title: "⚡ Revelador Rápido",
    description: "Revele 5 cards no mesmo dia",
    icon: "⚡",
    rarity: "rare",
    condition: (stats, cards) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return cards.filter(c => {
        if (!c.state.revealedAt) return false;
        const revealDate = new Date(c.state.revealedAt);
        revealDate.setHours(0, 0, 0, 0);
        return revealDate.getTime() === today.getTime();
      }).length >= 5;
    },
  },
  {
    id: "night_owl",
    title: "🦉 Coruja Noturna",
    description: "Revele um card após meia-noite",
    icon: "🦉",
    rarity: "common",
    condition: (stats, cards) =>
      cards.some(c => {
        if (!c.state.revealedAt) return false;
        const hour = c.state.revealedAt.getHours();
        return hour >= 0 && hour < 6;
      }),
  },
  {
    id: "early_bird",
    title: "🌅 Madrugador",
    description: "Revele um card antes das 7h da manhã",
    icon: "🌅",
    rarity: "common",
    condition: (stats, cards) =>
      cards.some(c => {
        if (!c.state.revealedAt) return false;
        const hour = c.state.revealedAt.getHours();
        return hour >= 5 && hour < 7;
      }),
  },
];

/**
 * Verifica quais meta-conquistas foram desbloqueadas
 */
export function checkUnlockedMetaAchievements(
  stats: CollectionStats,
  cards: CardData[],
  previouslyUnlocked: string[] = []
): MetaAchievement[] {
  const unlockedAchievements: MetaAchievement[] = [];
  
  for (const meta of META_ACHIEVEMENTS) {
    const isUnlocked = meta.condition(stats, cards);
    const wasAlreadyUnlocked = previouslyUnlocked.includes(meta.id);
    
    unlockedAchievements.push({
      ...meta,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked && !wasAlreadyUnlocked ? new Date() : null,
    });
  }
  
  return unlockedAchievements;
}

/**
 * Retorna apenas as meta-conquistas recém-desbloqueadas
 */
export function getNewlyUnlockedMetaAchievements(
  stats: CollectionStats,
  cards: CardData[],
  previouslyUnlocked: string[]
): MetaAchievement[] {
  const allUnlocked = checkUnlockedMetaAchievements(stats, cards, previouslyUnlocked);
  
  return allUnlocked.filter(meta => 
    meta.unlocked && !previouslyUnlocked.includes(meta.id)
  );
}

/**
 * Formata estatísticas para exibição
 */
export function formatStats(stats: CollectionStats) {
  return {
    completion: `${stats.revealedCards}/${stats.totalCards} (${stats.completionPercentage.toFixed(1)}%)`,
    locked: stats.lockedCards,
    streak: stats.streakDays > 0 ? `${stats.streakDays} ${stats.streakDays === 1 ? 'dia' : 'dias'}` : 'Nenhum',
    byRarity: {
      legendary: `👑 ${stats.byRarity.legendary}`,
      epic: `💜 ${stats.byRarity.epic}`,
      rare: `💙 ${stats.byRarity.rare}`,
      common: `⚪ ${stats.byRarity.common}`,
    },
  };
}