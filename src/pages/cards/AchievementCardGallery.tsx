// src/pages/cards/AchievementCardGallery.tsx
import React, { useMemo, useState } from "react";
import AthleteAchievementFeedCard from "./AthleteAchievementFeedCard";
import AthleteAchievementStoryCard from "./AthleteAchievementStoryCard";

import type { CardStyleTokens } from "./achievementCardProfile";
import { buildAchievementCardUI, type PlacementType } from "./design/achievementCardVisuals";

const THEMES: Array<CardStyleTokens["baseTheme"]> = [
  "international",
  "national",
  "state",
  "municipal",
];

const DIVS: Array<1 | 2 | 3> = [1, 2, 3];
const PLACEMENTS: PlacementType[] = ["gold", "silver", "bronze"];

function makeProfile(
  theme: CardStyleTokens["baseTheme"],
  div: 1 | 2 | 3,
  rarity: CardStyleTokens["rarity"]
): CardStyleTokens {
  // ✅ Esses dois são obrigatórios no seu CardStyleTokens atual
  const iconBgClass =
    theme === "international"
      ? "bg-[#0f3aa8]"
      : theme === "national"
      ? "bg-[#d4a62a]"
      : theme === "state"
      ? "bg-[#cfd6e3]"
      : "bg-[#cd7f32]";

  const textAccentClass =
    theme === "international"
      ? "text-[#9ed0ff]"
      : theme === "national"
      ? "text-[#ffd36a]"
      : theme === "state"
      ? "text-[#d6dde8]"
      : "text-[#ffb37a]";

  return {
    baseTheme: theme,

    // são exigidos pelo tipo do achievementCardProfile.ts
    baseColorHex: "#ffffff",
    frameClass: "border-white/30",
    glowClass: "shadow-xl",

    iconBgClass,
    textAccentClass,

    competitionLabel:
      theme === "international"
        ? "Internacional"
        : theme === "national"
        ? "Nacional"
        : theme === "state"
        ? "Estadual"
        : "Municipal",

    divisionLabel: div === 1 ? "Divisão Especial" : div === 2 ? "1ª Divisão" : "2ª Divisão",
    divisionTier: div,

    dominance: { isDominant: true, count: 2, label: "Bicampeão" },
    rarity,
  };
}

export default function AchievementCardGallery() {
  const [layout, setLayout] = useState<"both" | "feed" | "story">("both");

  const combos = useMemo(() => {
    const out: Array<{
      theme: CardStyleTokens["baseTheme"];
      div: 1 | 2 | 3;
      place: PlacementType;
      rarity: CardStyleTokens["rarity"];
    }> = [];

    for (const theme of THEMES) {
      for (const div of DIVS) {
        for (const place of PLACEMENTS) {
          const rarity: CardStyleTokens["rarity"] =
            theme === "international" && div === 1 && place === "gold"
              ? "legendary"
              : theme === "international"
              ? "epic"
              : theme === "national"
              ? "rare"
              : "common";

          out.push({ theme, div, place, rarity });
        }
      }
    }

    return out;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold text-white">Galeria — 36 combinações</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setLayout("both")}
            className={`px-4 py-2 rounded-xl font-bold ${
              layout === "both" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300"
            }`}
          >
            Feed + Story
          </button>
          <button
            onClick={() => setLayout("feed")}
            className={`px-4 py-2 rounded-xl font-bold ${
              layout === "feed" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300"
            }`}
          >
            Apenas Feed
          </button>
          <button
            onClick={() => setLayout("story")}
            className={`px-4 py-2 rounded-xl font-bold ${
              layout === "story" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-300"
            }`}
          >
            Apenas Story
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {combos.map((c, idx) => {
          const profile = makeProfile(c.theme, c.div, c.rarity);
          const ui = buildAchievementCardUI({ profile, placement: c.place });

          const title = `${profile.competitionLabel} • ${profile.divisionLabel} • ${c.place.toUpperCase()}`;
          const achievement =
            c.place === "gold" ? "CAMPEÃO" : c.place === "silver" ? "VICE" : "3º LUGAR";

          return (
            <div
              key={idx}
              className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 space-y-3"
            >
              <div className="text-xs text-gray-300 font-semibold">
                {profile.baseTheme} • div {profile.divisionTier} • {c.place} • {profile.rarity}
              </div>

              <div className="flex flex-wrap gap-4 items-start">
                {(layout === "both" || layout === "feed") && (
                  <AthleteAchievementFeedCard
                    athleteName="Jogadora Exemplo"
                    profilePhotoUrl={null}
                    title={title}
                    achievement={achievement}
                    category="Adulto"
                    year={2025}
                    club="Clube Exemplo"
                    brandText="voleihub.com"
                    profile={profile}
                    ui={ui}
                  />
                )}

                {(layout === "both" || layout === "story") && (
                  <AthleteAchievementStoryCard
                    athleteName="Jogadora Exemplo"
                    profilePhotoUrl={null}
                    title={title}
                    achievement={achievement}
                    category="Adulto"
                    year={2025}
                    club="Clube Exemplo"
                    brandText="voleihub.com"
                    profile={profile}
                    ui={ui}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
