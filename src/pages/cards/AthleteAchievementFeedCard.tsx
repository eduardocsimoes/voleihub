// src/pages/cards/AthleteAchievementFeedCard.tsx

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

export default function AthleteAchievementFeedCard(props: Props) {
  return (
    <AchievementCardBase
      {...props}

      /* =========================
         SIZE — ~10% menor + responsivo
      ========================== */

      aspectClass="
        w-[380px]
        sm:w-[360px]
        md:w-[380px]
        lg:w-[400px]
        aspect-square
      "

      /* =========================
         PHOTO — ligeiramente menor
      ========================== */
      photoHeightClass="h-[38%]"

      /* =========================
         CONTENT — mais compacto
      ========================== */
      containerPadding="px-5 pb-5 pt-3 h-[62%]"
    />
  );
}
