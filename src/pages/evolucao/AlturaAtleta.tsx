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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Tab = "previsao" | "cadastro" | "historico";

type HeightRecord = {
  id: string;
  height: number;
  date: string; // 'YYYY-MM-DD'
  createdAt?: any;
};

type Sex = "M" | "F";

interface ProfileExtras {
  birthDate?: string;
  fatherHeight?: number;
  motherHeight?: number;
  sex?: Sex;
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function diffYears(from: Date, to: Date) {
  return (to.getTime() - from.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

// --------- modelos estatísticos simples ---------

function fitLinear(points: { age: number; height: number }[]) {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (const p of points) {
    sumX += p.age;
    sumY += p.height;
    sumXY += p.age * p.height;
    sumX2 += p.age * p.age;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const b = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - b * sumX) / n;

  return { a, b }; // height = a + b * age
}

// Resolve sistema 3x3 (para regressão quadrática)
function solve3x3(A: number[][], B: number[]): number[] | null {
  const a = A.map((row) => [...row]);
  const b = [...B];

  for (let i = 0; i < 3; i++) {
    // pivô
    let maxRow = i;
    for (let r = i + 1; r < 3; r++) {
      if (Math.abs(a[r][i]) > Math.abs(a[maxRow][i])) maxRow = r;
    }
    if (Math.abs(a[maxRow][i]) < 1e-8) return null;

    // troca linhas
    [a[i], a[maxRow]] = [a[maxRow], a[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];

    // normaliza
    const pivot = a[i][i];
    for (let c = i; c < 3; c++) a[i][c] /= pivot;
    b[i] /= pivot;

    // zera abaixo
    for (let r = 0; r < 3; r++) {
      if (r === i) continue;
      const factor = a[r][i];
      for (let c = i; c < 3; c++) {
        a[r][c] -= factor * a[i][c];
      }
      b[r] -= factor * b[i];
    }
  }

  return b; // já está solucionado
}

function fitQuadratic(points: { age: number; height: number }[]) {
  const n = points.length;
  if (n < 3) return null;

  let Sx = 0,
    Sx2 = 0,
    Sx3 = 0,
    Sx4 = 0,
    Sy = 0,
    Sxy = 0,
    Sx2y = 0;

  for (const p of points) {
    const x = p.age;
    const y = p.height;
    const x2 = x * x;

    Sx += x;
    Sx2 += x2;
    Sx3 += x2 * x;
    Sx4 += x2 * x2;
    Sy += y;
    Sxy += x * y;
    Sx2y += x2 * y;
  }

  const A = [
    [n, Sx, Sx2],
    [Sx, Sx2, Sx3],
    [Sx2, Sx3, Sx4],
  ];
  const B = [Sy, Sxy, Sx2y];

  const sol = solve3x3(A, B);
  if (!sol) return null;

  const [a, b, c] = sol;
  return { a, b, c }; // height = a + b*x + c*x²
}

function formatHeight(h?: number | null) {
  if (h == null || Number.isNaN(h)) return "–";
  return `${h.toFixed(1)} cm`;
}

export default function AlturaAtleta() {
  const usuarioAtual = auth.currentUser?.uid;

  const [tab, setTab] = useState<Tab>("previsao");

  const [height, setHeight] = useState("");
  const [date, setDate] = useState("");
  const [history, setHistory] = useState<HeightRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [profile, setProfile] = useState<ProfileExtras>({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [savingHeight, setSavingHeight] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    // se não tiver usuário logado, não faz nada
    if (!usuarioAtual) return;
  
    async function loadAll(uid: string) {
      setLoadingHistory(true);
      setLoadingProfile(true);
  
      const [hist, prof] = await Promise.all([
        getHeightHistory(uid),
        getUserProfile(uid),
      ]);
  
      setHistory(
        hist.map((h: any) => ({
          id: h.id,
          height: h.height,
          date: h.date,
          createdAt: h.createdAt,
        }))
      );
  
      setProfile({
        birthDate: prof?.birthDate,
        fatherHeight: prof?.fatherHeight,
        motherHeight: prof?.motherHeight,
        sex: prof?.sex as Sex | undefined,
      });
  
      setLoadingHistory(false);
      setLoadingProfile(false);
    }
  
    // aqui o TS sabe que é string, porque só chega se passou no if acima
    loadAll(usuarioAtual);
  }, [usuarioAtual]);
  
  // -------------- Derivados para modelos ----------------

  const birthDateObj = useMemo(() => parseDate(profile.birthDate), [profile.birthDate]);

  const points = useMemo(() => {
    if (!birthDateObj) return [] as { age: number; height: number }[];
    return history
      .map((h) => {
        const d = parseDate(h.date);
        if (!d) return null;
        return { age: diffYears(birthDateObj, d), height: h.height };
      })
      .filter(Boolean) as { age: number; height: number }[];
  }, [birthDateObj, history]);

  const linearModel = useMemo(() => fitLinear(points), [points]);
  const quadModel = useMemo(() => fitQuadratic(points), [points]);

  const MPH = useMemo(() => {
    if (!profile.fatherHeight || !profile.motherHeight || !profile.sex) return null;

    if (profile.sex === "M") {
      return (profile.fatherHeight + profile.motherHeight + 13) / 2;
    } else {
      return (profile.fatherHeight + profile.motherHeight - 13) / 2;
    }
  }, [profile.fatherHeight, profile.motherHeight, profile.sex]);

  const targetAge = 18;

  const linearAt18 =
    linearModel != null ? linearModel.a + linearModel.b * targetAge : null;

  const quadAt18 =
    quadModel != null
      ? quadModel.a + quadModel.b * targetAge + quadModel.c * targetAge * targetAge
      : null;

  const ageNow = useMemo(() => {
    if (!birthDateObj) return null;
    return diffYears(birthDateObj, new Date());
  }, [birthDateObj]);

  const chartData = useMemo(() => {
    if (!points.length) return [];

    const firstAge = Math.max(0, Math.floor(points[0].age));
    const lastAge = Math.max(
      targetAge,
      Math.ceil(points[points.length - 1].age)
    );

    const data: any[] = [];

    for (let age = firstAge; age <= lastAge; age++) {
      const row: any = { age };
      if (linearModel) row.linear = linearModel.a + linearModel.b * age;
      if (quadModel)
        row.quadratic =
          quadModel.a + quadModel.b * age + quadModel.c * age * age;
      if (MPH != null) row.mph = MPH;
      data.push(row);
    }

    // também podemos marcar pontos reais
    points.forEach((p) => {
      const idx = data.findIndex((d) => d.age === Math.round(p.age));
      if (idx >= 0) data[idx].real = p.height;
    });

    return data;
  }, [points, linearModel, quadModel, MPH]);

  // -------------- Ações ----------------

  async function handleSaveHeight() {
    if (!usuarioAtual) {
      alert("Você precisa estar logado.");
      return;
    }

    if (!height || !date) {
      alert("Preencha altura e data.");
      return;
    }

    try {
      setSavingHeight(true);
      await addHeightRecord(usuarioAtual, Number(height), date);
      const lista = await getHeightHistory(usuarioAtual);
      setHistory(
        lista.map((h: any) => ({
          id: h.id,
          height: h.height,
          date: h.date,
          createdAt: h.createdAt,
        }))
      );
      setHeight("");
      setDate("");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar altura.");
    } finally {
      setSavingHeight(false);
    }
  }

  async function handleDelete(recordId: string) {
    if (!usuarioAtual) return;
    if (!confirm("Deseja realmente excluir esta medida?")) return;

    await deleteHeightRecord(usuarioAtual, recordId);
    const lista = await getHeightHistory(usuarioAtual);
    setHistory(
      lista.map((h: any) => ({
        id: h.id,
        height: h.height,
        date: h.date,
        createdAt: h.createdAt,
      }))
    );
  }

  async function handleSaveProfileExtras() {
    if (!usuarioAtual) return;

    try {
      setSavingProfile(true);
      await updateAtletaProfile(usuarioAtual, {
        fatherHeight: profile.fatherHeight || null,
        motherHeight: profile.motherHeight || null,
        sex: profile.sex || null,
      } as any);
      alert("Dados para previsão atualizados com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar dados.");
    } finally {
      setSavingProfile(false);
    }
  }

  // -------------- Render ----------------

  if (!usuarioAtual) {
    return <p className="text-white">Você precisa estar logado.</p>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full px-4">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Altura e Crescimento</h1>
        <p className="text-gray-400">
          Registre suas medidas e acompanhe as previsões de altura adulta com
          diferentes modelos.
        </p>
      </div>

      {/* Abas internas */}
      <div className="flex gap-2 border-b border-gray-700/70 pb-2">
        {[
          { id: "previsao", label: "Previsão" },
          { id: "cadastro", label: "Cadastro" },
          { id: "historico", label: "Histórico" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition ${
              tab === t.id
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {tab === "previsao" && (
        <div className="space-y-6">
          {/* Cards resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Modelo Clínico (Pais)
              </p>
              <p className="text-2xl font-bold text-orange-400 mt-2">
                {formatHeight(MPH)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Mid–Parental Height usando altura dos pais.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Regressão Linear
              </p>
              <p className="text-2xl font-bold text-orange-400 mt-2">
                {formatHeight(linearAt18)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Estimativa aos 18 anos baseada na tendência linear das
                medições.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Regressão Quadrática
              </p>
              <p className="text-2xl font-bold text-orange-400 mt-2">
                {formatHeight(quadAt18)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Modelo de curva de crescimento (polinomial).
              </p>
            </div>
          </div>

          {/* Idade atual */}
          <div className="flex justify-end text-sm text-gray-400">
            Idade atual (aprox.):{" "}
            <span className="font-semibold text-white ml-1">
              {ageNow != null ? ageNow.toFixed(1).replace(".", ",") : "–"} anos
            </span>
          </div>

          {/* Avisos */}
          {(!birthDateObj || points.length < 2) && (
            <div className="bg-yellow-900/40 border border-yellow-600/60 text-yellow-100 text-sm rounded-xl p-4">
              <p className="font-semibold mb-1">Informações insuficientes</p>
              {!birthDateObj && (
                <p>
                  • Cadastre sua <strong>data de nascimento</strong> no perfil
                  para habilitar a previsão por idade.
                </p>
              )}
              {points.length < 2 && (
                <p>
                  • Registre pelo menos{" "}
                  <strong>duas medições de altura</strong> para estimativas
                  baseadas em regressão.
                </p>
              )}
              {profile.fatherHeight == null ||
                profile.motherHeight == null ||
                !profile.sex && (
                  <p>
                    • Informe <strong>altura do pai, da mãe e sexo</strong> na
                    aba &quot;Cadastro&quot; para ativar o modelo clínico (MPH).
                  </p>
                )}
            </div>
          )}

          {/* Gráfico */}
          <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 h-80">
            <h3 className="text-white font-semibold mb-3">
              Curvas de previsão de altura
            </h3>
            {chartData.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Registre medidas e dados de nascimento para visualizar o
                gráfico.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272f" />
                  <XAxis dataKey="age" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#030712",
                      border: "1px solid #374151",
                      borderRadius: "0.75rem",
                      fontSize: 12,
                    }}
                  />
                  <Legend />
                  {MPH != null && (
                    <Line
                      type="monotone"
                      dataKey="mph"
                      name="MPH (pais)"
                      stroke="#f97316"
                      dot={false}
                      strokeWidth={2}
                    />
                  )}
                  {linearModel && (
                    <Line
                      type="monotone"
                      dataKey="linear"
                      name="Linear"
                      stroke="#22c55e"
                      dot={false}
                      strokeWidth={2}
                    />
                  )}
                  {quadModel && (
                    <Line
                      type="monotone"
                      dataKey="quadratic"
                      name="Quadrática"
                      stroke="#3b82f6"
                      dot={false}
                      strokeWidth={2}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="real"
                    name="Medições"
                    stroke="#e5e7eb"
                    dot={{ r: 4 }}
                    strokeWidth={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab === "cadastro" && (
        <div className="space-y-8">
          {/* FORM ALTURA */}
          <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">
              Registrar nova altura
            </h2>

            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Altura (cm)"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-lg"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-lg"
            />

            <button
              onClick={handleSaveHeight}
              disabled={savingHeight}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold text-white text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingHeight ? "Salvando..." : "Salvar altura"}
            </button>
          </div>

          {/* FORM DADOS AUXILIARES */}
          <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">
              Dados para previsão
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Altura do pai (cm)</label>
                <input
                  type="number"
                  value={profile.fatherHeight ?? ""}
                  onChange={(e) =>
                    setProfile((old) => ({
                      ...old,
                      fatherHeight: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">
                  Altura da mãe (cm)
                </label>
                <input
                  type="number"
                  value={profile.motherHeight ?? ""}
                  onChange={(e) =>
                    setProfile((old) => ({
                      ...old,
                      motherHeight: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Sexo do atleta</label>
                <select
                  value={profile.sex ?? ""}
                  onChange={(e) =>
                    setProfile((old) => ({
                      ...old,
                      sex: e.target.value ? (e.target.value as Sex) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfileExtras}
              disabled={savingProfile}
              className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold text-white text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingProfile ? "Salvando..." : "Salvar dados de previsão"}
            </button>

            <p className="text-xs text-gray-400 mt-2">
              Esses dados são usados apenas para estimar altura adulta pelo
              modelo clínico (MPH). Você pode alterá-los a qualquer momento.
            </p>
          </div>
        </div>
      )}

      {tab === "historico" && (
        <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">
            Histórico de Medidas
          </h2>

          {loadingHistory && <p className="text-gray-400">Carregando...</p>}

          {!loadingHistory && history.length === 0 && (
            <p className="text-gray-400">Nenhuma altura registrada ainda.</p>
          )}

          {!loadingHistory && history.length > 0 && (
            <div className="space-y-4">
              {history.map((h) => {
                const d = parseDate(h.date);
                const age =
                  birthDateObj && d ? diffYears(birthDateObj, d) : null;

                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-white font-bold text-lg">
                        {h.height} cm
                      </p>
                      <p className="text-xs text-gray-400">
                        Data: {h.date}
                      </p>
                      <p className="text-xs text-gray-400">
                        Idade:{" "}
                        {age != null ? age.toFixed(1).replace(".", ",") : "–"}{" "}
                        anos
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-2 rounded-full hover:bg-red-500/10 text-red-400 hover:text-red-300 transition"
                      title="Excluir medida"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
