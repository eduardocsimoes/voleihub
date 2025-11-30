import React from 'react';
import { Trophy, Target, Award, Star, TrendingUp, Users, Zap, Crown } from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export default function BadgesSection() {
  const badges: Badge[] = [
    {
      id: '1',
      title: 'Campeão Estadual',
      description: 'Conquistou um título estadual',
      icon: Trophy,
      color: 'from-yellow-500 to-yellow-600',
      unlocked: true,
    },
    {
      id: '2',
      title: '100+ Jogos',
      description: 'Completou 100 jogos profissionais',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      unlocked: true,
    },
    {
      id: '3',
      title: 'MVP',
      description: 'Foi eleito MVP de uma competição',
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: '4',
      title: 'Estrela em Ascensão',
      description: 'Jogou em 3 clubes diferentes',
      icon: Star,
      color: 'from-orange-500 to-orange-600',
      unlocked: true,
    },
    {
      id: '5',
      title: 'Profissional Veterano',
      description: '5+ anos de carreira',
      icon: Crown,
      color: 'from-red-500 to-red-600',
      unlocked: true,
    },
    {
      id: '6',
      title: 'Evolução Constante',
      description: 'Complete seu perfil 100%',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      unlocked: false,
      progress: 75,
      maxProgress: 100,
    },
    {
      id: '7',
      title: 'Seleção Nacional',
      description: 'Convocado para a seleção',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
    },
    {
      id: '8',
      title: 'Performance Elite',
      description: 'Média de 80% de aproveitamento',
      icon: Zap,
      color: 'from-pink-500 to-pink-600',
      unlocked: false,
      progress: 65,
      maxProgress: 80,
    },
  ];

  const unlockedBadges = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Conquistas e Badges</h2>
          <p className="text-gray-400 mt-1">
            Você desbloqueou {unlockedBadges} de {badges.length} conquistas
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-orange-500">{unlockedBadges}/{badges.length}</div>
          <div className="text-sm text-gray-400">Completo</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progresso Total</span>
          <span className="text-sm font-medium text-white">
            {Math.round((unlockedBadges / badges.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
            style={{ width: `${(unlockedBadges / badges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const isLocked = !badge.unlocked;

          return (
            <div
              key={badge.id}
              className={`
                relative bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border
                transition-all duration-300
                ${isLocked 
                  ? 'border-gray-700 opacity-50' 
                  : 'border-orange-500/20 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} 
                flex items-center justify-center mx-auto mb-4
                ${isLocked ? 'grayscale' : ''}
              `}>
                <Icon size={28} className="text-white" />
              </div>

              {/* Title */}
              <h3 className="text-white font-semibold text-center mb-2">
                {badge.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm text-center mb-3">
                {badge.description}
              </p>

              {/* Progress (if applicable) */}
              {!badge.unlocked && badge.progress !== undefined && badge.maxProgress !== undefined && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Progresso</span>
                    <span className="text-xs font-medium text-white">
                      {badge.progress}/{badge.maxProgress}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                      style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Lock Icon */}
              {isLocked && (
                <div className="absolute top-2 right-2 text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Unlocked Badge */}
              {!isLocked && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ✓
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}