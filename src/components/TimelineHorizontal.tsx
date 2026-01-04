import React, { useState } from 'react';
import { Building2, Trophy, Calendar, Edit2, Trash2 } from 'lucide-react';
import type { CareerExperience, Achievement } from '../firebase/firestore';

const formatAchievementDetails = (ach: Achievement) => {
  const parts: string[] = [];

  if ((ach as any).championshipCategory) {
    parts.push((ach as any).championshipCategory);
  }

  if ((ach as any).division && (ach as any).division !== "Divisão Única") {
    parts.push((ach as any).division);
  }

  if (ach.state) {
    parts.push(ach.state);
  }

  if (ach.city) {
    parts.push(ach.city);
  }

  return parts.join(" • ");
};

interface TimelineHorizontalProps {
  experiences: CareerExperience[];
  achievements: Achievement[];
  onEditClub?: (club: CareerExperience) => void;
  onDeleteClub?: (club: CareerExperience) => void;
  onEditAchievement?: (achievement: Achievement) => void;
  onDeleteAchievement?: (achievement: Achievement) => void;
}

type TimelineItem = {
  type: 'year' | 'club' | 'achievement';
  year?: number;
  club?: CareerExperience;
  achievement?: Achievement;
};

export default function TimelineHorizontal({ 
  experiences, 
  achievements,
  onEditClub,
  onDeleteClub,
  onEditAchievement,
  onDeleteAchievement
}: TimelineHorizontalProps) {
  
  const [confirmDelete, setConfirmDelete] = useState<{type: 'club' | 'achievement', id: string} | null>(null);
  
  // Criar linha do tempo contínua
  const createContinuousTimeline = (): TimelineItem[] => {
    const timeline: TimelineItem[] = [];
    
    // Obter todos os anos únicos e ordenar DECRESCENTE (mais recente primeiro)
    const yearsSet = new Set<number>();
    
    // Adicionar anos dos clubes (todos os anos entre startYear e endYear/atual)
    experiences.forEach((exp: CareerExperience) => {
      const endYear = exp.current ? new Date().getFullYear() : (exp.endYear || exp.startYear);
      for (let year = exp.startYear; year <= endYear; year++) {
        yearsSet.add(year);
      }
    });
    
    // Adicionar anos dos títulos
    achievements.forEach((ach: Achievement) => yearsSet.add(ach.year));
    
    // Ordenar DECRESCENTE (mais novo primeiro)
    const years = Array.from(yearsSet).sort((a, b) => b - a);
    
    // Para cada ano, adicionar clubes e títulos
    years.forEach(year => {
      // Adicionar marcador de ano
      timeline.push({ type: 'year', year });
      
      // Obter clubes ativos neste ano
      const clubsThisYear = experiences
        .filter(exp => {
          const endYear = exp.current ? new Date().getFullYear() : (exp.endYear || exp.startYear);
          return year >= exp.startYear && year <= endYear;
        })
        .sort((a, b) => {
          // Ordenar por startYear (mais antigo primeiro dentro do ano)
          if (a.startYear !== b.startYear) return a.startYear - b.startYear;
          return a.id.localeCompare(b.id);
        });
      
      // Para cada clube ativo neste ano
      clubsThisYear.forEach(club => {
        // Adicionar clube
        timeline.push({ type: 'club', club, year });
        
        // Adicionar títulos DESTE clube NESTE ano
        const titlesThisClubThisYear = achievements
          .filter(ach => ach.club === club.clubName && ach.year === year)
          .sort((a, b) => a.id.localeCompare(b.id));
        
        titlesThisClubThisYear.forEach(achievement => {
          timeline.push({ type: 'achievement', achievement });
        });
      });
    });
    
    return timeline;
  };
  
  const timeline = createContinuousTimeline();
  
  // Função para renderizar ícone de colocação
  const renderPlacementIcon = (placement?: string) => {
    switch (placement) {
      case '1º Lugar':
        return '🥇';
      case '2º Lugar':
        return '🥈';
      case '3º Lugar':
        return '🥉';
      case 'Participante':
        return '🏅';
      default:
        return '⭐';
    }
  };
  
  // Confirmar exclusão de clube
  const handleConfirmDeleteClub = (club: CareerExperience) => {
    const titlesCount = achievements.filter(a => a.club === club.clubName).length;
    const message = titlesCount > 0 
      ? `Tem certeza que deseja excluir o clube "${club.clubName}"?\n\n⚠️ ATENÇÃO: ${titlesCount} título(s) vinculado(s) a este clube também será(ão) excluído(s)!`
      : `Tem certeza que deseja excluir o clube "${club.clubName}"?`;
    
    if (window.confirm(message)) {
      onDeleteClub?.(club);
    }
  };
  
  // Confirmar exclusão de título
  const handleConfirmDeleteAchievement = (achievement: Achievement) => {
    if (window.confirm(`Tem certeza que deseja excluir o título "${achievement.championship}"?`)) {
      onDeleteAchievement?.(achievement);
    }
  };
  
  if (experiences.length === 0 && achievements.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-2xl font-bold text-white mb-2">Timeline Vazia</h3>
        <p className="text-gray-400">
          Adicione clubes e títulos para visualizar sua linha do tempo
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-orange-500" />
          Linha do Tempo da Carreira
        </h2>
        <p className="text-gray-400">Sua trajetória profissional em ordem cronológica (mais recente primeiro)</p>
      </div>
      
      {/* Timeline Contínua Horizontal */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 overflow-hidden">
        <div className="relative">
          {/* Linha horizontal contínua */}
          <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/50 via-orange-400/50 to-orange-500/50 rounded-full"></div>
          
          {/* Scroll horizontal */}
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-gray-800/50">
            <div className="flex items-start gap-3 min-w-max px-2">
              {timeline.map((item, index) => {
                if (item.type === 'year') {
                  // Marcador de Ano
                  return (
                    <div key={`year-${item.year}`} className="flex-shrink-0 flex flex-col items-center">
                      <div className="relative z-20 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 whitespace-nowrap">
                        {item.year}
                      </div>
                      <div className="w-px h-4 bg-orange-500/50 mt-2"></div>
                    </div>
                  );
                } else if (item.type === 'club') {
                  // Card de Clube (COMPACTO)
                  const club = item.club!;
                  const currentYear = item.year;
                  const endYear = club.current ? new Date().getFullYear() : (club.endYear || club.startYear);
                  
                  return (
                    <div key={`club-${club.id}-${currentYear}`} className="flex-shrink-0 flex flex-col items-center group/card" style={{ width: '140px' }}>
                      {/* Ponto na linha */}
                      <div className="relative z-10 w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-900 shadow-lg shadow-blue-500/50 mb-2"></div>
                      
                      {/* Card compacto */}
                      <div className="w-full bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30 hover:border-blue-500/60 transition-all shadow-lg relative">
                        {/* Botões de ação (aparecem no hover) */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                          {onEditClub && (
                            <button
                              onClick={() => onEditClub(club)}
                              className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                              title="Editar clube"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {onDeleteClub && (
                            <button
                              onClick={() => handleConfirmDeleteClub(club)}
                              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                              title="Excluir clube"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3 h-3 text-blue-400" />
                          </div>
                          <h4 className="font-bold text-white text-xs line-clamp-2 leading-tight">
                            {club.clubName}
                          </h4>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-300">
                          <div className="truncate">{club.position}</div>
                          <div className="text-green-400 font-medium">
                            {club.startYear} - {club.current ? 'Atual' : endYear}
                          </div>
                        </div>
                        
                        {club.current && currentYear === new Date().getFullYear() && (
                          <div className="mt-2 pt-2 border-t border-blue-500/20">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-xs font-semibold">Atual</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  // Card de Título (COMPACTO)
                  const achievement = item.achievement!;
                  return (
                    <div key={`achievement-${achievement.id}`} className="flex-shrink-0 flex flex-col items-center group/card" style={{ width: '140px' }}>
                      {/* Ponto na linha */}
                      <div className="relative z-10 w-4 h-4 rounded-full bg-yellow-500 border-4 border-gray-900 shadow-lg shadow-yellow-500/50 mb-2"></div>
                      
                      {/* Card compacto */}
                      <div className="w-full bg-gradient-to-br from-yellow-500/10 to-orange-600/10 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30 hover:border-yellow-500/60 transition-all shadow-lg relative">
                        {/* Botões de ação (aparecem no hover) */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                          {onEditAchievement && (
                            <button
                              onClick={() => onEditAchievement(achievement)}
                              className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                              title="Editar título"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {onDeleteAchievement && (
                            <button
                              onClick={() => handleConfirmDeleteAchievement(achievement)}
                              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                              title="Excluir título"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                          </div>
                          <h4 className="font-bold text-white text-xs leading-tight">
                            {achievement.championship}
                          </h4>
                        </div>
                        
                        {achievement.placement && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-lg">{renderPlacementIcon(achievement.placement)}</span>
                            <span className="text-yellow-300 font-semibold text-xs">
                              {achievement.placement}
                            </span>
                          </div>
                        )}
                        
                        {achievement.award && (
                          <div className="text-purple-300 font-semibold text-xs mb-1">
                            ⭐ {achievement.award}
                          </div>
                        )}

                        {formatAchievementDetails(achievement) && (
                          <div className="text-gray-300 text-[11px] leading-snug mb-1">
                            {formatAchievementDetails(achievement)}
                          </div>
                        )}
                        
                        <div className="mt-2 pt-2 border-t border-yellow-500/20">
                          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
                            achievement.type === 'Coletivo'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {achievement.type === 'Coletivo' ? '🏆' : '⭐'}
                            <span className="text-xs">{achievement.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
        
        {/* Dica de scroll */}
        <div className="text-center mt-4 text-gray-500 text-xs">
          ← Arraste para ver toda a linha do tempo (mais recente à esquerda) →
        </div>
      </div>
      
      {/* Estatísticas finais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20 text-center">
          <div className="text-3xl font-bold text-blue-400">{experiences.length}</div>
          <div className="text-gray-400 text-sm mt-1">Clubes</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/20 text-center">
          <div className="text-3xl font-bold text-yellow-400">{achievements.length}</div>
          <div className="text-gray-400 text-sm mt-1">Conquistas</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20 text-center">
          <div className="text-3xl font-bold text-green-400">
            {(() => {
              const yearsSet = new Set<number>();
              experiences.forEach((exp: CareerExperience) => {
                const endYear = exp.current ? new Date().getFullYear() : (exp.endYear || exp.startYear);
                for (let year = exp.startYear; year <= endYear; year++) {
                  yearsSet.add(year);
                }
              });
              return yearsSet.size;
            })()}
          </div>
          <div className="text-gray-400 text-sm mt-1">Anos de Carreira</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-4 border border-purple-500/20 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {achievements.filter(a => a.placement === '1º Lugar' || a.award).length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Títulos/Prêmios</div>
        </div>
      </div>
    </div>
  );
}
