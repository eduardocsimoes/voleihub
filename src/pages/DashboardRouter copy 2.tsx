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

  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        console.log('Usuário não autenticado, redirecionando...');
        navigate('/');
        return;
      }
      
      try {
        const result = await getUserProfile(user.uid);
        
        if (result.success && result.data) {
          console.log('Perfil carregado:', result.data.profileType);
          setProfileType(result.data.profileType);
          setError(null);
        } else {
          console.error('Erro ao carregar perfil:', result.error);
          setError(result.error || 'Erro ao carregar perfil');
        }
      } catch (err) {
        console.error('Exceção ao carregar perfil:', err);
        setError('Erro inesperado ao carregar perfil');
      }
      
      setLoading(false);
    };

    // Verificar quando componente monta
    checkProfile();

    // Verificar também quando auth state muda
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkProfile();
      } else {
        console.log('Auth state mudou: usuário não autenticado');
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando dashboard...</div>
      </div>
    );
  }

  if (error) {
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
  switch (profileType) {
    case 'atleta':
      return <DashboardAtleta />;
    case 'clube':
      return <DashboardClube />;
    case 'treinador':
      return <DashboardTreinador />;
    case 'agente':
      return <DashboardAgente />;
    case 'patrocinador':
      return <DashboardPatrocinador />;
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="text-white text-xl">Tipo de perfil não reconhecido</div>
        </div>
      );
  }
}