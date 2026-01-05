// src/pages/cards/components/AchievementVisualSelector.tsx
import React from "react";
import { Trophy } from "lucide-react";

type Props = {
  achievements: any[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

function getYear(a: any): number {
  return (
    Number(
      a?.year ??
        a?.season ??
        (a?.date ? new Date(a.date).getFullYear() : null)
    ) || 0
  );
}

export default function AchievementVisualSelector({
  achievements,
  selectedIndex,
  onSelect,
}: Props) {
  if (!achievements.length) {
    return (
      <div className="text-center text-sm text-gray-400 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        Nenhuma conquista cadastrada.
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        Selecione uma conquista
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {achievements.map((a, index) => {
          const isActive = index === selectedIndex;
          const year = getYear(a);

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`
                min-w-[200px] snap-start
                rounded-2xl p-4 text-center
                border transition-all
                ${
                  isActive
                    ? "bg-orange-500 border-orange-400 shadow-xl scale-[1.05]"
                    : "bg-gray-900 border-gray-800 hover:border-orange-400"
                }
              `}
            >
              <div className="flex justify-center mb-3">
                <Trophy
                  size={22}
                  className={isActive ? "text-white" : "text-gray-400"}
                />
              </div>

              <div
                className={`
                  text-sm font-bold
                  ${isActive ? "text-white" : "text-gray-200"}
                `}
              >
                {a.title || a.championship || "Conquista"}
              </div>

              <div
                className={`
                  text-xs mt-1
                  ${isActive ? "text-white/80" : "text-gray-500"}
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
