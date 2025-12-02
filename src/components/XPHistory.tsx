// src/components/XPHistory.tsx
import React from "react";

interface XPItem {
  date: string;
  xp: number;
  reason: string;
}

interface XPHistoryProps {
  history?: XPItem[];
}

export default function XPHistory({ history = [] }: XPHistoryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Histórico de XP</h2>

      {history.length === 0 && (
        <div className="p-4 bg-gray-800 text-gray-400 rounded-lg">
          Nenhum registro de XP encontrado.
        </div>
      )}

      <div className="space-y-3">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-900/70 rounded-lg border border-gray-700 flex justify-between items-center"
          >
            <div>
              <p className="text-white font-semibold">
                {item.reason || "XP Adquirido"}
              </p>
              <p className="text-gray-400 text-sm">{item.date}</p>
            </div>

            <span className="text-green-400 font-bold text-lg">
              +{item.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
