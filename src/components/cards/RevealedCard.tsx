// RevealedCard.tsx - Card revelado (versão miniatura para gallery)

import React from "react";
import { Trophy, Eye, Calendar } from "lucide-react";
import { CardData } from "../../types/cardSystem";
import { getRarityColors, getRarityEmoji, safeText } from "../../utils/cardUtils";

type Props = {
  card: CardData;
  onClick: () => void;
};

function getPlacementEmoji(achievement: any): string {
  const text = `${achievement.title ?? ""} ${achievement.placement ?? ""}`.toLowerCase();
  
  if (text.includes("1º") || text.includes("1°") || text.includes("campeão") || text.includes("campeao")) {
    return "🥇";
  }
  if (text.includes("2º") || text.includes("2°") || text.includes("vice")) {
    return "🥈";
  }
  if (text.includes("3º") || text.includes("3°")) {
    return "🥉";
  }
  if (text.includes("mvp")) {
    return "⭐";
  }
  if (text.includes("melhor")) {
    return "🏐";
  }
  
  return "🏆";
}

export default function RevealedCard({ card, onClick }: Props) {
  const colors = getRarityColors(card.state.rarity);
  const rarityEmoji = getRarityEmoji(card.state.rarity);
  const placementEmoji = getPlacementEmoji(card.achievement);
  
  const championship = safeText(card.achievement.championship || card.achievement.title, "Conquista");
  const category = card.achievement.championshipCategory;
  const year = card.achievement.year;

  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 bg-slate-800"
      style={{
        boxShadow: `0 4px 12px ${colors.glow}40`,
      }}
    >
      {/* Fundo com gradient da raridade */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        }}
      />

      {/* Badge de raridade no canto */}
      <div className="absolute top-2 right-2 z-10">
        <div
          className={`
            px-2 py-1 rounded-lg backdrop-blur-sm
            border ${colors.border}
            bg-slate-900/80
          `}
        >
          <span className="text-lg">{rarityEmoji}</span>
        </div>
      </div>

      {/* Badge de visualizações */}
      {card.state.viewCount > 1 && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-600/50">
            <Eye size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-300">{card.state.viewCount}</span>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="relative h-full flex flex-col p-4">
        {/* Emoji grande da conquista */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="text-7xl drop-shadow-2xl"
            style={{
              filter: `drop-shadow(0 0 20px ${colors.glow})`,
            }}
          >
            {placementEmoji}
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-2">
          {/* Título da conquista */}
          <div className="text-center">
            <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight mb-1">
              {championship}
            </h3>
            {category && (
              <p className="text-slate-400 text-xs line-clamp-1">
                {category}
              </p>
            )}
          </div>

          {/* Ano e clube */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar size={12} />
              <span>{year}</span>
            </div>
            {card.achievement.club && (
              <div className="text-slate-400 truncate max-w-[120px]">
                {card.achievement.club}
              </div>
            )}
          </div>

          {/* Barra de raridade */}
          <div className="w-full h-1 rounded-full bg-slate-700/50">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
              style={{
                width:
                  card.state.rarity === "legendary"
                    ? "100%"
                    : card.state.rarity === "epic"
                    ? "75%"
                    : card.state.rarity === "rare"
                    ? "50%"
                    : "25%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Overlay de hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-white font-bold text-sm flex items-center gap-2">
          <Eye size={16} />
          Ver Detalhes
        </div>
      </div>

      {/* Borda com cor da raridade */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none border-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          borderColor: colors.primary,
          boxShadow: `0 0 20px ${colors.glow}`,
        }}
      />
    </button>
  );
}