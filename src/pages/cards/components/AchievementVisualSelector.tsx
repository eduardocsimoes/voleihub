import React, { useMemo } from "react";
import {
  Trophy,
  Medal,
  Star,
  Volleyball,
} from "lucide-react";

type Props = {
  achievements: any[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/* =========================
   HELPERS
========================== */

/**
 * Identifica se a conquista é válida para o seletor
 * (pódio ou prêmio individual)
 */
function getAchievementType(a: any) {
  const text =
    `${a?.title || ""} ${a?.achievement || ""} ${a?.description || ""}`.toLowerCase();

  // 🥇🥈🥉 PODIUM
  if (text.includes("1º") || text.includes("1o") || text.includes("primeiro"))
    return { type: "gold", label: "1º Lugar" };

  if (text.includes("2º") || text.includes("2o") || text.includes("segundo"))
    return { type: "silver", label: "2º Lugar" };

  if (text.includes("3º") || text.includes("3o") || text.includes("terceiro"))
    return { type: "bronze", label: "3º Lugar" };

  // ⭐ MVP
  if (text.includes("mvp"))
    return { type: "mvp", label: "MVP" };

  // 🏐 Melhor posição
  if (text.includes("melhor") && text.includes("posição"))
    return { type: "position", label: "Melhor da Posição" };

  if (text.includes("melhor"))
    return { type: "position", label: "Melhor da Posição" };

  return null;
}

function getYear(a: any): number {
  return (
    Number(
      a?.year ||
        a?.season ||
        (a?.date ? new Date(a.date).getFullYear() : null)
    ) || 0
  );
}

/* =========================
   ICON MAP
========================== */
function IconByType(type: string) {
  switch (type) {
    case "gold":
      return <Medal className="text-yellow-400" size={22} />;
    case "silver":
      return <Medal className="text-gray-300" size={22} />;
    case "bronze":
      return <Medal className="text-amber-600" size={22} />;
    case "mvp":
      return <Star className="text-orange-400" size={22} />;
    case "position":
      return <Volleyball className="text-orange-400" size={22} />;
    default:
      return <Trophy size={22} />;
  }
}

/* =========================
   COMPONENT
========================== */
export default function AchievementVisualSelector({
  achievements,
  selectedIndex,
  onSelect,
}: Props) {
  /**
   * 🔥 Filtra apenas conquistas válidas
   * 🔥 Ordena do mais recente → mais antigo
   */
  const filteredAchievements = useMemo(() => {
    return achievements
      .map((a, originalIndex) => {
        const meta = getAchievementType(a);
        if (!meta) return null;

        return {
          data: a,
          meta,
          year: getYear(a),
          originalIndex,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.year - a.year);
  }, [achievements]);

  if (!filteredAchievements.length) {
    return (
      <div className="text-center text-sm text-gray-400 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        Nenhuma conquista de pódio ou prêmio individual encontrada.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        Destaques da atleta
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {filteredAchievements.map((item: any, visualIndex: number) => {
          const { meta, year, originalIndex } = item;
          const isActive = originalIndex === selectedIndex;

          return (
            <button
              key={visualIndex}
              onClick={() => onSelect(originalIndex)}
              className={`
                min-w-[180px] snap-start
                rounded-2xl p-4 text-center
                border transition-all
                ${
                  isActive
                    ? "bg-orange-500 border-orange-400 shadow-xl scale-[1.05]"
                    : "bg-gray-900 border-gray-800 hover:border-orange-400"
                }
              `}
            >
              {/* ICON */}
              <div className="flex justify-center mb-3">
                {IconByType(meta.type)}
              </div>

              {/* LABEL */}
              <div
                className={`
                  text-sm font-bold
                  ${
                    isActive
                      ? "text-white"
                      : "text-gray-200"
                  }
                `}
              >
                {meta.label}
              </div>

              {/* YEAR */}
              <div
                className={`
                  text-xs mt-1
                  ${
                    isActive
                      ? "text-white/80"
                      : "text-gray-500"
                  }
                `}
              >
                {year || "—"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
