// PremiumCardSystem.tsx - Sistema de configuração dos cards premium

export type AwardType = "mvp" | "best_position" | "highlight" | "revelation";
export type PlacementType = "gold" | "silver" | "bronze";
export type CompetitionType = "superliga" | "estadual" | "brasileiro" | "sul_americano" | "mundial" | "other";
export type DominanceLevel = "standard" | "dominant" | "legendary";

export interface CompetitionConfig {
  name: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const COMPETITION_CONFIGS: Record<CompetitionType, CompetitionConfig> = {
  superliga: {
    name: "SUPERLIGA",
    icon: "⭐",
    colors: {
      primary: "#FFD700",
      secondary: "#FFA500",
      accent: "#FF8C00",
    },
  },
  brasileiro: {
    name: "BRASILEIRO",
    icon: "🏆",
    colors: {
      primary: "#00AA00",
      secondary: "#008800",
      accent: "#006600",
    },
  },
  estadual: {
    name: "ESTADUAL",
    icon: "🎖️",
    colors: {
      primary: "#4169E1",
      secondary: "#0047AB",
      accent: "#002366",
    },
  },
  sul_americano: {
    name: "SUL-AMERICANO",
    icon: "🌎",
    colors: {
      primary: "#FF4500",
      secondary: "#FF6347",
      accent: "#DC143C",
    },
  },
  mundial: {
    name: "MUNDIAL",
    icon: "🌍",
    colors: {
      primary: "#8B008B",
      secondary: "#9932CC",
      accent: "#9400D3",
    },
  },
  other: {
    name: "COMPETIÇÃO",
    icon: "🏐",
    colors: {
      primary: "#708090",
      secondary: "#778899",
      accent: "#696969",
    },
  },
};

export interface CardConfig {
  competition: CompetitionType;
  achievementType: "collective" | "individual";
  placement?: PlacementType;
  award?: AwardType;
  dominance: DominanceLevel;
  rarity: "common" | "rare" | "epic" | "legendary";
  competitionConfig: CompetitionConfig;
}

export function buildCardConfig(achievement: any, allAchievements: any[]): CardConfig {
  const championship = String(achievement?.championship || "").toLowerCase();
  
  // Determina competição
  let competition: CompetitionType = "other";
  if (championship.includes("superliga")) competition = "superliga";
  else if (championship.includes("brasileiro")) competition = "brasileiro";
  else if (championship.includes("estadual")) competition = "estadual";
  else if (championship.includes("sul-americano") || championship.includes("sul americano")) competition = "sul_americano";
  else if (championship.includes("mundial") || championship.includes("world")) competition = "mundial";
  
  const competitionConfig = COMPETITION_CONFIGS[competition];
  
  // Determina tipo (coletiva ou individual)
  const title = String(achievement?.title || "").toLowerCase();
  const isIndividual = title.includes("mvp") || title.includes("melhor");
  const achievementType: "collective" | "individual" = isIndividual ? "individual" : "collective";
  
  // Determina placement ou award
  let placement: PlacementType | undefined;
  let award: AwardType | undefined;
  
  if (achievementType === "collective") {
    if (title.includes("1º") || title.includes("1°") || title.includes("campeão") || title.includes("campeao")) {
      placement = "gold";
    } else if (title.includes("2º") || title.includes("2°") || title.includes("vice")) {
      placement = "silver";
    } else if (title.includes("3º") || title.includes("3°")) {
      placement = "bronze";
    } else {
      placement = "gold"; // default
    }
  } else {
    if (title.includes("mvp")) {
      award = "mvp";
    } else if (title.includes("melhor")) {
      award = "best_position";
    } else if (title.includes("revelação") || title.includes("revelacao")) {
      award = "revelation";
    } else {
      award = "highlight";
    }
  }
  
  // Determina dominância (baseado em quantas conquistas similares o atleta tem)
  const sameCompetitionCount = allAchievements.filter((a: any) => {
    const otherChampionship = String(a?.championship || "").toLowerCase();
    return otherChampionship.includes(championship.split(" ")[0]); // compara primeira palavra
  }).length;
  
  let dominance: DominanceLevel = "standard";
  if (sameCompetitionCount >= 3) dominance = "dominant";
  if (sameCompetitionCount >= 5) dominance = "legendary";
  
  // Determina raridade
  let rarity: "common" | "rare" | "epic" | "legendary" = "common";
  
  if (competition === "mundial" || (placement === "gold" && competition === "superliga")) {
    rarity = "legendary";
  } else if (competition === "superliga" || competition === "sul_americano" || award === "mvp") {
    rarity = "epic";
  } else if (placement === "gold" || placement === "silver" || competition === "brasileiro") {
    rarity = "rare";
  }
  
  return {
    competition,
    achievementType,
    placement,
    award,
    dominance,
    rarity,
    competitionConfig,
  };
}