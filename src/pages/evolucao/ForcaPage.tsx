import React from "react";
import { Zap } from "lucide-react";

export default function ForcaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto bg-gray-900/70 border border-gray-700 p-8 rounded-2xl">
        
        <div className="flex items-center gap-3 mb-5">
          <Zap size={28} className="text-yellow-400" />
          <h1 className="text-2xl font-bold">Força e Velocidade</h1>
        </div>

        <p className="text-gray-300 text-sm">
          Testes de sprint, agilidade e resistência com histórico e gráficos.
        </p>

        <div className="mt-10 text-center text-gray-500 italic">
          Em breve...
        </div>

      </div>
    </div>
  );
}
