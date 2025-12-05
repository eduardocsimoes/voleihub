// src/pages/AlturaAtleta.tsx
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
      // pega o usuário logado
      const usuarioAtual = auth.currentUser?.uid;
  
      // se não tiver usuário logado, não tenta buscar nada
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

    // Atualiza lista
    const lista = await getHeightHistory(usuarioAtual);
    setHistory(lista);

    setHeight("");
    setDate("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">

        <h1 className="text-2xl font-bold text-center">
          Controle de Altura do Atleta
        </h1>

        {/* FORM */}
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">Registrar nova altura</h2>

          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Altura (cm)"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
          />

          <button
            onClick={salvar}
            className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold"
          >
            Salvar altura
          </button>
        </div>

        {/* HISTÓRICO */}
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">Histórico de Medidas</h2>

          {loading && <p className="text-gray-400">Carregando...</p>}

          {!loading && history.length === 0 && (
            <p className="text-gray-400">Nenhuma altura registrada ainda.</p>
          )}

          {!loading && history.length > 0 && (
            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-white font-bold">{h.height} cm</p>
                    <p className="text-xs text-gray-400">
                      Data: {h.date}
                    </p>
                  </div>

                  <p className="text-xs text-gray-300">
                    Idade: {h.ageAtMeasurement} anos
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
