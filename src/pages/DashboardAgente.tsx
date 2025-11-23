import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Phone, Globe, Award, Edit2, LogOut, Trophy, Users, TrendingUp } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, getAgenteProfile, UserProfile, AgenteProfile } from '../firebase/firestore';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function DashboardAgente() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [agenteProfile, setAgenteProfile] = useState<AgenteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.currentUser) {
        const userResult = await getUserProfile(auth.currentUser.uid);
        const agenteResult = await getAgenteProfile(auth.currentUser.uid);

        if (userResult.success && userResult.data) {
          setUserProfile(userResult.data);
        }

        if (agenteResult.success && agenteResult.data) {
          setAgenteProfile(agenteResult.data);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    const confirmed = window.confirm('Tem certeza que deseja sair?');
    if (confirmed) {
      await logout();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!userProfile || !agenteProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Erro ao carregar perfil</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white">VôleiHub</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Olá, {userProfile.displayName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Dashboard do Agente</h1>
          <p className="text-gray-400">Gerencie sua rede de atletas e clubes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">{userProfile.displayName}</h2>
                <span className="mt-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
                  Agente Esportivo
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <span>{agenteProfile.city} - {agenteProfile.state}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span>{agenteProfile.phone}</span>
                </div>
                {agenteProfile.website && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Globe className="w-5 h-5 text-green-500" />
                    <a href={agenteProfile.website} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">
                      Website
                    </a>
                  </div>
                )}
                {agenteProfile.yearsOfExperience && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Award className="w-5 h-5 text-green-500" />
                    <span>{agenteProfile.yearsOfExperience} anos de experiência</span>
                  </div>
                )}
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>

            {agenteProfile.specialization && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Especialização</h3>
                <p className="text-gray-300 capitalize">{agenteProfile.specialization.replace('-', ' ')}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sobre Mim</h3>
              <p className="text-gray-300 leading-relaxed">
                {agenteProfile.bio || 'Nenhuma bio adicionada ainda.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-green-500 mb-2">
                  {agenteProfile.athletes?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Atletas</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-green-500 mb-2">
                  {agenteProfile.clubs?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Clubes</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-green-500 mb-2">
                  {agenteProfile.successfulDeals || 0}
                </div>
                <div className="text-sm text-gray-400">Negociações</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl hover:border-orange-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-white">Buscar Atletas</h4>
                </div>
                <p className="text-sm text-gray-400">Expanda sua rede de talentos</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-white">Buscar Clubes</h4>
                </div>
                <p className="text-sm text-gray-400">Encontre oportunidades</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}