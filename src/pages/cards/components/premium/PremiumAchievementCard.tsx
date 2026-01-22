// PremiumAchievementCard.tsx - Card Premium Unificado (DEFINITIVAMENTE CORRIGIDO)

import React, { useState } from "react";
import { Trophy, Award, Star, Zap, Crown, Target } from "lucide-react";
import {
  buildCardConfig,
  COMPETITION_CONFIGS,
  type AwardType,
  type PlacementType,
} from "./PremiumCardSystem";
import { PremiumCardWrapper, PREMIUM_CARD_ANIMATIONS } from "./PremiumCardAnimations";

type Props = {
  athleteName: string;
  profilePhotoUrl?: string | null;
  position: string;
  championship: string;
  championshipCategory?: string | null;
  year: number;
  club: string;
  achievement: any;
  allAchievements: any[];
  format?: "feed" | "story";
  brandText?: string;
};

function getPlacementDisplay(placement: PlacementType): { icon: React.ReactElement; emoji: string; text: string } {
  switch (placement) {
    case 'gold':
      return { icon: <Trophy size={48} />, emoji: '🥇', text: '1º LUGAR' };
    case 'silver':
      return { icon: <Award size={48} />, emoji: '🥈', text: '2º LUGAR' };
    case 'bronze':
      return { icon: <Award size={48} />, emoji: '🥉', text: '3º LUGAR' };
  }
}

function getAwardDisplay(award: AwardType): { icon: React.ReactElement; emoji: string; text: string } {
  switch (award) {
    case 'mvp':
      return { icon: <Crown size={48} />, emoji: '👑', text: 'MVP' };
    case 'best_position':
      return { icon: <Star size={48} />, emoji: '⭐', text: 'MELHOR DA POSIÇÃO' };
    case 'highlight':
      return { icon: <Zap size={48} />, emoji: '🏐', text: 'DESTAQUE' };
    case 'revelation':
      return { icon: <Target size={48} />, emoji: '🎯', text: 'REVELAÇÃO' };
  }
}

export default function PremiumAchievementCard({
  athleteName,
  profilePhotoUrl,
  position,
  championship,
  championshipCategory,
  year,
  club,
  achievement,
  allAchievements,
  format = "feed",
  brandText = "voleihub.com",
}: Props) {
  const [imageError, setImageError] = useState(false);
  
  const cardConfig = buildCardConfig(achievement, allAchievements);
  const { 
    competition, 
    achievementType, 
    placement, 
    award, 
    dominance, 
    rarity, 
    competitionConfig 
  } = cardConfig;
  
  const isStory = format === "story";
  const cardWidth = isStory ? 360 : 420;
  const aspectRatio = isStory ? "aspect-[9/16]" : "aspect-square";
  
  const photoToUse = imageError ? null : profilePhotoUrl;
  
  const display = achievementType === 'collective' 
    ? getPlacementDisplay(placement!)
    : getAwardDisplay(award!);

  return (
    <div style={{ width: cardWidth }}>
      <style>{PREMIUM_CARD_ANIMATIONS}</style>
      
      <PremiumCardWrapper
        rarity={rarity}
        dominance={dominance}
        className={`
          ${aspectRatio}
          rounded-[40px]
          shadow-[0_40px_120px_rgba(0,0,0,0.6)]
        `}
      >
        <div className={`relative ${isStory ? 'h-[35%]' : 'h-[35%]'} p-4`}>
          <div className="relative h-full w-full rounded-3xl overflow-hidden bg-black/90">
            
            {photoToUse ? (
              <img
                src={photoToUse}
                alt={athleteName}
                crossOrigin="anonymous"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
                style={{
                  filter: 'brightness(0.85) contrast(1.15) saturate(1.25)',
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Trophy size={72} className="text-gray-600" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />
            
            <div 
              className="absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
              }}
            />
            
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <div className="text-[10px] uppercase tracking-[0.25em] font-black text-white/80 mb-1">
                {position}
              </div>
              <div 
                className="text-xl font-black text-white leading-tight"
                style={{
                  textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 6px 20px rgba(0,0,0,0.5)',
                  letterSpacing: '0.02em',
                }}
              >
                {athleteName}
              </div>
            </div>
            
            <div className="absolute top-3 right-3 z-10">
              <div 
                className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm border-2 text-white text-[10px] font-black uppercase tracking-wider"
                style={{
                  borderColor: competitionConfig.colors.primary,
                  boxShadow: `0 0 15px ${competitionConfig.colors.primary}`,
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}
              >
                <span className="mr-1">{competitionConfig.icon}</span>
                {competitionConfig.name}
              </div>
            </div>
          </div>
        </div>

        <div className={`relative ${isStory ? 'h-[65%]' : 'h-[65%]'} px-6 pb-6 pt-4`}>
          
          <div className="absolute inset-4 rounded-3xl border-2 border-white/15 pointer-events-none" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              
              <div className="relative flex flex-col items-center">
                <div 
                  className="text-7xl mb-2"
                  style={{
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
                  }}
                >
                  {display.emoji}
                </div>
              </div>
              
              <div
                className="text-5xl font-black uppercase tracking-tight leading-none text-white"
                style={{
                  textShadow: `0 4px 12px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.5), 0 0 40px ${competitionConfig.colors.primary}40`,
                  letterSpacing: '-0.03em',
                  WebkitTextStroke: '1.5px rgba(0,0,0,0.4)',
                }}
              >
                {display.text}
              </div>
              
              <div className="space-y-1.5 mt-3">
                <div
                  className="text-lg font-bold text-white/95 leading-tight"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                  }}
                >
                  {championship}
                </div>
                
                {championshipCategory && (
                  <div
                    className="text-sm font-semibold text-white/85 uppercase tracking-wide"
                    style={{
                      textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                    }}
                  >
                    {championshipCategory}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2.5">
              
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-white/70" />
                  <span className="text-sm font-bold text-white/95">
                    {club}
                  </span>
                </div>
                <div className="text-2xl font-black text-white/95">
                  {year}
                </div>
              </div>
              
            </div>
            
            <div className="text-center pt-2">
              <div
                className="text-[11px] font-bold uppercase tracking-widest text-white/50"
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {brandText}
              </div>
            </div>
          </div>
        </div>
      </PremiumCardWrapper>
    </div>
  );
}