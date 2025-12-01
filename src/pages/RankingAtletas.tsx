// src/pages/RankingAtletas.tsx
import React, { useEffect, useState } from 'react';
import { Trophy, Star, Search, Filter, ArrowUpRight, Medal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AtletaProfile } from '../firebase/firestore';
import { getUserProfile } from '../firebase/firestore';
import { calculateAthleteGamification } from '../gamification/gamification';

type RankingRow = {
  id: string;
  name: string;
  state: string;
  position: string;
  level: number;
  title: string;
  xp: number;
  club?: string;
  isCurrentUser?: boolean;
};

export default function RankingAtletas() {
  const { currentUser } = useAuth();
  const [atletaProfile, setAtletaProfile] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'todos' | 'meu-estado'>('todos');

  // =============================
  // 1. Carregar perfil atual
  // =============================
  useEffect(() => {
    const load = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(currentUser.uid);
        setAtletaProfile(profile);

        // Calcula XP / nível do atleta atual
        const gamification = calculateAthleteGamification(profile);

        // =============================
        // 2. Mock de ranking global
        //    (no futuro será vindo do backend)
        // =============================
        const mockRanking: RankingRow[] = [
          {
            id: '1',
            name: 'Ana Souza',
            state: 'SP',
            position: 'Levantadora',
            level: 8,
            title: 'Lenda do Vôlei',
            xp: 2800,
            club: 'Minas Tênis Clube',
          },
          {
            id: '2',
            name: 'Mariana Lima',
            state: 'MG',
            position: 'Ponteiro',
            level: 7,
            title: 'Talento Brasileiro',
            xp: 2350,
            club: 'Praia Clube',
          },
          {
            id: '3',
            name: 'Julia Ferreira',
            state: 'PR',
            position: 'Oposto',
            level: 7,
            title: 'Talento Brasileiro',
            xp: 2100,
            club: 'Curitiba Vôlei',
          },
          {
            id: '4',
            name: 'Beatriz Santos',
            state: 'RJ',
            position: 'Central',
            level: 6,
            title: 'Elite Nacional',
            xp: 1800,
            club: 'Flamengo',
          },
        ];

        // Insere/atualiza o atleta atual dentro do ranking mockado
        if (profile) {
          const currentRow: RankingRow = {
            id: profile.uid,
            name: profile.name,
            state: profile.state || 'UF',
            position: profile.position || 'Posição',
            level: gamification.level,
            title: gamification.title || 'Atleta',
            xp: gamification.xp,
            club: profile.experiences?.find((e) => e.current)?.clubName,
            isCurrentUser: true,
          };

          // Se já existir alguém com o mesmo nome, substitui / caso contrário adiciona
          const withoutMe = mockRanking.filter((r) => r.id !== currentRow.id);
          const merged = [currentRow, ...withoutMe]
            .sort((a, b) => b.xp - a.xp)
            .map((row, index) => ({
              ...row,
              id: String(index + 1),
            }));

          setRanking(merged);
        } else {
          setRanking(mockRanking);
        }
      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  const gamification = calculateAthleteGamification(atletaProfile);

  // =============================
  // Filtros simples (busca / estado)
  // =============================
  const filteredRanking = ranking.filter((row) => {
    const matchesSearch =
      search.trim().length === 0 ||
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.club?.toLowerCase().includes(search.toLowerCase());

    const matchesState =
      filterState === 'todos' ||
      (filterState === 'meu-estado' &&
        atletaProfile?.state &&
        row.state === atletaProfile.state);

    return matchesSearch && matchesState;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando ranking...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* HEADER SIMPLES */}
      <header className="border-b border-orange-500/20 bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Trophy className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ranking de Atletas</h1>
              <p className="text-gray-400 text-sm">
                Veja como você se posiciona entre os atletas da VôleiHub.
              </p>
            </div>
          </div>

          {atletaProfile && (
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-sm text-gray-400">Seu nível atual</span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/40">
                <Star size={16} className="text-purple-300" />
                <span className="text-sm font-semibold">
                  Nível {gamification.level} · {gamification.title}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* PROGRESSO DE NÍVEL */}
        <section className="bg-gray-900/70 border border-purple-500/30 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-sm">Progresso de Nível</p>
              <h2 className="text-lg font-semibold">
                XP atual: <span className="text-purple-300">{gamification.xp} XP</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                Próximo nível em{' '}
                <span className="text-purple-300">
                  {Math.max(gamification.nextLevelXP - gamification.xp, 0)} XP
                </span>
              </p>
              <p className="text-xs text-gray-500">
                (Nível {gamification.level} → {gamification.level + 1})
              </p>
            </div>
          </div>

          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 transition-all"
              style={{ width: `${gamification.progress}%` }}
            />
          </div>
        </section>

        {/* FILTROS */}
        <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar atleta ou clube..."
              className="w-full bg-gray-900/80 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterState('todos')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                filterState === 'todos'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Filter size={16} />
              Todos os estados
            </button>
            <button
              onClick={() => setFilterState('meu-estado')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                filterState === 'meu-estado'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Medal size={16} />
              Meu estado
            </button>
          </div>
        </section>

        {/* LISTA DE RANKING */}
        <section className="bg-gray-900/70 border border-gray-700/60 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              Ranking Geral de Atletas
            </h2>
            <span className="text-xs text-gray-400">
              {filteredRanking.length} atletas exibidos
            </span>
          </div>

          <div className="divide-y divide-gray-800">
            {filteredRanking.map((row) => (
              <div
                key={row.id}
                className={`px-5 py-3 flex items-center gap-4 text-sm ${
                  row.isCurrentUser
                    ? 'bg-gradient-to-r from-purple-900/40 via-purple-900/10 to-transparent'
                    : 'bg-transparent'
                }`}
              >
                <div className="w-8 text-center font-bold text-gray-400">
                  #{row.id}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold truncate ${
                        row.isCurrentUser ? 'text-white' : 'text-gray-100'
                      }`}
                    >
                      {row.name}
                    </span>
                    {row.isCurrentUser && (
                      <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/40 flex items-center gap-1">
                        <Star size={12} />
                        Você
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-2 mt-0.5">
                    <span>{row.position}</span>
                    <span>•</span>
                    <span>{row.state}</span>
                    {row.club && (
                      <>
                        <span>•</span>
                        <span>{row.club}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-40 flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">
                    Nível {row.level} · {row.title}
                  </span>
                  <div className="inline-flex items-center gap-1 text-xs text-yellow-300">
                    <Trophy size={14} />
                    <span>{row.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredRanking.length === 0 && (
              <div className="px-5 py-6 text-center text-gray-400 text-sm">
                Nenhum atleta encontrado para os filtros atuais.
              </div>
            )}
          </div>
        </section>

        {/* CHAMADA PARA AÇÃO */}
        <section className="bg-gradient-to-r from-orange-600/90 via-orange-500/90 to-pink-500/90 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-500/40">
          <div>
            <h2 className="text-xl font-bold mb-1">Quer subir no ranking?</h2>
            <p className="text-sm text-orange-50/90">
              Registre novas conquistas, títulos e prêmios individuais para ganhar mais
              XP e avançar de nível.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/10 hover:bg-black/20 text-sm font-semibold">
            Atualizar minha trajetória
            <ArrowUpRight size={16} />
          </button>
        </section>
      </main>
    </div>
  );
}
