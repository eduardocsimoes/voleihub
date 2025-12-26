import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase/config";
import { getUserProfile } from "../../firebase/firestore";

import AthletePresentationCard from "../../components/AthletePresentationCard";
import AthletePresentationStoryCard from "../cards/AthletePresentationStoryCard";

import { toPng } from "html-to-image";
import { Download } from "lucide-react";

type ActiveCard = "presentation" | "story";

export default function AthleteCardsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<ActiveCard>("presentation");
  const [exporting, setExporting] = useState(false);

  const storyRef = useRef<HTMLDivElement | null>(null);

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

      const data = await getUserProfile(uid);
      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, []);

  /* =========================
     EXPORT STORY (PNG 9:16)
  ========================== */
  async function handleExportStory() {
    if (!storyRef.current) return;

    try {
      setExporting(true);

      const dataUrl = await toPng(storyRef.current, {
        cacheBust: true,
        pixelRatio: 3, // 🔥 1080x1920 real
      });

      const link = document.createElement("a");
      link.download = "story-atleta.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao exportar story:", err);
      alert("Erro ao gerar a imagem do story.");
    } finally {
      setExporting(false);
    }
  }

  /* =========================
     STATES
  ========================== */
  if (loading) {
    return <p className="text-gray-400">Carregando...</p>;
  }

  if (!profile) {
    return <p className="text-gray-400">Perfil não encontrado.</p>;
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Cartões do Atleta
      </h1>

      {/* MENU DOS CARDS */}
      <div className="flex gap-6 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveCard("presentation")}
          className={`px-2 pb-1 ${
            activeCard === "presentation"
              ? "text-orange-400 border-b-2 border-orange-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Cartão de Apresentação
        </button>

        <button
          onClick={() => setActiveCard("story")}
          className={`px-2 pb-1 ${
            activeCard === "story"
              ? "text-orange-400 border-b-2 border-orange-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Story (Instagram)
        </button>
      </div>

      {/* ================= CARD DE APRESENTAÇÃO ================= */}
      {activeCard === "presentation" && (
        <AthletePresentationCard
          name={profile.name}
          photoUrl={profile.photoURL}
          position={profile.position}
          heightCm={profile.height}
          club={profile.clubName || profile.club}
          city={profile.city}
          state={profile.state}
          highlight="Atleta em evolução"
        />
      )}

      {/* ================= STORY 9:16 ================= */}
      {activeCard === "story" && (
        <div className="space-y-4">
          {/* STORY PREVIEW */}
          <div ref={storyRef} className="mx-auto w-fit">
            <AthletePresentationStoryCard
              name={profile.name}
              photoUrl={profile.photoURL}
              position={profile.position}
              heightCm={profile.height}
              birthYear={
                profile.birthDate
                  ? new Date(profile.birthDate).getFullYear()
                  : null
              }
              club={profile.clubName || profile.club}
              city={profile.city}
              state={profile.state}
              mainTitle={
                profile.achievements?.[0]?.championship || null
              }
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              onClick={handleExportStory}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-orange-500 hover:bg-orange-600
                         text-white font-semibold disabled:opacity-60"
            >
              <Download size={18} />
              {exporting ? "Gerando imagem..." : "Exportar Story"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
