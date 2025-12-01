// src/components/BadgesSection.tsx
import React from 'react';
import { AtletaProfile } from '../firebase/firestore';
import { calculateAthleteGamification } from '../gamification/gamification';
import {
  Trophy,
  Medal,
  Award,
  Target,
  Flag,
  Star,
  Lock,
} from 'lucide-react';

type BadgesSectionProps = {
  atletaProfile: AtletaProfile | null;
};

// =====================================================
// Helpers básicos a partir do perfil
// =====================================================
function getAnosCarreira(atleta: AtletaProfile | null): number {
  if (!atleta?.experiences || atleta.experiences.length === 0) return 0;
  const sorted = [...atleta.experiences].sort(
    (a, b) => a.startYear - b.startYear,
  );
  const primeiroAno = sorted[0].startYear;
  const anoAtual = new Date().getFullYear();
  return Math.max(anoAtual - primeiroAno, 0);
}

function getTotais(atleta: AtletaProfile | null) {
  const achievements = atleta?.achievements || [];

  const totalTitulosOuro = achievements.filter(
    (a) => a.placement === '1º Lugar',
  ).length;

  const totalMedalhasPodio = achievements.filter(
    (a) =>
      a.placement === '1º Lugar' ||
      a.placement === '2º Lugar' ||
      a.placement === '3º Lugar',
  ).length;

  const totalParticipacoes = achievements.length;
  const totalClubes = atleta?.experiences?.length || 0;

  const temEstadual = achievements.some((a) =>
    a.championship.toLowerCase().includes('estadual'),
  );
  const temTituloEstadual = achievements.some(
    (a) =>
      a.championship.toLowerCase().includes('estadual') &&
      a.placement === '1º Lugar',
  );
  const temNacional = achievements.some((a) =>
    a.championship.toLowerCase().includes('brasileiro'),
  );
  const temCBS = achievements.some((a) =>
    a.championship.toLowerCase().includes('cbs'),
  );
  const temTaçaParana = achievements.some((a) =>
    a.championship.toLowerCase().includes('taça paraná'),
  );

  const temPremioIndividual = achievements.some(
    (a) => a.type === 'Individual' && a.award,
  );

  return {
    totalTitulosOuro,
    totalMedalhasPodio,
    totalParticipacoes,
    totalClubes,
    temEstadual,
    temTituloEstadual,
    temNacional,
    temCBS,
    temTaçaParana,
    temPremioIndividual,
  };
}

// =====================================================
// Definição das conquistas
// =====================================================

type BadgeCategory = 'JORNADA' | 'TÍTULOS GERAIS' | 'ESTADUAL' | 'NACIONAL' | 'ESPECIAL';
type BadgeTier = 'Bronze' | 'Prata' | 'Ouro' | 'Lendário';

interface BadgeDefinition {
  id: string;
  titulo: string;
  descricao: string;
  categoria: BadgeCategory;
  tier: BadgeTier;
  // função que determina se está desbloqueada
  unlocked: (atleta: AtletaProfile | null) => boolean;
}

// Ícones por categoria (usei React.ReactNode pra não dar erro de JSX)
const CATEGORY_ICONS: Record<BadgeCategory, React.ReactNode> = {
  JORNADA: <Flag className="text-blue-400" size={24} />,
  'TÍTULOS GERAIS': <Trophy className="text-yellow-400" size={24} />,
  ESTADUAL: <Medal className="text-green-400" size={24} />,
  NACIONAL: <Trophy className="text-red-400" size={24} />,
  ESPECIAL: <Star className="text-purple-400" size={24} />,
};

// Lista de conquistas (primeira versão enxuta, mas já bem legal)
const BADGES: BadgeDefinition[] = [
  {
    id: 'primeiro-clube',
    titulo: 'Primeiro Clube',
    descricao: 'Você registrou sua primeira experiência em um clube.',
    categoria: 'JORNADA',
    tier: 'Bronze',
    unlocked: (atleta) => (atleta?.experiences?.length || 0) >= 1,
  },
  {
    id: 'rodado',
    titulo: 'Rodado',
    descricao: 'Jogou em pelo menos 3 clubes diferentes.',
    categoria: 'JORNADA',
    tier: 'Prata',
    unlocked: (atleta) => (atleta?.experiences?.length || 0) >= 3,
  },
  {
    id: 'veterano',
    titulo: 'Veterano',
    descricao: 'Mais de 5 anos de carreira registrados.',
    categoria: 'JORNADA',
    tier: 'Ouro',
    unlocked: (atleta) => getAnosCarreira(atleta) >= 5,
  },
  {
    id: 'primeira-medalha',
    titulo: 'Primeira Medalha',
    descricao: 'Conquistou a primeira medalha em qualquer competição.',
    categoria: 'TÍTULOS GERAIS',
    tier: 'Bronze',
    unlocked: (atleta) => getTotais(atleta).totalMedalhasPodio >= 1,
  },
  {
    id: 'campeao-vez',
    titulo: 'Campeão pela Primeira Vez',
    descricao: 'Conquistou o primeiro título (1º lugar) em qualquer competição.',
    categoria: 'TÍTULOS GERAIS',
    tier: 'Prata',
    unlocked: (atleta) => getTotais(atleta).totalTitulosOuro >= 1,
  },
  {
    id: 'colecionador-tacas',
    titulo: 'Colecionador de Taças',
    descricao: 'Acumulou 10 ou mais títulos (1º lugar).',
    categoria: 'TÍTULOS GERAIS',
    tier: 'Ouro',
    unlocked: (atleta) => getTotais(atleta).totalTitulosOuro >= 10,
  },
  {
    id: 'estadual-estreia',
    titulo: 'Estadual – Estreia',
    descricao: 'Participou de um Campeonato Estadual.',
    categoria: 'ESTADUAL',
    tier: 'Bronze',
    unlocked: (atleta) => getTotais(atleta).temEstadual,
  },
  {
    id: 'estadual-campeao',
    titulo: 'Campeão Estadual',
    descricao: 'Foi campeão em um Campeonato Estadual.',
    categoria: 'ESTADUAL',
    tier: 'Ouro',
    unlocked: (atleta) => getTotais(atleta).temTituloEstadual,
  },
  {
    id: 'nacional-estreia',
    titulo: 'Nacional – Estreia',
    descricao: 'Participou de um Campeonato Brasileiro ou CBS.',
    categoria: 'NACIONAL',
    tier: 'Prata',
    unlocked: (atleta) =>
      getTotais(atleta).temNacional ||
      getTotais(atleta).temCBS ||
      getTotais(atleta).temTaçaParana,
  },
  {
    id: 'nacional-campeao',
    titulo: 'Campeão Nacional',
    descricao: 'Conquistou um título de nível nacional (CBS/CBI/Taça Paraná).',
    categoria: 'NACIONAL',
    tier: 'Ouro',
    unlocked: (atleta) => {
      const achievements = atleta?.achievements || [];
      return achievements.some(
        (a) =>
          (a.championship.toLowerCase().includes('brasileiro') ||
            a.championship.toLowerCase().includes('cbs') ||
            a.championship.toLowerCase().includes('taça paraná')) &&
          a.placement === '1º Lugar',
      );
    },
  },
  {
    id: 'premio-individual',
    titulo: 'Destaque Individual',
    descricao: 'Recebeu um prêmio individual (MVP, melhor da posição, etc.).',
    categoria: 'ESPECIAL',
    tier: 'Ouro',
    unlocked: (atleta) => getTotais(atleta).temPremioIndividual,
  },
];

// =====================================================
// COMPONENTE
// =====================================================

const BadgesSection: React.FC<BadgesSectionProps> = ({ atletaProfile }) => {
  const gamification = calculateAthleteGamification(atletaProfile);
  const badgesWithStatus = BADGES.map((b) => ({
    ...b,
    isUnlocked: b.unlocked(atletaProfile),
  }));

  const totalBadges = badgesWithStatus.length;
  const unlockedCount = badgesWithStatus.filter((b) => b.isUnlocked).length;

  const categories: BadgeCategory[] = [
    'JORNADA',
    'TÍTULOS GERAIS',
    'ESTADUAL',
    'NACIONAL',
    'ESPECIAL',
  ];

  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-2xl border border-gray-700/60 p-6 lg:p-8 shadow-xl">
      {/* Título + resumo */}
      <header className="mb-6 lg:mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Conquistas e Badges
        </h1>
        <p className="text-gray-400 mt-2">
          Acompanhe sua evolução no vôlei desbloqueando conquistas ao longo da
          carreira.
        </p>
      </header>

      {/* Barra de progresso geral */}
      <div className="mb-8 rounded-2xl bg-gray-900/60 border border-gray-700/60 p-4 lg:p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Você desbloqueou{' '}
              <span className="font-semibold text-white">
                {unlockedCount} de {totalBadges}
              </span>{' '}
              conquistas
            </p>
            <p className="text-xs text-gray-500">
              XP atual:{' '}
              <span className="font-semibold text-yellow-400">
                {gamification.xp} XP
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-600/20 border border-purple-400/40 px-3 py-1 text-xs font-semibold text-purple-200">
              <Star size={14} />
              Nível {gamification.level} · {gamification.title}
            </span>
            <span className="text-xs text-gray-400">
              Próximo nível em{' '}
              <span className="font-semibold text-yellow-300">
                {Math.max(gamification.nextLevelXP - gamification.xp, 0)} XP
              </span>
            </span>
          </div>
        </div>

        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 transition-all"
            style={{ width: `${gamification.progress}%` }}
          />
        </div>
      </div>

      {/* Grid de badges por categoria */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catBadges = badgesWithStatus.filter(
            (b) => b.categoria === cat,
          );
          if (catBadges.length === 0) return null;

          const unlockedInCat = catBadges.filter((b) => b.isUnlocked).length;

          return (
            <section key={cat}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center">
                    {CATEGORY_ICONS[cat]}
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {cat}
                  </h2>
                </div>
                <span className="text-xs text-gray-400">
                  {unlockedInCat}/{catBadges.length} desbloqueadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catBadges.map((badge) => {
                  const tierColor =
                    badge.tier === 'Bronze'
                      ? 'bg-amber-700/40 text-amber-200 border-amber-500/40'
                      : badge.tier === 'Prata'
                      ? 'bg-slate-500/40 text-slate-100 border-slate-300/40'
                      : badge.tier === 'Ouro'
                      ? 'bg-yellow-500/30 text-yellow-100 border-yellow-400/50'
                      : 'bg-purple-600/40 text-purple-100 border-purple-400/50';

                  return (
                    <div
                      key={badge.id}
                      className={`relative rounded-2xl border p-4 lg:p-5 transition-all ${
                        badge.isUnlocked
                          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-emerald-400/60 shadow-lg shadow-emerald-500/20'
                          : 'bg-gray-900/60 border-gray-700/80 opacity-70'
                      }`}
                    >
                      {/* status de bloqueio */}
                      {!badge.isUnlocked && (
                        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Lock size={14} />
                            <span>Continue evoluindo para desbloquear</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center">
                          <Award className="text-yellow-400" size={20} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white">
                              {badge.titulo}
                            </h3>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border ${tierColor}`}
                            >
                              {badge.tier}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">
                            {badge.descricao}
                          </p>
                        </div>
                      </div>

                      {badge.isUnlocked && (
                        <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-300">
                          <div className="flex items-center gap-1">
                            <Target size={12} />
                            <span>Desbloqueado</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
};

export default BadgesSection;
