// src/pages/cards/achievementCardProfile.ts
import type { Achievement } from "../../firebase/firestore";

/**
 * ViewModel seguro para o front (não quebra TS mesmo com dados legados)
 */
export type AchievementVM = Achievement & {
  championshipType?: string;
  championship?: string;

  // textos usados no card (legado / normalizado)
  title?: string;
  achievement?: string;
  description?: string;

  category?: string;
  level?: string;
  type?: string;

  year?: number;
  season?: number;
  date?: string | Date;

  club?: string;
  clubName?: string;

  division?: string;
  state?: string;
  city?: string;

  // ✅ usado na dominância (pode existir no cadastro novo)
  championshipCategory?: string;
};

/** Nível principal (mais raro/importante = menor número) */
export type CompetitionTier = 1 | 2 | 3 | 4; // 1=Internacional, 2=Nacional, 3=Estadual, 4=Municipal
/** Subnível da divisão (Tier 1 > Tier 2 > Tier 3) */
export type DivisionTier = 1 | 2 | 3;

export type Dominance = {
  count: number; // quantas vezes o atleta tem "o mesmo título" (definido por key)
  label: string | null; // "Bicampeão", "Tricampeão", ...
  isDominant: boolean;
};

export type CardRarity = "common" | "rare" | "epic" | "legendary";

/** Tokens visuais para o card (Tailwind) */
export type CardStyleTokens = {
  baseTheme: "international" | "national" | "state" | "municipal";

  baseColorHex: string;

  // Moldura / brilho do card
  frameClass: string;
  glowClass: string;

  // ✅ usados no AchievementCardBase
  iconBgClass: string;
  textAccentClass: string;
  rarityLabel?: string;

  competitionLabel: string;
  divisionLabel?: string;
  divisionTier: DivisionTier;

  dominance: Dominance;
  rarity: CardRarity;

  // debug
  debug?: {
    competitionTier: CompetitionTier;
    divisionOrderUsed?: string[];
  };
};

function normalizeText(v?: unknown): string {
  return String(v ?? "").trim();
}

/**
 * Regras:
 * - Internacional: azul forte
 * - Nacional: dourado
 * - Estadual: prata
 * - Municipal: bronze
 */
export function getCompetitionTier(championshipType?: string): CompetitionTier {
  const t = normalizeText(championshipType).toLowerCase();

  if (t === "internacional") return 1;
  if (t === "nacional") return 2;
  if (t === "estadual") return 3;
  if (t === "municipal") return 4;

  // fallback conservador
  return 4;
}

export function getBaseThemeByTier(
  tier: CompetitionTier
): CardStyleTokens["baseTheme"] {
  switch (tier) {
    case 1:
      return "international";
    case 2:
      return "national";
    case 3:
      return "state";
    case 4:
    default:
      return "municipal";
  }
}

/**
 * Tokens base por tema (FIFA-like)
 * (Você pode refinar depois, mas já está pronto pro Base)
 */
export function getThemeTokens(
  theme: CardStyleTokens["baseTheme"]
): Pick<
  CardStyleTokens,
  "baseColorHex" | "frameClass" | "glowClass" | "iconBgClass" | "textAccentClass"
> {
  switch (theme) {
    case "international":
      return {
        baseColorHex: "#0A3DFF",
        frameClass: "border-blue-500/80",
        glowClass: "shadow-[0_0_40px_rgba(10,61,255,0.35)]",
        iconBgClass: "bg-blue-500",
        textAccentClass: "text-blue-700",
      };

    case "national":
      return {
        baseColorHex: "#D4AF37",
        frameClass: "border-yellow-400/80",
        glowClass: "shadow-[0_0_40px_rgba(212,175,55,0.30)]",
        iconBgClass: "bg-yellow-400",
        textAccentClass: "text-yellow-700",
      };

    case "state":
      return {
        baseColorHex: "#C0C0C0",
        frameClass: "border-gray-200/70",
        glowClass: "shadow-[0_0_35px_rgba(192,192,192,0.25)]",
        iconBgClass: "bg-gray-200",
        textAccentClass: "text-gray-600",
      };

    case "municipal":
    default:
      return {
        baseColorHex: "#CD7F32",
        frameClass: "border-amber-700/70",
        glowClass: "shadow-[0_0_35px_rgba(205,127,50,0.22)]",
        iconBgClass: "bg-amber-600",
        textAccentClass: "text-amber-700",
      };
  }
}

/**
 * Tier das divisões por ORDEM de cadastramento (index do array):
 * - index 0 => Tier 1 (mais importante)
 * - index 1 => Tier 2
 * - index 2+ => Tier 3
 *
 * Regra especial:
 * - "Divisão Única" => Tier 1
 */
export function getDivisionTierFromOrder(params: {
  division?: string;
  divisionOrder?: string[];
}): DivisionTier {
  const division = normalizeText(params.division);
  if (!division) return 1;

  const dLower = division.toLowerCase();
  if (dLower === "divisão única" || dLower === "divisao unica") return 1;

  const order =
    params.divisionOrder?.map((x) => normalizeText(x)).filter(Boolean) ?? [];

  if (!order.length) {
    // fallback (sem ordem): heurística simples
    if (
      dLower.includes("especial") ||
      dLower.includes("ouro") ||
      dLower.includes("1ª") ||
      dLower.includes("1a") ||
      dLower === "a"
    )
      return 1;

    if (
      dLower.includes("prata") ||
      dLower.includes("2ª") ||
      dLower.includes("2a") ||
      dLower === "b"
    )
      return 2;

    return 3;
  }

  const idx = order.findIndex((x) => x.toLowerCase() === dLower);
  if (idx === 0) return 1;
  if (idx === 1) return 2;
  return 3;
}

export function getDominanceLabel(count: number): string | null {
  if (count < 2) return null;
  if (count === 2) return "Bicampeão";
  if (count === 3) return "Tricampeão";
  if (count === 4) return "Tetracampeão";
  if (count === 5) return "Pentacampeão";
  return `${count}x Campeão`;
}

/**
 * Chave para identificar “mesmo título” (para dominância).
 * Aqui a recorrência ignora o ano (é dominância histórica).
 */
export function buildDominanceKey(a: AchievementVM): string {
  const championship = normalizeText(a.championship);
  const type = normalizeText(a.championshipType);
  const division = normalizeText(a.division);
  const category = normalizeText((a as any).championshipCategory ?? a.category);
  const state = normalizeText(a.state);
  const city = normalizeText(a.city);

  return [
    championship.toLowerCase(),
    type.toLowerCase(),
    division.toLowerCase(),
    category.toLowerCase(),
    state.toLowerCase(),
    city.toLowerCase(),
  ].join("|");
}

export function calcDominance(
  achievement: AchievementVM,
  allAchievements: AchievementVM[]
): Dominance {
  const key = buildDominanceKey(achievement);
  const count = allAchievements.filter((a) => buildDominanceKey(a) === key).length;

  return {
    count,
    label: getDominanceLabel(count),
    isDominant: count >= 2,
  };
}

export function calcRarity(params: {
  competitionTier: CompetitionTier;
  divisionTier: DivisionTier;
  dominance: Dominance;
}): CardRarity {
  const { competitionTier, divisionTier, dominance } = params;

  let score = 0;
  score += (5 - competitionTier) * 3; // Internacional(1)=>12, Municipal(4)=>3
  score += (4 - divisionTier) * 2; // Tier1=>6, Tier3=>2
  score += dominance.isDominant ? Math.min(dominance.count, 5) : 0;

  if (score >= 17) return "legendary";
  if (score >= 12) return "epic";
  if (score >= 8) return "rare";
  return "common";
}

export function getRarityLabel(rarity: CardRarity): string {
  switch (rarity) {
    case "legendary":
      return "LEGENDARY";
    case "epic":
      return "EPIC";
    case "rare":
      return "RARE";
    default:
      return "COMMON";
  }
}

/**
 * Função principal: gera tokens + tiers + dominância
 */
export function buildAchievementCardProfile(params: {
  achievement: AchievementVM;
  allAchievements?: AchievementVM[];
  divisionOrder?: string[];
}): CardStyleTokens {
  const { achievement, allAchievements = [], divisionOrder } = params;

  const championshipType = normalizeText(achievement.championshipType);
  const competitionTier = getCompetitionTier(championshipType);
  const baseTheme = getBaseThemeByTier(competitionTier);

  const division = normalizeText(achievement.division);
  const divisionTier = getDivisionTierFromOrder({ division, divisionOrder });

  const dominance = calcDominance(achievement, allAchievements);

  const rarity = calcRarity({
    competitionTier,
    divisionTier,
    dominance,
  });

  const themeTokens = getThemeTokens(baseTheme);

  return {
    baseTheme,
    ...themeTokens,
    competitionLabel: championshipType || "—",
    divisionLabel: division ? division : undefined,
    divisionTier,
    dominance,
    rarity,
    rarityLabel: getRarityLabel(rarity),
    debug: {
      competitionTier,
      divisionOrderUsed: divisionOrder,
    },
  };
}
