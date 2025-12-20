export type MeasurementType = "video" | "manual";

/* =========================
   VÍDEO (DADOS TÉCNICOS)
========================= */
export interface VerticalJumpVideoData {
  url: string;               // vídeo original (upload futuro ou externo)
  clipUrl?: string;          // 🎬 clipe do salto (Decolagem → Pouso)

  fps: number;
  takeOffTime: number;
  landingTime: number;
  hangTime: number;

  calculationMethod: "flight_time";

  detection?: {
    takeOffSource: "manual" | "auto";
    landingSource: "manual" | "auto";
    confidence?: number; // 0–1
  };
}

/* =========================
   REGISTRO BASE (FIRESTORE)
========================= */
export interface VerticalJumpRecord {
  id: string;
  userId: string;
  date: string; // yyyy-mm-dd
  createdAt: any;

  sex: "M" | "F";
  birthDate?: string;

  jumpHeight: number; // sempre em cm

  reachStanding?: number;
  reachJump?: number;

  measurementType: MeasurementType;

  video?: VerticalJumpVideoData;

  manual?: {
    inputMethod: "reach_difference";
    evaluator?: string;
  };

  notes?: string;
}

/* =========================
   PAYLOAD DO COMPONENTE DE VÍDEO
========================= */
export type VideoVerticalJumpPayload = {
  date: string;

  fps: number;
  takeOffTime: number;
  landingTime: number;
  hangTime: number;

  jumpHeight: number; // sempre em cm

  // URLs prontas
  videoUrl: string;
  clipUrl?: string;
};

/* =========================
   MODELO UNIFICADO (HISTÓRICO)
   👉 ESSE É O QUE QUEBRAVA
========================= */
export interface UnifiedVerticalJumpRecord {
  id: string;
  userId: string;

  date: string;
  createdAt: any;

  jumpHeight: number;
  measurementType: MeasurementType;

  // 🎬 auditoria por vídeo
  videoUrl?: string;
  clipUrl?: string;

  fps?: number;
  takeOffTime?: number;
  landingTime?: number;
  hangTime?: number;
}
