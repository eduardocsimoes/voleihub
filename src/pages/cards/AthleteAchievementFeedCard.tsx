// src/pages/cards/AthleteAchievementFeedCard.tsx
import AchievementCardBase, {
  CardStyleTokens,
} from "../cards/base/AchievementCardBase";

type Props = {
  athleteName: string;
  profilePhotoUrl?: string | null;
  title: string;
  achievement: string;
  category?: string | null;
  year: number;
  club: string;
  brandText?: string;
  profile?: CardStyleTokens;
};

export default function AthleteAchievementFeedCard(props: Props) {
  return (
    <AchievementCardBase
      {...props}
      aspectClass="w-[420px] aspect-square"
      photoHeightClass="h-[40%]"
      containerPadding="px-6 pb-6 pt-4 h-[60%]"
    />
  );
}
