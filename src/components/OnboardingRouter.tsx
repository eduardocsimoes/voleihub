import { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { getUserProfile, ProfileType } from '../firebase/firestore';
import OnboardingAtleta from './OnboardingAtleta';
import OnboardingClube from './OnboardingClube';
import OnboardingTreinador from './OnboardingTreinador';
import OnboardingAgente from './OnboardingAgente';
import OnboardingPatrocinador from './OnboardingPatrocinador';

export default function OnboardingRouter() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const checkOnboarding = async () => {
      const user = auth.currentUser;
      
      if (user) {
        const result = await getUserProfile(user.uid);
        
        if (result.success && result.data) {
          // Se onboarding não foi completado, mostrar
          if (!result.data.onboardingCompleted) {
            setShowOnboarding(true);
            setProfileType(result.data.profileType);
            setUserId(user.uid);
          }
        }
      }
    };

    // Verificar quando componente monta
    checkOnboarding();

    // Verificar também quando auth state muda
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkOnboarding();
    });

    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    // Não permitir fechar sem completar
    const confirmed = window.confirm(
      'Você precisa completar seu perfil para usar a plataforma. Deseja sair?'
    );
    
    if (confirmed) {
      setShowOnboarding(false);
      auth.signOut();
    }
  };

  if (!showOnboarding || !profileType) return null;

  // Renderizar o onboarding correto baseado no tipo de perfil
  switch (profileType) {
    case 'atleta':
      return <OnboardingAtleta isOpen={showOnboarding} onClose={handleClose} userId={userId} />;
    case 'clube':
      return <OnboardingClube isOpen={showOnboarding} onClose={handleClose} userId={userId} />;
    case 'treinador':
      return <OnboardingTreinador isOpen={showOnboarding} onClose={handleClose} userId={userId} />;
    case 'agente':
      return <OnboardingAgente isOpen={showOnboarding} onClose={handleClose} userId={userId} />;
    case 'patrocinador':
      return <OnboardingPatrocinador isOpen={showOnboarding} onClose={handleClose} userId={userId} />;
    default:
      return null;
  }
}