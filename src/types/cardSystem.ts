// types/cardSystem.ts - Sistema de tipos para Cards de Conquistas

export type CardRarity = "common" | "rare" | "epic" | "legendary";

export type CardStatus = "locked" | "revealed";

export interface CardState {
  achievementId: string;
  revealed: boolean;
  revealedAt: Date | null;
  rarity: CardRarity;
  viewCount: number;
  createdAt: Date;
  lastViewedAt: Date | null;
}

export interface Achievement {
  id: string;
  title: string;
  championship?: string;
  championshipCategory?: string;
  year: number;
  date?: string;
  placement?: string;
  club?: string;
  division?: string;
  category?: string;
  type?: string;
  achievement?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CardData {
  achievement: Achievement;
  state: CardState;
  score: number; // Para ordenação por importância
}

export interface CollectionStats {
  totalCards: number;
  revealedCards: number;
  lockedCards: number;
  byRarity: {
    legendary: number;
    epic: number;
    rare: number;
    common: number;
  };
  byYear: Record<number, number>;
  completionPercentage: number;
  lastRevealedAt: Date | null;
  streakDays: number; // Dias consecutivos revelando cards
}

export interface MetaAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: CollectionStats, cards: CardData[]) => boolean;
  unlocked: boolean;
  unlockedAt: Date | null;
  rarity: CardRarity;
}

export interface CardFilter {
  status?: "all" | "locked" | "revealed";
  rarity?: CardRarity | "all";
  year?: number | "all";
  searchTerm?: string;
}

export interface CardSort {
  by: "newest" | "oldest" | "importance" | "rarity" | "year";
  order: "asc" | "desc";
}

export interface NotificationData {
  id: string;
  type: "new_card" | "meta_achievement" | "milestone";
  title: string;
  message: string;
  cardId?: string;
  metaAchievementId?: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}