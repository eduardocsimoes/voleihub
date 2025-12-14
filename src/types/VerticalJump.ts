export type MeasurementType = "video" | "manual";

export interface VerticalJumpVideoData {
  url: string;
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

export interface VerticalJumpRecord {
  id: string;
  userId: string;
  date: string; // yyyy-mm-dd
  createdAt: any;

  sex: "M" | "F";
  birthDate?: string;

  jumpHeight: number;

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

export type VideoVerticalJumpPayload = {
    date: string;
    takeOffTime: number;
    landingTime: number;
    hangTime: number;
    jumpHeight: number;
    fps: number;
    videoFile: File;
  };
  