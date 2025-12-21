import React, { useEffect, useMemo, useRef, useState } from "react";
import { VideoVerticalJumpPayload, JUMP_TYPES, JumpType } from "../types/VerticalJump";
import { Pause, Play, RotateCcw, RotateCw, Video } from "lucide-react";
import { uploadJumpClipToStorage, uploadJumpThumbnailToStorage } from "../firebase/storage";
import { useAuth } from "../contexts/AuthContext";

declare global {
  interface HTMLMediaElement {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  }
}

type Props = {
  userId: string;  
  saving?: boolean;
  onSave: (payload: VideoVerticalJumpPayload) => void;
};

type Unit = "cm" | "in";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(t: number) {
  if (!Number.isFinite(t)) return "0.00s";
  return `${t.toFixed(2)}s`;
}

// Fórmula física: h = g * t^2 / 8  (resultado em cm)
function heightFromHangTimeSeconds(hangTimeSeconds: number) {
  const g = 9.81;
  const hMeters = (g * hangTimeSeconds * hangTimeSeconds) / 8;
  return hMeters * 100;
}

function getVideoCaptureStream(videoEl: HTMLVideoElement): MediaStream | null {
  // prefer captureStream, fallback mozCaptureStream
  const cs = videoEl.captureStream?.bind(videoEl);
  const moz = (videoEl as any).mozCaptureStream?.bind(videoEl) as
    | (() => MediaStream)
    | undefined;

  try {
    return cs?.() ?? moz?.() ?? null;
  } catch {
    return null;
  }
}

/**
 * 🎬 Recorta o trecho do salto (decolagem → pouso) gravando o stream do vídeo.
 * - Não "corta" o arquivo original; grava um novo clipe.
 * - Funciona em browsers que suportam captureStream + MediaRecorder.
 * - Se não suportar, retorna null (não quebra o fluxo).
 */
async function extractJumpClip(
  videoEl: HTMLVideoElement,
  startSec: number,
  endSec: number
): Promise<Blob | null> {
  const stream = getVideoCaptureStream(videoEl);
  if (!stream) return null;
  if (typeof MediaRecorder === "undefined") return null;

  const BUFFER = 0.25;
  const from = Math.max(0, startSec - BUFFER);
  const to = Math.max(from, endSec + BUFFER);

  if (!Number.isFinite(to - from) || to <= from) return null;

  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  const mimeType =
    candidates.find((m) => {
      try {
        return MediaRecorder.isTypeSupported(m);
      } catch {
        return false;
      }
    }) ?? "";

  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined
  );

  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  // pausa e posiciona
  videoEl.pause();
  videoEl.currentTime = from;

  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      videoEl.removeEventListener("seeked", onSeeked);
      resolve();
    };
    videoEl.addEventListener("seeked", onSeeked);
  });

  recorder.start();

  await videoEl.play();

  // 🔥 CONTROLE REAL PELO currentTime (ESSA É A CHAVE)
  await new Promise<void>((resolve) => {
    const checkTime = () => {
      if (videoEl.currentTime >= to) {
        resolve();
      } else {
        requestAnimationFrame(checkTime);
      }
    };
    checkTime();
  });

  videoEl.pause();
  recorder.stop();

  await new Promise<void>((r) => (recorder.onstop = () => r()));

  if (!chunks.length) return null;

  return new Blob(chunks, {
    type: recorder.mimeType || "video/webm",
  });
}

async function generateJumpThumbnail(
  videoEl: HTMLVideoElement,
  atTime: number
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // posiciona no frame desejado
  videoEl.pause();
  videoEl.currentTime = atTime;

  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      videoEl.removeEventListener("seeked", onSeeked);
      resolve();
    };
    videoEl.addEventListener("seeked", onSeeked);
  });

  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      0.85 // qualidade
    );
  });
}

export default function VideoVerticalJump({ userId, saving, onSave }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [fileInputKey, setFileInputKey] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const [date, setDate] = useState("");
  const [jumpType, setJumpType] = useState<JumpType | null>(null);

  const [fpsInput, setFpsInput] = useState("120");
  const [unit, setUnit] = useState<Unit>("cm");

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [takeOffTime, setTakeOffTime] = useState<number | null>(null);
  const [landingTime, setLandingTime] = useState<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const [savingLocal, setSavingLocal] = useState(false);

  const fps = useMemo(() => {
    const n = Number(fpsInput);
    return Number.isFinite(n) && n > 0 ? n : 120;
  }, [fpsInput]);

  // 🔁 Vídeo de exemplo (troque depois por um asset seu)
  const EXAMPLE_URL =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

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
    return jumpHeightCm / 2.54;
  }, [jumpHeightCm, unit]);

  function validateForCalcOrSave() {
    if (!videoFile) return "Selecione um vídeo.";
    if (!date) return "Informe a data da medição.";
    if (!jumpType) return "Selecione o tipo de salto.";
    if (takeOffTime == null || landingTime == null)
      return "Marque Decolagem e Pouso.";
    if (!hangTime || !jumpHeightCm) return "Tempo de voo inválido.";
    return null;
  }

  function handleCalculate() {
    const err = validateForCalcOrSave();
    if (err) {
      alert(err);
      return;
    }
    setCalculated(true);
  }

  /**
   * ✅ Agora o Salvar é async, e se possível anexa clipBlob (trecho do salto)
   */
  async function handleSave() {
    const err = validateForCalcOrSave();
    if (err) {
      alert(err);
      return;
    }
  
    const videoEl = videoRef.current;
    if (!videoEl) {
      alert("Player de vídeo não encontrado.");
      return;
    }
    
  
    try {
      setSavingLocal(true);
  
      let clipUrl: string | undefined = undefined;
      let thumbnailUrl: string | undefined = undefined;
  
      // 1️⃣ Gerar clipe entre Decolagem → Pouso
      if (takeOffTime != null && landingTime != null) {
        try {
          const clipBlob = await extractJumpClip(
            videoEl,        // ✅ SEMPRE o ref
            takeOffTime,
            landingTime
          );
      
          let thumbnailUrl: string | undefined;

          if (clipBlob && userId) {
            clipUrl = await uploadJumpClipToStorage(userId, clipBlob);
          
            // 📸 thumbnail no meio do voo
            const midTime = (takeOffTime! + landingTime!) / 2;
          
            const thumbBlob = await generateJumpThumbnail(videoEl, midTime);
          
            if (thumbBlob) {
              thumbnailUrl = await uploadJumpThumbnailToStorage(
                userId,
                thumbBlob
              );
            }
          }
                    
        } catch (e) {
          console.warn("Falha ao gerar/upload do clipe:", e);
        }
      }
      
      const v = getVideo();
      if (!v) return;

      const videoMeta = {
        duration: v.duration,
        width: v.videoWidth,
        height: v.videoHeight,
        fps,
        browser: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
      };
      
      // 2️⃣ Enviar dados consolidados para o SaltoAtleta → Firestore
      onSave({
        date,
        jumpType: jumpType as JumpType,
        videoUrl, // URL local do vídeo completo (preview / auditoria)
        takeOffTime: takeOffTime!,
        landingTime: landingTime!,
        hangTime: hangTime!,
        jumpHeight: jumpHeightCm!, // SEMPRE EM CM
        fps,
        clipUrl, // ✅ AGORA FUNCIONA
        thumbnailUrl,
        videoMeta,
      });
  
    } finally {
      setSavingLocal(false);
    }
  }
  
  async function loadExample() {
    try {
      const res = await fetch(EXAMPLE_URL);
      const blob = await res.blob();
      const file = new File([blob], "exemplo.mp4", {
        type: blob.type || "video/mp4",
      });

      setVideoFile(file);
      setTakeOffTime(null);
      setLandingTime(null);
      setCalculated(false);
    } catch (e) {
      console.error(e);
      alert("Não foi possível carregar o vídeo de exemplo. Verifique a URL.");
    }
  }

  const isSaving = Boolean(saving || savingLocal);

  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Medição por Vídeo</h2>
        <p className="text-sm text-gray-400">
          Use <b>±1 frame</b> para precisão. Marque <b>Decolagem</b> e{" "}
          <b>Pouso</b>, clique em <b>Calcular</b>.
        </p>
      </div>

      {/* Top controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">

        <div className="grid grid-cols-1 gap-2">
        {/* Tipo de Salto */}
        <div className="space-y-1">
          {/*<label className="text-xs text-gray-400">Tipo de Salto</label>*/}
          <select
            value={jumpType ?? ""}
            onChange={(e) => setJumpType(e.target.value as JumpType)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm"
          >
            {/* Placeholder descritivo (não selecionável) */}
            <option value="" disabled>
              Selecione o tipo de salto (ex: ataque, bloqueio, vertical)
            </option>

            {JUMP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>


        {/* Data + Unidade */}
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
      </div>

      {/* ================== VÍDEO ================== */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Selecionar vídeo */}
        <label className="md:col-span-2 flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-gray-800/40 transition">
          <input
            key={fileInputKey}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              setVideoFile(e.target.files?.[0] ?? null);
              setTakeOffTime(null);
              setLandingTime(null);
              setCalculated(false);
            }}
          />

          <div className="flex items-center gap-2 text-orange-400">
            <Video className="w-5 h-5" />
            <span className="font-semibold text-sm">
              {videoFile ? "Trocar vídeo do salto" : "Selecionar vídeo do salto"}
            </span>
          </div>

          <span className="text-xs text-gray-400 mt-1">
            MP4, MOV ou WEBM
          </span>
        </label>

        {/* Botões à direita */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={loadExample}
            className="h-20 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700 text-sm flex items-center justify-center text-center"
          >
            Vídeo de Exemplo
          </button>

          <button
            type="button"
            onClick={() => {
              setVideoFile(null);
              setTakeOffTime(null);
              setLandingTime(null);
              setCalculated(false);
              setFileInputKey((k) => k + 1);
            }}
            className="h-20 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700 text-sm flex items-center justify-center"
          >
            Limpar
          </button>
        </div>
      </div>

        </div>

        {/*<div className="space-y-2">

          <input
            value={fpsInput}
            onChange={(e) => setFpsInput(e.target.value)}
            placeholder="FPS (ex: 120)"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm"
          />

          <div className="text-xs text-gray-400">
            Dica: para <i>slow motion</i>, use 120/240 FPS.
          </div>
          </div>*/}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Video */}
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
                    setDuration(e.currentTarget.duration || 0);
                  }}
                  onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Overlay controls bar */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[min(720px,92%)]">
                  <div className="bg-gray-800/70 backdrop-blur-md border border-gray-600 rounded-2xl px-3 py-2 flex flex-col gap-2">
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
                          title="Reproduzir/Pausar"
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
                        <b>{currentTime.toFixed(2)}</b>s{" "}
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
                      <div className="flex gap-2">
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
                          className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
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
              <li>
                Se o vídeo estiver em câmera lenta, ajuste o FPS corretamente.
              </li>
              <li>
                Marque a <b>Decolagem</b> no último frame antes dos pés saírem do
                chão.
              </li>
              <li>
                Marque o <b>Pouso</b> no primeiro frame em que os pés tocam o
                chão novamente.
              </li>
              <li>FPS alto (120/240) aumenta a precisão do tempo de voo.</li>
              <li>
                Se você aterrissar com joelhos muito dobrados, o resultado pode
                variar.
              </li>
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
                {hangTime == null ? "—" : `${hangTime.toFixed(2)}s`}
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
                <span className="text-2xl text-gray-300 ml-1">{unit}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Clique em <b>Calcular</b> para atualizar o resultado.
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            {isSaving ? "Salvando..." : "Salvar Salto"}
          </button>

          <div className="text-xs text-gray-400">
            O valor salvo é sempre em <b>cm</b> (padrão do sistema). A
            visualização em polegadas é apenas UI.
          </div>

          <div className="text-[11px] text-gray-500">
            Obs.: o clipe do salto (Decolagem → Pouso) é anexado somente se o
            navegador suportar gravação do stream do vídeo.
          </div>
        </div>
      </div>
    </div>
  );
}
