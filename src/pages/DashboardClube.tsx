import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Globe, Instagram, Users, TrendingUp, Edit2, LogOut, Trophy, Plus } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, getClubeProfile, UserProfile, ClubeProfile } from '../firebase/firestore';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function DashboardClube() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clubeProfile, setClubeProfile] = useState<ClubeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.currentUser) {
        const userResult = await getUserProfile(auth.currentUser.uid);
        const clubeResult = await getClubeProfile(auth.currentUser.uid);

        if (userResult.success && userResult.data) {
          setUserProfile(userResult.data);
        }

        if (clubeResult.success && clubeResult.data) {
          setClubeProfile(clubeResult.data);
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

  if (!userProfile || !clubeProfile) {
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white">VôleiHub</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Olá, {clubeProfile.clubName || userProfile.displayName}</span>
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
          <h1 className="text-4xl font-black text-white mb-2">Dashboard do Clube</h1>
          <p className="text-gray-400">Gerencie seu clube e encontre novos talentos</p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Club Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">{clubeProfile.clubName}</h2>
                <p className="text-blue-500 font-semibold">{clubeProfile.category}</p>
                <span className="mt-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm">
                  {clubeProfile.division}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span>{clubeProfile.city} - {clubeProfile.state}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span>{clubeProfile.phone}</span>
                </div>
                {clubeProfile.website && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <a href={clubeProfile.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                      Website
                    </a>
                  </div>
                )}
                {clubeProfile.instagram && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Instagram className="w-5 h-5 text-blue-500" />
                    <span>{clubeProfile.instagram}</span>
                  </div>
                )}
                {clubeProfile.foundedYear && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Trophy className="w-5 h-5 text-blue-500" />
                    <span>Fundado em {clubeProfile.foundedYear}</span>
                  </div>
                )}
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>

            {/* Facilities */}
            {clubeProfile.facilities && clubeProfile.facilities.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Instalações</h3>
                <div className="space-y-2">
                  {clubeProfile.facilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300 capitalize">{facility.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sobre o Clube</h3>
              <p className="text-gray-300 leading-relaxed">
                {clubeProfile.description || 'Nenhuma descrição adicionada ainda.'}
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-blue-500 mb-2">
                  {clubeProfile.openPositions?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Vagas Abertas</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-blue-500 mb-2">
                  {clubeProfile.facilities?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Instalações</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-blue-500 mb-2">
                  {clubeProfile.sponsorships?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Patrocinadores</div>
              </div>
            </div>

            {/* Open Positions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Vagas Abertas
                </h3>
                <button className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Vaga
                </button>
              </div>

              {clubeProfile.openPositions && clubeProfile.openPositions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {clubeProfile.openPositions.map((position, index) => (
                    <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <h4 className="font-bold text-white capitalize mb-2">{position}</h4>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded text-xs hover:bg-blue-500/20 transition-colors">
                          Ver Candidatos
                        </button>
                        <button className="px-3 py-1 bg-white/5 text-gray-400 rounded text-xs hover:bg-white/10 transition-colors">
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma vaga aberta no momento.</p>
                  <button className="mt-4 px-6 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors">
                    Publicar Primeira Vaga
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <button className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl hover:border-orange-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-white">Buscar Atletas</h4>
                </div>
                <p className="text-sm text-gray-400">Encontre atletas para seu time</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl hover:border-purple-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <h4 className="font-bold text-white">Treinadores</h4>
                </div>
                <p className="text-sm text-gray-400">Encontre treinadores qualificados</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}