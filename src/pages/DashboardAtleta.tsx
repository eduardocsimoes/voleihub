import { useState, useEffect } from 'react';
import { User, MapPin, Phone, Ruler, Weight, Calendar, Target, TrendingUp, Edit2, LogOut, Trophy } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, getAtletaProfile, UserProfile, AtletaProfile } from '../firebase/firestore';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function DashboardAtleta() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [atletaProfile, setAtletaProfile] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.currentUser) {
        const userResult = await getUserProfile(auth.currentUser.uid);
        const atletaResult = await getAtletaProfile(auth.currentUser.uid);

        if (userResult.success && userResult.data) {
          setUserProfile(userResult.data);
        }

        if (atletaResult.success && atletaResult.data) {
          setAtletaProfile(atletaResult.data);
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

  if (!userProfile || !atletaProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Erro ao carregar perfil</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navbar */}
      <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Meu Dashboard</h1>
          <p className="text-gray-400">Gerencie seu perfil e acompanhe suas oportunidades</p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">{userProfile.displayName}</h2>
                <p className="text-orange-500 font-semibold">{atletaProfile.position}</p>
                <span className="mt-2 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-sm">
                  Atleta
                </span>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>{atletaProfile.city} - {atletaProfile.state}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span>{atletaProfile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Ruler className="w-5 h-5 text-orange-500" />
                  <span>{atletaProfile.height} cm</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Weight className="w-5 h-5 text-orange-500" />
                  <span>{atletaProfile.weight} kg</span>
                </div>
                {atletaProfile.birthDate && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <span>{new Date(atletaProfile.birthDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {/* Edit Profile Button */}
              <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>

            {/* Seeking Card */}
            {atletaProfile.seeking && atletaProfile.seeking.length > 0 && (
              <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Estou Procurando
                </h3>
                <div className="space-y-2">
                  {atletaProfile.seeking.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-300 capitalize">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sobre Mim</h3>
              <p className="text-gray-300 leading-relaxed">
                {atletaProfile.bio || 'Nenhuma bio adicionada ainda.'}
              </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Estatísticas
              </h3>
              
              {atletaProfile.stats ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-black text-orange-500 mb-1">
                      {atletaProfile.stats.aces || 0}
                    </div>
                    <div className="text-sm text-gray-400">Aces</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-black text-orange-500 mb-1">
                      {atletaProfile.stats.blocks || 0}
                    </div>
                    <div className="text-sm text-gray-400">Bloqueios</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-3xl font-black text-orange-500 mb-1">
                      {atletaProfile.stats.attacks || 0}
                    </div>
                    <div className="text-sm text-gray-400">Ataques</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma estatística adicionada ainda.</p>
                  <button className="mt-4 px-6 py-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors">
                    Adicionar Estatísticas
                  </button>
                </div>
              )}
            </div>

            {/* Achievements Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                Conquistas
              </h3>
              
              {atletaProfile.achievements && atletaProfile.achievements.length > 0 ? (
                <div className="space-y-3">
                  {atletaProfile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="text-gray-300">{achievement}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma conquista adicionada ainda.</p>
                  <button className="mt-4 px-6 py-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors">
                    Adicionar Conquistas
                  </button>
                </div>
              )}
            </div>

            {/* Videos Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Vídeos</h3>
              
              {atletaProfile.videos && atletaProfile.videos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {atletaProfile.videos.map((video, index) => (
                    <div key={index} className="aspect-video bg-white/5 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Vídeo {index + 1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhum vídeo adicionado ainda.</p>
                  <button className="mt-4 px-6 py-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors">
                    Adicionar Vídeos
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <button className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-white">Buscar Clubes</h4>
                </div>
                <p className="text-sm text-gray-400">Encontre clubes procurando atletas</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl hover:border-purple-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5 text-purple-500" />
                  </div>
                  <h4 className="font-bold text-white">Treinadores</h4>
                </div>
                <p className="text-sm text-gray-400">Encontre treinadores especializados</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}