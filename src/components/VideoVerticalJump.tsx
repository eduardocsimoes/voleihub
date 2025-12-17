import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, UploadCloud, Trash2 } from "lucide-react";
import { VideoVerticalJumpPayload } from "../types/VerticalJump";

type Props = {
  saving?: boolean;
  onSave: (payload: VideoVerticalJumpPayload) => void;
};

type Unit = "cm" | "in";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(t: number) {
  if (!Number.isFinite(t)) return "0,00s";
  // pt-BR: vírgula
  return `${t.toFixed(2).replace(".", ",")}s`;
}

// Física: h = g * t^2 / 8
function heightFromHangTimeSeconds(hangTimeSeconds: number) {
  const g = 9.81;
  const hMeters = (g * hangTimeSeconds * hangTimeSeconds) / 8;
  return hMeters * 100; // cm
}

function toPtDecimal(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(digits).replace(".", ",");
}

export default function VideoVerticalJump({ saving, onSave }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const [date, setDate] = useState("");
  const [fpsInput, setFpsInput] = useState("120");
  const [unit, setUnit] = useState<Unit>("cm");

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [takeOffTime, setTakeOffTime] = useState<number | null>(null);
  const [landingTime, setLandingTime] = useState<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [calculated, setCalculated] = useState(false);

  // Permite que o usuário carregue um exemplo (você pode trocar por um asset seu)
  const EXAMPLE_URL =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  const fps = useMemo(() => {
    const n = Number(fpsInput);
    return Number.isFinite(n) && n > 0 ? n : 120;
  }, [fpsInput]);

  useEffect(() => {
    if (!videoFile) {
      setVideoUrl("");
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  function getVideo() {
    return videoRef.current;
  }

  function seekTo(t: number) {
    const v = getVideo();
    if (!v) return;
    const max = duration || v.duration || 0;
    const next = clamp(t, 0, max);
    v.currentTime = next;
    setCurrentTime(next);
  }

  function stepSeconds(delta: number) {
    seekTo(currentTime + delta);
  }

  function stepFrame(deltaFrames: number) {
    const step = 1 / fps;
    seekTo(currentTime + deltaFrames * step);
  }

  async function togglePlay() {
    const v = getVideo();
    if (!v) return;

    try {
      if (v.paused) {
        await v.play();
        setIsPlaying(true);
      } else {
        v.pause();
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(!v.paused);
    }
  }

  function resetMarks() {
    setTakeOffTime(null);
    setLandingTime(null);
    setCalculated(false);
  }

  function clearAll() {
    setVideoFile(null);
    setVideoUrl("");
    setDate("");
    setFpsInput("120");
    setUnit("cm");
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    resetMarks();
  }

  function handleTakeOff() {
    setTakeOffTime(currentTime);
    setCalculated(false);
  }

  function handleLanding() {
    setLandingTime(currentTime);
    setCalculated(false);
  }

  function handleShowTakeOff() {
    if (takeOffTime == null) return;
    seekTo(takeOffTime);
  }

  function handleShowLanding() {
    if (landingTime == null) return;
    seekTo(landingTime);
  }

  const hangTime = useMemo(() => {
    if (takeOffTime == null || landingTime == null) return null;
    const t = landingTime - takeOffTime;
    return t > 0 ? t : null;
  }, [takeOffTime, landingTime]);

  const jumpHeightCm = useMemo(() => {
    if (!hangTime) return null;
    return heightFromHangTimeSeconds(hangTime);
  }, [hangTime]);

  const jumpHeightDisplay = useMemo(() => {
    if (!jumpHeightCm) return null;
    if (unit === "cm") return jumpHeightCm;
    return jumpHeightCm / 2.54; // polegadas
  }, [jumpHeightCm, unit]);

  const canCalculate = useMemo(() => {
    return !!videoFile && !!date && takeOffTime != null && landingTime != null;
  }, [videoFile, date, takeOffTime, landingTime]);

  function validateForCalculate(): { ok: boolean; message?: string } {
    if (!videoFile) return { ok: false, message: "Selecione um vídeo." };
    if (!date) return { ok: false, message: "Informe a data da medição." };
    if (takeOffTime == null || landingTime == null)
      return { ok: false, message: "Marque Decolagem e Pouso." };
    if (!hangTime || !jumpHeightCm) return { ok: false, message: "Tempo de voo inválido." };
    return { ok: true };
  }

  function handleCalculate() {
    const v = validateForCalculate();
    if (!v.ok) {
      alert(v.message);
      return;
    }
    setCalculated(true);
  }

  function handleSave() {
    const v = validateForCalculate();
    if (!v.ok) {
      alert(v.message);
      return;
    }

    // ✅ Salvar chama onSave de verdade (é o que o SaltoAtleta espera)
    onSave({
      date,
      takeOffTime: takeOffTime!,
      landingTime: landingTime!,
      hangTime: hangTime!,
      jumpHeight: jumpHeightCm!, // sempre em cm no payload
      fps,
      videoFile: videoFile!,
    });
  }

  async function loadExample() {
    try {
      const res = await fetch(EXAMPLE_URL);
      const blob = await res.blob();
      const file = new File([blob], "exemplo.mp4", { type: blob.type || "video/mp4" });
      setVideoFile(file);
      resetMarks();
      // mantém date/fps/unit como estão para não “bagunçar” a UI do usuário
    } catch (e) {
      console.error(e);
      alert("Não foi possível carregar o vídeo de exemplo. Verifique a URL.");
    }
  }

  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Medição por Vídeo</h2>
        <p className="text-sm text-gray-400">
          Use <b>±1 frame</b> para precisão. Marque <b>Decolagem</b> e <b>Pouso</b>, clique em{" "}
          <b>Calcular</b>.
        </p>
      </div>

      {/* Top controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: upload / example / clear */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1">
              <div className="text-xs text-gray-300 mb-1">Vídeo</div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setVideoFile(f);
                      resetMarks();
                      // não mexe em date/fps/unit
                    }}
                    className="w-full text-sm text-gray-300
                               file:mr-3 file:px-4 file:py-2 file:rounded-xl
                               file:bg-gray-800 file:border file:border-gray-600
                               file:text-gray-200 hover:file:bg-gray-700
                               file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            </label>

            <div className="flex gap-2 items-end">
              <button
                type="button"
                onClick={loadExample}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                Vídeo de Exemplo
              </button>

              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Right: date / unit / fps */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm"
            >
              <option value="cm">cm</option>
              <option value="in">polegadas</option>
            </select>
          </div>

          <input
            value={fpsInput}
            onChange={(e) => setFpsInput(e.target.value)}
            placeholder="FPS (ex: 120)"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm"
          />

          <div className="text-xs text-gray-400">
            Dica: para <i>slow motion</i>, use 120/240 FPS.
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Video column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-700">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full max-h-[520px] object-contain bg-black"
                  controls={false}
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration || 0;
                    setDuration(d);
                    // garante currentTime válido
                    setCurrentTime((prev) => clamp(prev, 0, d || 0));
                  }}
                  onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Overlay controls bar */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[min(720px,92%)]">
                  <div className="bg-gray-800/70 backdrop-blur-md border border-gray-600 rounded-2xl px-3 py-2 flex flex-col gap-2 shadow-2xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => stepFrame(-1)}
                          className="p-2 rounded-lg bg-gray-900/60 hover:bg-gray-900 border border-gray-600"
                          title="Voltar 1 frame"
                        >
                          <RotateCcw className="w-4 h-4 text-gray-200" />
                        </button>

                        <button
                          type="button"
                          onClick={togglePlay}
                          className="p-2 rounded-lg bg-gray-900/60 hover:bg-gray-900 border border-gray-600"
                          title="Play/Pause"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-gray-200" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-200" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => stepFrame(1)}
                          className="p-2 rounded-lg bg-gray-900/60 hover:bg-gray-900 border border-gray-600"
                          title="Avançar 1 frame"
                        >
                          <RotateCw className="w-4 h-4 text-gray-200" />
                        </button>
                      </div>

                      <div className="text-xs text-gray-200">
                        <span className="text-gray-400">tempo:</span>{" "}
                        <b>{toPtDecimal(currentTime, 2)}</b>s{" "}
                        <span className="text-gray-400 ml-3">fps:</span>{" "}
                        <b>{fps}</b>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.001}
                      value={currentTime}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      className="w-full"
                      disabled={!duration}
                    />

                    <div className="flex flex-wrap gap-2 justify-between">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => stepSeconds(-0.01)}
                          className="px-3 py-2 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-600 text-gray-200 text-sm"
                        >
                          -0,01s
                        </button>
                        <button
                          type="button"
                          onClick={() => stepSeconds(0.01)}
                          className="px-3 py-2 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-600 text-gray-200 text-sm"
                        >
                          +0,01s
                        </button>
                        <button
                          type="button"
                          onClick={() => stepFrame(-1)}
                          className="px-3 py-2 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-600 text-gray-200 text-sm"
                        >
                          -1 frame
                        </button>
                        <button
                          type="button"
                          onClick={() => stepFrame(1)}
                          className="px-3 py-2 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-600 text-gray-200 text-sm"
                        >
                          +1 frame
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleTakeOff}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                        >
                          Decolagem
                        </button>
                        <button
                          type="button"
                          onClick={handleLanding}
                          className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
                        >
                          Pouso
                        </button>
                        <button
                          type="button"
                          onClick={handleCalculate}
                          className={`px-3 py-2 rounded-xl text-white text-sm font-semibold ${
                            canCalculate
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-orange-500/40 cursor-not-allowed"
                          }`}
                          disabled={!canCalculate}
                        >
                          Calcular
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                Carregue um vídeo para começar
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-2">
              Como garantir uma medição correta
            </h3>
            <ul className="text-sm text-gray-300 list-disc pl-5 space-y-2">
              <li>Se o vídeo estiver em câmera lenta, ajuste o FPS corretamente.</li>
              <li>
                Marque a <b>Decolagem</b> no último frame antes dos pés saírem do chão.
              </li>
              <li>
                Marque o <b>Pouso</b> no primeiro frame em que os pés tocam o chão novamente.
              </li>
              <li>FPS alto (120/240) aumenta a precisão do tempo de voo.</li>
              <li>Se você aterrissar com joelhos muito dobrados, o resultado pode variar.</li>
            </ul>
          </div>
        </div>

        {/* Analysis panel */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-lg">
            Análise do Salto Vertical
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Tempo na Decolagem</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">
                  {takeOffTime == null ? "—" : formatTime(takeOffTime)}
                </span>
                <button
                  type="button"
                  onClick={handleShowTakeOff}
                  disabled={takeOffTime == null}
                  className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                >
                  Mostrar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Tempo no Pouso</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">
                  {landingTime == null ? "—" : formatTime(landingTime)}
                </span>
                <button
                  type="button"
                  onClick={handleShowLanding}
                  disabled={landingTime == null}
                  className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                >
                  Mostrar
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-3">
              <span className="text-gray-300">Tempo de Voo</span>
              <span className="text-white font-semibold">
                {hangTime == null ? "—" : `${toPtDecimal(hangTime, 2)}s`}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-end justify-between">
              <div className="text-sm text-gray-300">Resultado</div>
              <div className="text-6xl font-bold text-white leading-none">
                {calculated && jumpHeightDisplay != null
                  ? Math.round(jumpHeightDisplay)
                  : 0}
                <span className="text-2xl text-gray-300 ml-1">
                  {unit === "cm" ? "cm" : "pol"}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-2">
              Clique em <b>Calcular</b> para atualizar o resultado.
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar Salto"}
          </button>

          <div className="text-xs text-gray-400">
            O valor salvo é sempre em <b>cm</b> (padrão do sistema). A visualização em
            polegadas é apenas UI.
          </div>
        </div>
      </div>
    </div>
  );
}
