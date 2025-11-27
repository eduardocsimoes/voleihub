import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Building2, Trophy, Calendar, MapPin } from 'lucide-react';
import type { CareerExperience, Achievement } from '../firebase/firestore';

interface TimelineCarreiraProps {
  experiences: CareerExperience[];
  achievements: Achievement[];
  onUpdate: (experiences: CareerExperience[], achievements: Achievement[]) => void;
  editMode?: boolean;
  onAddExperience?: () => void;
  onAddAchievement?: () => void;
  onEditExperience?: (experience: CareerExperience) => void;
  onDeleteExperience?: (id: string) => void;
  onEditAchievement?: (achievement: Achievement) => void;
  onDeleteAchievement?: (id: string) => void;
}

export default function TimelineCarreira({
  experiences,
  achievements,
  onUpdate,
  editMode = false,
  onAddExperience,
  onAddAchievement,
  onEditExperience,
  onDeleteExperience,
  onEditAchievement,
  onDeleteAchievement
}: TimelineCarreiraProps) {
  const [expandedClubs, setExpandedClubs] = useState<Set<string>>(new Set());

  const toggleClub = (clubId: string) => {
    const newExpanded = new Set(expandedClubs);
    if (newExpanded.has(clubId)) {
      newExpanded.delete(clubId);
    } else {
      newExpanded.add(clubId);
    }
    setExpandedClubs(newExpanded);
  };

  const getTitulosDoClube = (clubName: string) => {
    return achievements.filter(
      (achievement) => achievement.club.toLowerCase() === clubName.toLowerCase()
    );
  };

  const getPlacementIcon = (placement?: string) => {
    switch (placement) {
      case '1º Lugar': return '🥇';
      case '2º Lugar': return '🥈';
      case '3º Lugar': return '🥉';
      default: return '🏆';
    }
  };

  const getAwardIcon = (award?: string) => {
    if (award?.includes('MVP')) return '👑';
    if (award?.includes('Melhor')) return '🎯';
    if (award?.includes('Sacador')) return '⚡';
    if (award?.includes('Bloqueador')) return '🧱';
    if (award?.includes('Destaque')) return '⭐';
    if (award?.includes('Revelação')) return '🌟';
    return '🏅';
  };

  const sortedExperiences = [...experiences].sort((a, b) => {
    if (a.current) return -1;
    if (b.current) return 1;
    const endA = a.endYear || new Date().getFullYear();
    const endB = b.endYear || new Date().getFullYear();
    return endB - endA;
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Trajetória Profissional</h2>
          <p className="text-gray-400 text-sm">Clubes, títulos e conquistas</p>
        </div>
        {editMode && (
          <div className="flex gap-3">
            {onAddExperience && (
              <button
                onClick={onAddExperience}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-4 h-4" />
                Adicionar Clube
              </button>
            )}
            {onAddAchievement && (
              <button
                onClick={onAddAchievement}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-yellow-500/30"
              >
                <Plus className="w-4 h-4" />
                Adicionar Título
              </button>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      {sortedExperiences.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-400 mb-4">Nenhum clube cadastrado ainda</p>
          {editMode && onAddExperience && (
            <button
              onClick={onAddExperience}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Adicionar Primeiro Clube
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedExperiences.map((exp, index) => {
            const titulos = getTitulosDoClube(exp.clubName);
            const isExpanded = expandedClubs.has(exp.id);
            const isLast = index === sortedExperiences.length - 1;

            return (
              <div key={exp.id} className="relative">
                {/* Linha vertical da timeline */}
                {!isLast && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/50 to-transparent" />
                )}

                {/* Card do Clube */}
                <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all overflow-hidden group">
                  {/* Badge "Atual" */}
                  {exp.current && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30 animate-pulse">
                      ● ATUAL
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Ícone do clube */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>

                      {/* Informações do clube */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{exp.clubName}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 text-orange-400 font-semibold">
                                <MapPin className="w-4 h-4" />
                                {exp.position}
                              </span>
                              <span className="flex items-center gap-1 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {exp.startYear} - {exp.current ? 'Atual' : exp.endYear || 'Atual'}
                              </span>
                              <span className="text-gray-500">
                                ({exp.current 
                                  ? new Date().getFullYear() - exp.startYear 
                                  : (exp.endYear || new Date().getFullYear()) - exp.startYear
                                }{' '}
                                {((exp.current ? new Date().getFullYear() - exp.startYear : (exp.endYear || new Date().getFullYear()) - exp.startYear) === 1) ? 'ano' : 'anos'})
                              </span>
                            </div>
                          </div>

                          {/* Botões de ação */}
                          {editMode && (onEditExperience || onDeleteExperience) && (
                            <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              {onEditExperience && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditExperience(exp);
                                  }}
                                  className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                  title="Editar clube"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {onDeleteExperience && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Excluir o clube "${exp.clubName}" e todos os seus títulos?`)) {
                                      onDeleteExperience(exp.id);
                                    }
                                  }}
                                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                  title="Excluir clube"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {exp.description && (
                          <p className="text-gray-400 text-sm mt-2 leading-relaxed">{exp.description}</p>
                        )}

                        {/* Títulos */}
                        {titulos.length > 0 && (
                          <div className="mt-4">
                            <button
                              onClick={() => toggleClub(exp.id)}
                              className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                            >
                              <Trophy className="w-4 h-4" />
                              {titulos.length} {titulos.length === 1 ? 'Título' : 'Títulos'}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-4 space-y-2">
                                {titulos.map((titulo) => (
                                  <div
                                    key={titulo.id}
                                    className="flex items-start justify-between gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-yellow-500/30 transition-all group/titulo"
                                  >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                      <span className="text-2xl flex-shrink-0">
                                        {titulo.type === 'Coletivo' 
                                          ? getPlacementIcon(titulo.placement)
                                          : getAwardIcon(titulo.award)
                                        }
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">{titulo.championship}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <span className="text-xs text-gray-400">{titulo.year}</span>
                                          {titulo.type === 'Coletivo' && titulo.placement && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                                              {titulo.placement}
                                            </span>
                                          )}
                                          {titulo.type === 'Individual' && titulo.award && (
                                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                                              {titulo.award}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Botões de ação do título */}
                                    {editMode && (onEditAchievement || onDeleteAchievement) && (
                                      <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover/titulo:opacity-100 transition-opacity flex-shrink-0">
                                        {onEditAchievement && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onEditAchievement(titulo);
                                            }}
                                            className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                                            title="Editar título"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {onDeleteAchievement && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm(`Excluir o título "${titulo.championship}"?`)) {
                                                onDeleteAchievement(titulo.id);
                                              }
                                            }}
                                            className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                            title="Excluir título"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}