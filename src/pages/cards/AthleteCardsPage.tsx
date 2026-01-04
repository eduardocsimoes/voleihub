import React, { useEffect, useMemo, useRef, useState } from "react";
import { auth } from "../../firebase/config";
import { getUserProfile } from "../../firebase/firestore";
import { uploadAthleteCardImage } from "../../firebase/storage";
import {
  buildAchievementCardProfile,
  type AchievementVM,
} from "./achievementCardProfile";


import AthletePresentationStoryCard from "../cards/AthletePresentationStoryCard";
import AthletePresentationFeedCard from "../cards/AthletePresentationFeedCard";
import AthleteAchievementFeedCard from "../cards/AthleteAchievementFeedCard";
import AthleteAchievementStoryCard from "../cards/AthleteAchievementStoryCard";
import AchievementVisualSelector from "./components/AchievementVisualSelector";

import { toPng } from "html-to-image";
import {
  Download,
  Instagram,
  MessageCircle,
  Trophy,
  User,
} from "lucide-react";

/* =========================
   TYPES
========================== */
type PresentationFormat = "feed" | "story";
type CardType = "presentation" | "achievement";

type AchievementCardData = {
  title: string;
  achievement: string;
  category: string;
  year: number; // ✅ sempre number
  club: string;
};

export default function AthleteCardsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [cardType, setCardType] = useState<CardType>("presentation");
  const [presentationFormat, setPresentationFormat] =
    useState<PresentationFormat>("feed");

  const [exporting, setExporting] = useState(false);
  const [selectedAchievementIndex, setSelectedAchievementIndex] = useState(0);

  const cardRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     LOAD PROFILE
  ========================== */
  useEffect(() => {
    async function loadProfile() {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserProfile(uid);
        setProfile(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  /* =========================
     HELPERS
  ========================== */
  function dataURLToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  }

  function safeText(value: any, fallback = "—"): string {
    if (value === null || value === undefined) return fallback;
    const s = String(value).trim();
    return s.length ? s : fallback;
  }

  /* =========================
     DERIVED DATA
  ========================== */
  const birthYear = useMemo(() => {
    return profile?.birthDate
      ? new Date(profile.birthDate).getFullYear()
      : null;
  }, [profile]);

  const club = useMemo(() => {
    return profile?.clubName || profile?.club || "—";
  }, [profile]);

  const achievements = useMemo<AchievementVM[]>(() => {
    return Array.isArray(profile?.achievements)
      ? (profile.achievements as AchievementVM[])
      : [];
  }, [profile]);

  const selectedAchievement = useMemo<AchievementVM | null>(() => {
    if (!achievements.length) return null;
    return achievements[selectedAchievementIndex] ?? null;
  }, [achievements, selectedAchievementIndex]);

  /* =========================
     NORMALIZED ACHIEVEMENT DATA
  ========================== */
  const achievementCardData: AchievementCardData | null = useMemo(() => {
    if (!selectedAchievement) return null;

    const rawYear =
    selectedAchievement.year ??
    selectedAchievement.season ??
    (selectedAchievement.date
      ? new Date(selectedAchievement.date).getFullYear()
      : null);
  

    return {
      title: safeText(
        selectedAchievement.title ??
        selectedAchievement.championship ??
        "Conquista"
      ),      
      achievement: safeText(
        selectedAchievement.achievement ??
        selectedAchievement.description ??
        selectedAchievement.championship ??
        "—"
      ),      
      category: safeText(
        selectedAchievement.category ??
        selectedAchievement.level ??
        selectedAchievement.type ??
        "—"
      ),      
      year: Number(rawYear) || new Date().getFullYear(), // ✅ garante number
      club: safeText(
        selectedAchievement.club ??
        selectedAchievement.clubName ??
        club
      ),      
    };
  }, [selectedAchievement, club]);

  const achievementProfile = useMemo(() => {
    if (!selectedAchievement) return null;
  
    return buildAchievementCardProfile({
      achievement: selectedAchievement,
      allAchievements: achievements,
      // futuramente: divisionOrder (quando vier do cadastro)
    });
  }, [selectedAchievement, achievements]);  
  
  /* =========================
     EXPORT
  ========================== */
  async function handleExport() {
    if (!cardRef.current) return;

    try {
      setExporting(true);

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
      });

      const blob = dataURLToBlob(dataUrl);
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      await uploadAthleteCardImage(uid, presentationFormat, blob);

      const link = document.createElement("a");
      link.href = dataUrl;

      const base =
        cardType === "achievement" ? "conquista" : "apresentacao";

      link.download =
        presentationFormat === "story"
          ? `card-${base}-story.png`
          : `card-${base}-feed.png`;

      link.click();
    } catch (err) {
      console.error("Erro ao exportar:", err);
      alert("Erro ao exportar o card.");
    } finally {
      setExporting(false);
    }
  }

  /* =========================
     STATES
  ========================== */
  if (loading) return <p className="text-gray-400">Carregando...</p>;
  if (!profile) return <p className="text-gray-400">Perfil não encontrado.</p>;

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Cartões do Atleta</h1>

      {/* TIPO */}
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          onClick={() => setCardType("presentation")}
          className={`px-5 py-2 rounded-xl font-semibold flex items-center gap-2 ${
            cardType === "presentation"
              ? "bg-orange-500 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          <User size={18} /> Apresentação
        </button>

        <button
          onClick={() => setCardType("achievement")}
          className={`px-5 py-2 rounded-xl font-semibold flex items-center gap-2 ${
            cardType === "achievement"
              ? "bg-orange-500 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          <Trophy size={18} /> Conquista
        </button>
      </div>

      {/* FORMATO */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setPresentationFormat("feed")}
          className={`px-5 py-2 rounded-xl font-semibold ${
            presentationFormat === "feed"
              ? "bg-orange-500 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          Feed
        </button>

        <button
          onClick={() => setPresentationFormat("story")}
          className={`px-5 py-2 rounded-xl font-semibold ${
            presentationFormat === "story"
              ? "bg-orange-500 text-white"
              : "bg-gray-800 text-gray-300"
          }`}
        >
          Story
        </button>
      </div>

      {/* SELETOR VISUAL */}
      {cardType === "achievement" && achievements.length > 0 && (
        <AchievementVisualSelector
          achievements={achievements}
          selectedIndex={selectedAchievementIndex}
          onSelect={setSelectedAchievementIndex}
        />
      )}

      {/* PREVIEW */}
      <div className="flex justify-center">
        <div ref={cardRef} className="w-fit">
          {cardType === "presentation" ? (
            presentationFormat === "feed" ? (
              <AthletePresentationFeedCard
                name={profile.name}
                profilePhotoUrl={profile.photoURL}
                position={profile.position}
                heightCm={profile.height}
                birthYear={birthYear}
                club={club}
                city={profile.city}
                state={profile.state}
                mainTitle={profile.achievements?.[0]?.championship || null}
              />
            ) : (
              <AthletePresentationStoryCard
                name={profile.name}
                profilePhotoUrl={profile.photoURL}
                position={profile.position}
                heightCm={profile.height}
                birthYear={birthYear}
                club={club}
                city={profile.city}
                state={profile.state}
                mainTitle={profile.achievements?.[0]?.championship || null}
              />
            )
          ) : achievementCardData ? (
            presentationFormat === "feed" ? (
              <AthleteAchievementFeedCard
                athleteName={profile.name}
                profilePhotoUrl={profile.photoURL}
                {...achievementCardData}
                profile={achievementProfile ?? undefined}
                brandText="voleihub.com"
              />
            ) : (
              <AthleteAchievementStoryCard
                athleteName={profile.name}
                profilePhotoUrl={profile.photoURL}
                {...achievementCardData}
                profile={achievementProfile ?? undefined}
                brandText="voleihub.com"
              />
            )
          ) : null}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold"
        >
          <Download size={18} />
        </button>

        <button
          onClick={() => window.open("https://web.whatsapp.com/", "_blank")}
          className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold"
        >
          <MessageCircle size={18} />
        </button>

        <button
          onClick={() => window.open("https://www.instagram.com/", "_blank")}
          className="px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold"
        >
          <Instagram size={18} />
        </button>
      </div>
    </div>
  );
}
