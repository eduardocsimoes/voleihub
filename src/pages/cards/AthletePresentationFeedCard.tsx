import React, { useState } from "react";
import { RotateCcw, ImagePlus } from "lucide-react";

type Props = {
  name: string;
  profilePhotoUrl?: string | null;
  position: string;
  heightCm?: number | null;
  birthYear?: number | null;
  club?: string | null;
  city?: string | null;
  state?: string | null;
  mainTitle?: string | null;
  brandText?: string;
};

/* =========================
   HELPERS
========================== */
function formatHeight(heightCm?: number | null) {
  if (!heightCm) return "—";
  return `${(heightCm / 100).toFixed(2).replace(".", ",")} m`;
}

function calculateAge(birthYear?: number | null) {
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
}

function statLine(label: string, value?: string | null) {
  return (
    <div className="flex justify-between items-center py-2 px-3 rounded-lg
                    bg-white/60 border border-gray-300">
      <span className="text-gray-600 text-xs font-semibold uppercase">
        {label}
      </span>
      <span className="text-gray-900 font-bold text-sm text-right">
        {value || "—"}
      </span>
    </div>
  );
}

/* =========================
   COMPONENT
========================== */
export default function AthletePresentationFeedCard({
  name,
  profilePhotoUrl,
  position,
  heightCm,
  birthYear,
  club,
  city,
  state,
  mainTitle,
  brandText = "voleihub.com",
}: Props) {
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  const photoToUse = customPhoto || profilePhotoUrl;
  const age = calculateAge(birthYear);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCustomPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="
      w-[420px] aspect-square rounded-[36px] relative overflow-hidden
      bg-gradient-to-br from-[#f8f8f6] to-[#eaeae6]
      shadow-[0_25px_60px_rgba(0,0,0,0.35)]
    ">

      {/* ================= MOLDURA EXTERNA ================= */}
      <div className="absolute inset-0 rounded-[36px] border-[3px] border-orange-500" />

      {/* ================= FOTO (40%) ================= */}
      <div className="relative h-[40%] w-full p-3">
        <div className="relative h-full w-full rounded-2xl overflow-hidden border-2 border-orange-400">

          {photoToUse ? (
            <img
              src={photoToUse}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
              Sem foto
            </div>
          )}

          {/* Overlay esportivo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-10" />

          {/* Nome + posição */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-[11px] uppercase tracking-widest text-orange-300">
              {position}
            </div>
            <div className="text-xl font-extrabold text-white leading-tight">
              {name}
            </div>
          </div>

          {/* BOTÕES FOTO */}
          <div className="absolute top-3 right-3 flex gap-2">
            <label
              className="bg-black/70 border border-white/20 rounded-full p-2 cursor-pointer hover:bg-black"
              title="Trocar foto do card"
            >
              <ImagePlus size={16} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            {customPhoto && (
              <button
                onClick={() => setCustomPhoto(null)}
                className="bg-black/70 border border-white/20 rounded-full p-2 hover:bg-black"
                title="Resetar para foto do perfil"
              >
                <RotateCcw size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= INFO (60%) ================= */}
      <div className="relative h-[60%] p-5">

        {/* Moldura interna INFO */}
        <div className="absolute inset-3 rounded-2xl border-2 border-orange-400/40 pointer-events-none" />

        {/* Conteúdo */}
        <div className="relative z-10 space-y-2">
          {statLine("Nascimento", birthYear ? `${birthYear} (${age} anos)` : null)}
          {statLine("Altura", formatHeight(heightCm))}
          {statLine("Clube Atual", club)}
          {statLine("Cidade", city && state ? `${city} - ${state}` : city)}
          {statLine("Título Destaque", mainTitle)}
        </div>

        {/* Rodapé */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-[11px] font-semibold text-gray-500">
          {brandText}
        </div>
      </div>
    </div>
  );
}
