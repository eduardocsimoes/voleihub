import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../../firebase/config";
import {
  getUserProfile,
  addVerticalJumpFromVideo,
  getVerticalJumpHistoryUnified,
  deleteVerticalJumpUnified,
  UnifiedVerticalJumpRecord,
} from "../../firebase/firestore";

import { Trash2, Video, Play } from "lucide-react";
import { VideoVerticalJumpPayload } from "../../types/VerticalJump";
import VideoVerticalJump from "../../components/VideoVerticalJump";
import { deleteJumpClipFromStorage } from "../../firebase/storage";

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

function groupJumpsByType(records: UnifiedVerticalJumpRecord[]) {
  return records.reduce<Record<string, UnifiedVerticalJumpRecord[]>>(
    (acc, record) => {
      if (!acc[record.jumpType]) {
        acc[record.jumpType] = [];
      }
      acc[record.jumpType].push(record);
      return acc;
    },
    {}
  );
}

export default function SaltoAtleta() {
  const [activeTab, setActiveTab] = useState<SaltoTab>("resumo");

  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<UnifiedVerticalJumpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVideo, setSavingVideo] = useState(false);

  const groupedByType = useMemo(() => {
    return groupJumpsByType(history);
  }, [history]);
  
  // modal de vídeo
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);

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
  
        if (!mounted) return;
  
        setProfile(prof);
        setHistory(hist);
        setLoading(false);
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
     SALVAR VÍDEO
  ========================== */
  async function handleSaveVideo(payload: VideoVerticalJumpPayload) {
    const uid = auth.currentUser?.uid;
    if (!uid || !profile) return;

    try {
      setSavingVideo(true);

      await addVerticalJumpFromVideo(uid, {
        date: payload.date,
        jumpType: payload.jumpType,
        sex: profile.sex ?? "M",
        birthDate: profile.birthDate,

        clipUrl: payload.clipUrl,

        fps: payload.fps,
        takeOffTime: payload.takeOffTime,
        landingTime: payload.landingTime,
        hangTime: payload.hangTime,
        jumpHeight: payload.jumpHeight,
        videoMeta: payload.videoMeta,
      });

      setHistory(await getVerticalJumpHistoryUnified(uid));
      setActiveTab("historico");
    } finally {
      setSavingVideo(false);
    }
  }

  /* =========================
     DELETE (Firestore + Storage)
  ========================== */
  async function handleDelete(jump: UnifiedVerticalJumpRecord) {
    if (!confirm("Excluir este salto?")) return;

    try {
      if (jump.video?.clipUrl) {
        await deleteJumpClipFromStorage(jump.video.clipUrl);
      }

      await deleteVerticalJumpUnified(jump.id);

      const uid = auth.currentUser?.uid;
      if (!uid) return;

      setHistory(await getVerticalJumpHistoryUnified(uid));
    } catch (e) {
      console.error("Erro ao excluir salto:", e);
      alert("Erro ao excluir o salto.");
    }
  }

  /* =========================
     GRÁFICO
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
      <h1 className="text-3xl font-bold text-white">Salto Vertical</h1>

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
        <VideoVerticalJump
          userId={auth.currentUser!.uid}
          saving={savingVideo}
          onSave={handleSaveVideo}
        />
      )}

      {/* ================= HISTÓRICO ================= */}
      {activeTab === "historico" &&
        history.map((h) => (
          <div
            key={h.id}
            className="flex justify-between items-center bg-gray-800 p-4 rounded"
          >
            <div className="flex items-center gap-4">
            {h.video?.thumbnailUrl ? (
              <img
                src={h.video.thumbnailUrl}
                alt="Thumbnail do salto"
                className="w-24 h-16 object-cover rounded border border-gray-700"
              />
            ) : h.video?.clipUrl ? (
              <video
                src={h.video.clipUrl}
                className="w-24 h-16 object-cover rounded border border-gray-700"
                muted
              />
            ) : (
              <div className="w-24 h-16 bg-gray-700 rounded flex items-center justify-center">
                <Video className="text-gray-400" />
              </div>
            )}

              <div>
                <p className="text-white font-bold">
                  {h.jumpHeight.toFixed(1)} cm
                </p>
                <p className="text-xs text-gray-400">
                  {h.measurementType} • {h.date}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {h.video?.clipUrl && (
                <button
                  onClick={() => setVideoModalUrl(h.video!.clipUrl!)}
                  className="text-orange-400 hover:text-orange-300"
                  title="Ver vídeo"
                >
                  <Play />
                </button>
              )}

              <button
                onClick={() => handleDelete(h)}
                className="text-red-400"
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}

      {/* ================= MODAL VÍDEO ================= */}
      {videoModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setVideoModalUrl(null)} // clique fora fecha
        >
          <div
            className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-[90vw] max-w-4xl"
            onClick={(e) => e.stopPropagation()} // impede fechar ao clicar no vídeo
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="text-white font-semibold text-sm">
                Visualização do Salto
              </h3>

              <button
                onClick={() => setVideoModalUrl(null)}
                className="text-gray-400 hover:text-white text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {/* Vídeo */}
            <div className="p-4">
              <video
                src={videoModalUrl}
                controls
                autoPlay
                className="w-full max-h-[70vh] rounded-lg bg-black"
              />
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 text-right">
              <button
                onClick={() => setVideoModalUrl(null)}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
