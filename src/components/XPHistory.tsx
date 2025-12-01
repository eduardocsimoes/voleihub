// src/gamification/XPHistory.tsx
import React from "react";

export interface XPEntry {
  date: string;
  xp: number;
  reason: string;
}

interface XPHistoryProps {
  history: XPEntry[] | undefined; // aceita undefined sem quebrar
}

export default function XPHistory({ history }: XPHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 bg-gray-900 text-gray-300 rounded-xl border border-gray-700">
        <p>Nenhum registro de XP encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Histórico de XP</h2>

      <div className="space-y-4">
        {history.map((entry, index) => (
          <div
            key={index}
            className="p-4 bg-gray-800 rounded-lg flex items-center justify-between border border-gray-700"
          >
            <div>
              <p className="text-white font-semibold">{entry.reason}</p>
              <p className="text-gray-400 text-sm">
                {new Date(entry.date).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <span className="text-green-400 font-bold text-lg">
              +{entry.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
