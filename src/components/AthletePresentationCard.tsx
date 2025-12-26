import React, { useState } from "react";

type Props = {
  // Identidade
  name: string;
  photoUrl?: string | null;

  // Dados principais
  position: string; // ex: "Ponteiro"
  heightCm?: number | null; // ex: 192

  // Contexto
  club?: string | null; // ex: "Clube XYZ"
  city?: string | null; // ex: "Vitória"
  state?: string | null; // ex: "ES"

  // Destaque principal (1 linha)
  highlight?: string | null; // ex: "Campeão Estadual 2024"

  // Branding
  brandText?: string; // ex: "volleyballhub.com"
};

function formatHeight(heightCm?: number | null) {
  if (!heightCm || !Number.isFinite(heightCm)) return null;
  const m = heightCm / 100;
  return `${m.toFixed(2).replace(".", ",")} m`;
}

function joinLocation(city?: string | null, state?: string | null) {
  const c = (city ?? "").trim();
  const s = (state ?? "").trim();
  if (c && s) return `${c} - ${s}`;
  return c || s || null;
}

export default function AthletePresentationCard({
  name,
  photoUrl,
  position,
  heightCm,
  club,
  city,
  state,
  highlight,
  brandText = "volleyballhub.com",
}: Props) {
  const heightLabel = formatHeight(heightCm);
  const locationLabel = joinLocation(city, state);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full max-w-[420px]">
      {/* CARD */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-slate-950 shadow-2xl">

        {/* MENU ⋮ */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full bg-black/60 px-2 py-1 text-white hover:bg-black/80"
            aria-label="Menu do cartão"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
              <button
                onClick={() => {
                  console.log("Compartilhar card");
                  setMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
              >
                📤 Compartilhar
              </button>

              <button
                onClick={() => {
                  console.log("Exportar imagem");
                  setMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
              >
                🖼️ Exportar imagem
              </button>

              <button
                onClick={() => {
                  console.log("Abrir perfil público");
                  setMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
              >
                🔗 Ver perfil
              </button>
            </div>
          )}
        </div>

        {/* TOPO / FOTO */}
        <div className="relative aspect-[4/2.05] bg-gradient-to-b from-slate-900 to-black">
          {/* brilho */}
          <div className="pointer-events-none absolute inset-0 opacity-60">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-5">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Foto de ${name}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-14 w-14 rounded-full bg-gray-800" />
                    <div className="text-sm">Sem foto</div>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10" />
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="space-y-3 p-5">
          {/* Nome */}
          <div>
            <div className="text-xl font-extrabold tracking-tight text-white">
              {name}
            </div>

            <div className="mt-1 text-sm text-gray-300">
              <span className="font-semibold text-gray-100">{position}</span>
              {heightLabel && (
                <>
                  <span className="mx-2 text-gray-500">•</span>
                  <span>{heightLabel}</span>
                </>
              )}
            </div>
          </div>

          {/* Clube / Local */}
          <div className="grid grid-cols-1 gap-1">
            {club && (
              <div className="text-sm text-gray-200">
                <span className="text-gray-400">Clube:</span>{" "}
                <span className="font-semibold">{club}</span>
              </div>
            )}

            {locationLabel && (
              <div className="text-sm text-gray-200">
                <span className="text-gray-400">Local:</span>{" "}
                <span className="font-semibold">{locationLabel}</span>
              </div>
            )}
          </div>

          {/* Destaque */}
          {highlight ? (
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
              <div className="text-sm font-semibold text-orange-200">
                ⭐ {highlight}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/30 px-4 py-3">
              <div className="text-sm text-gray-400">
                Destaque: <span className="text-gray-500">—</span>
              </div>
            </div>
          )}

          {/* Branding */}
          <div className="pt-1 text-center text-[11px] text-gray-500">
            {brandText}
          </div>
        </div>
      </div>
    </div>
  );
}
