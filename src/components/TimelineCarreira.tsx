import { useState } from 'react';
import { Building2, Trophy, Star, MapPin, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import type { CareerExperience, Achievement } from '../firebase/firestore';

interface TimelineCarreiraProps {
  experiences: CareerExperience[];
  achievements: Achievement[];
  onUpdate: (experiences: CareerExperience[], achievements: Achievement[]) => void;
  editMode?: boolean;
  onAddExperience?: () => void;
  onAddAchievement?: () => void;
}

export default function TimelineCarreira({
  experiences = [],
  achievements = [],
  onUpdate,
  editMode = false,
  onAddExperience,
  onAddAchievement
}: TimelineCarreiraProps) {
  const [expandedClubs, setExpandedClubs] = useState<Set<string>>(new Set());

  const safeExperiences = Array.isArray(experiences) ? experiences : [];
  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  const normalize = (str: string): string => {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  };

  const toggleClub = (clubId: string) => {
    setExpandedClubs(prev => {
      const newSet = new Set(prev);
      newSet.has(clubId) ? newSet.delete(clubId) : newSet.add(clubId);
      return newSet;
    });
  };

  const sortedExperiences = [...safeExperiences].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const aEnd = a.current ? 9999 : (a.endYear || a.startYear);
    const bEnd = b.current ? 9999 : (b.endYear || b.startYear);
    return bEnd - aEnd;
  });

  const getTitulos = (clubName: string, startYear: number, endYear?: number) => {
    const normClub = normalize(clubName);
    const maxYear = endYear || new Date().getFullYear();
    
    return safeAchievements.filter(ach => {
      if (!ach?.club || !ach?.year || !ach?.championship) return false;
      const normAchClub = normalize(ach.club);
      const hasMatch = normClub.includes(normAchClub) || normAchClub.includes(normClub);
      const inPeriod = ach.year >= startYear && ach.year <= maxYear;
      return hasMatch && inPeriod;
    }).sort((a, b) => b.year !== a.year ? b.year - a.year : (a.championship || '').localeCompare(b.championship || ''));
  };

  const getIcon = (placement?: string, award?: string, type?: string) => {
    if (type === 'Individual') return award === 'MVP' ? '👑' : award?.includes('Melhor') ? '🎯' : award === 'Revelação' ? '🌟' : '⭐';
    return placement === '1º Lugar' ? '🥇' : placement === '2º Lugar' ? '🥈' : placement === '3º Lugar' ? '🥉' : '🏆';
  };

  const getColor = (placement?: string, type?: string) => {
    if (type === 'Individual') return 'text-purple-400';
    return placement === '1º Lugar' ? 'text-yellow-500' : placement === '2º Lugar' ? 'text-gray-400' : placement === '3º Lugar' ? 'text-orange-600' : 'text-gray-500';
  };

  const stats = {
    clubes: safeExperiences.length,
    titulos: safeAchievements.filter(a => a?.type === 'Coletivo').length,
    premios: safeAchievements.filter(a => a?.type === 'Individual').length,
    mvps: safeAchievements.filter(a => a?.type === 'Individual' && a?.award === 'MVP').length
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-orange-500" />
          Carreira
        </h3>
        {editMode && (
          <div className="flex gap-2">
            <button onClick={() => onAddExperience?.()} className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" />Clube
            </button>
            <button onClick={() => onAddAchievement?.()} className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" />Título
            </button>
          </div>
        )}
      </div>

      {sortedExperiences.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Adicione sua experiência em clubes e títulos conquistados</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-red-500 to-transparent"></div>
          <div className="space-y-6">
            {sortedExperiences.map((exp) => {
              const titulos = getTitulos(exp.clubName, exp.startYear, exp.endYear);
              const expanded = expandedClubs.has(exp.id);
              const hasTitulos = titulos.length > 0;

              return (
                <div key={exp.id} className="relative pl-12">
                  <div className="absolute left-2 top-2 w-4 h-4 rounded-full border-2 bg-blue-500 border-blue-400"></div>
                  <div className="bg-white/5 rounded-xl border border-white/10">
                    <div className={`p-4 ${hasTitulos ? 'cursor-pointer hover:bg-white/10' : ''}`} onClick={() => hasTitulos && toggleClub(exp.id)}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {hasTitulos && (expanded ? <ChevronDown className="w-5 h-5 text-orange-500" /> : <ChevronRight className="w-5 h-5 text-gray-400" />)}
                          <Building2 className="w-5 h-5 text-blue-400" />
                          <h4 className="text-white font-bold">{exp.clubName}</h4>
                          {hasTitulos && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs font-semibold">{titulos.length}</span>}
                        </div>
                        <span className="text-sm text-gray-400 ml-2">{exp.startYear} - {exp.current ? 'Atual' : exp.endYear || '?'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 ml-7" />
                        <span>{exp.position}</span>
                      </div>
                    </div>
                    {exp.description && <div className="px-4 pb-4"><p className="text-sm text-gray-300 ml-7">{exp.description}</p></div>}
                    {hasTitulos && expanded && (
                      <div className="px-4 pb-4">
                        <div className="pt-4 border-t border-white/10 ml-7 space-y-3">
                          {titulos.map((t) => (
                            <div key={t.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                              <div className="flex items-start gap-2">
                                <span className="text-xl">{getIcon(t.placement, t.award, t.type)}</span>
                                <div className="flex-1">
                                  <h5 className={`font-bold text-sm ${getColor(t.placement, t.type)}`}>
                                    {t.type === 'Coletivo' ? `${t.championship} (${t.placement})` : t.award}
                                  </h5>
                                  {t.type === 'Individual' && <p className="text-xs text-gray-400 mt-0.5">{t.championship}</p>}
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${t.type === 'Individual' ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                      {t.type === 'Individual' ? <Star className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                                      {t.type === 'Individual' ? 'Prêmio' : 'Título'}
                                    </span>
                                    <span className="text-xs text-gray-500">{t.year}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-black text-blue-500">{stats.clubes}</div><div className="text-xs text-gray-400">Clubes</div></div>
          <div><div className="text-2xl font-black text-yellow-500">{stats.titulos}</div><div className="text-xs text-gray-400">Títulos</div></div>
          <div><div className="text-2xl font-black text-purple-500">{stats.premios}</div><div className="text-xs text-gray-400">Prêmios</div></div>
          <div><div className="text-2xl font-black text-orange-500">{stats.mvps}</div><div className="text-xs text-gray-400">MVPs</div></div>
        </div>
      </div>
    </div>
  );
}