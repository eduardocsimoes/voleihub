import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';

import { auth } from './config';
import { 
  createAtletaProfile,
  createClubeProfile,
  createTreinadorProfile,
  createAgenteProfile,
  createPatrocinadorProfile,
  ProfileType
} from './firestore';

// =======================================================
// REGISTRO
// =======================================================
export async function register(
  email: string,
  password: string,
  name: string,
  profileType: ProfileType
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    switch (profileType) {
      case 'atleta':
        await createAtletaProfile(user.uid, email, name);
        break;
      case 'clube':
        await createClubeProfile(user.uid, email, name, name);
        break;
      case 'treinador':
        await createTreinadorProfile(user.uid, email, name);
        break;
      case 'agente':
        await createAgenteProfile(user.uid, email, name);
        break;
      case 'patrocinador':
        await createPatrocinadorProfile(user.uid, email, name, name);
        break;
    }

    return { success: true, user };
  } catch (error: any) {
    console.error('Erro ao registrar:', error);
    return { success: false, error: error.code || error.message };
  }
}

// =======================================================
// LOGIN PADRÃO
// =======================================================
export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.code || error.message };
  }
}

// =======================================================
// LOGIN COM EMAIL (para LoginModal)
// =======================================================
export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.code || error.message };
  }
}

// =======================================================
// LOGIN COM GOOGLE
// =======================================================
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.code || error.message };
  }
}

// =======================================================
// RESET DE SENHA
// =======================================================
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.code || error.message };
  }
}

// =======================================================
// LOGOUT
// =======================================================
export async function logout() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.code || error.message };
  }
}

// =======================================================
// GET CURRENT USER
// =======================================================
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
