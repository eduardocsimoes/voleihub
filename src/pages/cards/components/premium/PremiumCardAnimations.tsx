// PremiumCardAnimations.tsx - Animações e Efeitos Visuais

import React from 'react';
import type { CardRarity, Dominance } from './PremiumCardSystem';
import { RARITY_CONFIGS } from './PremiumCardSystem';

/* =========================
   KEYFRAMES CSS
========================== */
export const PREMIUM_CARD_ANIMATIONS = `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.03); }
  }
  
  @keyframes float-particle {
    0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-120px) translateX(30px) rotate(180deg); opacity: 0; }
  }
  
  @keyframes ray-sweep {
    0% { transform: translateX(-100%) rotate(25deg); }
    100% { transform: translateX(200%) rotate(25deg); }
  }
  
  @keyframes rainbow-shift {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  
  @keyframes border-pulse {
    0%, 100% { 
      border-color: var(--primary-color);
      box-shadow: 0 0 20px var(--glow-color);
    }
    50% { 
      border-color: var(--accent-color);
      box-shadow: 0 0 40px var(--glow-color), 0 0 60px var(--glow-color);
    }
  }
  
  @keyframes dominance-pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 0 10px currentColor;
    }
    50% { 
      transform: scale(1.05);
      box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
    }
  }
  
  @keyframes confetti-burst {
    0% { transform: translateY(0) scale(0); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: translateY(-200px) scale(1) rotate(720deg); opacity: 0; }
  }
  
  .shimmer-effect {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  
  .subtle-animation {
    animation: pulse-glow 4s ease-in-out infinite;
  }
  
  .medium-animation {
    animation: pulse-glow 3s ease-in-out infinite;
  }
  
  .intense-animation {
    animation: pulse-glow 2.5s ease-in-out infinite, border-pulse 2.5s ease-in-out infinite;
  }
  
  .legendary-animation {
    animation: 
      pulse-glow 2s ease-in-out infinite, 
      border-pulse 2s ease-in-out infinite;
  }
  
  .mythic-animation {
    animation: 
      pulse-glow 1.5s ease-in-out infinite, 
      border-pulse 1.5s ease-in-out infinite,
      rainbow-shift 10s linear infinite;
  }
  
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    animation: float-particle 4s ease-in infinite;
    pointer-events: none;
  }
  
  .light-ray {
    position: absolute;
    top: 0;
    left: -50%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.5) 50%,
      transparent 100%
    );
    transform: rotate(25deg);
    animation: ray-sweep 4s ease-in-out infinite;
    pointer-events: none;
  }
  
  .dominance-badge {
    animation: dominance-pulse 2s ease-in-out infinite;
  }
  
  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 8px;
    animation: confetti-burst 2s ease-out forwards;
    pointer-events: none;
  }
`;

/* =========================
   COMPONENTE: Badge de Raridade
========================== */
interface RarityBadgeProps {
  rarity: CardRarity;
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const config = RARITY_CONFIGS[rarity];
  
  return (
    <div
      className="
        absolute top-4 left-4 z-20
        px-3 py-1.5 rounded-full
        font-black text-xs uppercase tracking-widest
        border-2
        backdrop-blur-sm
      "
      style={{
        background: config.gradient,
        borderColor: config.colors.primary,
        boxShadow: `0 0 20px ${config.colors.glow}`,
        color: rarity === 'common' ? '#2D1810' : 'white',
        textShadow: rarity === 'common' 
          ? 'none' 
          : '0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(255,255,255,0.3)',
      }}
    >
      {config.name}
    </div>
  );
}

/* =========================
   COMPONENTE: Badge de Dominância
========================== */
interface DominanceBadgeProps {
  dominance: Dominance;
}

export function DominanceBadge({ dominance }: DominanceBadgeProps) {
  if (!dominance.isDominant) return null;
  
  return (
    <div
      className="
        absolute top-4 right-4 z-20
        px-3 py-1.5 rounded-full
        font-black text-xs uppercase tracking-wider
        border-2
        backdrop-blur-sm
        dominance-badge
      "
      style={{
        background: `linear-gradient(135deg, ${dominance.color}, ${dominance.color}DD)`,
        borderColor: dominance.color,
        boxShadow: `0 0 20px ${dominance.color}`,
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)',
      }}
    >
      <span className="mr-1">{dominance.icon}</span>
      {dominance.label}
    </div>
  );
}

/* =========================
   COMPONENTE: Partículas Flutuantes
========================== */
interface ParticlesProps {
  count: number;
  color: string;
}

export function FloatingParticles({ count, color }: ParticlesProps) {
  if (count === 0) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '0',
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            background: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

/* =========================
   COMPONENTE: Raios de Luz
========================== */
interface LightRaysProps {
  show: boolean;
  color?: string;
}

export function LightRays({ show, color = 'rgba(255, 255, 255, 0.5)' }: LightRaysProps) {
  if (!show) return null;
  
  return (
    <>
      <div 
        className="light-ray" 
        style={{ 
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          opacity: 0.4,
          animationDelay: '0s',
        }} 
      />
      <div 
        className="light-ray" 
        style={{ 
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          opacity: 0.3,
          animationDelay: '2s',
        }} 
      />
    </>
  );
}

/* =========================
   COMPONENTE: Efeito Shimmer
========================== */
interface ShimmerEffectProps {
  show: boolean;
}

export function ShimmerEffect({ show }: ShimmerEffectProps) {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 shimmer-effect rounded-[40px] pointer-events-none opacity-60" />
  );
}

/* =========================
   COMPONENTE: Confete (Mythic)
========================== */
interface ConfettiProps {
  show: boolean;
}

export function Confetti({ show }: ConfettiProps) {
  if (!show) return null;
  
  const colors = ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFD60A'];
  
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: `50%`,
            background: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* =========================
   COMPONENTE: Efeitos Visuais Completos
========================== */
interface CardEffectsProps {
  rarity: CardRarity;
  dominance: Dominance;
}

export function PremiumCardEffects({ rarity, dominance }: CardEffectsProps) {
  const config = RARITY_CONFIGS[rarity];
  
  return (
    <>
      {/* Badges */}
      <RarityBadge rarity={rarity} />
      <DominanceBadge dominance={dominance} />
      
      {/* Brilho pulsante nas bordas */}
      {config.animation !== 'none' && (
        <div
          className={`
            absolute inset-0 rounded-[40px] pointer-events-none
            ${config.animation === 'subtle' ? 'subtle-animation' : ''}
            ${config.animation === 'medium' ? 'medium-animation' : ''}
            ${config.animation === 'intense' ? 'intense-animation' : ''}
            ${config.animation === 'legendary' ? 'legendary-animation' : ''}
            ${config.animation === 'mythic' ? 'mythic-animation' : ''}
          `}
          style={{
            boxShadow: config.shadow,
            opacity: 0.5,
          }}
        />
      )}
      
      {/* Raios de luz (EPIC+) */}
      <LightRays 
        show={rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic'} 
        color={config.colors.glow}
      />
      
      {/* Partículas flutuantes */}
      <FloatingParticles 
        count={config.particles} 
        color={config.colors.accent} 
      />
      
      {/* Efeito shimmer/holográfico (LEGENDARY+) */}
      <ShimmerEffect show={rarity === 'legendary' || rarity === 'mythic'} />
      
      {/* Confete (só MYTHIC) */}
      <Confetti show={rarity === 'mythic'} />
      
      {/* Overlay de brilho sutil */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[40px]"
        style={{
          background: config.shine,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  );
}

/* =========================
   COMPONENTE: Wrapper do Card Premium
========================== */
interface PremiumCardWrapperProps {
  rarity: CardRarity;
  dominance: Dominance;
  children: React.ReactNode;
  className?: string;
}

export function PremiumCardWrapper({ 
  rarity, 
  dominance, 
  children, 
  className = '' 
}: PremiumCardWrapperProps) {
  const config = RARITY_CONFIGS[rarity];
  
  return (
    <div
      className={`
        relative overflow-hidden
        ${className}
      `}
      style={{
        background: config.gradient,
        border: config.border,
        boxShadow: config.shadow,
        borderImage: rarity === 'mythic' 
          ? `${config.gradient} 1`
          : undefined,
        '--primary-color': config.colors.primary,
        '--accent-color': config.colors.accent,
        '--glow-color': config.colors.glow,
      } as React.CSSProperties}
    >
      {/* Efeitos visuais */}
      <PremiumCardEffects rarity={rarity} dominance={dominance} />
      
      {/* Conteúdo do card */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}