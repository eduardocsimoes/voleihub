// src/pages/cards/design/achievementCardVisuals.ts
import type { CardStyleTokens as ProfileTokens } from "../achievementCardProfile";

export type PlacementType =
  | "gold"
  | "silver"
  | "bronze"
  | "mvp"
  | "position"
  | "none";

export type AchievementCardUI = {
  theme: ProfileTokens["baseTheme"];
  rarity: ProfileTokens["rarity"];
  divisionTier: ProfileTokens["divisionTier"];
  placement: PlacementType;

  // Frame / bordas
  frameOuter: string;
  frameInner: string;

  // Background (FUT-like)
  bgGradient: string;
  bgPatternOpacity: string;

  // Glow + brilho
  glow: string;
  shimmerStrength: "low" | "mid" | "high";

  // Accent
  accentText: string;
  chipClass: string;
  medalBg: string;
  medalRing: string;

  // Tilt intensity
  tilt: number;
};

function tiltByRarity(r: ProfileTokens["rarity"]) {
  switch (r) {
    case "legendary":
      return 18;
    case "epic":
      return 14;
    case "rare":
      return 10;
    default:
      return 6;
  }
}

function themeBase(theme: ProfileTokens["baseTheme"]) {
  switch (theme) {
    case "international":
      return {
        bgGradient: "from-[#06163a] via-[#0a2a7a] to-[#030716]",
        glow: "shadow-[0_0_65px_rgba(60,130,255,0.35)]",
        frameOuter: "border-[#6aa8ff]/80",
        frameInner: "border-[#cfe9ff]/25",
        accentText: "text-[#9ed0ff]",
        chipClass:
          "bg-[#0a2a7a]/70 text-[#d9f0ff] border border-white/10",
        medalBg: "bg-[#0f3aa8]",
        medalRing: "ring-[#9ed0ff]/50",
      };
    case "national":
      return {
        bgGradient: "from-[#2b1700] via-[#7a5200] to-[#120700]",
        glow: "shadow-[0_0_65px_rgba(255,190,70,0.30)]",
        frameOuter: "border-[#ffd36a]/80",
        frameInner: "border-[#fff2bf]/25",
        accentText: "text-[#ffd36a]",
        chipClass:
          "bg-[#7a5200]/55 text-[#fff4d7] border border-white/10",
        medalBg: "bg-[#d4a62a]",
        medalRing: "ring-[#ffd36a]/55",
      };
    case "state":
      return {
        bgGradient: "from-[#0b0f16] via-[#2a313a] to-[#05070a]",
        glow: "shadow-[0_0_55px_rgba(210,220,235,0.20)]",
        frameOuter: "border-[#d6dde8]/65",
        frameInner: "border-[#ffffff]/15",
        accentText: "text-[#d6dde8]",
        chipClass:
          "bg-[#2a313a]/60 text-[#eef3ff] border border-white/10",
        medalBg: "bg-[#cfd6e3]",
        medalRing: "ring-[#d6dde8]/45",
      };
    case "municipal":
    default:
      return {
        bgGradient: "from-[#140805] via-[#5a2c12] to-[#0b0503]",
        glow: "shadow-[0_0_55px_rgba(255,160,90,0.18)]",
        frameOuter: "border-[#ffb37a]/55",
        frameInner: "border-[#ffe2cf]/15",
        accentText: "text-[#ffb37a]",
        chipClass:
          "bg-[#5a2c12]/55 text-[#ffe8da] border border-white/10",
        medalBg: "bg-[#cd7f32]",
        medalRing: "ring-[#ffb37a]/40",
      };
  }
}

function shimmerByRarity(r: ProfileTokens["rarity"]): AchievementCardUI["shimmerStrength"] {
  switch (r) {
    case "legendary":
      return "high";
    case "epic":
      return "high";
    case "rare":
      return "mid";
    default:
      return "low";
  }
}

function divisionPatternOpacity(t: 1 | 2 | 3) {
  if (t === 1) return "opacity-90";
  if (t === 2) return "opacity-70";
  return "opacity-55";
}

export function buildAchievementCardUI(params: {
  profile: ProfileTokens;
  placement: PlacementType;
}): AchievementCardUI {
  const { profile, placement } = params;
  const base = themeBase(profile.baseTheme);

  return {
    theme: profile.baseTheme,
    rarity: profile.rarity,
    divisionTier: profile.divisionTier,
    placement,

    frameOuter: base.frameOuter,
    frameInner: base.frameInner,

    bgGradient: base.bgGradient,
    bgPatternOpacity: divisionPatternOpacity(profile.divisionTier),

    glow: base.glow,
    shimmerStrength: shimmerByRarity(profile.rarity),

    accentText: base.accentText,
    chipClass: base.chipClass,
    medalBg: base.medalBg,
    medalRing: base.medalRing,

    tilt: tiltByRarity(profile.rarity),
  };
}
