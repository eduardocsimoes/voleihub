// PremiumCardAnimations.tsx - Animações e wrapper dos cards premium

import React from "react";

export const PREMIUM_CARD_ANIMATIONS = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes glow-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes rotate-rays {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes particle-float {
    0% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) scale(0);
      opacity: 0;
    }
  }
`;

type Props = {
  rarity: "common" | "rare" | "epic" | "legendary";
  dominance: "standard" | "dominant" | "legendary";
  children: React.ReactNode;
  className?: string;
};

export function PremiumCardWrapper({ rarity, dominance, children, className = "" }: Props) {
  const rarityColors = {
    common: {
      gradient: "from-slate-600 via-slate-500 to-slate-600",
      glow: "rgba(148, 163, 184, 0.3)",
    },
    rare: {
      gradient: "from-blue-600 via-blue-400 to-blue-600",
      glow: "rgba(59, 130, 246, 0.5)",
    },
    epic: {
      gradient: "from-purple-600 via-purple-400 to-purple-600",
      glow: "rgba(168, 85, 247, 0.5)",
    },
    legendary: {
      gradient: "from-amber-600 via-amber-400 to-amber-600",
      glow: "rgba(245, 158, 11, 0.8)",
    },
  };
  
  const colors = rarityColors[rarity];
  
  return (
    <div 
      className={`relative ${className}`}
      style={{
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        boxShadow: `0 0 40px ${colors.glow}, 0 10px 50px rgba(0,0,0,0.5)`,
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />
      
      {/* Shimmer effect para legendary */}
      {rarity === "legendary" && (
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none z-10"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            backgroundSize: "1000px 100%",
            animation: "shimmer 3s infinite linear",
          }}
        />
      )}
      
      {/* Rays para dominant/legendary */}
      {(dominance === "dominant" || dominance === "legendary") && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: `repeating-conic-gradient(from 0deg, transparent 0deg, ${colors.glow} 10deg, transparent 20deg)`,
              animation: "rotate-rays 20s linear infinite",
            }}
          />
        </div>
      )}
      
      {/* Partículas flutuantes para epic e legendary */}
      {(rarity === "epic" || rarity === "legendary") && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: "0%",
                animation: `particle-float ${3 + Math.random() * 2}s ease-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}