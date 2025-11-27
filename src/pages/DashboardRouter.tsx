import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
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

  useEffect(() => {
    console.log('🟢 DashboardRouter montado');

    // Usar onAuthStateChanged para garantir que temos o usuário
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 onAuthStateChanged no DashboardRouter');
      console.log('👤 User:', user?.email || 'null');

      if (!user) {
        console.log('❌ Nenhum usuário autenticado, redirecionando...');
        setLoading(false);
        navigate('/');
        return;
      }

      console.log('✅ Usuário autenticado:', user.email);
      console.log('🆔 UID:', user.uid);

      try {
        console.log('📋 Buscando perfil...');
        const result = await getUserProfile(user.uid);
        console.log('📋 Resultado:', result);

        if (result.success && result.data) {
          console.log('✅ Perfil encontrado!');
          console.log('👥 profileType:', result.data.profileType);
          console.log('🎯 onboardingCompleted:', result.data.onboardingCompleted);

          if (!result.data.onboardingCompleted) {
            console.log('⚠️ Onboarding não completo, redirecionando para /');
            navigate('/');
            return;
          }

          setProfileType(result.data.profileType);
          setError(null);
        } else {
          console.error('❌ Erro ao buscar perfil:', result.error);
          setError(result.error || 'Perfil não encontrado');
        }
      } catch (err: any) {
        console.error('❌ Exceção:', err);
        setError(err.message || 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('🔴 DashboardRouter desmontado');
      unsubscribe();
    };
  }, []); // ✅ SEM DEPENDENCIES! Executa apenas 1x

  // Loading state
  if (loading) {
    console.log('⏳ Renderizando loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-4">Carregando dashboard...</div>
          <div className="text-gray-400 text-sm">Aguarde um momento</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log('❌ Renderizando erro:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-white text-2xl font-bold mb-4">Erro ao carregar perfil</div>
          <div className="text-gray-400 text-sm mb-6">{error}</div>
          <button
            onClick={() => {
              console.log('🔄 Voltando para /');
              navigate('/');
            }}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // No profile type
  if (!profileType) {
    console.log('❌ profileType é null');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-white text-2xl font-bold mb-4">Perfil não configurado</div>
          <div className="text-gray-400 text-sm mb-6">
            Seu perfil não foi encontrado. Por favor, complete o cadastro.
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Render dashboard based on profile type
  console.log('🎯 Renderizando dashboard:', profileType);

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
      console.error('❌ Tipo de perfil não reconhecido:', profileType);
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-2xl font-bold mb-4">
              Tipo de perfil não reconhecido
            </div>
            <div className="text-gray-400 text-sm mb-6">
              Tipo: {profileType}
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      );
  }
}