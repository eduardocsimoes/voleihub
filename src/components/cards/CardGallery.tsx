// CardGallery.tsx - Gallery Principal de Cards de Conquistas

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Filter,
  Search,
  TrendingUp,
  Calendar,
  Star,
  Lock,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CardData, CardFilter, CollectionStats } from "../../types/cardSystem";
import { filterCards, sortCards, getRarityColors, getRarityLabel } from "../../utils/cardUtils";
import LockedCard from "./LockedCard";
import RevealedCard from "./RevealedCard";

type Props = {
  cards: CardData[];
  stats: CollectionStats;
  onRevealCard: (cardId: string) => void;
  onViewCard: (cardId: string) => void;
  groupByYear?: boolean;
};

export default function CardGallery({
  cards,
  stats,
  onRevealCard,
  onViewCard,
  groupByYear = true,
}: Props) {
  const [filter, setFilter] = useState<CardFilter>({
    status: "all",
    rarity: "all",
    year: "all",
    searchTerm: "",
  });

  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "importance" | "rarity" | "year">("importance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Filtra e ordena cards
  const processedCards = useMemo(() => {
    let filtered = filterCards(cards, filter);
    filtered = sortCards(filtered, sortBy, sortOrder);
    return filtered;
  }, [cards, filter, sortBy, sortOrder]);

  // Agrupa por ano
  const cardsByYear = useMemo(() => {
    if (!groupByYear) return { all: processedCards };

    const grouped: Record<string, CardData[]> = {};
    processedCards.forEach((card) => {
      const year = card.achievement.year || 0;
      const yearKey = String(year);
      if (!grouped[yearKey]) {
        grouped[yearKey] = [];
      }
      grouped[yearKey].push(card);
    });

    return grouped;
  }, [processedCards, groupByYear]);

  const years = Object.keys(cardsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Anos disponíveis para filtro
  const availableYears = useMemo(() => {
    const yearsSet = new Set(cards.map((c) => c.achievement.year));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [cards]);

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const lockedCount = processedCards.filter((c) => !c.state.revealed).length;

  return (
    <div className="w-full space-y-6">
      {/* ========== HEADER COM ESTATÍSTICAS ========== */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Trophy className="text-amber-500" size={28} />
              Minha Coleção de Conquistas
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {stats.revealedCards}/{stats.totalCards} cards revelados •{" "}
              {stats.completionPercentage.toFixed(0)}% completo
            </p>
          </div>

          {/* Estatísticas rápidas */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-xl">👑</span>
              <span className="text-amber-400 font-bold">{stats.byRarity.legendary}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <span className="text-xl">💜</span>
              <span className="text-purple-400 font-bold">{stats.byRarity.epic}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <span className="text-xl">💙</span>
              <span className="text-blue-400 font-bold">{stats.byRarity.rare}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-500/10 border border-slate-500/30 rounded-lg">
              <span className="text-xl">⚪</span>
              <span className="text-slate-400 font-bold">{stats.byRarity.common}</span>
            </div>
          </div>
        </div>

        {/* Badge de cards novos */}
        {lockedCount > 0 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg w-fit">
            <Sparkles className="text-purple-400" size={20} />
            <span className="text-white font-bold">
              {lockedCount} {lockedCount === 1 ? "novo card" : "novos cards"} para revelar!
            </span>
          </div>
        )}
      </div>

      {/* ========== BARRA DE FERRAMENTAS ========== */}
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar conquista, competição, clube..."
              value={filter.searchTerm || ""}
              onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          {/* Botão de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${
                showFilters
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
              }
            `}
          >
            <Filter size={18} />
            <span>Filtros</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Painel de filtros expansível */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Status
              </label>
              <select
                value={filter.status || "all"}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">Todos</option>
                <option value="locked">Não Revelados</option>
                <option value="revealed">Revelados</option>
              </select>
            </div>

            {/* Raridade */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Raridade
              </label>
              <select
                value={filter.rarity || "all"}
                onChange={(e) => setFilter({ ...filter, rarity: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">Todas</option>
                <option value="legendary">👑 Lendário</option>
                <option value="epic">💜 Épico</option>
                <option value="rare">💙 Raro</option>
                <option value="common">⚪ Comum</option>
              </select>
            </div>

            {/* Ano */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Ano
              </label>
              <select
                value={filter.year === "all" ? "all" : filter.year}
                onChange={(e) =>
                  setFilter({ ...filter, year: e.target.value === "all" ? "all" : Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="all">Todos os anos</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="importance">⭐ Importância</option>
                <option value="newest">🆕 Mais Recentes</option>
                <option value="oldest">⏰ Mais Antigas</option>
                <option value="rarity">💎 Raridade</option>
                <option value="year">📅 Ano</option>
              </select>
            </div>

            {/* Ordem */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Ordem
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ========== GALLERY DE CARDS ========== */}
      {processedCards.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-700/50">
          <Trophy size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 text-lg font-medium">Nenhum card encontrado</p>
          <p className="text-slate-500 text-sm mt-2">Tente ajustar os filtros</p>
        </div>
      ) : groupByYear ? (
        // Agrupado por ano
        <div className="space-y-6">
          {years.map((year: number) => {
            const yearCards: CardData[] = cardsByYear[String(year)] || [];
            const isExpanded = expandedYears.has(year) || years.length === 1;
            const lockedInYear = yearCards.filter((c: CardData) => !c.state.revealed).length;

            return (
              <div
                key={year}
                className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden"
              >
                {/* Header do ano */}
                <button
                  onClick={() => toggleYear(year)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="text-purple-400" size={24} />
                    <span className="text-xl font-bold text-white">{year}</span>
                    <span className="text-sm text-slate-400">
                      ({yearCards.length} {yearCards.length === 1 ? "card" : "cards"})
                    </span>
                    {lockedInYear > 0 && (
                      <span className="px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs font-bold text-purple-400">
                        {lockedInYear} novo{lockedInYear > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>

                {/* Cards do ano */}
                {isExpanded && (
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {yearCards.map((card: CardData) =>
                      card.state.revealed ? (
                        <RevealedCard
                          key={card.achievement.id}
                          card={card}
                          onClick={() => onViewCard(card.achievement.id)}
                        />
                      ) : (
                        <LockedCard
                          key={card.achievement.id}
                          card={card}
                          onClick={() => onRevealCard(card.achievement.id)}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Grid simples sem agrupamento
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {processedCards.map((card: CardData) =>
            card.state.revealed ? (
              <RevealedCard
                key={card.achievement.id}
                card={card}
                onClick={() => onViewCard(card.achievement.id)}
              />
            ) : (
              <LockedCard
                key={card.achievement.id}
                card={card}
                onClick={() => onRevealCard(card.achievement.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}