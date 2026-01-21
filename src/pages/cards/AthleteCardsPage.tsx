import React, { useEffect, useMemo, useRef, useState } from "react";
import { auth } from "../../firebase/config";
import { getUserProfile } from "../../firebase/firestore";
import { uploadAthleteCardImage } from "../../firebase/storage";

import {
  buildAchievementCardProfile,
  type AchievementVM,
} from "./achievementCardProfile";

import {
  buildAchievementCardUI,
  type PlacementType,
} from "./design/achievementCardVisuals";

import AthletePresentationStoryCard from "../cards/AthletePresentationStoryCard";
import AthletePresentationFeedCard from "../cards/AthletePresentationFeedCard";
import AthleteAchievementFeedCard from "../cards/AthleteAchievementFeedCard";
import AthleteAchievementStoryCard from "../cards/AthleteAchievementStoryCard";

import { toPng } from "html-to-image";
import {
  Download,
  Instagram,
  MessageCircle,
  Trophy,
  User,
  LayoutGrid,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =========================
   TYPES
========================== */
type PresentationFormat = "feed" | "story";
type CardType = "presentation" | "achievement";

/* =========================
   HELPERS
========================== */
function safeText(value: any, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s.length ? s : fallback;
}

function getYear(a: any): number {
  return (
    Number(
      a?.year ||
        a?.season ||
        (a?.date ? new Date(a.date).getFullYear() : null)
    ) || 0
  );
}

/* =========================
   HELPER: EXTRAIR DIVISÃO (apenas se não for "Divisão Única")
========================== */
function getDivision(a: any): string | null {
  const division = 
    a?.division || 
    a?.divisionName || 
    a?.level || 
    "";
  
  const divisionStr = String(division).trim().toLowerCase();
  
  // Se for "divisão única" ou vazio, retorna null (não mostra)
  if (!divisionStr || 
      divisionStr.includes("divisão única") || 
      divisionStr.includes("divisao unica") ||
      divisionStr.includes("unica") ||
      divisionStr === "única") {
    return null;
  }
  
  return safeText(division);
}

/* =========================
   HELPER: EXTRAIR CATEGORIA
========================== */
function getCategory(a: any): string | null {
  const category = 
    a?.category || 
    a?.categoryName ||
    a?.ageGroup ||
    a?.categoryLevel ||
    "";
  
  const categoryStr = String(category).trim();
  
  // Se vazio, retorna null
  if (!categoryStr) {
    return null;
  }
  
  return categoryStr;
}

/* =========================
   PLACEMENT
========================== */
function getPlacement(a: AchievementVM | null): PlacementType {
  if (!a) return "none";

  const placementField = String((a as any)?.placement ?? "").toLowerCase();
  if (placementField.includes("1")) return "gold";
  if (placementField.includes("2")) return "silver";
  if (placementField.includes("3")) return "bronze";

  const text = `${a?.title ?? ""} ${a?.achievement ?? ""} ${a?.description ?? ""}`.toLowerCase();

  if (text.includes("mvp")) return "mvp";
  if (text.includes("melhor")) return "position";
  if (text.includes("1º") || text.includes("1o")) return "gold";
  if (text.includes("2º") || text.includes("2o")) return "silver";
  if (text.includes("3º") || text.includes("3o")) return "bronze";

  return "none";
}

function placementEmoji(p: PlacementType) {
  switch (p) {
    case "gold":
      return "🥇";
    case "silver":
      return "🥈";
    case "bronze":
      return "🥉";
    case "mvp":
      return "⭐";
    case "position":
      return "🏐";
    default:
      return "🏆";
  }
}

function placementLabel(p: PlacementType, title: string) {
  switch (p) {
    case "gold":
      return "1º Lugar";
    case "silver":
      return "2º Lugar";
    case "bronze":
      return "3º Lugar";
    case "mvp":
      return "MVP";
    case "position":
      // Tenta extrair do título (ex: "Melhor Ponteira")
      if (title.toLowerCase().includes("melhor")) {
        return title;
      }
      return "Destaque Individual";
    default:
      return "Participação";
  }
}

function getAchievementKindLabel(a: any): "Coletivo" | "Individual" | "—" {
  const raw =
    String(
      a?.kind ??
        a?.typeKind ??
        a?.achievementKind ??
        a?.formatKind ??
        a?.mode ??
        a?.format ??
        a?.isIndividual ??
        ""
    ).toLowerCase();

  if (raw === "true") return "Individual";
  if (raw === "false") return "Coletivo";
  if (raw.includes("ind")) return "Individual";
  if (raw.includes("solo")) return "Individual";
  if (raw.includes("colet")) return "Coletivo";
  if (raw.includes("team")) return "Coletivo";
  if (raw === "individual") return "Individual";
  if (raw === "coletivo") return "Coletivo";

  return "—";
}

/* =========================
   FILTRO: Apenas medalhas e conquistas individuais
========================== */
function shouldShowAchievement(placement: PlacementType): boolean {
  return ["gold", "silver", "bronze", "mvp", "position"].includes(placement);
}

/* =========================
   COMPONENTE: MINI ACHIEVEMENT CARD (ADAPTATIVO)
========================== */
function CompactAchievementCard({
  active,
  title,
  year,
  division,
  category,
  placement,
  onClick,
}: {
  active: boolean;
  title: string;
  year: number;
  division: string | null;
  category: string | null;
  placement: PlacementType;
  onClick: () => void;
}) {
  const emoji = placementEmoji(placement);
  const label = placementLabel(placement, title);
  
  // Calcula altura dinamicamente baseado no que tem para mostrar
  const hasCategory = category !== null;
  const hasDivision = division !== null;
  
  let height = 90; // Base: título + ano + colocação
  if (hasDivision) height += 20;
  if (hasCategory) height += 20;

  return (
    <button
      onClick={onClick}
      className={`
        relative group
        w-[140px]
        flex-shrink-0
        p-3 rounded-lg border-2
        transition-all duration-200 ease-out
        ${
          active
            ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-lg shadow-orange-500/40 scale-105"
            : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600"
        }
      `}
      style={{ height: `${height}px` }}
    >
      {/* Conteúdo */}
      <div className="h-full flex flex-col justify-between">
        {/* Nome do campeonato + Ano */}
        <h4
          className={`
            font-bold text-[11px] leading-tight line-clamp-2 text-left
            ${active ? "text-white" : "text-gray-200"}
          `}
          title={`${title} - ${year}`}
        >
          {title} - {year}
        </h4>

        {/* Divisão (apenas se existir e não for "Divisão Única") */}
        {hasDivision && (
          <div
            className={`
              text-[9px] font-medium text-left truncate
              ${active ? "text-white/80" : "text-gray-400"}
            `}
          >
            {division}
          </div>
        )}

        {/* Categoria (apenas se existir) */}
        {hasCategory && (
          <div
            className={`
              text-[10px] font-semibold text-left truncate
              ${active ? "text-white/90" : "text-gray-300"}
            `}
          >
            {category}
          </div>
        )}

        {/* Colocação/Conquista com emoji inline */}
        <div
          className={`
            flex items-center gap-1 text-[11px] font-bold
            ${active ? "text-white" : "text-gray-200"}
          `}
        >
          <span className="text-base">{emoji}</span>
          <span className="truncate">{label}</span>
        </div>
      </div>

      {/* Pulso de seleção */}
      {active && (
        <div className="absolute inset-0 rounded-lg border border-white/30 pointer-events-none animate-pulse"></div>
      )}
    </button>
  );
}

/* =========================
   MAIN COMPONENT
========================== */
export default function AthleteCardsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [cardType, setCardType] = useState<CardType>("presentation");
  const [presentationFormat, setPresentationFormat] =
    useState<PresentationFormat>("feed");

  const [exporting, setExporting] = useState(false);
  const [selectedAchievementIndex, setSelectedAchievementIndex] = useState(0);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     LOAD PROFILE
  ========================== */
  useEffect(() => {
    async function loadProfile() {
      const uid = auth.currentUser?.uid;
      if (!uid) return setLoading(false);

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
     SCROLL CARROSSEL
  ========================== */
  const scrollCarousel = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 160;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  /* =========================
     EXPORT
  ========================== */
  function dataURLToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  }

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
      link.download =
        presentationFormat === "story" ? "card-story.png" : "card-feed.png";
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  /* =========================
     DATA
  ========================== */
  const allAchievements = useMemo<AchievementVM[]>(() => {
    return Array.isArray(profile?.achievements) ? profile.achievements : [];
  }, [profile]);

  // FILTRAR: apenas medalhas e conquistas individuais
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter((a) => {
      const placement = getPlacement(a);
      return shouldShowAchievement(placement);
    });
  }, [allAchievements]);

  // ORDENAR: decrescente por ano (mais recente primeiro)
  const sortedAchievements = useMemo(() => {
    return [...filteredAchievements].sort((a, b) => {
      const yearA = getYear(a);
      const yearB = getYear(b);
      return yearB - yearA; // Decrescente
    });
  }, [filteredAchievements]);

  const achievements = sortedAchievements;

  const selectedAchievement = achievements[selectedAchievementIndex] ?? null;

  const achievementProfile = useMemo(() => {
    if (!selectedAchievement) return null;
    return buildAchievementCardProfile({
      achievement: selectedAchievement,
      allAchievements: allAchievements, // Usa todos para cálculo de perfil
    });
  }, [selectedAchievement, allAchievements]);

  const placement = useMemo(
    () => getPlacement(selectedAchievement),
    [selectedAchievement]
  );

  const achievementUI = useMemo(() => {
    if (!achievementProfile) return undefined;
    return buildAchievementCardUI({ profile: achievementProfile, placement });
  }, [achievementProfile, placement]);

  /* =========================
     STATES
  ========================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-gray-400">Perfil não encontrado.</p>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================== */
  const cardKey = `${cardType}-${presentationFormat}-${selectedAchievementIndex}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Keyframes */}
      <style>{`
        @keyframes vhFadeUp {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* ==================== HEADER ==================== */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Crie seu Card{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
              VôleiHub
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            Escolha tipo, formato e conquista para gerar seu card profissional
          </p>
        </div>

        {/* ==================== FAIXA 1: TIPO + FORMATO ==================== */}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 p-4 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-700/50">
            {/* Tipo de Card */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">
                Tipo:
              </span>
              <div className="flex bg-slate-800/60 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setCardType("presentation")}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md 
                    font-medium text-sm transition-all duration-200
                    ${
                      cardType === "presentation"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }
                  `}
                >
                  <User size={16} />
                  <span>Perfil</span>
                </button>
                <button
                  onClick={() => setCardType("achievement")}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md 
                    font-medium text-sm transition-all duration-200
                    ${
                      cardType === "achievement"
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }
                  `}
                >
                  <Trophy size={16} />
                  <span>Conquista</span>
                </button>
              </div>
            </div>

            {/* Divisor */}
            <div className="hidden sm:block h-8 w-px bg-slate-700"></div>

            {/* Formato */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">
                Formato:
              </span>
              <div className="flex bg-slate-800/60 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setPresentationFormat("feed")}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md 
                    font-medium text-sm transition-all duration-200
                    ${
                      presentationFormat === "feed"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }
                  `}
                >
                  <LayoutGrid size={16} />
                  <span>Feed</span>
                </button>
                <button
                  onClick={() => setPresentationFormat("story")}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md 
                    font-medium text-sm transition-all duration-200
                    ${
                      presentationFormat === "story"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-600/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }
                  `}
                >
                  <Smartphone size={16} />
                  <span>Story</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== FAIXA 2: SELEÇÃO DE CONQUISTAS ==================== */}
        {cardType === "achievement" && (
          <div className="w-full">
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3">
              {/* Header compacto */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy size={12} className="text-orange-500" />
                  Selecione a Conquista
                </h3>
                <span className="text-[9px] text-slate-400 font-medium">
                  {achievements.length}{" "}
                  {achievements.length === 1 ? "conquista" : "conquistas"}
                </span>
              </div>

              {/* Carrossel */}
              {achievements.length > 0 ? (
                <div className="relative group">
                  {/* Botões de navegação */}
                  {achievements.length > 5 && (
                    <>
                      <button
                        onClick={() => scrollCarousel("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-6 h-6 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Anterior"
                      >
                        <ChevronLeft size={14} className="text-white" />
                      </button>

                      <button
                        onClick={() => scrollCarousel("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-6 h-6 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Próximo"
                      >
                        <ChevronRight size={14} className="text-white" />
                      </button>
                    </>
                  )}

                  {/* Container do carrossel */}
                  <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide"
                    style={{ maxHeight: "140px" }}
                  >
                    {achievements.map((a, i) => {
                      const title = safeText(
                        a?.title || (a as any)?.championship,
                        "Conquista"
                      );
                      const year = getYear(a);
                      const division = getDivision(a);
                      const category = getCategory(a);
                      const p = getPlacement(a);

                      return (
                        <div key={i} className="snap-start">
                          <CompactAchievementCard
                            active={i === selectedAchievementIndex}
                            title={title}
                            year={year}
                            division={division}
                            category={category}
                            placement={p}
                            onClick={() => setSelectedAchievementIndex(i)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400">
                  <Trophy size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-[11px] font-medium">
                    Nenhuma conquista com medalha ou destaque individual.
                  </p>
                  <p className="text-[10px] mt-1 opacity-75">
                    Cadastre conquistas de 1º, 2º, 3º lugar ou MVPs.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== CARD + AÇÕES ==================== */}
        <div className="flex flex-col items-center py-4">
          <div
            className="scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.75] origin-top"
            style={{ animation: "vhFadeUp 300ms ease-out" }}
          >
            <div className="flex flex-col items-center gap-4">
              <div ref={cardRef} key={cardKey} className="will-change-transform">
                {cardType === "presentation" ? (
                  presentationFormat === "feed" ? (
                    <AthletePresentationFeedCard
                      name={profile.name}
                      profilePhotoUrl={profile.photoURL}
                      position={profile.position}
                      heightCm={profile.height}
                      birthYear={profile.birthDate}
                      club={profile.club}
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
                      birthYear={profile.birthDate}
                      club={profile.club}
                      city={profile.city}
                      state={profile.state}
                      mainTitle={profile.achievements?.[0]?.championship || null}
                    />
                  )
                ) : presentationFormat === "feed" ? (
                  <AthleteAchievementFeedCard
                    athleteName={profile.name}
                    profilePhotoUrl={profile.photoURL}
                    title={safeText(selectedAchievement?.title)}
                    achievement={safeText(selectedAchievement?.achievement)}
                    category={safeText(selectedAchievement?.category)}
                    year={Number(
                      selectedAchievement?.year || new Date().getFullYear()
                    )}
                    club={safeText(selectedAchievement?.club)}
                    profile={achievementProfile ?? undefined}
                    ui={achievementUI}
                    brandText="voleihub.com"
                  />
                ) : (
                  <AthleteAchievementStoryCard
                    athleteName={profile.name}
                    profilePhotoUrl={profile.photoURL}
                    title={safeText(selectedAchievement?.title)}
                    achievement={safeText(selectedAchievement?.achievement)}
                    category={safeText(selectedAchievement?.category)}
                    year={Number(
                      selectedAchievement?.year || new Date().getFullYear()
                    )}
                    club={safeText(selectedAchievement?.club)}
                    profile={achievementProfile ?? undefined}
                    ui={achievementUI}
                    brandText="voleihub.com"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} />
                  <span>{exporting ? "Baixando..." : "Baixar"}</span>
                </button>

                <button
                  onClick={() => window.open("https://web.whatsapp.com", "_blank")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => window.open("https://instagram.com", "_blank")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Instagram size={16} />
                  <span>Instagram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}