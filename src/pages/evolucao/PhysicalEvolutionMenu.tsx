import React from "react";
import { Link } from "react-router-dom";
import { Ruler, Activity, MoveUp, BarChart3, ArrowRight } from "lucide-react";

export default function PhysicalEvolutionMenu() {
  const items = [
    {
      title: "Altura e Crescimento",
      description: "Registros por data, curva de crescimento e previsão de altura.",
      icon: Ruler,
      link: "/evolucao/altura",
      color: "from-blue-500 to-blue-700"
    },
    {
      title: "Salto Vertical",
      description: "Medição de salto, recordes e nível de impulsão.",
      icon: MoveUp,
      link: "/evolucao/salto",
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Envergadura",
      description: "Envergadura, alcance em pé e alcance no salto.",
      icon: Activity,
      link: "/evolucao/envergadura",
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Força & Velocidade",
      description: "Provas de sprint, agilidade e resistência.",
      icon: BarChart3,
      link: "/evolucao/forca",
      color: "from-purple-500 to-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Evolução Física</h1>
        <p className="text-gray-300 mb-6">
          Acompanhe sua progressão física com registros, gráficos, comparações e análises inteligentes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.link}
                className="group bg-gray-900/80 border border-gray-700 rounded-2xl p-5 flex gap-4 items-start hover:border-orange-500/50 transition-all hover:shadow-xl"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <Icon size={28} className="text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>

                  <span className="inline-flex items-center gap-1 text-orange-400 text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
                    Acessar <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
