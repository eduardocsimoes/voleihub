import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Star, Target, Award, Flag, Crown, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { AtletaProfile, Achievement, CareerExperience } from '../firebase/firestore';
import { getUserProfile } from '../firebase/firestore';

type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legend';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  group: string;
  tier: BadgeTier;
  icon: React.ComponentType<{ className?: string }>;
  checkUnlocked: (ctx: BadgeRuleContext) => boolean;
}

interface BadgeRuleContext {
  profile: AtletaProfile | null;
  experiences: CareerExperience[];
  achievements: Achievement[];
}

interface ComputedBadge extends BadgeDefinition {
  unlocked: boolean;
}

const normalize = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// helpers baseados em nome do campeonato / colocação / prêmio
const isPlacement = (achievement: Achievement, placements: string[]) => {
  const p = normalize(achievement.placement);
  return placements.some((pl) => p.includes(normalize(pl)));
};

const isCompetitionLike = (achievement: Achievement, keywords: string[]) => {
  const name = normalize(achievement.championship);
  return keywords.some((kw) => name.includes(normalize(kw)));
};

const hasAwardKeyword = (achievement: Achievement, keywords: string[]) => {
  const award = normalize(achievement.award);
  return (
    award.length > 0 &&
    keywords.some((kw) => award.includes(normalize(kw)))
  );
};

// === CATÁLOGO DE BADGES (gamification) ===
const badgeDefinitions: BadgeDefinition[] = [
  // JORNADA GERAL
  {
    id: 'primeiro-clube',
    name: 'Primeiro Clube',
    description: 'Você registrou sua primeira experiência em um clube.',
    group: 'Jornada',
    tier: 'bronze',
    icon: Flag,
    checkUnlocked: ({ experiences }) => experiences.length >= 1,
  },
  {
    id: 'tres-clubes',
    name: 'Rodado',
    description: 'Você jogou em pelo menos 3 clubes diferentes.',
    group: 'Jornada',
    tier: 'silver',
    icon: Target,
    checkUnlocked: ({ experiences }) => {
      const clubs = new Set(experiences.map((e) => normalize(e.clubName)));
      return clubs.size >= 3;
    },
  },
  {
    id: 'cinco-anos-carreira',
    name: 'Veterano',
    description: 'Mais de 5 anos de carreira registrados.',
    group: 'Jornada',
    tier: 'silver',
    icon: Star,
    checkUnlocked: ({ experiences }) => {
      if (experiences.length === 0) return false;
      const sorted = [...experiences].sort((a, b) => a.startYear - b.startYear);
      const firstYear = sorted[0].startYear;
      const currentYear = new Date().getFullYear();
      return currentYear - firstYear >= 5;
    },
  },
  {
    id: 'dez-anos-carreira',
    name: 'Lenda do Vôlei',
    description: '10 anos ou mais de carreira registrados.',
    group: 'Jornada',
    tier: 'legend',
    icon: Crown,
    checkUnlocked: ({ experiences }) => {
      if (experiences.length === 0) return false;
      const sorted = [...experiences].sort((a, b) => a.startYear - b.startYear);
      const firstYear = sorted[0].startYear;
      const currentYear = new Date().getFullYear();
      return currentYear - firstYear >= 10;
    },
  },

  // TÍTULOS GERAIS
  {
    id: 'primeira-medalha',
    name: 'Primeira Medalha',
    description: 'Conquistou a primeira medalha em qualquer competição.',
    group: 'Títulos Gerais',
    tier: 'bronze',
    icon: Trophy,
    checkUnlocked: ({ achievements }) =>
      achievements.some((a) =>
        isPlacement(a, ['1º lugar', '2º lugar', '3º lugar'])
      ),
  },
  {
    id: 'primeiro-titulo',
    name: 'Campeão pela Primeira Vez',
    description: 'Conquistou o primeiro título (1º lugar) em competição coletiva.',
    group: 'Títulos Gerais',
    tier: 'silver',
    icon: Trophy,
    checkUnlocked: ({ achievements }) =>
      achievements.some(
        (a) =>
          isPlacement(a, ['1º lugar']) &&
          normalize(a.type) === normalize('Coletivo')
      ),
  },
  {
    id: 'dez-titulos',
    name: 'Colecionador de Taças',
    description:
      'Acumulou 10 ou mais títulos (1º lugar) em competições coletivas.',
    group: 'Títulos Gerais',
    tier: 'gold',
    icon: Trophy,
    checkUnlocked: ({ achievements }) => {
      const titles = achievements.filter(
        (a) =>
          isPlacement(a, ['1º lugar']) &&
          normalize(a.type) === normalize('Coletivo')
      );
      return titles.length >= 10;
    },
  },

  // ESTADUAL
  {
    id: 'participacao-estadual',
    name: 'Estadual – Estreia',
    description: 'Participou de um Campeonato Estadual.',
    group: 'Estadual',
    tier: 'bronze',
    icon: Flag,
    checkUnlocked: ({ achievements }) =>
      achievements.some((a) =>
        isCompetitionLike(a, ['campeonato estadual', 'estadual'])
      ),
  },
  {
    id: 'titulo-estadual',
    name: 'Campeão Estadual',
    description: 'Conquistou um título em Campeonato Estadual (1º lugar).',
    group: 'Estadual',
    tier: 'gold',
    icon: Trophy,
    checkUnlocked: ({ achievements }) =>
      achievements.some(
        (a) =>
          isCompetitionLike(a, ['campeonato estadual', 'estadual']) &&
          isPlacement(a, ['1º lugar'])
      ),
  },
  {
    id: 'mvp-estadual',
    name: 'MVP Estadual',
    description: 'Recebeu prêmio individual em Campeonato Estadual.',
    group: 'Estadual',
    tier: 'gold',
    icon: Award,
    checkUnlocked: ({ achievements }) =>
      achievements.some(
        (a) =>
          isCompetitionLike(a, ['campeonato estadual', 'estadual']) &&
          hasAwardKeyword(a, ['mvp', 'melhor', 'destaque'])
      ),
  },

  // CBS – CAMPEONATO BRASILEIRO DE SELEÇÕES
  {
    id: 'participacao-cbs',
    name: 'Estreia no CBS',
    description:
      'Participou de qualquer edição do Campeonato Brasileiro de Seleções.',
    group: 'CBS',
    tier: 'silver',
    icon: Flag,
    checkUnlocked: ({ achievements }) =>
      achievements.some((a) =>
        isCompetitionLike(a, ['campeonato brasileiro de selecoes', 'cbs'])
      ),
  },
  {
    id: 'titulo-cbs',
    name: 'Campeão do CBS',
    description: 'Foi campeão (1º lugar) em qualquer divisão do CBS.',
    group: 'CBS',
    tier: 'gold',
    icon: Trophy,
    checkUnlocked: ({ achievements }) =>
      achievements.some(
        (a) =>
          isCompetitionLike(a, ['campeonato brasileiro de selecoes', 'cbs']) &&
          isPlacement(a, ['1º lugar'])
      ),
  },
  {
    id: 'mvp-cbs',
    name: 'MVP do CBS',
    description:
      'Recebeu prêmio de MVP ou Melhor da Posição no Campeonato Brasileiro de Seleções.',
    group: 'CBS',
    tier: 'legend',
    icon: Award,
    checkUnlocked: ({ achievements }) =>
      achievements.some(
        (a) =>
          isCompetitionLike(a, ['campeonato brasileiro de selecoes', 'cbs']) &&
          hasAwardKeyword(a, ['mvp', 'melhor', 'best', 'all star'])
      ),
  },

  // CBI – CAMPEONATO BRASILEIRO INTERCLUBES
  {
    id: 'participacao-cbi',
    name: 'Estreia no CBI',
    description: 'Participou do Campeonato Brasileiro Interclubes.',
    group: 'CBI',
    tier: 'silver',
    icon: Flag,
    checkUnlocked: ({ achievements }) =>
      achievements.some((a) =>
        isCompetitionLike(a, ['campeonato brasileiro interclubes', 'cbi'])
      ),
  },
  {
    id: 'titulo-cbi',
    name: 'Campeão do CBI',
    description: 'Foi campeão (1º lugar) em qualquer divisão do CBI.',
    group: 'CBI',
    tier: 'gold',
    icon: Trophy,
    checkUnlocked: ({ achievements }) =>
      achievements.some(
        (a) =>
          isCompetitionLike(a, ['campeonato brasileiro interclubes', 'cbi']) &&
          isPlacement(a, ['1º lugar'])
      ),
  },

  // GRANDES COPAS
  {
    id: 'taca-parana',
    name: 'Taça Paraná',
    description: 'Participou da Taça Paraná.',
    group: 'Grandes Copas',
    tier: 'silver',
    icon: Flag,
    checkUnlocked: ({ achievements }) =>
      achievements.some((a) =>
        isCompetitionLike(a, ['taca parana', 'taça paraná'])
      ),
  },
  {
    id: 'copa-minas',
    name: 'Copa Minas',
    description: 'Participou da Copa Minas.',
    group: 'Grandes Copas',
    tier: 'silver',
    icon: Flag,
    checkUnlocked: ({ achievements }) =>
      achievements.some((a) => isCompetitionLike(a, ['copa minas'])),
  },

  // SELEÇÕES
  {
    id: 'selecao-estadual',
    name: 'Convocado – Seleção Estadual',
    description: 'Registrou experiência em seleção estadual.',
    group: 'Seleções',
    tier: 'gold',
    icon: Star,
    checkUnlocked: ({ experiences }) =>
      experiences.some((e) =>
        normalize(e.clubName).includes(normalize('seleção'))
      ),
  },
  {
    id: 'selecao-brasileira-base',
    name: 'Seleção Brasileira de Base',
    description: 'Registrou experiência na Seleção Brasileira de base.',
    group: 'Seleções',
    tier: 'legend',
    icon: Crown,
    checkUnlocked: ({ experiences }) => {
      const name = experiences.map((e) => normalize(e.clubName)).join(' ');
      return (
        name.includes(normalize('seleção brasileira')) ||
        name.includes(normalize('selecao brasileira'))
      );
    },
  },
];

const tierColors: Record<
  BadgeTier,
  { ring: string; bg: string; label: string }
> = {
  bronze: {
    ring: 'ring-amber-700',
    bg: 'bg-gradient-to-br from-amber-900/40 via-amber-900/20 to-gray-900/60',
    label: 'text-amber-300',
  },
  silver: {
    ring: 'ring-slate-300',
    bg: 'bg-gradient-to-br from-slate-500/30 via-slate-700/30 to-gray-900/60',
    label: 'text-slate-100',
  },
  gold: {
    ring: 'ring-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-500/30 via-amber-500/30 to-gray-900/60',
    label: 'text-yellow-200',
  },
  legend: {
    ring: 'ring-purple-400',
    bg: 'bg-gradient-to-br from-purple-600/40 via-fuchsia-500/40 to-gray-900/60',
    label: 'text-purple-100',
  },
};

export default function BadgesSection() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const result = await getUserProfile(currentUser.uid);

        // versão mais comum: a função já retorna o próprio profile
        if ((result as any)?.experiences || (result as any)?.achievements) {
          setProfile(result as AtletaProfile);
        } else if ((result as any)?.success && (result as any)?.data) {
          // fallback caso você tenha alterado getUserProfile para retornar wrapper
          setProfile((result as any).data as AtletaProfile);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil do atleta para badges:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const computedBadges: ComputedBadge[] = useMemo(() => {
    const ctx: BadgeRuleContext = {
      profile,
      experiences: profile?.experiences || [],
      achievements: profile?.achievements || [],
    };

    return badgeDefinitions.map((def) => ({
      ...def,
      unlocked: def.checkUnlocked(ctx),
    }));
  }, [profile]);

  const totalBadges = badgeDefinitions.length;
  const unlockedCount = computedBadges.filter((b) => b.unlocked).length;
  const progressPercent =
    totalBadges === 0 ? 0 : Math.round((unlockedCount / totalBadges) * 100);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-300">Carregando conquistas...</div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          Conquistas e Badges
        </h1>
        <p className="text-gray-400">
          Acompanhe sua evolução no vôlei desbloqueando conquistas ao longo da
          carreira.
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="bg-gray-900/70 border border-gray-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">
              Você desbloqueou{' '}
              <span className="font-semibold text-white">
                {unlockedCount} de {totalBadges}
              </span>{' '}
              conquistas
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Progresso Total
            </p>
            <p className="text-xl font-bold text-orange-400">
              {progressPercent}%
            </p>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-amber-300 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid de badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {computedBadges.map((badge) => {
          const Icon = badge.icon;
          const palette = tierColors[badge.tier];

          return (
            <div
              key={badge.id}
              className={`
                relative rounded-2xl border border-white/5 p-4 sm:p-5
                ${palette.bg} ${
                badge.unlocked ? 'opacity-100' : 'opacity-60'
              }
                transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60
              `}
            >
              {/* Status / tier */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ring-2 ${palette.ring} bg-black/40
                    `}
                  >
                    {badge.unlocked ? (
                      <Icon className="w-5 h-5 text-yellow-300" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {badge.group}
                    </p>
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {badge.name}
                    </h3>
                  </div>
                </div>

                <span
                  className={`
                    px-2.5 py-1 rounded-full text-[10px] font-semibold
                    border border-white/10 ${palette.label} bg-black/30
                  `}
                >
                  {badge.tier === 'bronze'
                    ? 'Bronze'
                    : badge.tier === 'silver'
                    ? 'Prata'
                    : badge.tier === 'gold'
                    ? 'Ouro'
                    : 'Lendário'}
                </span>
              </div>

              <p className="text-xs text-gray-300 mb-4">{badge.description}</p>

              {/* overlay de bloqueado */}
              {!badge.unlocked && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <div className="text-center px-4">
                    <Lock className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-[11px] text-gray-300">
                      Continue avançando na carreira para desbloquear esta
                      conquista.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
