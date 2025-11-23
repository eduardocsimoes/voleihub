import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from './config';

export const db = getFirestore(app);

export type ProfileType = 'atleta' | 'clube' | 'treinador' | 'agente' | 'patrocinador';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  profileType: ProfileType;
  createdAt: any;
  onboardingCompleted: boolean;
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

// ========== PERFIS ESPECÍFICOS ==========

interface AtletaProfile {
  userId: string;
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

interface ClubeProfile {
  userId: string;
  clubName?: string;
  city?: string;
  state?: string;
  category?: string;
  division?: string;
  foundedYear?: number;
  openPositions?: string[];
  facilities?: string[];
  sponsorships?: string[];
}

const createClubeProfile = async (uid: string) => {
  const clubeRef = doc(db, 'clubes', uid);
  const clubeData: ClubeProfile = {
    userId: uid,
    openPositions: [],
    facilities: [],
    sponsorships: [],
  };
  await setDoc(clubeRef, clubeData);
};

interface TreinadorProfile {
  userId: string;
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

interface AgenteProfile {
  userId: string;
  athletes?: string[];
  clubs?: string[];
  successfulDeals?: number;
  specialization?: string;
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

interface PatrocinadorProfile {
  userId: string;
  brandName?: string;
  industry?: string;
  budget?: number;
  interests?: string[];
  currentSponsorships?: string[];
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