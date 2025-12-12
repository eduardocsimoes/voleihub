// src/pages/evolucao/SaltoAtleta.tsx
import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase/config";
import {
  getUserProfile,
  addVerticalJumpRecord,
  getVerticalJumpHistory,
  deleteVerticalJumpRecord,
  VerticalJumpRecord,
} from "../../firebase/firestore";

import { Trash2 } from "lucide-react";

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type SaltoTab = "resumo" | "cadastro" | "historico";

// ----------------- Helpers -----------------

function calcularIdade(birthDate?: string, refDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const ref = refDate ? new Date(refDate) : new Date();

  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;

  return age + m / 12;
}

function formatCm(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} cm`;
}

function formatAge(age?: number | null): string {
  if (age == null || Number.isNaN(age)) return "—";
  return `${age.toFixed(1).replace(".", ",")} anos`;
}

function classifyJump(sex: "M" | "F", jumpHeight?: number | null): string {
  if (!jumpHeight && jumpHeight !== 0) return "—";

  const v = jumpHeight;
  if (sex === "M") {
    if (v >= 70) return "Excelente";
    if (v >= 60) return "Muito bom";
    if (v >= 50) return "Bom";
    if (v >= 40) return "Regular";
    return "Fraco";
  } else {
    if (v >= 55) return "Excelente";
    if (v >= 45) return "Muito bom";
    if (v >= 35) return "Bom";
    if (v >= 25) return "Regular";
    return "Fraco";
  }
}

// Converte {age, height} -> {x, y} para Chart.js
function toXY(points: { age: number; value: number }[]) {
  return points.map((p) => ({ x: p.age, y: p.value }));
}

// =============================================================================
// ===========================  COMPONENTE  ====================================
// =============================================================================

export default function SaltoAtleta() {
  const [activeTab, setActiveTab] = useState<SaltoTab>("resumo");

  const [history, setHistory] = useState<VerticalJumpRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  // Formulário
  const [reachStandingInput, setReachStandingInput] = useState("");
  const [reachJumpInput, setReachJumpInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const [saving, setSaving] = useState(false);

  // ----------------- Carregamento inicial -----------------

  useEffect(() => {
    async function loadAll() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      setLoadingHistory(true);
      try {
        const [hist, prof] = await Promise.all([
          getVerticalJumpHistory(uid),
          getUserProfile(uid),
        ]);

        setHistory(hist);
        setProfile(prof);
      } catch (e) {
        console.error("Erro ao carregar dados de salto:", e);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadAll();
  }, []);

  const sexCode: "M" | "F" = profile?.sex === "F" ? "F" : "M";

  // Histórico + idade
  const historyWithAge = useMemo(
    () =>
      history.map((h) => ({
        ...h,
        ageAtMeasurement: profile?.birthDate
          ? calcularIdade(profile.birthDate, h.date)
          : null,
      })),
    [history, profile?.birthDate]
  );

  // Último salto
  const latest = useMemo(() => {
    if (!historyWithAge.length) return null;
    return historyWithAge[historyWithAge.length - 1];
  }, [historyWithAge]);

  const bestJump = useMemo(() => {
    if (!historyWithAge.length) return null;
    return historyWithAge.reduce((best, item) =>
      item.jumpHeight > (best?.jumpHeight ?? -Infinity) ? item : best
    );
  }, [historyWithAge]);

  const maxReachJump = useMemo(() => {
    if (!historyWithAge.length) return null;
    return historyWithAge.reduce((best, item) =>
      item.reachJump > (best?.reachJump ?? -Infinity) ? item : best
    );
  }, [historyWithAge]);

  const avgLast5Jump = useMemo(() => {
    if (!historyWithAge.length) return null;
    const last = historyWithAge.slice(-5);
    const sum = last.reduce((acc, item) => acc + (item.jumpHeight ?? 0), 0);
    return sum / last.length;
  }, [historyWithAge]);

  const currentClassification = classifyJump(
    sexCode,
    latest?.jumpHeight ?? null
  );

  // ----------------- Gráfico ------------------------------

  const chartData = useMemo(() => {
    const pointsJump: { age: number; value: number }[] = [];
    const pointsReach: { age: number; value: number }[] = [];

    historyWithAge.forEach((h) => {
      if (h.ageAtMeasurement != null) {
        pointsJump.push({
          age: h.ageAtMeasurement as number,
          value: h.jumpHeight,
        });
        pointsReach.push({
          age: h.ageAtMeasurement as number,
          value: h.reachJump,
        });
      }
    });

    if (!pointsJump.length) return null;

    const datasets: any[] = [
      {
        label: "Salto Vertical (cm)",
        data: toXY(pointsJump),
        borderColor: "#f97316",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 4,
        pointBackgroundColor: "#f97316",
      },
      {
        label: "Alcance no salto (cm)",
        data: toXY(pointsReach),
        borderColor: "#38bdf8",
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 3,
        pointBackgroundColor: "#38bdf8",
      },
    ];

    return { datasets };
  }, [historyWithAge]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#e5e7eb" },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const v = ctx.parsed.y;
            if (v == null) return "";
            return `${ctx.dataset.label}: ${v.toFixed(1)} cm`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Idade (anos)",
          color: "#9ca3af",
        },
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(107,114,128,0.3)" },
      },
      y: {
        title: {
          display: true,
          text: "Altura (cm)",
          color: "#9ca3af",
        },
        ticks: { color: "#9ca3af" },
        grid: { color: "rgba(75,85,99,0.4)" },
      },
    },
  } as any;

  // ----------------- Ações: salvar / excluir -----------------

  async function handleSaveJump() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!reachStandingInput || !reachJumpInput || !dateInput) {
      alert("Informe alcance em pé, alcance no salto e data.");
      return;
    }

    const reachStanding = Number(reachStandingInput.replace(",", "."));
    const reachJump = Number(reachJumpInput.replace(",", "."));

    if (Number.isNaN(reachStanding) || Number.isNaN(reachJump)) {
      alert("Valores inválidos.");
      return;
    }

    if (reachJump <= reachStanding) {
      alert("O alcance no salto deve ser maior que o alcance em pé.");
      return;
    }

    try {
      setSaving(true);
      await addVerticalJumpRecord(uid, reachStanding, reachJump, dateInput);
      const hist = await getVerticalJumpHistory(uid);
      setHistory(hist);

      setReachStandingInput("");
      setReachJumpInput("");
      setDateInput("");
      alert("Salto registrado!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar o salto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recordId: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!confirm("Deseja excluir este registro de salto?")) return;

    await deleteVerticalJumpRecord(uid, recordId);
    const hist = await getVerticalJumpHistory(uid);
    setHistory(hist);
  }

  // ==========================================================
  // ======================= RENDER ============================
  // ==========================================================

  return (
    <div className="space-y-10 max-w-6xl mx-auto w-full px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Salto Vertical</h1>
        <p className="text-gray-400 max-w-3xl">
          Registre seus saltos e acompanhe sua evolução de impulsão e alcance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-gray-800">
        {[
          { id: "resumo", label: "Resumo" },
          { id: "cadastro", label: "Cadastro de Salto" },
          { id: "historico", label: "Histórico" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SaltoTab)}
            className={`px-5 py-2 rounded-t-lg text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --------- TAB: RESUMO --------- */}
      {activeTab === "resumo" && (
        <div className="space-y-8">
          {/* Cards resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Maior salto */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300">
                Maior salto registrado
              </h3>
              <p className="text-3xl font-bold text-orange-400 mt-3">
                {bestJump ? formatCm(bestJump.jumpHeight) : "—"}
              </p>
              {bestJump && (
                <p className="text-xs text-gray-400 mt-2">
                  Data: <span className="font-semibold">{bestJump.date}</span>
                </p>
              )}
            </div>

            {/* Salto atual */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300">
                Salto atual
              </h3>
              <p className="text-3xl font-bold text-orange-400 mt-3">
                {latest ? formatCm(latest.jumpHeight) : "—"}
              </p>
              {latest && (
                <p className="text-xs text-gray-400 mt-2">
                  Idade:{" "}
                  <span className="font-semibold">
                    {formatAge(latest.ageAtMeasurement)}
                  </span>
                </p>
              )}
            </div>

            {/* Classificação atual */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300">
                Classificação atual
              </h3>
              <p className="text-2xl font-bold text-orange-400 mt-3">
                {currentClassification}
              </p>
              {latest && (
                <p className="text-xs text-gray-400 mt-2">
                  Baseado em {formatCm(latest.jumpHeight)}
                </p>
              )}
            </div>

            {/* Alcance máximo */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300">
                Maior alcance no salto
              </h3>
              <p className="text-3xl font-bold text-orange-400 mt-3">
                {maxReachJump ? formatCm(maxReachJump.reachJump) : "—"}
              </p>
              {maxReachJump && (
                <p className="text-xs text-gray-400 mt-2">
                  Alcance em pé:{" "}
                  <span className="font-semibold">
                    {formatCm(maxReachJump.reachStanding)}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Evolução do Salto Vertical
            </h3>

            {chartData ? (
              <Line data={chartData as any} options={chartOptions} />
            ) : (
              <p className="text-gray-400 text-sm">
                Cadastre pelo menos um registro de salto para visualizar o
                gráfico.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --------- TAB: CADASTRO --------- */}
      {activeTab === "cadastro" && (
        <div className="space-y-8 max-w-xl">
          <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">
              Registrar novo salto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-300 mb-1">
                  Alcance em pé (cm)
                </label>
                <input
                  type="number"
                  value={reachStandingInput}
                  onChange={(e) => setReachStandingInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">
                  Alcance no salto (cm)
                </label>
                <input
                  type="number"
                  value={reachJumpInput}
                  onChange={(e) => setReachJumpInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">
                Data da medição
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
              />
            </div>

            <button
              onClick={handleSaveJump}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar Salto"}
            </button>
          </div>
        </div>
      )}

      {/* --------- TAB: HISTÓRICO --------- */}
      {activeTab === "historico" && (
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">
            Histórico de Saltos
          </h2>

          {loadingHistory && <p className="text-gray-400">Carregando...</p>}

          {!loadingHistory && historyWithAge.length === 0 && (
            <p className="text-gray-400 text-sm">
              Nenhum salto registrado ainda.
            </p>
          )}

          {!loadingHistory &&
            historyWithAge.length > 0 &&
            historyWithAge.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-white font-bold text-lg">
                    {formatCm(h.jumpHeight)}{" "}
                    <span className="text-sm text-gray-400">
                      (salto vertical)
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Data: <span className="font-semibold">{h.date}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Idade:{" "}
                    {h.ageAtMeasurement
                      ? `${h.ageAtMeasurement
                          .toFixed(1)
                          .replace(".", ",")} anos`
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Alcance em pé: {formatCm(h.reachStanding)} | Alcance no
                    salto: {formatCm(h.reachJump)}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(h.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Excluir registro"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
