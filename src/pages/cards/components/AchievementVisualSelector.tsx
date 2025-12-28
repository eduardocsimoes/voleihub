import { Trophy, CheckCircle } from "lucide-react";

type Achievement = any;

type Props = {
  achievements: Achievement[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export default function AchievementVisualSelector({
  achievements,
  selectedIndex,
  onSelect,
}: Props) {
  if (!achievements.length) return null;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h3 className="text-sm text-gray-300 font-semibold mb-2">
        Selecione a conquista
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {achievements.map((a, idx) => {
          const title =
            a?.championship ||
            a?.title ||
            a?.name ||
            `Conquista ${idx + 1}`;

          const year =
            a?.year ||
            a?.season ||
            (a?.date
              ? new Date(a.date).getFullYear()
              : "—");

          const isActive = idx === selectedIndex;

          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`
                min-w-[220px] p-4 rounded-2xl text-left transition-all
                border relative
                ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-400 scale-[1.02]"
                    : "bg-gray-900 text-gray-300 border-gray-800 hover:border-orange-400"
                }
              `}
            >
              {/* Ícone */}
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={18} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {year}
                </span>
              </div>

              {/* Título */}
              <div className="font-bold leading-snug">
                {title}
              </div>

              {/* Indicador selecionado */}
              {isActive && (
                <CheckCircle
                  size={20}
                  className="absolute top-3 right-3 text-white"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
