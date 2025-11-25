import { useState } from 'react';
import { Building2, Trophy, Star, Calendar, MapPin, Plus, Edit2, Trash2, Award } from 'lucide-react';

interface CareerExperience {
  id: string;
  clubName: string;
  position: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  description?: string;
}

interface Achievement {
  id: string;
  title: string;
  year: number;
  championship: string;
  placement: 'Campeão' | 'Vice-Campeão' | '3º Lugar' | 'Participante';
  type: 'Coletivo' | 'Individual';
}

interface TimelineCarreiraProps {
  experiences: CareerExperience[];
  achievements: Achievement[];
  onUpdate: (experiences: CareerExperience[], achievements: Achievement[]) => void;
  editMode?: boolean;
  onAddExperience?: () => void;
  onAddAchievement?: () => void;
}

export default function TimelineCarreira({
  experiences,
  achievements,
  onUpdate,
  editMode = false,
  onAddExperience,
  onAddAchievement
}: TimelineCarreiraProps) {
  // Combinar experiências e conquistas em uma timeline unificada
  const timelineItems = [
    ...experiences.map(exp => ({ type: 'experience' as const, data: exp, year: exp.startYear })),
    ...achievements.map(ach => ({ type: 'achievement' as const, data: ach, year: ach.year }))
  ].sort((a, b) => b.year - a.year);

  const getPlacementColor = (placement: string) => {
    switch (placement) {
      case 'Campeão': return 'text-yellow-500';
      case 'Vice-Campeão': return 'text-gray-400';
      case '3º Lugar': return 'text-orange-600';
      default: return 'text-gray-500';
    }
  };

  const getPlacementIcon = (placement: string) => {
    switch (placement) {
      case 'Campeão': return '🥇';
      case 'Vice-Campeão': return '🥈';
      case '3º Lugar': return '🥉';
      default: return '🏆';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-orange-500" />
          Carreira
        </h3>
        {editMode && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log('🔵 [TIMELINE] Botão Clube clicado!');
                console.log('🔵 [TIMELINE] onAddExperience existe?', !!onAddExperience);
                onAddExperience?.();
              }}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Clube
            </button>
            <button
              onClick={() => {
                console.log('🟡 [TIMELINE] Botão Título clicado!');
                console.log('🟡 [TIMELINE] onAddAchievement existe?', !!onAddAchievement);
                onAddAchievement?.();
              }}
              className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Título
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      {timelineItems.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Adicione sua experiência em clubes e títulos conquistados</p>
        </div>
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-red-500 to-transparent"></div>

          {/* Items */}
          <div className="space-y-6">
            {timelineItems.map((item, index) => (
              <div key={`${item.type}-${item.year}-${index}`} className="relative pl-12">
                {/* Ponto na linha */}
                <div className={`absolute left-2 top-2 w-4 h-4 rounded-full border-2 ${
                  item.type === 'experience' 
                    ? 'bg-blue-500 border-blue-400' 
                    : 'bg-yellow-500 border-yellow-400'
                }`}></div>

                {/* Conteúdo */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
                  {item.type === 'experience' ? (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-400" />
                          <h4 className="text-white font-bold">{item.data.clubName}</h4>
                        </div>
                        <span className="text-sm text-gray-400">
                          {item.data.startYear} - {item.data.current ? 'Atual' : item.data.endYear || '?'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{item.data.position}</span>
                      </div>
                      {item.data.description && (
                        <p className="text-sm text-gray-300 mt-2">{item.data.description}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getPlacementIcon(item.data.placement)}</span>
                          <div>
                            <h4 className={`font-bold ${getPlacementColor(item.data.placement)}`}>
                              {item.data.title}
                            </h4>
                            <p className="text-sm text-gray-400">{item.data.championship}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{item.data.year}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {item.data.type === 'Individual' ? (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Prêmio Individual
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Título Coletivo
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats resumo */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-blue-500">
              {experiences.length}
            </div>
            <div className="text-xs text-gray-400">Clubes</div>
          </div>
          <div>
            <div className="text-2xl font-black text-yellow-500">
              {achievements.filter(a => a.type === 'Coletivo').length}
            </div>
            <div className="text-xs text-gray-400">Títulos</div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-500">
              {achievements.filter(a => a.type === 'Individual').length}
            </div>
            <div className="text-xs text-gray-400">Prêmios</div>
          </div>
        </div>
      </div>
    </div>
  );
}