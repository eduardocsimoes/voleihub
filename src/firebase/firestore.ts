import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from './config';

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
  title: string;
  year: number;
  championship: string;
  placement: 'Campeão' | 'Vice-Campeão' | '3º Lugar' | 'Participante';
  type: 'Coletivo' | 'Individual';
}

// Logo após os imports, ANTES de qualquer outra interface
export interface Result<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export const db = getFirestore(app);

export type ProfileType = 'atleta' | 'clube' | 'treinador' | 'agente' | 'patrocinador';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  profileType: ProfileType;
  createdAt: any;
  onboardingCompleted: boolean;
  photoURL?: string;  // ← ADICIONE ESTA LINHA
  avatar?: string;
}

// Criar perfil de usuário no Firestore após registro
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  profileType: ProfileType
) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    const userData: UserProfile = {
      uid,
      email,
      displayName,
      profileType,
      createdAt: serverTimestamp(),
      onboardingCompleted: false,
    };

    await setDoc(userRef, userData);

    // Criar documento específico do perfil
    switch (profileType) {
      case 'atleta':
        await createAtletaProfile(uid);
        break;
      case 'clube':
        await createClubeProfile(uid);
        break;
      case 'treinador':
        await createTreinadorProfile(uid);
        break;
      case 'agente':
        await createAgenteProfile(uid);
        break;
      case 'patrocinador':
        await createPatrocinadorProfile(uid);
        break;
    }

    return { success: true, data: userData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Buscar perfil do usuário
export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() as UserProfile };
    } else {
      return { success: false, error: 'Usuário não encontrado' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Marcar onboarding como completo
export const completeOnboarding = async (uid: string) => {
  return updateUserProfile(uid, { onboardingCompleted: true });
};



// ========== ATLETA ==========

export interface AtletaProfile {
  userId: string;
  photoURL?: string;  // ← ADICIONE ESTA LINHA
  position?: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  city?: string;
  state?: string;
  phone?: string;
  bio?: string;
  stats?: {
    aces?: number;
    blocks?: number;
    attacks?: number;
  };
  videos?: string[];
  achievements?: string[];
  seeking?: ('clube' | 'patrocinio' | 'treinador')[];
  careerExperiences?: CareerExperience[];
  careerAchievements?: Achievement[];
}

const createAtletaProfile = async (uid: string) => {
  const atletaRef = doc(db, 'atletas', uid);
  const atletaData: AtletaProfile = {
    userId: uid,
    videos: [],
    achievements: [],
    seeking: [],
  };
  await setDoc(atletaRef, atletaData);
};

export const getAtletaProfile = async (uid: string) => {
  try {
    const atletaRef = doc(db, 'atletas', uid);
    const atletaSnap = await getDoc(atletaRef);

    if (atletaSnap.exists()) {
      return { success: true, data: atletaSnap.data() as AtletaProfile };
    } else {
      return { success: false, error: 'Perfil de atleta não encontrado' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateAtletaProfile = async (uid: string, data: Partial<AtletaProfile>) => {
  try {
    const atletaRef = doc(db, 'atletas', uid);
    await updateDoc(atletaRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ========== CLUBE ==========

export interface ClubeProfile {
  userId: string;
  photoURL?: string;
  clubName?: string;
  foundedYear?: number;
  category?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  description?: string;
  stats?: {
    athletes?: number;
    titles?: number;
    matches?: number;
  };
  achievements?: string[];
  seeking?: ('atletas' | 'treinadores' | 'patrocinadores')[];
}

const createClubeProfile = async (uid: string) => {
  const clubeRef = doc(db, 'clubes', uid);
  const clubeData: ClubeProfile = {
    userId: uid,
  };
  await setDoc(clubeRef, clubeData);
};

// ==========================================
// FUNÇÕES PARA CLUBE
// ==========================================
// Adicione no final do seu firestore.ts (antes do último })

// Buscar perfil de clube
export async function getClubeProfile(userId: string): Promise<Result<ClubeProfile>> {
  try {
    const docRef = doc(db, 'clubes', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        data: docSnap.data() as ClubeProfile 
      };
    }
    
    return { 
      success: false, 
      error: 'Perfil de clube não encontrado' 
    };
  } catch (error: any) {
    console.error('❌ Erro ao buscar perfil de clube:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Atualizar perfil de clube
export async function updateClubeProfile(
  userId: string, 
  data: Partial<ClubeProfile>
): Promise<Result<void>> {
  try {
    const docRef = doc(db, 'clubes', userId);
    await updateDoc(docRef, data as any);
    
    console.log('✅ Perfil de clube atualizado!');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erro ao atualizar perfil de clube:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// ========== TREINADOR ==========

export interface TreinadorProfile {
  userId: string;
  photoURL?: string;  // ← ADICIONE ESTA LINHA
  specialties?: string[];
  experience?: string;
  certifications?: string[];
  courses?: {
    id: string;
    title: string;
    price: number;
    description: string;
  }[];
  mentorshipPrice?: number;
  availability?: string;
  city?: string;
  state?: string;
  phone?: string;
  bio?: string;
  yearsOfExperience?: number;
}

const createTreinadorProfile = async (uid: string) => {
  const treinadorRef = doc(db, 'treinadores', uid);
  const treinadorData: TreinadorProfile = {
    userId: uid,
    specialties: [],
    certifications: [],
    courses: [],
  };
  await setDoc(treinadorRef, treinadorData);
};

export const getTreinadorProfile = async (uid: string) => {
  try {
    const treinadorRef = doc(db, 'treinadores', uid);
    const treinadorSnap = await getDoc(treinadorRef);

    if (treinadorSnap.exists()) {
      return { success: true, data: treinadorSnap.data() as TreinadorProfile };
    } else {
      return { success: false, error: 'Perfil de treinador não encontrado' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateTreinadorProfile = async (uid: string, data: Partial<TreinadorProfile>) => {
  try {
    const treinadorRef = doc(db, 'treinadores', uid);
    await updateDoc(treinadorRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ========== AGENTE ==========

export interface AgenteProfile {
  userId: string;
  photoURL?: string;  // ← ADICIONE ESTA LINHA
  athletes?: string[];
  clubs?: string[];
  successfulDeals?: number;
  specialization?: string;
  city?: string;
  state?: string;
  phone?: string;
  bio?: string;
  yearsOfExperience?: number;
  website?: string;
}

const createAgenteProfile = async (uid: string) => {
  const agenteRef = doc(db, 'agentes', uid);
  const agenteData: AgenteProfile = {
    userId: uid,
    athletes: [],
    clubs: [],
    successfulDeals: 0,
  };
  await setDoc(agenteRef, agenteData);
};

export const getAgenteProfile = async (uid: string) => {
  try {
    const agenteRef = doc(db, 'agentes', uid);
    const agenteSnap = await getDoc(agenteRef);

    if (agenteSnap.exists()) {
      return { success: true, data: agenteSnap.data() as AgenteProfile };
    } else {
      return { success: false, error: 'Perfil de agente não encontrado' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateAgenteProfile = async (uid: string, data: Partial<AgenteProfile>) => {
  try {
    const agenteRef = doc(db, 'agentes', uid);
    await updateDoc(agenteRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ========== PATROCINADOR ==========

export interface PatrocinadorProfile {
  userId: string;
  photoURL?: string;  // ← ADICIONE ESTA LINHA
  brandName?: string;
  industry?: string;
  budget?: number;
  interests?: string[];
  currentSponsorships?: string[];
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  description?: string;
}

const createPatrocinadorProfile = async (uid: string) => {
  const patrocinadorRef = doc(db, 'patrocinadores', uid);
  const patrocinadorData: PatrocinadorProfile = {
    userId: uid,
    interests: [],
    currentSponsorships: [],
  };
  await setDoc(patrocinadorRef, patrocinadorData);
};

export const getPatrocinadorProfile = async (uid: string) => {
  try {
    const patrocinadorRef = doc(db, 'patrocinadores', uid);
    const patrocinadorSnap = await getDoc(patrocinadorRef);

    if (patrocinadorSnap.exists()) {
      return { success: true, data: patrocinadorSnap.data() as PatrocinadorProfile };
    } else {
      return { success: false, error: 'Perfil de patrocinador não encontrado' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updatePatrocinadorProfile = async (uid: string, data: Partial<PatrocinadorProfile>) => {
  try {
    const patrocinadorRef = doc(db, 'patrocinadores', uid);
    await updateDoc(patrocinadorRef, data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};