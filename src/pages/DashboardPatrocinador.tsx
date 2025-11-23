import { useState, useEffect } from 'react';
import { Award, MapPin, Phone, Globe, DollarSign, Edit2, LogOut, Trophy, Users, TrendingUp } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, getPatrocinadorProfile, UserProfile, PatrocinadorProfile } from '../firebase/firestore';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function DashboardPatrocinador() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [patrocinadorProfile, setPatrocinadorProfile] = useState<PatrocinadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.currentUser) {
        const userResult = await getUserProfile(auth.currentUser.uid);
        const patrocinadorResult = await getPatrocinadorProfile(auth.currentUser.uid);

        if (userResult.success && userResult.data) {
          setUserProfile(userResult.data);
        }

        if (patrocinadorResult.success && patrocinadorResult.data) {
          setPatrocinadorProfile(patrocinadorResult.data);
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

  if (!userProfile || !patrocinadorProfile) {
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
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white">VôleiHub</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Olá, {patrocinadorProfile.brandName || userProfile.displayName}</span>
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
          <h1 className="text-4xl font-black text-white mb-2">Dashboard do Patrocinador</h1>
          <p className="text-gray-400">Gerencie seus patrocínios e campanhas</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">{patrocinadorProfile.brandName}</h2>
                <p className="text-yellow-500 font-semibold">{patrocinadorProfile.industry}</p>
                <span className="mt-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm">
                  Patrocinador
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-yellow-500" />
                  <span>{patrocinadorProfile.city} - {patrocinadorProfile.state}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-yellow-500" />
                  <span>{patrocinadorProfile.phone}</span>
                </div>
                {patrocinadorProfile.website && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Globe className="w-5 h-5 text-yellow-500" />
                    <a href={patrocinadorProfile.website} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors">
                      Website
                    </a>
                  </div>
                )}
                {patrocinadorProfile.budget && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                    <span>R$ {patrocinadorProfile.budget.toLocaleString('pt-BR')}/ano</span>
                  </div>
                )}
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>

            {patrocinadorProfile.interests && patrocinadorProfile.interests.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Interesses</h3>
                <div className="flex flex-wrap gap-2">
                  {patrocinadorProfile.interests.map((interest) => (
                    <span key={interest} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm capitalize">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sobre a Marca</h3>
              <p className="text-gray-300 leading-relaxed">
                {patrocinadorProfile.description || 'Nenhuma descrição adicionada ainda.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-yellow-500 mb-2">
                  {patrocinadorProfile.currentSponsorships?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Patrocínios Ativos</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-yellow-500 mb-2">
                  0
                </div>
                <div className="text-sm text-gray-400">Campanhas</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-yellow-500 mb-2">
                  0
                </div>
                <div className="text-sm text-gray-400">ROI Médio</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  Patrocínios Ativos
                </h3>
                <button className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-colors">
                  Novo Patrocínio
                </button>
              </div>

              {patrocinadorProfile.currentSponsorships && patrocinadorProfile.currentSponsorships.length > 0 ? (
                <div className="space-y-4">
                  {patrocinadorProfile.currentSponsorships.map((sponsorship, index) => (
                    <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <h4 className="font-bold text-white">{sponsorship}</h4>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhum patrocínio ativo no momento.</p>
                  <button className="mt-4 px-6 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-colors">
                    Buscar Oportunidades
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl hover:border-orange-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-white">Buscar Atletas</h4>
                </div>
                <p className="text-sm text-gray-400">Encontre atletas para patrocinar</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-white">Buscar Clubes</h4>
                </div>
                <p className="text-sm text-gray-400">Patrocine clubes de vôlei</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}