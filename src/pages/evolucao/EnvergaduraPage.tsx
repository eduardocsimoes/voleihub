import React from "react";
import { Ruler } from "lucide-react";

export default function EnvergaduraPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto bg-gray-900/70 border border-gray-700 p-8 rounded-2xl">
        
        <div className="flex items-center gap-3 mb-5">
          <Ruler size={28} className="text-orange-400" />
          <h1 className="text-2xl font-bold">Envergadura</h1>
        </div>

        <p className="text-gray-300 text-sm mb-3">
          Registre sua envergadura de forma precisa e acompanhe evolução.
        </p>

        <div className="mt-10 text-center text-gray-500 italic">
          Em breve...
        </div>

      </div>
    </div>
  );
}
