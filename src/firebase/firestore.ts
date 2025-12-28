import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc,
  addDoc,
  arrayUnion, 
  arrayRemove,
  collection,
  serverTimestamp,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
//import { calculateJumpHeightFromHangTime } from "../utils/verticalJump";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { JumpType } from "../types/VerticalJump";

const storage = getStorage();

// ============================================================
// ==================== TIPOS EXPORTADOS ======================
// ============================================================

export type ProfileType = 'atleta' | 'clube' | 'treinador' | 'agente' | 'patrocinador';

// ============================================================
// ==================== TIPOS BASE ============================
// ============================================================

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  userType: ProfileType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted?: boolean;
}

// ============================================================
// ==================== TIPOS PARA ATLETA =====================
// ============================================================

export interface CareerExperience {
  id: string;
  clubName: string;
  position: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  description?: string;
}

export interface Achievement {
  id: string;
  type: 'Coletivo' | 'Individual';
  championship: string;
  club: string;
  year: number;
  placement?: '1º Lugar' | '2º Lugar' | '3º Lugar' | 'Participante';
  award?: string;
}

// ⭐⭐⭐ Gamificação – estatísticas calculadas dinamicamente ⭐⭐⭐
export interface GamificationStats {
  careerScore: number;
  level: number;
}

export interface AtletaProfile extends UserProfile {
  photoURL?: string;
  position?: string;
  birthDate?: string;
  height?: number;
  weight?: number;
  city?: string;
  state?: string;
  phone?: string;
  bio?: string;

  fatherHeight?: number; // altura do pai (cm)
  motherHeight?: number; // altura da mãe (cm)
  sex?: 'M' | 'F';       // sexo do atleta (M/F)

  // Histórico futuro de XP (se quiser log de evoluções)
  xpHistory?: {
    date: string;
    xp: number;
    reason: string;
  }[];
  experiences?: CareerExperience[];
  achievements?: Achievement[];
  seeking?: ('clube' | 'patrocinio' | 'treinador')[];

  // Campos de gamificação (opcionais, não quebram dados antigos)
  careerScore?: number;
  level?: number;
}

// ============================================================
// ==================== SALTO VERTICAL ========================
// ============================================================

export type VerticalJumpMeasurementType = "manual" | "video";

export interface UnifiedVerticalJumpRecord {
  id: string;
  userId: string;
  date: string;
  jumpType: JumpType;
  jumpHeight: number;
  measurementType: VerticalJumpMeasurementType;
  createdAt?: Timestamp;

  // manual
  reachStanding?: number;
  reachJump?: number;

  // video (🔥 AUDITORIA 🔥)
  video?: {
    clipUrl?: string | null;
    thumbnailUrl?: string | null;
    fps: number;
    takeOffTime: number;
    landingTime: number;
    hangTime: number;
  };

  videoMeta?: {
    duration: number;
    width: number;
    height: number;
    fps: number;
    browser: string;
    devicePixelRatio: number;
  };  
}

/* =========================================================
   VIDEO
========================================================= */
/* =========================================================
   VIDEO — SALTO VERTICAL (COM AUDITORIA)
========================================================= */
export async function addVerticalJumpFromVideo(
  userId: string,
  data: {
    date: string;
    sex: "M" | "F";
    birthDate?: string;
    jumpType: JumpType;
    fps: number;
    takeOffTime: number;
    landingTime: number;
    hangTime: number;
    jumpHeight: number;

    clipUrl?: string;
    thumbnailUrl?: string;
    // 🔥 AUDITORIA ANTIFRAUDE
    videoMeta?: {
      duration: number;
      width: number;
      height: number;
      fps: number;
      browser: string;
      devicePixelRatio: number;
    };
  }
) {
  return addDoc(collection(db, "verticalJumps"), {
    userId,
    date: data.date,
    createdAt: serverTimestamp(),

    jumpType: data.jumpType,

    sex: data.sex,
    birthDate: data.birthDate ?? null,

    jumpHeight: data.jumpHeight,
    measurementType: "video",

    video: {
      clipUrl: data.clipUrl ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      fps: data.fps,
      takeOffTime: data.takeOffTime,
      landingTime: data.landingTime,
      hangTime: data.hangTime,
    },

    // ✅ agora existe de verdade
    videoMeta: data.videoMeta ?? null,
  });
}

/* =========================================================
   HISTÓRICO UNIFICADO
========================================================= */
export async function getVerticalJumpHistoryUnified(
  uid: string
): Promise<UnifiedVerticalJumpRecord[]> {
  const q = query(
    collection(db, "verticalJumps"),
    orderBy("date", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs
    .map((d) => {
      const data = d.data();

      return {
        id: d.id,
        userId: data.userId,
        date: data.date,
        jumpType: data.jumpType,
        jumpHeight: Number(data.jumpHeight ?? 0),
        measurementType: data.measurementType,

        reachStanding: data.reachStanding,
        reachJump: data.reachJump,

        video: data.video
        ? {
            clipUrl: data.video.clipUrl ?? null,
            thumbnailUrl: data.video.thumbnailUrl ?? null, // ✅ AQUI ESTÁ O BUG
            fps: data.video.fps,
            takeOffTime: data.video.takeOffTime,
            landingTime: data.video.landingTime,
            hangTime: data.video.hangTime,
          }
        : undefined,
      } as UnifiedVerticalJumpRecord;
    })
    .filter((r) => r.userId === uid);
}

/* =========================================================
   DELETE (Firestore only — Storage é feito fora)
========================================================= */
export async function deleteVerticalJumpUnified(id: string) {
  await deleteDoc(doc(db, "verticalJumps", id));
}

// ============================================================
// ==================== TIPOS PARA CLUBE ======================
// ============================================================

export interface ClubeProfile extends UserProfile {
  clubName: string;
  photoURL?: string;
  foundedYear?: number;
  city?: string;
  state?: string;
  category?: string;
  division?: string;
  description?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  openPositions?: string[];
  facilities?: string[];
  stats?: {
    athletes?: number;
    titles?: number;
    matches?: number;
  };
  achievements?: string[];
  seeking?: ('atletas' | 'treinadores' | 'patrocinadores')[];
}

// ============================================================
// ==================== TIPOS PARA TREINADOR ==================
// ============================================================

export interface TreinadorProfile extends UserProfile {
  specialty?: string;
  experience?: string;
  certifications?: string[];
  city?: string;
  state?: string;
  phone?: string;
  bio?: string;
  seeking?: ('clube' | 'atletas')[];
  yearsOfExperience?: number;
  specialties?: string[];
  mentorshipPrice?: number;
  availability?: string;
}

// ============================================================
// ==================== TIPOS PARA AGENTE =====================
// ============================================================

export interface AgenteProfile extends UserProfile {
  company?: string;
  athletes?: string[];
  city?: string;
  state?: string;
  phone?: string;
  bio?: string;
  seeking?: ('atletas' | 'clubes')[];
  yearsOfExperience?: number;
  specialization?: string;
  website?: string;
}

// ============================================================
// ==================== TIPOS PARA PATROCINADOR ===============
// ============================================================

export interface PatrocinadorProfile extends UserProfile {
  companyName: string;
  brandName?: string;
  segment?: string;
  industry?: string;
  description?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  investmentRange?: string;
  budget?: number;
  interests?: string[];
  seeking?: ('atletas' | 'clubes' | 'eventos')[];
}

// ============================================================
// ==================== FUNÇÕES GERAIS ========================
// ============================================================

export async function completeOnboarding(uid: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    onboardingCompleted: true,
    updatedAt: Timestamp.now(),
  });
}

// ============================================================
// ==================== FUNÇÕES DE ATLETA =====================
// ============================================================

// ⭐⭐⭐ Função de cálculo da pontuação (versão 1.0) ⭐⭐⭐
// Participar campeonato: 10 pts
// Medalhas: 1º=60, 2º=40, 3º=30
// Premiação individual: 50 pts
// Convocação (award === 'Convocação Seleção Estadual'): +80
// Convocação (award === 'Convocação Seleção Brasileira'): +200

export function calculateCareerScore(profile: AtletaProfile): GamificationStats {
  let score = 0;

  (profile.achievements || []).forEach((a) => {
    // Participação simples (qualquer competição cadastrada conta)
    score += 10;

    if (a.placement === '1º Lugar') score += 60;
    if (a.placement === '2º Lugar') score += 40;
    if (a.placement === '3º Lugar') score += 30;

    if (a.type === 'Individual') score += 50;

    if (a.award === 'Convocação Seleção Estadual') score += 80;
    if (a.award === 'Convocação Seleção Brasileira') score += 200;
  });

  // Converter score → level (escala simples)
  const level = Math.floor(score / 150) + 1;

  return { careerScore: score, level };
}

// ============================================================
// ============ CREATE ATLETA COM SCORE INICIAL ===============
// ============================================================

export async function createAtletaProfile(
  uid: string,
  email: string,
  name: string,
  additionalData: Partial<AtletaProfile> = {}
) {
  const atletaRef = doc(db, 'users', uid);

  const atletaData: AtletaProfile = {
    uid,
    email,
    name,
    userType: 'atleta',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    onboardingCompleted: false,
    experiences: [],
    achievements: [],
    careerScore: 0, // inicial
    level: 1,       // inicial
    ...additionalData,
  };

  await setDoc(atletaRef, atletaData);
  return atletaData;
}

// ============================================================
// =================== GET USER PROFILE ========================
// ============================================================

export async function getUserProfile(uid: string): Promise<AtletaProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      const profile: AtletaProfile = {
        uid: data.uid,
        email: data.email,
        name: data.name,
        userType: data.userType,
        photoURL: data.photoURL,
        position: data.position,
        birthDate: data.birthDate,
        height: data.height,
        weight: data.weight,
        city: data.city,
        state: data.state,
        phone: data.phone,
        bio: data.bio,
        fatherHeight: data.fatherHeight,
        motherHeight: data.motherHeight,
        sex: data.sex,
        experiences: data.experiences || [],
        achievements: data.achievements || [],
        seeking: data.seeking || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        onboardingCompleted: data.onboardingCompleted,
        careerScore: data.careerScore || 0,
        level: data.level || 1,
        xpHistory: data.xpHistory || [],
      };

      // ⭐ Atualiza score dinamicamente com base nas conquistas atuais
      const stats = calculateCareerScore(profile);
      profile.careerScore = stats.careerScore;
      profile.level = stats.level;

      return profile;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

// ============================================================
// ==================== UPDATE ATLETA ==========================
// ============================================================

export async function updateAtletaProfile(
  uid: string,
  updates: Partial<AtletaProfile>
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

// ============================================================
// ================ EXPERIENCES (CRUD) =========================
// ============================================================

export async function addExperience(uid: string, experience: CareerExperience) {
  const userRef = doc(db, 'users', uid);
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Usuário não encontrado');

  const data = userSnap.data();
  const currentExperiences = data.experiences || [];

  const newExperience = {
    ...experience,
    id: experience.id || `experience_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  const cleanExperience: CareerExperience = Object.keys(newExperience).reduce((acc, key) => {
    const value = (newExperience as any)[key];
    if (value !== undefined) (acc as any)[key] = value;
    return acc;
  }, {} as CareerExperience);

  await updateDoc(userRef, {
    experiences: [...currentExperiences, cleanExperience],
    updatedAt: Timestamp.now(),
  });
}

export async function updateExperience(
  uid: string,
  oldExperience: CareerExperience,
  newExperience: CareerExperience
) {
  const userRef = doc(db, 'users', uid);
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Usuário não encontrado');

  const data = userSnap.data();
  const currentExperiences = data.experiences || [];

  const cleanExperience: CareerExperience = Object.keys(newExperience).reduce((acc, key) => {
    const value = (newExperience as any)[key];
    if (value !== undefined) (acc as any)[key] = value;
    return acc;
  }, {} as CareerExperience);

  const updatedExperiences = currentExperiences
    .filter((exp: CareerExperience) => exp.id !== oldExperience.id)
    .concat(cleanExperience);

  await updateDoc(userRef, {
    experiences: updatedExperiences,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteExperience(uid: string, experience: CareerExperience) {
  const userRef = doc(db, 'users', uid);
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Usuário não encontrado');

  const data = userSnap.data();
  const updatedExperiences = (data.experiences || []).filter(
    (exp: CareerExperience) => exp.id !== experience.id
  );

  await updateDoc(userRef, {
    experiences: updatedExperiences,
    updatedAt: Timestamp.now(),
  });
}

function calculateAgeFromBirthdate(birthDate: string, measurementDate: string) {
  const birth = new Date(birthDate);
  const measure = new Date(measurementDate);

  let age = measure.getFullYear() - birth.getFullYear();
  const m = measure.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && measure.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/** Registrar altura */
export async function addHeightRecord(
  uid: string,
  height: number,
  date: string
) {
  const heightRef = collection(db, "users", uid, "heightRecords");

  await setDoc(doc(heightRef), {
    height,
    date,
    createdAt: Timestamp.now(),
  });
}

export interface HeightRecord {
  id: string;
  height: number;
  date: string;
}

export async function getHeightHistory(uid: string): Promise<HeightRecord[]> {
  const q = query(
    collection(db, "users", uid, "heightRecords"),
    orderBy("date", "asc")
  );

  const snap = await getDocs(q);

  const list: HeightRecord[] = snap.docs.map((d) => {
    const data = d.data();

    return {
      id: d.id,
      height: Number(data.height ?? 0),
      date: String(data.date ?? ""),
    };
  });

  return list;
}


export async function deleteHeightRecord(uid: string, recordId: string) {
  const ref = doc(db, "users", uid, "heightRecords", recordId);
  await deleteDoc(ref);
}


// ---------------------------------------------------------------------------
// SALTO VERTICAL – Tipos e funções de Firestore
// ---------------------------------------------------------------------------

export interface VerticalJumpRecord {
  id: string;
  date: string;           // yyyy-mm-dd
  reachStanding: number;  // alcance em pé (cm)
  reachJump: number;      // alcance no salto (cm)
  jumpHeight: number;     // reachJump - reachStanding (cm)
}

/**
 * Adiciona um novo registro de salto vertical.
 */
export async function addVerticalJumpRecord(
  uid: string,
  reachStanding: number,
  reachJump: number,
  date: string
): Promise<void> {
  const jumpHeight = reachJump - reachStanding;

  const ref = collection(db, "atletas", uid, "verticalJump");
  await addDoc(ref, {
    date,
    reachStanding,
    reachJump,
    jumpHeight,
  });
}

/**
 * Obtém o histórico de saltos verticais do atleta, ordenado por data.
 */
export async function getVerticalJumpHistory(
  uid: string
): Promise<VerticalJumpRecord[]> {
  const ref = collection(db, "atletas", uid, "verticalJump");
  const q = query(ref, orderBy("date", "asc"));

  const snap = await getDocs(q);
  const items: VerticalJumpRecord[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;
    items.push({
      id: docSnap.id,
      date: data.date,
      reachStanding: Number(data.reachStanding ?? 0),
      reachJump: Number(data.reachJump ?? 0),
      jumpHeight: Number(data.jumpHeight ?? 0),
    });
  });

  return items;
}

/**
 * Remove um registro específico de salto vertical.
 */
export async function deleteVerticalJumpRecord(
  uid: string,
  recordId: string
): Promise<void> {
  const ref = doc(db, "atletas", uid, "verticalJump", recordId);
  await deleteDoc(ref);
}
// ---------------------------------------------------------------------------


// ============================================================
// ================ ACHIEVEMENTS (CRUD) ========================
// ============================================================

export async function addAchievement(uid: string, achievement: Achievement) {
  const userRef = doc(db, 'users', uid);
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Usuário não encontrado');

  const data = userSnap.data();
  const currentAchievements = data.achievements || [];

  const newAchievement = {
    ...achievement,
    id: achievement.id || `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  const cleanAchievement: Achievement = Object.keys(newAchievement).reduce((acc, key) => {
    const value = (newAchievement as any)[key];
    if (value !== undefined) (acc as any)[key] = value;
    return acc;
  }, {} as Achievement);

  await updateDoc(userRef, {
    achievements: [...currentAchievements, cleanAchievement],
    updatedAt: Timestamp.now(),
  });
}

export async function updateAchievement(
  uid: string,
  oldAchievement: Achievement,
  newAchievement: Achievement
) {
  const userRef = doc(db, 'users', uid);
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Usuário não encontrado');

  const data = userSnap.data();
  const currentAchievements = data.achievements || [];

  const cleanAchievement: Achievement = Object.keys(newAchievement).reduce((acc, key) => {
    const value = (newAchievement as any)[key];
    if (value !== undefined) (acc as any)[key] = value;
    return acc;
  }, {} as Achievement);

  const updatedAchievements = currentAchievements
    .filter((ach: Achievement) => ach.id !== oldAchievement.id)
    .concat(cleanAchievement);

  await updateDoc(userRef, {
    achievements: updatedAchievements,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteAchievement(uid: string, achievement: Achievement) {
  const userRef = doc(db, 'users', uid);
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('Usuário não encontrado');

  const data = userSnap.data();
  const updatedAchievements = (data.achievements || []).filter(
    (ach: Achievement) => ach.id !== achievement.id
  );

  await updateDoc(userRef, {
    achievements: updatedAchievements,
    updatedAt: Timestamp.now(),
  });
}

// ============================================================
// ==================== OUTROS PERFIS =========================
// ============================================================

export async function createClubeProfile(
  uid: string,
  email: string,
  name: string,
  clubName: string,
  additionalData: Partial<ClubeProfile> = {}
) {
  const clubeRef = doc(db, 'users', uid);
  const clubeData: ClubeProfile = {
    uid,
    email,
    name,
    clubName,
    userType: 'clube',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    onboardingCompleted: false,
    ...additionalData,
  };

  await setDoc(clubeRef, clubeData);
  return clubeData;
}

export async function getClubeProfile(uid: string): Promise<ClubeProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? (userSnap.data() as ClubeProfile) : null;
  } catch (error) {
    console.error('Erro ao buscar perfil do clube:', error);
    return null;
  }
}

export async function updateClubeProfile(
  uid: string,
  updates: Partial<ClubeProfile>
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function createTreinadorProfile(
  uid: string,
  email: string,
  name: string,
  additionalData: Partial<TreinadorProfile> = {}
) {
  const treinadorRef = doc(db, 'users', uid);
  const treinadorData: TreinadorProfile = {
    uid,
    email,
    name,
    userType: 'treinador',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    onboardingCompleted: false,
    ...additionalData,
  };

  await setDoc(treinadorRef, treinadorData);
  return treinadorData;
}

export async function getTreinadorProfile(uid: string): Promise<TreinadorProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? (userSnap.data() as TreinadorProfile) : null;
  } catch (error) {
    console.error('Erro ao buscar perfil do treinador:', error);
    return null;
  }
}

export async function updateTreinadorProfile(
  uid: string,
  updates: Partial<TreinadorProfile>
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function createAgenteProfile(
  uid: string,
  email: string,
  name: string,
  additionalData: Partial<AgenteProfile> = {}
) {
  const agenteRef = doc(db, 'users', uid);
  const agenteData: AgenteProfile = {
    uid,
    email,
    name,
    userType: 'agente',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    onboardingCompleted: false,
    ...additionalData,
  };

  await setDoc(agenteRef, agenteData);
  return agenteData;
}

export async function getAgenteProfile(uid: string): Promise<AgenteProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? (userSnap.data() as AgenteProfile) : null;
  } catch (error) {
    console.error('Erro ao buscar perfil do agente:', error);
    return null;
  }
}

export async function updateAgenteProfile(
  uid: string,
  updates: Partial<AgenteProfile>
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function createPatrocinadorProfile(
  uid: string,
  email: string,
  name: string,
  companyName: string,
  additionalData: Partial<PatrocinadorProfile> = {}
) {
  const patrocinadorRef = doc(db, 'users', uid);
  const patrocinadorData: PatrocinadorProfile = {
    uid,
    email,
    name,
    companyName,
    userType: 'patrocinador',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    onboardingCompleted: false,
    ...additionalData,
  };

  await setDoc(patrocinadorRef, patrocinadorData);
  return patrocinadorData;
}

export async function getPatrocinadorProfile(uid: string): Promise<PatrocinadorProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    return userSnap.exists() ? (userSnap.data() as PatrocinadorProfile) : null;
  } catch (error) {
    console.error('Erro ao buscar perfil do patrocinador:', error);
    return null;
  }
}

export async function updatePatrocinadorProfile(
  uid: string,
  updates: Partial<PatrocinadorProfile>
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function addXPHistory(
  uid: string,
  entry: { xp: number; reason: string }
) {
  const userRef = doc(db, 'users', uid);

  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const history = data.xpHistory || [];

  const newEntry = {
    date: new Date().toISOString(),
    xp: entry.xp,
    reason: entry.reason,
  };

  await updateDoc(userRef, {
    xpHistory: [...history, newEntry],
    updatedAt: Timestamp.now(),
  });
}

export async function updateAthleteCardImage(
  uid: string,
  format: "feed" | "story",
  imageUrl: string | null
) {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    [`athleteCards.${format}ImageUrl`]: imageUrl,
  });
}

