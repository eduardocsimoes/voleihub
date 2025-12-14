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

  const [reachStanding, setReachStanding] = useState("");
  const [reachJump, setReachJump] = useState("");
  const [date, setDate] = useState("");

  const [savingVideo, setSavingVideo] = useState(false);

  useEffect(() => {
    async function load() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      setProfile(await getUserProfile(uid));
      setHistory(await getVerticalJumpHistoryUnified(uid));
      setLoading(false);
    }
    load();
  }, []);

  const bestJump = useMemo(() => {
    if (!history.length) return null;
    return history.reduce((a, b) =>
      b.jumpHeight > a.jumpHeight ? b : a
    );
  }, [history]);

  const chartData = {
    datasets: [
      {
        label: "Salto Vertical (cm)",
        data: history.map((h, i) => ({
          x: i + 1,
          y: h.jumpHeight,
        })),
        borderColor: "#f97316",
        pointBackgroundColor: "#f97316",
        tension: 0.3,
      },
    ],
  };

  async function handleSaveManual() {
    const uid = auth.currentUser?.uid;
    if (!uid || !profile) return;

    const rs = Number(reachStanding);
    const rj = Number(reachJump);

    if (!date || rj <= rs) {
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
  }

  async function handleSaveVideo(payload: VideoVerticalJumpPayload) {
    const uid = auth.currentUser?.uid;
    if (!uid || !profile) return;
  
    try {
      setSavingVideo(true);
  
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
  
      const hist = await getVerticalJumpHistoryUnified(uid);
      setHistory(hist);
    } finally {
      setSavingVideo(false);
    }
  }
  
  
  async function handleDelete(id: string) {
    if (!confirm("Excluir este salto?")) return;
    await deleteVerticalJumpUnified(id);

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setHistory(await getVerticalJumpHistoryUnified(uid));
  }

  if (loading) return <p className="text-gray-400">Carregando...</p>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      <h1 className="text-3xl font-bold text-white">
        Salto Vertical
      </h1>

      {/* Tabs */}
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

      {activeTab === "cadastro" && (
        <>
          <div className="flex gap-4">
            <button
              onClick={() => setRegisterMode("manual")}
              className={`btn ${
                registerMode === "manual"
                  ? "bg-orange-500 text-white"
                  : ""
              }`}
            >
              <Ruler size={16} /> Manual
            </button>

            <button
              onClick={() => setRegisterMode("video")}
              className={`btn ${
                registerMode === "video"
                  ? "bg-orange-500 text-white"
                  : ""
              }`}
            >
              <Video size={16} /> Vídeo
            </button>
          </div>

          {registerMode === "video" && (
            <VideoVerticalJump
              saving={savingVideo}
              onSave={handleSaveVideo}
            />
          )}
        </>
      )}

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
                {h.measurementType}
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
