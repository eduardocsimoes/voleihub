import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// ==================== TIPOS EXPORTADOS ====================

export type ProfileType = 'atleta' | 'clube' | 'treinador' | 'agente' | 'patrocinador';

// ==================== TIPOS BASE ====================

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  userType: ProfileType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted?: boolean;
}

// ==================== TIPOS PARA ATLETA ====================

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
  experiences?: CareerExperience[];
  achievements?: Achievement[];
  seeking?: ('clube' | 'patrocinio' | 'treinador')[];
}

// ==================== TIPOS PARA CLUBE ====================

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

// ==================== TIPOS PARA TREINADOR ====================

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

// ==================== TIPOS PARA AGENTE ====================

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

// ==================== TIPOS PARA PATROCINADOR ====================

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

// ==================== FUNÇÕES GERAIS ====================

export async function completeOnboarding(uid: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    onboardingCompleted: true,
    updatedAt: Timestamp.now(),
  });
}

// ==================== FUNÇÕES DE ATLETA ====================

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
    ...additionalData,
  };

  await setDoc(atletaRef, atletaData);
  return atletaData;
}

export async function getUserProfile(uid: string): Promise<AtletaProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
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
        experiences: data.experiences || [],
        achievements: data.achievements || [],
        seeking: data.seeking || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        onboardingCompleted: data.onboardingCompleted,
      } as AtletaProfile;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

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

export async function addExperience(uid: string, experience: CareerExperience) {
  const userRef = doc(db, 'users', uid);
  
  // Buscar experiences atuais
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = userDoc.data();
  const currentExperiences = userData.experiences || [];
  
  // Garantir que tem ID único
  const newExperience = {
    ...experience,
    id: experience.id || `experience_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  // ✅ REMOVER CAMPOS UNDEFINED
  const cleanExperience: CareerExperience = Object.keys(newExperience).reduce((acc, key) => {
    const value = (newExperience as any)[key];
    if (value !== undefined) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as CareerExperience);
  
  // Adicionar ao array manualmente
  const updatedExperiences = [...currentExperiences, cleanExperience];
  
  await updateDoc(userRef, {
    experiences: updatedExperiences,
    updatedAt: Timestamp.now(),
  });
}

export async function updateExperience(
  uid: string,
  oldExperience: CareerExperience,
  newExperience: CareerExperience
) {
  const userRef = doc(db, 'users', uid);
  
  // Buscar experiences atuais
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = userDoc.data();
  const currentExperiences = userData.experiences || [];
  
  // ✅ REMOVER CAMPOS UNDEFINED
  const cleanExperience: CareerExperience = Object.keys(newExperience).reduce((acc, key) => {
    const value = (newExperience as any)[key];
    if (value !== undefined) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as CareerExperience);
  
  // Remover antiga e adicionar nova
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
  
  // Buscar experiences atuais
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = userDoc.data();
  const currentExperiences = userData.experiences || [];
  
  // Filtrar removendo a experience
  const updatedExperiences = currentExperiences.filter(
    (exp: CareerExperience) => exp.id !== experience.id
  );
  
  await updateDoc(userRef, {
    experiences: updatedExperiences,
    updatedAt: Timestamp.now(),
  });
}

// ✅ FUNÇÃO CORRIGIDA - addAchievement
export async function addAchievement(uid: string, achievement: Achievement) {
  const userRef = doc(db, 'users', uid);
  
  // Buscar achievements atuais
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = userDoc.data();
  const currentAchievements = userData.achievements || [];
  
  // Garantir que tem ID único
  const newAchievement = {
    ...achievement,
    id: achievement.id || `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  // ✅ REMOVER CAMPOS UNDEFINED (Firestore não aceita)
  const cleanAchievement: Achievement = Object.keys(newAchievement).reduce((acc, key) => {
    const value = (newAchievement as any)[key];
    if (value !== undefined) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as Achievement);
  
  // Adicionar ao array manualmente (NÃO usar arrayUnion!)
  const updatedAchievements = [...currentAchievements, cleanAchievement];
  
  await updateDoc(userRef, {
    achievements: updatedAchievements,
    updatedAt: Timestamp.now(),
  });
}

// ✅ FUNÇÃO CORRIGIDA - updateAchievement
export async function updateAchievement(
  uid: string,
  oldAchievement: Achievement,
  newAchievement: Achievement
) {
  const userRef = doc(db, 'users', uid);
  
  // Buscar achievements atuais
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = userDoc.data();
  const currentAchievements = userData.achievements || [];
  
  // ✅ REMOVER CAMPOS UNDEFINED
  const cleanAchievement: Achievement = Object.keys(newAchievement).reduce((acc, key) => {
    const value = (newAchievement as any)[key];
    if (value !== undefined) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as Achievement);
  
  // Remover antigo e adicionar novo
  const updatedAchievements = currentAchievements
    .filter((ach: Achievement) => ach.id !== oldAchievement.id)
    .concat(cleanAchievement);
  
  await updateDoc(userRef, {
    achievements: updatedAchievements,
    updatedAt: Timestamp.now(),
  });
}

// ✅ FUNÇÃO CORRIGIDA - deleteAchievement
export async function deleteAchievement(uid: string, achievement: Achievement) {
  const userRef = doc(db, 'users', uid);
  
  // Buscar achievements atuais
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado');
  }
  
  const userData = userDoc.data();
  const currentAchievements = userData.achievements || [];
  
  // Filtrar removendo o achievement
  const updatedAchievements = currentAchievements.filter(
    (ach: Achievement) => ach.id !== achievement.id
  );
  
  await updateDoc(userRef, {
    achievements: updatedAchievements,
    updatedAt: Timestamp.now(),
  });
}

// ==================== FUNÇÕES DE CLUBE ====================

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

    if (userSnap.exists()) {
      return userSnap.data() as ClubeProfile;
    }

    return null;
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

// ==================== FUNÇÕES DE TREINADOR ====================

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

    if (userSnap.exists()) {
      return userSnap.data() as TreinadorProfile;
    }

    return null;
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

// ==================== FUNÇÕES DE AGENTE ====================

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

    if (userSnap.exists()) {
      return userSnap.data() as AgenteProfile;
    }

    return null;
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

// ==================== FUNÇÕES DE PATROCINADOR ====================

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

    if (userSnap.exists()) {
      return userSnap.data() as PatrocinadorProfile;
    }

    return null;
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