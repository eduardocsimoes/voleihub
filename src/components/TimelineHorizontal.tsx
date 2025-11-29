import React from 'react';
import { Building2, Trophy, Calendar, MapPin, Award, Star } from 'lucide-react';
import type { CareerExperience, Achievement } from '../firebase/firestore';

interface TimelineHorizontalProps {
  experiences: CareerExperience[];
  achievements: Achievement[];
}

type TimelineEvent = {
  type: 'club' | 'achievement';
  year: number;
  data: CareerExperience | Achievement;
  order: number;
};

export default function TimelineHorizontal({ experiences, achievements }: TimelineHorizontalProps) {
  
  // Função para criar eventos da timeline
  const createTimelineEvents = (): { [year: number]: TimelineEvent[] } => {
    const eventsByYear: { [year: number]: TimelineEvent[] } = {};
    
    // Adicionar clubes
    experiences.forEach((exp, index) => {
      const year = exp.startYear;
      if (!eventsByYear[year]) {
        eventsByYear[year] = [];
      }
      
      eventsByYear[year].push({
        type: 'club',
        year,
        data: exp,
        order: index * 1000 // Clubes têm prioridade (multiplicador grande)
      });
    });
    
    // Adicionar títulos APÓS o clube correspondente
    achievements.forEach((ach) => {
      const year = ach.year;
      if (!eventsByYear[year]) {
        eventsByYear[year] = [];
      }
      
      // Encontrar o clube correspondente no mesmo ano
      const clubIndex = eventsByYear[year].findIndex(
        event => event.type === 'club' && 
        (event.data as CareerExperience).clubName === ach.club
      );
      
      // Order: se encontrou clube, coloca logo após (clubIndex * 1000 + 1, +2, etc)
      // Se não encontrou, coloca no final do ano
      const baseOrder = clubIndex >= 0 
        ? eventsByYear[year][clubIndex].order 
        : eventsByYear[year].length * 1000;
      
      const achievementOrder = baseOrder + eventsByYear[year].filter(
        e => e.type === 'achievement' && e.order > baseOrder && e.order < baseOrder + 1000
      ).length + 1;
      
      eventsByYear[year].push({
        type: 'achievement',
        year,
        data: ach,
        order: achievementOrder
      });
    });
    
    // Ordenar eventos dentro de cada ano
    Object.keys(eventsByYear).forEach(year => {
      eventsByYear[parseInt(year)].sort((a, b) => a.order - b.order);
    });
    
    return eventsByYear;
  };
  
  const timelineEvents = createTimelineEvents();
  const years = Object.keys(timelineEvents).map(Number).sort((a, b) => a - b);
  
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-orange-500" />
          Linha do Tempo da Carreira
        </h2>
        <p className="text-gray-400">Sua trajetória profissional em ordem cronológica</p>
      </div>
      
      {years.map((year, yearIndex) => (
        <div key={year} className="relative">
          {/* Ano como Divisor */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg shadow-orange-500/30">
              {year}
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
          </div>
          
          {/* Timeline Horizontal */}
          <div className="relative">
            {/* Linha horizontal */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/30 via-orange-400/30 to-orange-500/30 rounded-full hidden md:block"></div>
            
            {/* Eventos */}
            <div className="relative flex flex-col md:flex-row gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent">
              {timelineEvents[year].map((event, index) => (
                <div
                  key={`${event.type}-${index}`}
                  className="relative flex-shrink-0 w-full md:w-64"
                >
                  {/* Ponto na linha (apenas desktop) */}
                  <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                    <div className={`w-5 h-5 rounded-full border-4 border-gray-900 shadow-lg ${
                      event.type === 'club' 
                        ? 'bg-blue-500 shadow-blue-500/50' 
                        : 'bg-yellow-500 shadow-yellow-500/50'
                    }`}></div>
                  </div>
                  
                  {/* Card do Evento */}
                  <div className="mt-12 md:mt-8">
                    {event.type === 'club' ? (
                      // Card de Clube
                      <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hover:border-blue-500/60 transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/20">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                            <Building2 className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-blue-300 transition-colors">
                              {(event.data as CareerExperience).clubName}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-3 h-3 text-orange-400 flex-shrink-0" />
                            <span className="truncate">{(event.data as CareerExperience).position}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-3 h-3 text-green-400 flex-shrink-0" />
                            <span>
                              {(event.data as CareerExperience).startYear}
                              {(event.data as CareerExperience).current ? (
                                <span className="text-green-400 font-semibold"> - Atual</span>
                              ) : (event.data as CareerExperience).endYear ? (
                                ` - ${(event.data as CareerExperience).endYear}`
                              ) : ''}
                            </span>
                          </div>
                        </div>
                        
                        {(event.data as CareerExperience).current && (
                          <div className="mt-3 pt-3 border-t border-blue-500/20">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-xs font-semibold">Clube Atual</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Card de Título
                      <div className="group bg-gradient-to-br from-yellow-500/10 to-orange-600/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/60 transition-all hover:scale-105 shadow-lg hover:shadow-yellow-500/20">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/30 transition-colors">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-yellow-300 transition-colors">
                              {(event.data as Achievement).championship}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {(event.data as Achievement).placement && (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {renderPlacementIcon((event.data as Achievement).placement)}
                              </span>
                              <span className="text-yellow-300 font-semibold text-sm">
                                {(event.data as Achievement).placement}
                              </span>
                            </div>
                          )}
                          
                          {(event.data as Achievement).award && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-purple-400 flex-shrink-0" />
                              <span className="text-purple-300 font-semibold text-sm truncate">
                                {(event.data as Achievement).award}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-gray-400 text-xs mt-2 pt-2 border-t border-yellow-500/20">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{(event.data as Achievement).year}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-yellow-500/20">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                            (event.data as Achievement).type === 'Coletivo'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {(event.data as Achievement).type === 'Coletivo' ? '🏆' : '⭐'}
                            <span>{(event.data as Achievement).type}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Separador entre anos (não no último) */}
          {yearIndex < years.length - 1 && (
            <div className="mt-8 mb-4 flex items-center gap-4 opacity-30">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            </div>
          )}
        </div>
      ))}
      
      {/* Estatísticas no final */}
      <div className="mt-12 pt-8 border-t border-gray-700/50">
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
            <div className="text-3xl font-bold text-green-400">{years.length}</div>
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
    </div>
  );
}