import React, { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, ImagePlus, Trophy, Star } from "lucide-react";

/* =========================
   TYPES
========================== */

export type CardStyleTokens = {
  baseTheme: "international" | "national" | "state" | "municipal";
  frameClass: string;
  glowClass: string;
  iconBgClass: string;
  textAccentClass: string;

  // ✅ raridade usada para animações
  rarity?: "common" | "rare" | "epic" | "legendary";

  dominance?: {
    isDominant: boolean;
    label: string | null;
  };
};

type BaseProps = {
  athleteName: string;
  profilePhotoUrl?: string | null;
  title: string;
  achievement: string;
  category?: string | null;
  year: number;
  club: string;
  brandText?: string;
  profile?: CardStyleTokens;

  aspectClass: string;
  photoHeightClass: string;
  containerPadding: string;
};

/* =========================
   HELPERS
========================== */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getTiltIntensity(rarity?: CardStyleTokens["rarity"]) {
  switch (rarity) {
    case "legendary":
      return 18;
    case "epic":
      return 12;
    case "rare":
      return 8;
    default:
      return 4;
  }
}

function getHoverScale(rarity?: CardStyleTokens["rarity"]) {
  switch (rarity) {
    case "legendary":
      return 1.06;
    case "epic":
      return 1.045;
    case "rare":
      return 1.03;
    default:
      return 1.02;
  }
}

function getTransitionMs(rarity?: CardStyleTokens["rarity"]) {
  switch (rarity) {
    case "legendary":
      return 120;
    case "epic":
      return 140;
    case "rare":
      return 160;
    default:
      return 180;
  }
}

function getShimmerOpacity(rarity?: CardStyleTokens["rarity"]) {
  switch (rarity) {
    case "legendary":
      return 0.28;
    case "epic":
      return 0.22;
    case "rare":
      return 0.16;
    default:
      return 0.1;
  }
}

function getGlareOpacity(rarity?: CardStyleTokens["rarity"]) {
  switch (rarity) {
    case "legendary":
      return 0.55;
    case "epic":
      return 0.45;
    case "rare":
      return 0.35;
    default:
      return 0.28;
  }
}

function getRarityHaloClass(rarity?: CardStyleTokens["rarity"]) {
  // camada extra suave (não depende de cores fixas, só intensidade)
  switch (rarity) {
    case "legendary":
      return "opacity-100";
    case "epic":
      return "opacity-80";
    case "rare":
      return "opacity-60";
    default:
      return "opacity-40";
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
  aspectClass,
  photoHeightClass,
  containerPadding,
}: BaseProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // tilt e glare
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 35, a: 0 }); // x/y em %, a=alpha

  // hover state
  const [isHover, setIsHover] = useState(false);

  // foto custom
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const photoToUse = customPhoto || profilePhotoUrl;

  // acessibilidade
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;

    const apply = () => setReduceMotion(!!mq.matches);
    apply();

    // compat
    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } else {
      // @ts-ignore
      mq.addListener(apply);
      // @ts-ignore
      return () => mq.removeListener(apply);
    }
  }, []);

  const rarity = profile?.rarity;

  const intensity = useMemo(() => getTiltIntensity(rarity), [rarity]);
  const hoverScale = useMemo(() => getHoverScale(rarity), [rarity]);
  const transitionMs = useMemo(() => getTransitionMs(rarity), [rarity]);
  const shimmerOpacity = useMemo(() => getShimmerOpacity(rarity), [rarity]);
  const glareOpacity = useMemo(() => getGlareOpacity(rarity), [rarity]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const nx = (px - cx) / cx; // -1..1
    const ny = (py - cy) / cy; // -1..1

    const rotateY = nx * intensity;
    const rotateX = -ny * intensity;

    setTilt({ x: rotateX, y: rotateY });

    // glare em percent
    const gx = clamp((px / rect.width) * 100, 0, 100);
    const gy = clamp((py / rect.height) * 100, 0, 100);

    setGlare({ x: gx, y: gy, a: glareOpacity });
  }

  function handleMouseEnter() {
    setIsHover(true);
    if (!reduceMotion) {
      setGlare((g) => ({ ...g, a: glareOpacity }));
    }
  }

  function handleMouseLeave() {
    setIsHover(false);
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 35, a: 0 });
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCustomPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  /* =========================
     VISUAL TOKENS
  ========================== */
  const frameClass = profile?.frameClass ?? "border-yellow-500";
  const glowClass = profile?.glowClass ?? "shadow-xl";
  const iconBg = profile?.iconBgClass ?? "bg-yellow-400";
  const accentText = profile?.textAccentClass ?? "text-yellow-600";
  const haloClass = getRarityHaloClass(rarity);

  // transform final (com hover scale)
  const transformValue = reduceMotion
    ? undefined
    : `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
        isHover ? hoverScale : 1
      })`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // mobile: não aplica tilt (não quebra), mantém tudo funcionando
      onTouchStart={() => setIsHover(true)}
      onTouchEnd={() => setIsHover(false)}
      style={
        reduceMotion
          ? undefined
          : {
              transform: transformValue,
              transformStyle: "preserve-3d",
              transition: `transform ${transitionMs}ms ease-out`,
              willChange: "transform",
            }
      }
      className={`
        relative overflow-hidden rounded-[40px]
        bg-gradient-to-br from-[#f7f6f2] to-[#e5e3dc]
        ${aspectClass}
        ${glowClass}
      `}
    >
      {/* ================= MOLDURA ================= */}
      <div className={`absolute inset-0 rounded-[40px] border-[3px] ${frameClass}`} />

      {/* ================= RARITY HALO (leve) ================= */}
      <div
        className={`
          pointer-events-none absolute inset-0
          ${haloClass}
          transition-opacity duration-300
        `}
        style={{
          background:
            "radial-gradient(circle at 30% 10%, rgba(255,255,255,0.28), transparent 40%)",
          opacity: isHover ? 1 : 0.7,
        }}
      />

      {/* ================= GLARE (reflexo) ================= */}
      {!reduceMotion && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.a}), transparent 45%)`,
            transition: `background ${transitionMs}ms ease-out`,
            mixBlendMode: "soft-light",
          }}
        />
      )}

      {/* ================= SHIMMER (rarity) ================= */}
      {!reduceMotion && (
        <div
          className="pointer-events-none absolute -inset-[40%]"
          style={{
            opacity: isHover ? shimmerOpacity : shimmerOpacity * 0.45,
            transform: `translateX(${isHover ? "18%" : "-8%"}) rotate(18deg)`,
            transition: `transform 650ms ease, opacity 350ms ease`,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
          }}
        />
      )}

      {/* ================= DOMINÂNCIA ================= */}
      {profile?.dominance?.isDominant && profile.dominance.label && (
        <div className="absolute top-5 left-5 z-30 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-yellow-300 flex items-center gap-1">
          <Star size={12} />
          {profile.dominance.label}
        </div>
      )}

      {/* ================= FOTO ================= */}
      <div className={`relative ${photoHeightClass} p-4`} style={{ transform: "translateZ(30px)" }}>
        <div className={`relative h-full w-full rounded-3xl overflow-hidden border-2 ${frameClass}`}>
          {photoToUse ? (
            <img src={photoToUse} alt={athleteName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
              Sem foto
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 text-white text-xl font-extrabold">
            {athleteName}
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <label className="bg-black/70 border border-white/20 rounded-full p-2 cursor-pointer hover:bg-black">
              <ImagePlus size={18} className="text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>

            {customPhoto && (
              <button
                onClick={() => setCustomPhoto(null)}
                className="bg-black/70 border border-white/20 rounded-full p-2 hover:bg-black"
              >
                <RotateCcw size={18} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= CONTEÚDO ================= */}
      <div
        className={`relative flex flex-col justify-between ${containerPadding}`}
        style={{ transform: "translateZ(18px)" }}
      >
        <div className={`absolute inset-4 rounded-3xl border-2 ${frameClass}/40`} />

        <div className="relative z-10 text-center space-y-3">
          <div className="flex justify-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${iconBg}`}>
              <Trophy className="text-black" size={28} />
            </div>
          </div>

          <div className={`${accentText} text-sm font-bold uppercase tracking-widest`}>
            {achievement}
          </div>

          <div className="text-gray-900 text-xl font-extrabold px-2">
            {title}
          </div>

          <div className="text-gray-600 text-sm font-semibold">
            {category && <span>{category} • </span>}
            {year}
          </div>

          <div className="bg-white/90 rounded-xl px-4 py-2 border font-bold">
            {club}
          </div>
        </div>

        <div className="text-center text-[11px] font-semibold text-gray-500">
          {brandText}
        </div>
      </div>
    </div>
  );
}
