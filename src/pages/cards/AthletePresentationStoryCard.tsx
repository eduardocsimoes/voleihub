import React from "react";

type Props = {
  name: string;
  photoUrl?: string | null;
  position: string;
  heightCm?: number | null;
  birthYear?: number | null;
  club?: string | null;
  city?: string | null;
  state?: string | null;
  mainTitle?: string | null;
  brandText?: string;
};

function formatHeight(heightCm?: number | null) {
  if (!heightCm) return null;
  return `${(heightCm / 100).toFixed(2).replace(".", ",")} m`;
}

export default function AthletePresentationStoryCard({
  name,
  photoUrl,
  position,
  heightCm,
  birthYear,
  club,
  city,
  state,
  mainTitle,
  brandText = "volleyballhub.com",
}: Props) {
  return (
    <div className="w-full max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-black text-white relative">

      {/* FUNDO / FOTO */}
      <div className="absolute inset-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">

        {/* TOPO */}
        <div>
          <div className="text-sm uppercase tracking-wide text-orange-400">
            {position}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight">
            {name}
          </h1>
        </div>

        {/* MÉTRICAS */}
        <div className="flex justify-between text-sm mt-4">
          {heightCm && (
            <div>
              <div className="text-gray-300">Altura</div>
              <div className="font-bold">{formatHeight(heightCm)}</div>
            </div>
          )}
          {birthYear && (
            <div>
              <div className="text-gray-300">Nascimento</div>
              <div className="font-bold">{birthYear}</div>
            </div>
          )}
          {(city || state) && (
            <div>
              <div className="text-gray-300">Local</div>
              <div className="font-bold">
                {city}{state ? `/${state}` : ""}
              </div>
            </div>
          )}
        </div>

        {/* CONTEXTO */}
        <div className="space-y-2 mt-6">
          {club && (
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <div className="text-xs text-gray-300">Clube</div>
              <div className="font-semibold">{club}</div>
            </div>
          )}

          {mainTitle && (
            <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl px-4 py-3">
              <div className="text-xs text-orange-200">Destaque</div>
              <div className="font-bold">🏆 {mainTitle}</div>
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <div className="text-center text-xs text-gray-300 mt-6">
          {brandText}
        </div>
      </div>
    </div>
  );
}
