import React from "react";
import { AtletaProfile } from "../firebase/firestore";
import { Trophy, Award, MapPin, Ruler, Weight, Calendar } from "lucide-react";

interface Props {
  atleta: AtletaProfile | null;
}

export default function PerfilCompletoAtleta({ atleta }: Props) {
  if (!atleta) return null;

  // =============================
  //       ORDENAÇÃO CARREIRA
  // =============================
  const experienciasOrdenadas = (atleta.experiences || []).sort(
    (a, b) => b.startYear - a.startYear
  );

  // =============================
  //       ORDENAÇÃO TÍTULOS
  // =============================
  const conquistas = [...(atleta.achievements || [])];

  // 1) Medalhas (1º, 2º, 3º)
  const medalhasPrimeiro = conquistas.filter(c => c.placement === "1º Lugar");
  const medalhasSegundo = conquistas.filter(c => c.placement === "2º Lugar");
  const medalhasTerceiro = conquistas.filter(c => c.placement === "3º Lugar");

  // 2) Prêmios individuais
  const premiosIndividuais = conquistas.filter(
    c => c.type === "Individual" && !c.placement
  );

  // 3) Outras conquistas (participante ou sem medalha)
  const outras = conquistas.filter(
    c =>
      (!c.placement || c.placement === "Participante") &&
      c.type !== "Individual"
  );

  // =============================
  //   CLASSIFICAÇÃO POR IMPORTÂNCIA
  // =============================

  const categoria = (nome: string) => {
    const lower = nome.toLowerCase();
    if (lower.includes("brasil") || lower.includes("nacional")) return 1;
    if (lower.includes("estad") || lower.includes("regi")) return 2;
    return 3; // municipal / outros
  };

  function ordenarPorImportancia(lista: any[]) {
    return lista.sort((a, b) => {
      const catA = categoria(a.championship);
      const catB = categoria(b.championship);

      if (catA !== catB) return catA - catB;
      return b.year - a.year;
    });
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ===========================
            CABEÇALHO
        ============================ */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2">{atleta.name}</h1>

          <p className="text-gray-300 text-lg">
            Atleta Profissional de Voleibol
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">

            {atleta.height && (
              <div className="flex gap-2 items-center text-gray-300">
                <Ruler size={18} /> {atleta.height} cm
              </div>
            )}

            {atleta.weight && (
              <div className="flex gap-2 items-center text-gray-300">
                <Weight size={18} /> {atleta.weight} kg
              </div>
            )}

            {atleta.city && (
              <div className="flex gap-2 items-center text-gray-300">
                <MapPin size={18} /> {atleta.city}/{atleta.state}
              </div>
            )}

            {atleta.birthDate && (
              <div className="flex gap-2 items-center text-gray-300">
                <Calendar size={18} /> Nasc.: {atleta.birthDate}
              </div>
            )}
          </div>
        </div>

        {/* ===========================
            SEÇÃO - BIO / SOBRE
        ============================ */}
        {atleta.bio && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Sobre Mim</h2>
            <p className="text-gray-300 leading-relaxed">{atleta.bio}</p>
          </div>
        )}

        {/* ===========================
            SEÇÃO - CARREIRA
        ============================ */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex gap-2 items-center">
            <Trophy className="text-yellow-400" /> Carreira
          </h2>

          <div className="space-y-4">
            {experienciasOrdenadas.map((exp) => (
              <div
                key={exp.id}
                className="bg-gray-900 p-4 rounded-xl border border-gray-700"
              >
                <div className="flex justify-between text-white font-semibold">
                  <span>{exp.clubName}</span>
                  <span>
                    {exp.startYear} — {exp.endYear || "Atual"}
                  </span>
                </div>
                <p className="text-gray-400">{exp.position}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===========================
            SEÇÃO - CONQUISTAS
        ============================ */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">

          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="text-yellow-400" /> Principais Conquistas
          </h2>

          {/* 1 - Medalhas 1º */}
          {ordenarPorImportancia(medalhasPrimeiro).length > 0 && (
            <Section title="🏅 Títulos Nacionais, Estaduais e Municipais — 1º Lugar"
                     items={ordenarPorImportancia(medalhasPrimeiro)} />
          )}

          {/* 2 - Medalhas 2º */}
          {ordenarPorImportancia(medalhasSegundo).length > 0 && (
            <Section title="🥈 Vice-Campeonatos"
                     items={ordenarPorImportancia(medalhasSegundo)} />
          )}

          {/* 3 - Medalhas 3º */}
          {ordenarPorImportancia(medalhasTerceiro).length > 0 && (
            <Section title="🥉 Terceiros Lugares"
                     items={ordenarPorImportancia(medalhasTerceiro)} />
          )}

          {/* 4 - Prêmios Individuais */}
          {premiosIndividuais.length > 0 && (
            <Section title="🌟 Prêmios Individuais" items={premiosIndividuais} />
          )}

          {/* 5 - Outras Conquistas */}
          {outras.length > 0 && (
            <Section title="📌 Outras Competições" items={ordenarPorImportancia(outras)} />
          )}
        </div>

      </div>
    </div>
  );
}

// =========================
//   COMPONENTE DE SEÇÃO
// =========================
function Section({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl text-white font-semibold mb-3">{title}</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 rounded-lg border border-gray-700 p-4"
          >
            <div className="text-white font-medium">{item.championship}</div>
            <div className="text-gray-400 text-sm">
              {item.club} • {item.year}
            </div>
            {(item.placement || item.award) && (
              <div className="text-yellow-400 text-xs font-semibold mt-1">
                {item.placement || item.award}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
