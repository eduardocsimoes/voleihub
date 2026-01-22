// ============================================
// CollectionStatsPanel.tsx
// ============================================

import React from "react";
import { Trophy, Star, TrendingUp, Flame, Target } from "lucide-react";
import { CollectionStats } from "../../types/cardSystem";
import { getRarityColors } from "../../utils/cardUtils";

type StatsProps = {
  stats: CollectionStats;
};

export function CollectionStatsPanel({ stats }: StatsProps) {
  const progressPercentage = stats.completionPercentage;
  const hasStreak = stats.streakDays > 0;

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Trophy className="text-amber-500" size={24} />
          Estatísticas da Coleção
        </h3>
      </div>

      {/* Barra de progresso geral */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-300">Progresso Geral</span>
          <span className="text-sm font-bold text-white">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-700/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-400">
          <span>{stats.revealedCards} revelados</span>
          <span>{stats.lockedCards} para revelar</span>
        </div>
      </div>

      {/* Grid de estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total de cards */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-purple-400" size={18} />
            <span className="text-xs font-semibold text-slate-400 uppercase">Total</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalCards}</div>
          <div className="text-xs text-slate-400 mt-1">cards na coleção</div>
        </div>

        {/* Streak */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Flame className={hasStreak ? "text-orange-500" : "text-slate-600"} size={18} />
            <span className="text-xs font-semibold text-slate-400 uppercase">Sequência</span>
          </div>
          <div className={`text-3xl font-black ${hasStreak ? "text-orange-500" : "text-slate-600"}`}>
            {stats.streakDays}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.streakDays === 1 ? "dia" : "dias"} consecutivos
          </div>
        </div>
      </div>

      {/* Raridades */}
      <div>
        <div className="text-sm font-semibold text-slate-300 mb-3">Por Raridade</div>
        <div className="space-y-2">
          {/* Lendário */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <span className="text-sm text-slate-300">Lendário</span>
            </div>
            <span className="text-sm font-bold text-amber-400">{stats.byRarity.legendary}</span>
          </div>

          {/* Épico */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💜</span>
              <span className="text-sm text-slate-300">Épico</span>
            </div>
            <span className="text-sm font-bold text-purple-400">{stats.byRarity.epic}</span>
          </div>

          {/* Raro */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💙</span>
              <span className="text-sm text-slate-300">Raro</span>
            </div>
            <span className="text-sm font-bold text-blue-400">{stats.byRarity.rare}</span>
          </div>

          {/* Comum */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚪</span>
              <span className="text-sm text-slate-300">Comum</span>
            </div>
            <span className="text-sm font-bold text-slate-400">{stats.byRarity.common}</span>
          </div>
        </div>
      </div>

      {/* Por ano (top 5) */}
      {Object.keys(stats.byYear).length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-300 mb-3">Por Ano (Top 5)</div>
          <div className="space-y-2">
            {Object.entries(stats.byYear)
              .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
              .slice(0, 5)
              .map(([year, count]) => (
                <div key={year} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{year}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(stats.byYear))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// NotificationBanner.tsx
// ============================================

import { Bell, X, Sparkles as SparklesIcon } from "lucide-react";
import { NotificationData } from "../../types/cardSystem";

type NotificationProps = {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
  onClickNotification: (notification: NotificationData) => void;
};

export function NotificationBanner({ notifications, onDismiss, onClickNotification }: NotificationProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className="bg-slate-900 border-2 border-purple-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-sm animate-slideInRight cursor-pointer hover:border-purple-500 transition-all"
          onClick={() => onClickNotification(notification)}
        >
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animate-slideInRight {
              animation: slideInRight 0.3s ease-out;
            }
          `}</style>

          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
              }}
            >
              {notification.type === "new_card" ? (
                <SparklesIcon size={20} className="text-white" />
              ) : (
                <Trophy size={20} className="text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm mb-1">{notification.title}</h4>
              <p className="text-slate-300 text-xs line-clamp-2">{notification.message}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MetaAchievementsList.tsx
// ============================================

import { MetaAchievement } from "../../types/cardSystem";

type MetaProps = {
  metaAchievements: MetaAchievement[];
};

export function MetaAchievementsList({ metaAchievements }: MetaProps) {
  const unlocked = metaAchievements.filter((m) => m.unlocked);
  const locked = metaAchievements.filter((m) => !m.unlocked);

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Star className="text-yellow-500" size={24} />
          Conquistas Especiais
        </h3>
        <span className="text-sm font-bold text-slate-400">
          {unlocked.length}/{metaAchievements.length}
        </span>
      </div>

      {/* Desbloqueadas */}
      {unlocked.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
            <TrendingUp size={16} />
            Desbloqueadas
          </h4>
          <div className="space-y-2">
            {unlocked.map((meta) => {
              const colors = getRarityColors(meta.rarity);
              return (
                <div
                  key={meta.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border-2"
                  style={{ borderColor: colors.primary + "40" }}
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-white font-bold text-sm">{meta.title}</h5>
                      <span className={`text-xs ${colors.text} font-bold uppercase`}>
                        {meta.rarity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{meta.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bloqueadas */}
      {locked.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-3">Bloqueadas</h4>
          <div className="space-y-2">
            {locked.slice(0, 5).map((meta) => (
              <div
                key={meta.id}
                className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 opacity-50"
              >
                <span className="text-2xl grayscale">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <h5 className="text-slate-400 font-bold text-sm">{meta.title}</h5>
                  <p className="text-slate-500 text-xs mt-0.5">{meta.description}</p>
                </div>
              </div>
            ))}
            {locked.length > 5 && (
              <div className="text-center text-slate-500 text-xs py-2">
                +{locked.length - 5} mais conquistas bloqueadas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}