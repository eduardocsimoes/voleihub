import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { getUserProfile, ProfileType } from '../firebase/firestore';
import DashboardAtleta from './DashboardAtleta';
import DashboardClube from './DashboardClube';
import DashboardTreinador from './DashboardTreinador';
import DashboardAgente from './DashboardAgente';
import DashboardPatrocinador from './DashboardPatrocinador';

export default function DashboardRouter() {
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('🟢 DashboardRouter renderizou');
  console.log('📊 Estado atual:', { profileType, loading, error });

  useEffect(() => {
    console.log('🔥 DashboardRouter useEffect disparou');
    
    const checkProfile = async () => {
      console.log('⏰ Verificando perfil...');
      const user = auth.currentUser;
      
      console.log('👤 auth.currentUser:', user);
      
      if (!user) {
        console.log('❌ Usuário não autenticado, redirecionando...');
        navigate('/');
        return;
      }
      
      console.log('✅ Usuário autenticado:', user.email);
      console.log('🆔 UID:', user.uid);
      
      try {
        console.log('📋 Chamando getUserProfile...');
        const result = await getUserProfile(user.uid);
        console.log('📋 Resultado getUserProfile:', result);
        
        if (result.success && result.data) {
          console.log('✅ Perfil encontrado!');
          console.log('👥 profileType:', result.data.profileType);
          console.log('🎯 onboardingCompleted:', result.data.onboardingCompleted);
          
          setProfileType(result.data.profileType);
          setError(null);
          console.log('✅ setProfileType executado');
        } else {
          console.error('❌ Erro ao carregar perfil:', result.error);
          setError(result.error || 'Erro ao carregar perfil');
        }
      } catch (err) {
        console.error('❌ Exceção ao carregar perfil:', err);
        setError('Erro inesperado ao carregar perfil');
      }
      
      console.log('✅ setLoading(false)');
      setLoading(false);
    };

    checkProfile();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('🔥 onAuthStateChanged no DashboardRouter');
      console.log('👤 User:', user?.email);
      if (user) {
        checkProfile();
      } else {
        console.log('❌ Auth state mudou: usuário não autenticado');
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  console.log('🎬 Renderizando baseado no estado:', { loading, error, profileType });

  if (loading) {
    console.log('⏳ Renderizando tela de loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
    console.log('❌ Renderizando tela de erro:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Erro ao carregar perfil</div>
          <div className="text-gray-400 text-sm mb-6">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  if (!profileType) {
    console.log('❌ profileType é null, renderizando erro...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Perfil não encontrado</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Renderizar o dashboard correto baseado no tipo de perfil
  console.log('🎯 Switch case com profileType:', profileType);
  
  switch (profileType) {
    case 'atleta':
      console.log('🏐 Renderizando DashboardAtleta');
      return <DashboardAtleta />;
    case 'clube':
      console.log('🏢 Renderizando DashboardClube');
      return <DashboardClube />;
    case 'treinador':
      console.log('🎓 Renderizando DashboardTreinador');
      return <DashboardTreinador />;
    case 'agente':
      console.log('💼 Renderizando DashboardAgente');
      return <DashboardAgente />;
    case 'patrocinador':
      console.log('🏆 Renderizando DashboardPatrocinador');
      return <DashboardPatrocinador />;
    default:
      console.error('❌ profileType não reconhecido:', profileType);
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-white text-xl">Tipo de perfil não reconhecido: {profileType}</div>
        </div>
      );
  }
}