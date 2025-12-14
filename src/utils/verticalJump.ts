// g = gravidade (m/s²)
const GRAVITY = 9.81;

/**
 * Calcula salto vertical a partir do tempo de voo (hang time)
 * @param hangTime segundos
 * @returns altura do salto em cm
 */

/**
 * Calcula a altura do salto vertical a partir do tempo de voo
 * Fórmula física: h = g * t² / 8
 * Onde g = 9.81 m/s²
 * Retorno em centímetros
 */
/**
 * Calcula a altura do salto vertical a partir do tempo de voo
 * Fórmula: h = g * t² / 8
 * g = 9.81 m/s²
 * Retorno em centímetros
 */
export function calculateJumpHeightFromHangTime(
    hangTimeSeconds: number
  ): number {
    const g = 9.81;
    const hMeters = (g * hangTimeSeconds * hangTimeSeconds) / 8;
    return hMeters * 100;
  }
  
  