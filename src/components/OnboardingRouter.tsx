import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
    console.log('🟢 OnboardingRouter montado');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 OnboardingRouter - onAuthStateChanged disparou');
      console.log('👤 User:', user ? user.email : 'null');
      
      if (user) {
        console.log('📞 Buscando perfil para UID:', user.uid);
        
        try {
          const profile = await getUserProfile(user.uid);
          console.log('📋 Perfil retornado:', profile);

          if (profile) {
            console.log('🎯 onboardingCompleted:', profile.onboardingCompleted);
            console.log('👥 userType:', profile.userType);
            
            // VERIFICAR SE userType EXISTE
            if (!profile.userType) {
              console.error('❌ ERRO: userType não definido no perfil!');
              console.log('🔧 Tentando detectar userType pelos campos...');
              
              // Tentar detectar pelo tipo de perfil
              let detectedType: ProfileType | null = null;
              
              if ('clubName' in profile) {
                detectedType = 'clube';
                console.log('✅ Detectado tipo: clube (tem clubName)');
              } else if ('position' in profile) {
                detectedType = 'atleta';
                console.log('✅ Detectado tipo: atleta (tem position)');
              } else if ('specialty' in profile) {
                detectedType = 'treinador';
                console.log('✅ Detectado tipo: treinador (tem specialty)');
              } else if ('company' in profile) {
                detectedType = 'agente';
                console.log('✅ Detectado tipo: agente (tem company)');
              } else if ('companyName' in profile) {
                detectedType = 'patrocinador';
                console.log('✅ Detectado tipo: patrocinador (tem companyName)');
              }
              
              if (detectedType) {
                console.log('🔧 userType detectado:', detectedType);
                setProfileType(detectedType);
              } else {
                console.error('❌ Não foi possível detectar o tipo de perfil!');
                return;
              }
            } else {
              setProfileType(profile.userType);
            }
            
            // Verificar onboarding
            if (!profile.onboardingCompleted) {
              console.log('🚀 ABRINDO ONBOARDING MODAL!');
              setShowOnboarding(true);
              setUserId(user.uid);
            } else {
              console.log('✅ Onboarding já completado');
              setShowOnboarding(false);
            }
          } else {
            console.error('❌ Perfil não encontrado para UID:', user.uid);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar perfil:', error);
        }
      } else {
        console.log('❌ Nenhum usuário autenticado');
        setShowOnboarding(false);
        setProfileType(null);
      }
    });

    return () => {
      console.log('🔴 OnboardingRouter desmontado');
      unsubscribe();
    };
  }, []);

  console.log('🔍 OnboardingRouter render - showOnboarding:', showOnboarding, 'profileType:', profileType);

  if (!showOnboarding || !profileType) {
    console.log('⚠️ Não mostrando onboarding (showOnboarding:', showOnboarding, 'profileType:', profileType, ')');
    return null;
  }

  console.log('✅ Renderizando modal de onboarding para:', profileType);

  return (
    <>
      {profileType === 'atleta' && (
        <OnboardingAtleta
          isOpen={true}
          onClose={() => setShowOnboarding(false)}
          userId={userId}
        />
      )}
      
      {profileType === 'clube' && (
        <OnboardingClube
          isOpen={true}
          onClose={() => setShowOnboarding(false)}
          userId={userId}
        />
      )}
      
      {profileType === 'treinador' && (
        <OnboardingTreinador
          isOpen={true}
          onClose={() => setShowOnboarding(false)}
          userId={userId}
        />
      )}
      
      {profileType === 'agente' && (
        <OnboardingAgente
          isOpen={true}
          onClose={() => setShowOnboarding(false)}
          userId={userId}
        />
      )}
      
      {profileType === 'patrocinador' && (
        <OnboardingPatrocinador
          isOpen={true}
          onClose={() => setShowOnboarding(false)}
          userId={userId}
        />
      )}
    </>
  );
}