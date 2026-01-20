import React, { useMemo, useRef, useState } from "react";
import { RotateCcw, ImagePlus, Trophy, Star } from "lucide-react";
import type { CardStyleTokens as ProfileTokens } from "../achievementCardProfile";
import type { AchievementCardUI, PlacementType } from "../design/achievementCardVisuals";

/* =========================
   TYPES
========================== */

type BaseProps = {
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

  aspectClass: string;
  photoHeightClass: string;
  containerPadding: string;
};

/* =========================
   HELPERS
========================== */

function placementLabel(p: PlacementType) {
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
      return "Melhor da Posição";
    default:
      return null;
  }
}

function placementBadgeStyle(p: PlacementType) {
  switch (p) {
    case "gold":
      return "bg-yellow-400 text-black";
    case "silver":
      return "bg-gray-200 text-black";
    case "bronze":
      return "bg-amber-600 text-black";
    case "mvp":
      return "bg-orange-500 text-white";
    case "position":
      return "bg-purple-600 text-white";
    default:
      return "bg-white/15 text-white";
  }
}

/* =========================
   COMPONENT
========================== */

export default function AchievementCardBase({
  athleteName,
  profilePhotoUrl,
  title,
  achievement,
  category,
  year,
  club,
  brandText = "voleihub.com",
  profile,
  ui,
  aspectClass,
  photoHeightClass,
  containerPadding,
}: BaseProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const photoToUse = customPhoto || profilePhotoUrl;

  const tiltIntensity = ui?.tilt ?? 8;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * tiltIntensity;
    const rotateX = -((y - centerY) / centerY) * tiltIntensity;

    setTilt({ x: rotateX, y: rotateY });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCustomPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  /* =========================
     TOKENS
  ========================== */
  const frameOuter = ui?.frameOuter ?? profile?.frameClass ?? "border-yellow-500";
  const frameInner = ui?.frameInner ?? "border-white/15";
  const glow = ui?.glow ?? profile?.glowClass ?? "shadow-xl";
  const accentText = ui?.accentText ?? "text-yellow-300";
  const chip = ui?.chipClass ?? "bg-black/40 text-white border border-white/10";
  const bgGradient = ui?.bgGradient ?? "from-[#0b0f16] via-[#1a1f2a] to-[#05070a]";
  const bgPatternOpacity = ui?.bgPatternOpacity ?? "opacity-70";
  const medalBg = ui?.medalBg ?? "bg-yellow-400";
  const medalRing = ui?.medalRing ?? "ring-white/20";

  const dominanceLabel = profile?.dominance?.label ?? null;
  const hasDominance = Boolean(profile?.dominance?.isDominant && dominanceLabel);

  const placementText = useMemo(() => placementLabel(ui?.placement ?? "none"), [ui?.placement]);
  const placementClass = useMemo(() => placementBadgeStyle(ui?.placement ?? "none"), [ui?.placement]);

  const shimmerClass = useMemo(() => {
    const strength = ui?.shimmerStrength ?? "low";
    if (strength === "high") return "opacity-100";
    if (strength === "mid") return "opacity-70";
    return "opacity-40";
  }, [ui?.shimmerStrength]);

  /* =========================
     RENDER
  ========================== */
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 140ms ease-out",
      }}
      className={`relative overflow-hidden ${aspectClass} rounded-[42px] ${glow} select-none`}
    >
      {/* BACKGROUND */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />

      <div
        className={`absolute inset-0 pointer-events-none ${bgPatternOpacity}`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.10), transparent 38%)," +
            "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.08), transparent 40%)," +
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%)," +
            "linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 55%)",
        }}
      />

      {/* FRAME */}
      <div className={`absolute inset-0 rounded-[42px] border-[3px] ${frameOuter}`} />
      <div className={`absolute inset-[10px] rounded-[34px] border-2 ${frameInner}`} />

      {/* TOP CHIPS */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {!!profile?.competitionLabel && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${chip}`}>
              {profile.competitionLabel}
            </span>
          )}
          {!!profile?.divisionLabel && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${chip}`}>
              {profile.divisionLabel}
            </span>
          )}
        </div>

        {placementText && (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${placementClass}`}>
            {placementText}
          </span>
        )}
      </div>

      {/* DOMINANCE */}
      {hasDominance && (
        <div className="absolute top-[64px] left-4 z-30">
          <div className="bg-black/70 backdrop-blur px-3 py-1 rounded-full text-xs font-extrabold text-yellow-200 flex items-center gap-1 border border-white/10">
            <Star size={12} />
            {dominanceLabel}
          </div>
        </div>
      )}

      {/* PHOTO — 10% MENOR */}
      <div className={`relative ${photoHeightClass} p-3 z-10`}>
        <div className={`relative h-full w-full overflow-hidden rounded-[26px] border-2 ${frameInner}`}>
          {photoToUse ? (
            <img src={photoToUse} alt={athleteName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/70">
              Sem foto
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          <div className="absolute bottom-3 left-3 right-3 text-white text-lg font-extrabold drop-shadow">
            {athleteName}
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            <label className="bg-black/65 border border-white/15 rounded-full p-2 cursor-pointer hover:bg-black/80">
              <ImagePlus size={16} className="text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>

            {customPhoto && (
              <button
                onClick={() => setCustomPhoto(null)}
                className="bg-black/65 border border-white/15 rounded-full p-2 hover:bg-black/80"
              >
                <RotateCcw size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className={`relative z-10 ${containerPadding} flex flex-col justify-between`}>
        <div className="absolute inset-4 rounded-[26px] bg-black/10 border border-white/10" />

        <div className="relative z-10 text-center space-y-3">
          <div className="flex justify-center">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ring-2 ${medalRing} ${medalBg}`}
            >
              <Trophy className="text-black" size={26} />
            </div>
          </div>

          <div className={`${accentText} text-sm font-extrabold uppercase tracking-[0.24em]`}>
            {achievement}
          </div>

          <div className="text-white text-[20px] font-extrabold leading-tight px-3 drop-shadow">
            {title}
          </div>

          <div className="text-white/80 text-sm font-semibold">
            {category && <span>{category} • </span>}
            {year}
          </div>

          <div className="mx-auto w-fit bg-white/10 rounded-2xl px-5 py-2 border border-white/10 text-white font-extrabold">
            {club}
          </div>

          {profile?.rarity && (
            <div className="text-[10px] font-extrabold tracking-[0.35em] text-white/60">
              {String(profile.rarity).toUpperCase()}
            </div>
          )}
        </div>

        <div className="relative z-10 text-center text-[11px] font-semibold text-white/60">
          {brandText}
        </div>
      </div>
    </div>
  );
}
