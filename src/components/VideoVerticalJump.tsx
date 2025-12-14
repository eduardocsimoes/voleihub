import React, { useEffect, useMemo, useRef, useState } from "react";
import { VideoVerticalJumpPayload } from "../types/VerticalJump";

type Props = {
  saving?: boolean;
  onSave: (payload: VideoVerticalJumpPayload) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function VideoVerticalJump({ saving, onSave }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  const [date, setDate] = useState("");
  const [fpsInput, setFpsInput] = useState("60");

  const fps = useMemo(() => {
    const n = Number(fpsInput);
    return Number.isFinite(n) && n > 0 ? n : 60;
  }, [fpsInput]);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [takeOffTime, setTakeOffTime] = useState<number | null>(null);
  const [landingTime, setLandingTime] = useState<number | null>(null);

  useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  function seekTo(t: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = clamp(t, 0, duration || v.duration || 0);
    setCurrentTime(v.currentTime);
  }

  const hangTime = useMemo(() => {
    if (takeOffTime == null || landingTime == null) return null;
    const t = landingTime - takeOffTime;
    return t > 0 ? t : null;
  }, [takeOffTime, landingTime]);

  const jumpHeight = useMemo(() => {
    if (!hangTime) return null;
    const g = 9.81;
    return (g * hangTime * hangTime) / 8 * 100;
  }, [hangTime]);

  function handleSave() {
    if (!videoFile || !date || takeOffTime == null || landingTime == null || !hangTime || !jumpHeight) {
      alert("Dados incompletos.");
      return;
    }

    onSave({
      date,
      takeOffTime,
      landingTime,
      hangTime,
      jumpHeight,
      fps,
      videoFile,
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
      <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input value={fpsInput} onChange={(e) => setFpsInput(e.target.value)} />

      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        />
      )}

      <button onClick={() => setTakeOffTime(currentTime)}>Take-off</button>
      <button onClick={() => setLandingTime(currentTime)}>Landing</button>

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar Salto"}
      </button>
    </div>
  );
}
