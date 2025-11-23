import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    User
  } from 'firebase/auth';
  import { auth, googleProvider } from './config';
  import { createUserProfile, ProfileType } from './firestore';
  
  // Registrar com email e senha
  export const registerWithEmail = async (
    email: string, 
    password: string, 
    displayName: string,
    profileType: ProfileType
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        // Atualizar o displayName no Auth
        await updateProfile(userCredential.user, { displayName });
        
        // Enviar email de verificação
        await sendEmailVerification(userCredential.user);
        
        // Criar perfil no Firestore
        await createUserProfile(
          userCredential.user.uid,
          email,
          displayName,
          profileType
        );
      }
      
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  // Login com email e senha
  export const loginWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  // Login com Google
  export const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Se é primeira vez do usuário (novo registro via Google)
      // Precisamos identificar isso e pedir o tipo de perfil
      // Por enquanto, retornamos sucesso e tratamos isso no componente
      
      return { success: true, user: result.user, isNewUser: result.user.metadata.creationTime === result.user.metadata.lastSignInTime };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  // Criar perfil após login do Google (se for novo usuário)
  export const createGoogleUserProfile = async (user: User, profileType: ProfileType) => {
    try {
      await createUserProfile(
        user.uid,
        user.email || '',
        user.displayName || 'Usuário',
        profileType
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  // Logout
  export const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  // Reset de senha
  export const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  // Reenviar email de verificação
  export const resendVerificationEmail = async (user: User) => {
    try {
      await sendEmailVerification(user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };