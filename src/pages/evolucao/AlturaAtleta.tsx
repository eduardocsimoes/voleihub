// src/pages/evolucao/AlturaAtleta.tsx
import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase/config";
import {
  addHeightRecord,
  deleteHeightRecord,
  getHeightHistory,
  getUserProfile,
  updateAtletaProfile,
} from "../../firebase/firestore";

import { Trash2 } from "lucide-react";

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

// Modelos de crescimento
import {
  GrowthPoint,
  generateRealCurve,
  predictMidParentalHeight,
  predictLogisticMixed,
  predictLogisticHistory,
} from "../../utils/growthModels";

type AlturaTab = "previsao" | "cadastroAltura" | "auxiliares" | "historico";

interface HeightRecord {
  id: string;
  height: number;
  date: string; // yyyy-mm-dd
}

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

// Curva clínica (pais) – gera uma curva S suave usando o MPH como altura adulta
function buildClinicalCurve(
  adultHeight: number,
  sex: "M" | "F"
): { age: number; height: number }[] {
  const L = adultHeight;
  const m = sex === "M" ? 13 : 11.5; // idade aproximada do estirão
  const k = sex === "M" ? 0.33 : 0.30; // taxa de crescimento
  const maxAge = sex === "M" ? 19 : 17;

  const curve: { age: number; height: number }[] = [];
  for (let age = 0; age <= maxAge; age += 0.25) {
    const h = L / (1 + Math.exp(-k * (age - m)));
    curve.push({ age, height: h });
  }
  return curve;
}

// Converte {age, height} → {x, y} para o Chart.js com eixo X numérico
function toXY(curve: { age: number; height: number }[]) {
  return curve.map((p) => ({ x: p.age, y: p.height }));
}

// ============================================================
// ====================== COMPONENTE ==========================
// ============================================================

export default function AlturaAtleta() {
  const [activeTab, setActiveTab] = useState<AlturaTab>("previsao");

  const [history, setHistory] = useState<HeightRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  // Cadastro de altura
  const [heightInput, setHeightInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  // Dados auxiliares
  const [fatherHeightInput, setFatherHeightInput] = useState("");
  const [motherHeightInput, setMotherHeightInput] = useState("");
  const [sexInput, setSexInput] = useState<"masculino" | "feminino">(
    "masculino"
  );

  const [saving, setSaving] = useState(false);

  // ----------------- Carregamento inicial -----------------

  useEffect(() => {
    async function loadAll() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      setLoadingHistory(true);

      try {
        const [hist, prof] = await Promise.all([
          getHeightHistory(uid),
          getUserProfile(uid),
        ]);

        setHistory(hist);
        setProfile(prof);

        if (prof?.fatherHeight)
          setFatherHeightInput(String(prof.fatherHeight));
        if (prof?.motherHeight)
          setMotherHeightInput(String(prof.motherHeight));
        if (prof?.sex === "F") setSexInput("feminino");
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadAll();
  }, []);

  // ----------------- Histórico + idade -----------------

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

  const sexCode: "M" | "F" = profile?.sex === "F" ? "F" : "M";

  const growthPoints: GrowthPoint[] = useMemo(
    () =>
      historyWithAge
        .filter((h) => h.ageAtMeasurement != null)
        .map((h) => ({
          age: h.ageAtMeasurement as number,
          height: h.height,
        })),
    [historyWithAge]
  );

  // ----------------- Modelos de previsão -----------------

  // Modelo clínico (pais)
  const mphAdult = useMemo(
    () =>
      predictMidParentalHeight({
        sex: sexCode,
        fatherHeight: profile?.fatherHeight,
        motherHeight: profile?.motherHeight,
      }),
    [sexCode, profile?.fatherHeight, profile?.motherHeight]
  );

  // Curva clínica completa
  const clinicalCurve = useMemo(() => {
    if (!mphAdult) return null;
    return buildClinicalCurve(mphAdult, sexCode);
  }, [mphAdult, sexCode]);

  // Trajetória Pais + Histórico (Logistic Mixed)
  const mixedResult = useMemo(
    () => predictLogisticMixed(growthPoints, mphAdult),
    [growthPoints, mphAdult]
  );

  // Trajetória baseada no Histórico (Logistic History)
  const historyResult = useMemo(
    () => predictLogisticHistory(growthPoints),
    [growthPoints]
  );

  // Curva real (apenas os pontos reais conectados)
  const realCurve = useMemo(
    () => generateRealCurve(growthPoints),
    [growthPoints]
  );

  // ----------------- Dados do gráfico -----------------

  const chartData = useMemo(() => {
    if (
      !realCurve.length &&
      !clinicalCurve &&
      !mixedResult &&
      !historyResult
    ) {
      return null;
    }

    const datasets: any[] = [];

    if (realCurve.length) {
      datasets.push({
        label: "Altura Real",
        data: toXY(realCurve),
        borderColor: "#ffffff",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#ffffff",
        tension: 0.1,
      });
    }

    if (clinicalCurve) {
      datasets.push({
        label: "Curva Clínica (Pais)",
        data: toXY(clinicalCurve),
        borderColor: "#f97316",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
      });
    }

    if (mixedResult?.curve?.length) {
      datasets.push({
        label: "Trajetória Pais + Histórico",
        data: toXY(mixedResult.curve),
        borderColor: "#22c55e",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
      });
    }

    if (historyResult?.curve?.length) {
      datasets.push({
        label: "Trajetória baseada no Histórico",
        data: toXY(historyResult.curve),
        borderColor: "#38bdf8",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
      });
    }

    return { datasets };
  }, [realCurve, clinicalCurve, mixedResult, historyResult]);

  const chartOptions: any = useMemo(
    () => ({
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
    }),
    []
  );

  // ----------------- Ações: salvar / excluir -----------------

  async function handleSaveHeight() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!heightInput || !dateInput) {
      alert("Informe altura e data.");
      return;
    }

    try {
      setSaving(true);
      const height = Number(heightInput.replace(",", "."));

      await addHeightRecord(uid, height, dateInput);
      const hist = await getHeightHistory(uid);
      setHistory(hist);

      setHeightInput("");
      setDateInput("");
      alert("Altura registrada!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar altura.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAux() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      setSaving(true);

      await updateAtletaProfile(uid, {
        fatherHeight: fatherHeightInput
          ? Number(fatherHeightInput)
          : undefined,
        motherHeight: motherHeightInput
          ? Number(motherHeightInput)
          : undefined,
        sex: sexInput === "feminino" ? "F" : "M",
      });

      const prof = await getUserProfile(uid);
      setProfile(prof);

      alert("Dados auxiliares atualizados!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar dados auxiliares.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(recordId: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    if (!confirm("Deseja excluir este registro de altura?")) return;

    await deleteHeightRecord(uid, recordId);
    const hist = await getHeightHistory(uid);
    setHistory(hist);
  }

  // ----------------- Render -----------------

  return (
    <div className="space-y-10 max-w-6xl mx-auto w-full px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Altura e Crescimento</h1>
        <p className="text-gray-400 max-w-3xl">
          Registre suas medidas e acompanhe a curva de crescimento até a altura
          adulta estimada.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-gray-800">
        {[
          { id: "previsao", label: "Previsão" },
          { id: "auxiliares", label: "Dados Auxiliares" },
          { id: "cadastroAltura", label: "Cadastro de Altura" },
          { id: "historico", label: "Histórico" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AlturaTab)}
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

      {/* --------- TAB: PREVISÃO --------- */}
      {activeTab === "previsao" && (
        <div className="space-y-8">
          {/* Cards resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Clínico (Pais) */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300">
                MODELO CLÍNICO (Pais)
              </h3>
              <p className="text-3xl font-bold text-orange-400 mt-3">
                {mphAdult ? `${mphAdult.toFixed(1)} cm` : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Curva de crescimento baseada apenas na altura dos pais.
              </p>
            </div>

            {/* Pais + Histórico */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300">
                TRAJETÓRIA Pais + Histórico
              </h3>
              <p className="text-3xl font-bold text-orange-400 mt-3">
                {mixedResult
                  ? `${mixedResult.predictedAdultHeight.toFixed(1)} cm`
                  : "—"}
              </p>
              {mixedResult && (
                <p className="text-xs text-gray-400 mt-3">
                  Considera altura dos pais e todo o histórico de medições.
                </p>
              )}
            </div>

            {/* Somente Histórico */}
            <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-300">
                TRAJETÓRIA baseada no Histórico
              </h3>
              <p className="text-3xl font-bold text-orange-400 mt-3">
                {historyResult
                  ? `${historyResult.predictedAdultHeight.toFixed(1)} cm`
                  : "—"}
              </p>
              {historyResult && (
                <p className="text-xs text-gray-400 mt-3">
                  Usa apenas a curva real de crescimento para projetar a altura
                  adulta.
                </p>
              )}
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Curvas de Previsão
            </h3>

            {chartData ? (
              <Line data={chartData as any} options={chartOptions} />
            ) : (
              <p className="text-gray-400 text-sm">
                Cadastre pelo menos uma medida de altura e os dados dos pais
                para visualizar as curvas.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --------- TAB: CADASTRO ALTURA --------- */}
      {activeTab === "cadastroAltura" && (
        <div className="space-y-8 max-w-xl">
          <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">
              Registrar Nova Altura
            </h2>

            <input
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              placeholder="Altura (cm)"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            />

            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700"
            />

            <button
              onClick={handleSaveHeight}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-orange-500 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar Altura"}
            </button>
          </div>
        </div>
      )}

      {/* --------- TAB: DADOS AUXILIARES --------- */}
      {activeTab === "auxiliares" && (
        <div className="space-y-8 max-w-xl">
          <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">
              Dados Auxiliares para Previsão
            </h2>

            {/* Sexo */}
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  className="accent-orange-500"
                  value="masculino"
                  checked={sexInput === "masculino"}
                  onChange={() => setSexInput("masculino")}
                />
                Masculino
              </label>

              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="radio"
                  className="accent-orange-500"
                  value="feminino"
                  checked={sexInput === "feminino"}
                  onChange={() => setSexInput("feminino")}
                />
                Feminino
              </label>
            </div>

            {/* Altura dos pais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-300 mb-1">
                  Altura do pai (cm)
                </label>
                <input
                  type="number"
                  value={fatherHeightInput}
                  onChange={(e) => setFatherHeightInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">
                  Altura da mãe (cm)
                </label>
                <input
                  type="number"
                  value={motherHeightInput}
                  onChange={(e) => setMotherHeightInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAux}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar Dados"}
            </button>
          </div>
        </div>
      )}

      {/* --------- TAB: HISTÓRICO --------- */}
      {activeTab === "historico" && (
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">
            Histórico de Medidas
          </h2>

          {loadingHistory && <p className="text-gray-400">Carregando...</p>}

          {!loadingHistory && history.length === 0 && (
            <p className="text-gray-400 text-sm">
              Nenhuma altura registrada ainda.
            </p>
          )}

          {!loadingHistory && history.length > 0 && (
            <div className="space-y-4">
              {historyWithAge.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-white font-bold text-lg">
                      {h.height} cm
                    </p>
                    <p className="text-xs text-gray-400">Data: {h.date}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Idade:{" "}
                      {h.ageAtMeasurement != null
                        ? `${h.ageAtMeasurement.toFixed(1).replace(".", ",")} anos`
                        : "—"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                    title="Excluir medida"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
