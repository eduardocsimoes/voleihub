// LockedCard.tsx - Card não revelado (misterioso)

import React from "react";
import { Lock, Sparkles } from "lucide-react";
import { CardData } from "../../types/cardSystem";
import { getRarityColors, getRarityEmoji } from "../../utils/cardUtils";

type Props = {
  card: CardData;
  onClick: () => void;
};

export default function LockedCard({ card, onClick }: Props) {
  const colors = getRarityColors(card.state.rarity);
  const emoji = getRarityEmoji(card.state.rarity);

  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        boxShadow: `0 10px 30px ${colors.glow}`,
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes rotate-sparkle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Padrão de fundo */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`,
        }}
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            animation: "shimmer 3s infinite",
          }}
        />
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Conteúdo central */}
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        {/* Badge "NOVO" */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
          <Sparkles size={12} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-wider">
            Novo
          </span>
        </div>

        {/* Ícone de cadeado */}
        <div
          className="mb-4 relative"
          style={{
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <div
            className="absolute inset-0 blur-xl opacity-60"
            style={{
              background: colors.glow,
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          <Lock size={48} className="relative text-white drop-shadow-lg" />
        </div>

        {/* Símbolo de interrogação gigante */}
        <div
          className="text-8xl font-black text-white/80 mb-4 drop-shadow-2xl"
          style={{
            textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
          }}
        >
          ?
        </div>

        {/* Badge de raridade */}
        <div
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border-2"
          style={{
            borderColor: colors.primary,
          }}
        >
          <span className="text-2xl">{emoji}</span>
          <span className="text-white font-black uppercase text-sm tracking-wider">
            {card.state.rarity}
          </span>
        </div>

        {/* Texto de instrução */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-center">
            <div className="text-white/90 font-bold text-xs mb-1">
              Clique para revelar
            </div>
            <div className="text-white/60 text-[10px]">
              Conquista de {card.achievement.year}
            </div>
          </div>
        </div>
      </div>

      {/* Brilho hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Borda animada */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 2px ${colors.primary}`,
          opacity: 0.5,
        }}
      />

      {/* Sparkles rotativos no hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {[0, 90, 180, 270].map((rotation) => (
          <div
            key={rotation}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            <Sparkles
              className="text-white absolute"
              size={16}
              style={{
                animation: "rotate-sparkle 4s linear infinite",
                top: "-60px",
              }}
            />
          </div>
        ))}
      </div>
    </button>
  );
}