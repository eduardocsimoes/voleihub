import React, { useEffect, useState } from "react";
import { auth } from "../../firebase/config";
import { addHeightRecord, getHeightHistory } from "../../firebase/firestore";

export default function AlturaAtleta() {
  const usuarioAtual = auth.currentUser?.uid;

  const [height, setHeight] = useState("");
  const [date, setDate] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!usuarioAtual) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const lista = await getHeightHistory(usuarioAtual);
      setHistory(lista);
      setLoading(false);
    }

    loadHistory();
  }, []);

  async function salvar() {
    if (!usuarioAtual) {
      alert("Você precisa estar logado.");
      return;
    }

    if (!height || !date) {
      alert("Preencha altura e data.");
      return;
    }

    await addHeightRecord(usuarioAtual, Number(height), date);
    alert("Altura registrada com sucesso!");

    const lista = await getHeightHistory(usuarioAtual);
    setHistory(lista);

    setHeight("");
    setDate("");
  }

  return (
    <div className="space-y-10 max-w-3xl mx-auto w-full px-4">

      {/* Título */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Altura e Crescimento</h1>
        <p className="text-gray-400">
          Registre e acompanhe sua evolução de altura ao longo do tempo.
        </p>
      </div>

      {/* FORM */}
      <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Registrar nova altura</h2>

        {/* Altura */}
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Altura (cm)"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-lg"
        />

        {/* Data */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-lg"
        />

        {/* Botão */}
        <button
          onClick={salvar}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold text-white text-lg transition"
        >
          Salvar altura
        </button>
      </div>

      {/* HISTÓRICO */}
      <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Histórico de Medidas</h2>

        {loading && <p className="text-gray-400">Carregando...</p>}

        {!loading && history.length === 0 && (
          <p className="text-gray-400">Nenhuma altura registrada ainda.</p>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-4">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-white font-bold text-lg">{h.height} cm</p>
                  <p className="text-xs text-gray-400">Data: {h.date}</p>
                </div>

                <p className="text-sm text-gray-300">
                  Idade: {h.ageAtMeasurement ?? "–"} anos
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
