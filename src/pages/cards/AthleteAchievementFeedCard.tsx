import React, { useState } from "react";
import { RotateCcw, ImagePlus, Trophy } from "lucide-react";

/* =========================
   TYPES
========================== */
type Props = {
  athleteName: string;
  profilePhotoUrl?: string | null;
  photoUrl?: string | null;
  title: string;          // Nome da competição
  achievement: string;    // Campeã / Vice / 3º Lugar
  category?: string | null;
  year: number;
  club: string;

  brandText?: string;
};

/* =========================
   COMPONENT
========================== */
export default function AthleteAchievementFeedCard({
  athleteName,
  profilePhotoUrl,
  title,
  achievement,
  category,
  year,
  club,
  brandText = "voleihub.com",
}: Props) {
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  const photoToUse = customPhoto || profilePhotoUrl;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCustomPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="
        w-[420px] aspect-square
        rounded-[36px] overflow-hidden relative
        bg-gradient-to-br from-[#f7f6f2] to-[#e5e3dc]
        shadow-[0_30px_70px_rgba(0,0,0,0.4)]
      "
    >
      {/* Moldura externa */}
      <div className="absolute inset-0 rounded-[36px] border-[3px] border-yellow-500" />

      {/* ================= FOTO (40%) ================= */}
      <div className="relative h-[40%] p-4">
        <div className="relative h-full w-full rounded-3xl overflow-hidden border-2 border-yellow-400">

          {photoToUse ? (
            <img
              src={photoToUse}
              alt={athleteName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
              Sem foto
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-10 pointer-events-none" />

          {/* Nome do atleta */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-white text-lg font-extrabold leading-tight">
              {athleteName}
            </div>
          </div>

          {/* Botões de foto */}
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

      {/* ================= CONQUISTA (60%) ================= */}
      <div className="relative h-[60%] px-6 pb-6 pt-4 flex flex-col justify-between">

        {/* Moldura interna */}
        <div className="absolute inset-4 rounded-3xl border-2 border-yellow-400/40 pointer-events-none" />

        {/* Conteúdo */}
        <div className="relative z-10 text-center space-y-3">

          {/* Ícone */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
              <Trophy className="text-black" size={28} />
            </div>
          </div>

          {/* Achievement */}
          <div className="text-yellow-600 text-xs font-bold uppercase tracking-widest">
            {achievement}
          </div>

          {/* Competição */}
          <div className="text-gray-900 text-lg font-extrabold leading-tight px-2">
            {title}
          </div>

          {/* Categoria + Ano */}
          <div className="text-gray-600 text-sm font-semibold">
            {category && <span>{category} • </span>}
            {year}
          </div>

          {/* Clube */}
          <div className="bg-white/90 rounded-xl px-4 py-2 border border-gray-300 text-gray-900 font-bold text-sm">
            {club}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10 text-center text-[11px] font-semibold text-gray-500">
          {brandText}
        </div>
      </div>
    </div>
  );
}
