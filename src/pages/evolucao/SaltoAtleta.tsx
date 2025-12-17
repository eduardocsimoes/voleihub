import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase/config";
import {
  getUserProfile,
  addVerticalJumpManual,
  addVerticalJumpFromVideo,
  getVerticalJumpHistoryUnified,
  deleteVerticalJumpUnified,
  UnifiedVerticalJumpRecord,
} from "../../firebase/firestore";

import { Trash2, Video, Ruler } from "lucide-react";
import { VideoVerticalJumpPayload } from "../../types/VerticalJump";
import VideoVerticalJump from "../../components/VideoVerticalJump";

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type SaltoTab = "resumo" | "cadastro" | "historico";
type RegisterMode = "manual" | "video";

export default function SaltoAtleta() {
  const [activeTab, setActiveTab] = useState<SaltoTab>("resumo");
  const [registerMode, setRegisterMode] =
    useState<RegisterMode>("manual");

  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] =
    useState<UnifiedVerticalJumpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual
  const [reachStanding, setReachStanding] = useState("");
  const [reachJump, setReachJump] = useState("");
  const [date, setDate] = useState("");

  // Vídeo
  const [savingVideo, setSavingVideo] = useState(false);

  /* =========================
     LOAD INICIAL
  ========================== */
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          if (mounted) setLoading(false);
          return;
        }

        const prof = await getUserProfile(uid);
        const hist = await getVerticalJumpHistoryUnified(uid);

        if (mounted) {
          setProfile(prof);
          setHistory(hist);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar salto:", error);
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     SALVAR MANUAL
  ========================== */
  async function handleSaveManual() {
    const uid = auth.currentUser?.uid;
    if (!uid || !profile) return;

    const rs = Number(reachStanding);
    const rj = Number(reachJump);

    if (!date || rs <= 0 || rj <= rs) {
      alert("Dados inválidos.");
      return;
    }

    await addVerticalJumpManual(uid, {
      date,
      sex: profile.sex ?? "M",
      birthDate: profile.birthDate,
      reachStanding: rs,
      reachJump: rj,
    });

    setHistory(await getVerticalJumpHistoryUnified(uid));
    setReachStanding("");
    setReachJump("");
    setDate("");
  }

  /* =========================
     SALVAR VÍDEO
  ========================== */
  async function handleSaveVideo(payload: VideoVerticalJumpPayload) {
    const uid = auth.currentUser?.uid;
    if (!uid || !profile) return;

    try {
      setSavingVideo(true);

      // ⚠️ provisório (Storage depois)
      const fakeVideoUrl = URL.createObjectURL(payload.videoFile);

      await addVerticalJumpFromVideo(uid, {
        date: payload.date,
        sex: profile.sex ?? "M",
        birthDate: profile.birthDate,
        videoUrl: fakeVideoUrl,
        fps: payload.fps,
        takeOffTime: payload.takeOffTime,
        landingTime: payload.landingTime,
        hangTime: payload.hangTime,
        jumpHeight: payload.jumpHeight,
      });

      setHistory(await getVerticalJumpHistoryUnified(uid));
    } finally {
      setSavingVideo(false);
    }
  }

  /* =========================
     DELETE
  ========================== */
  async function handleDelete(id: string) {
    if (!confirm("Excluir este salto?")) return;
    await deleteVerticalJumpUnified(id);

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setHistory(await getVerticalJumpHistoryUnified(uid));
  }

  /* =========================
     DERIVAÇÕES
  ========================== */
  const chartData = useMemo(() => {
    const sorted = [...history].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return {
      labels: sorted.map((h) => h.date),
      datasets: [
        {
          label: "Altura do Salto (cm)",
          data: sorted.map((h) => h.jumpHeight),
          borderColor: "#f97316",
          backgroundColor: "rgba(249,115,22,0.2)",
        },
      ],
    };
  }, [history]);

  if (loading) {
    return <p className="text-gray-400">Carregando...</p>;
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      <h1 className="text-3xl font-bold text-white">
        Salto Vertical
      </h1>

      {/* TABS */}
      <div className="flex gap-3 border-b border-gray-800">
        {["resumo", "cadastro", "historico"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as SaltoTab)}
            className={`px-4 py-2 ${
              activeTab === t
                ? "text-white border-b-2 border-orange-500"
                : "text-gray-400"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= RESUMO ================= */}
      {activeTab === "resumo" && (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          {history.length === 0 ? (
            <p className="text-gray-400">
              Nenhum salto registrado ainda.
            </p>
          ) : (
            <Line data={chartData} />
          )}
        </div>
      )}

      {/* ================= CADASTRO ================= */}
      {activeTab === "cadastro" && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => setRegisterMode("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                registerMode === "manual"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              <Ruler size={16} /> Manual
            </button>

            <button
              onClick={() => setRegisterMode("video")}
              className={`flex items-center gap-2 px-4 py-2 rounded ${
                registerMode === "video"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              <Video size={16} /> Vídeo
            </button>
          </div>

          {registerMode === "manual" && (
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
              <input
                placeholder="Alcance em pé (cm)"
                value={reachStanding}
                onChange={(e) => setReachStanding(e.target.value)}
                className="input"
              />
              <input
                placeholder="Alcance no salto (cm)"
                value={reachJump}
                onChange={(e) => setReachJump(e.target.value)}
                className="input"
              />

              <button
                onClick={handleSaveManual}
                className="bg-orange-500 px-4 py-2 rounded text-white"
              >
                Salvar Salto Manual
              </button>
            </div>
          )}

          {registerMode === "video" && (
            <VideoVerticalJump
              saving={savingVideo}
              onSave={handleSaveVideo}
            />
          )}
        </div>
      )}

      {/* ================= HISTÓRICO ================= */}
      {activeTab === "historico" &&
        history.map((h) => (
          <div
            key={h.id}
            className="flex justify-between items-center bg-gray-800 p-4 rounded"
          >
            <div>
              <p className="text-white font-bold">
                {h.jumpHeight.toFixed(1)} cm
              </p>
              <p className="text-xs text-gray-400">
                {h.measurementType} • {h.date}
              </p>
            </div>
            <button
              onClick={() => handleDelete(h.id)}
              className="text-red-400"
            >
              <Trash2 />
            </button>
          </div>
        ))}
    </div>
  );
}
