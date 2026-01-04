// src/pages/cards/AthleteAchievementStoryCard.tsx
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

export default function AthleteAchievementStoryCard(props: Props) {
  return (
    <AchievementCardBase
      {...props}
      aspectClass="w-[360px] aspect-[9/16]"
      photoHeightClass="h-1/2"
      containerPadding="p-6 h-1/2"
    />
  );
}
