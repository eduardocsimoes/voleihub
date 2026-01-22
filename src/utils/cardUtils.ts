// utils/cardUtils.ts - Utilitários para sistema de cards

import { Achievement, CardRarity, CardData } from "../types/cardSystem";

/**
 * Determina a raridade de um card baseado na conquista
 */
export function calculateCardRarity(achievement: Achievement): CardRarity {
  const placement = getPlacement(achievement);
  const title = achievement.title?.toLowerCase() || "";
  const championship = achievement.championship?.toLowerCase() || "";
  
  // LEGENDARY - Ouro, Campeão, MVP de competições importantes
  if (
    placement === "gold" ||
    title.includes("campeão") ||
    title.includes("campeao") ||
    title.includes("1º lugar") ||
    title.includes("1° lugar") ||
    championship.includes("superliga") ||
    championship.includes("sul-americano") ||
    championship.includes("pan-americano") ||
    championship.includes("mundial") ||
    championship.includes("olympics") ||
    championship.includes("olimp")
  ) {
    return "legendary";
  }
  
  // EPIC - Prata, MVP, Vice-campeão
  if (
    placement === "silver" ||
    placement === "mvp" ||
    title.includes("mvp") ||
    title.includes("vice") ||
    title.includes("2º lugar") ||
    title.includes("2° lugar") ||
    championship.includes("estadual") ||
    championship.includes("brasileiro")
  ) {
    return "epic";
  }
  
  // RARE - Bronze, Melhor da posição, 3º lugar
  if (
    placement === "bronze" ||
    placement === "position" ||
    title.includes("melhor") ||
    title.includes("3º lugar") ||
    title.includes("3° lugar") ||
    title.includes("destaque")
  ) {
    return "rare";
  }
  
  // COMMON - Outras conquistas
  return "common";
}

/**
 * Calcula um score de importância para ordenação
 * Quanto maior o score, mais importante é o card
 */
export function calculateCardImportance(achievement: Achievement): number {
  let score = 0;
  
  const rarity = calculateCardRarity(achievement);
  const year = achievement.year || 0;
  const placement = getPlacement(achievement);
  
  // Base score por raridade
  const rarityScores = {
    legendary: 1000,
    epic: 500,
    rare: 250,
    common: 100,
  };
  score += rarityScores[rarity];
  
  // Bonus por tipo de conquista
  const placementBonus = {
    gold: 300,
    mvp: 250,
    silver: 200,
    bronze: 150,
    position: 100,
    none: 0,
  };
  score += placementBonus[placement];
  
  // Bonus por ano (mais recente = mais importante)
  const currentYear = new Date().getFullYear();
  const yearDiff = currentYear - year;
  const yearBonus = Math.max(0, 100 - yearDiff * 5); // -5 pontos por ano
  score += yearBonus;
  
  // Bonus por competições específicas
  const championship = achievement.championship?.toLowerCase() || "";
  if (championship.includes("superliga")) score += 200;
  if (championship.includes("mundial")) score += 300;
  if (championship.includes("olimp")) score += 400;
  if (championship.includes("sul-americano")) score += 150;
  if (championship.includes("pan-americano")) score += 150;
  if (championship.includes("brasileiro")) score += 100;
  if (championship.includes("estadual")) score += 50;
  
  return score;
}

/**
 * Determina o tipo de colocação de uma conquista
 */
type PlacementType = "gold" | "silver" | "bronze" | "mvp" | "position" | "none";

function getPlacement(achievement: Achievement): PlacementType {
  if (!achievement) return "none";

  const placementField = String(achievement.placement ?? "").toLowerCase();
  if (placementField.includes("1")) return "gold";
  if (placementField.includes("2")) return "silver";
  if (placementField.includes("3")) return "bronze";

  const text = `${achievement.title ?? ""} ${achievement.achievement ?? ""} ${achievement.description ?? ""}`.toLowerCase();

  if (text.includes("mvp")) return "mvp";
  if (text.includes("melhor")) return "position";
  if (text.includes("1º") || text.includes("1°") || text.includes("1o")) return "gold";
  if (text.includes("2º") || text.includes("2°") || text.includes("2o")) return "silver";
  if (text.includes("3º") || text.includes("3°") || text.includes("3o")) return "bronze";

  return "none";
}

/**
 * Verifica se uma conquista deve gerar um card
 */
export function shouldGenerateCard(achievement: Achievement): boolean {
  const placement = getPlacement(achievement);
  return ["gold", "silver", "bronze", "mvp", "position"].includes(placement);
}

/**
 * Agrupa cards por ano
 */
export function groupCardsByYear(cards: CardData[]): Record<number, CardData[]> {
  return cards.reduce((groups, card) => {
    const year = card.achievement.year || 0;
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(card);
    return groups;
  }, {} as Record<number, CardData[]>);
}

/**
 * Ordena cards baseado em critério
 */
export function sortCards(
  cards: CardData[],
  sortBy: "newest" | "oldest" | "importance" | "rarity" | "year",
  order: "asc" | "desc" = "desc"
): CardData[] {
  const sorted = [...cards].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "newest":
        comparison = (a.achievement.createdAt?.getTime() || 0) - (b.achievement.createdAt?.getTime() || 0);
        break;
      case "oldest":
        comparison = (a.achievement.createdAt?.getTime() || 0) - (b.achievement.createdAt?.getTime() || 0);
        break;
      case "importance":
        comparison = a.score - b.score;
        break;
      case "rarity":
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        comparison = rarityOrder[a.state.rarity] - rarityOrder[b.state.rarity];
        break;
      case "year":
        comparison = a.achievement.year - b.achievement.year;
        break;
    }
    
    return order === "desc" ? -comparison : comparison;
  });
  
  // Cards não revelados sempre vêm primeiro, independente da ordenação
  const locked = sorted.filter(c => !c.state.revealed);
  const revealed = sorted.filter(c => c.state.revealed);
  
  return [...locked, ...revealed];
}

/**
 * Filtra cards baseado em critérios
 */
export function filterCards(cards: CardData[], filter: {
  status?: "all" | "locked" | "revealed";
  rarity?: CardRarity | "all";
  year?: number | "all";
  searchTerm?: string;
}): CardData[] {
  let filtered = [...cards];
  
  // Filtro por status
  if (filter.status && filter.status !== "all") {
    filtered = filtered.filter(card => 
      filter.status === "locked" ? !card.state.revealed : card.state.revealed
    );
  }
  
  // Filtro por raridade
  if (filter.rarity && filter.rarity !== "all") {
    filtered = filtered.filter(card => card.state.rarity === filter.rarity);
  }
  
  // Filtro por ano
  if (filter.year && filter.year !== "all") {
    filtered = filtered.filter(card => card.achievement.year === filter.year);
  }
  
  // Busca por termo
  if (filter.searchTerm && filter.searchTerm.trim()) {
    const term = filter.searchTerm.toLowerCase();
    filtered = filtered.filter(card => {
      const searchable = `
        ${card.achievement.title}
        ${card.achievement.championship}
        ${card.achievement.championshipCategory}
        ${card.achievement.club}
        ${card.achievement.year}
      `.toLowerCase();
      return searchable.includes(term);
    });
  }
  
  return filtered;
}

/**
 * Formata texto para exibição
 */
export function safeText(value: any, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s.length ? s : fallback;
}

/**
 * Obtém cores por raridade
 */
export function getRarityColors(rarity: CardRarity) {
  const colors = {
    common: {
      primary: "#94a3b8",
      secondary: "#64748b",
      glow: "rgba(148, 163, 184, 0.5)",
      gradient: "from-slate-400 to-slate-600",
      text: "text-slate-400",
      border: "border-slate-400",
    },
    rare: {
      primary: "#3b82f6",
      secondary: "#2563eb",
      glow: "rgba(59, 130, 246, 0.8)",
      gradient: "from-blue-400 to-blue-600",
      text: "text-blue-400",
      border: "border-blue-400",
    },
    epic: {
      primary: "#a855f7",
      secondary: "#9333ea",
      glow: "rgba(168, 85, 247, 0.8)",
      gradient: "from-purple-400 to-purple-600",
      text: "text-purple-400",
      border: "border-purple-400",
    },
    legendary: {
      primary: "#f59e0b",
      secondary: "#d97706",
      glow: "rgba(245, 158, 11, 1)",
      gradient: "from-amber-400 to-amber-600",
      text: "text-amber-400",
      border: "border-amber-400",
    },
  };
  
  return colors[rarity];
}

/**
 * Obtém emoji por raridade
 */
export function getRarityEmoji(rarity: CardRarity): string {
  const emojis = {
    common: "⚪",
    rare: "💙",
    epic: "💜",
    legendary: "👑",
  };
  return emojis[rarity];
}

/**
 * Obtém label de raridade
 */
export function getRarityLabel(rarity: CardRarity): string {
  const labels = {
    common: "Comum",
    rare: "Raro",
    epic: "Épico",
    legendary: "Lendário",
  };
  return labels[rarity];
}