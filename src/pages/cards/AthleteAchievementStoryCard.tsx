// src/pages/cards/AthleteAchievementStoryCard.tsx

import AchievementCardBase from "../cards/base/AchievementCardBase";
import type { CardStyleTokens as ProfileTokens } from "./achievementCardProfile";
import type { AchievementCardUI } from "./design/achievementCardVisuals";

type Props = {
  athleteName: string;
  profilePhotoUrl?: string | null;
  title: string;
  achievement: string;
  category?: string | null;
  year: number;
  club: string;
  brandText?: string;

  profile?: ProfileTokens;
  ui?: AchievementCardUI;
};

export default function AthleteAchievementStoryCard(props: Props) {
  return (
    <AchievementCardBase
      {...props}

      /* =========================
         SIZE — ~10% menor + responsivo
      ========================== */
      aspectClass="
        w-[330px]
        sm:w-[320px]
        md:w-[330px]
        lg:w-[350px]
        aspect-[9/16]
      "

      /* =========================
         PHOTO — menor que feed
      ========================== */
      photoHeightClass="h-[44%]"

      /* =========================
         CONTENT — mais compacto
      ========================== */
      containerPadding="px-5 pb-5 pt-3 h-[56%]"
    />
  );
}
