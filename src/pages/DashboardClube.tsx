import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Calendar, Globe, FileText, Target, Users, Trophy, Edit2, LogOut, Briefcase, UserPlus, X } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, getClubeProfile, updateClubeProfile, UserProfile, ClubeProfile, db } from '../firebase/firestore';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import EditarPerfilClube from '../components/EditarPerfilClube';
import UploadFotoPerfil from '../components/UploadFotoPerfil';

export default function DashboardClube() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clubeProfile, setClubeProfile] = useState<ClubeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  const loadProfiles = async () => {
    if (auth.currentUser) {
      console.log('🔄 [CLUBE] Carregando perfis...');
      
      const userResult = await getUserProfile(auth.currentUser.uid);
      if (userResult.success && userResult.data) {
        console.log('✅ [CLUBE] Perfil de usuário carregado');
        setUserProfile(userResult.data);
      }

      const clubeResult = await getClubeProfile(auth.currentUser.uid);
      if (clubeResult.success && clubeResult.data) {
        console.log('✅ [CLUBE] Perfil de clube encontrado');
        setClubeProfile(clubeResult.data);
      } else {
        console.log('⚠️ [CLUBE] Perfil não encontrado, criando...');
        
        const novoPerfilClube: ClubeProfile = {
          userId: auth.currentUser.uid,
          clubName: 'Meu Clube',
          foundedYear: new Date().getFullYear(),
          category: 'Não definido',
          city: '',
          state: '',
          phone: '',
          website: '',
          description: 'Complete o perfil do seu clube para atrair atletas e patrocinadores!',
          stats: { athletes: 0, titles: 0, matches: 0 },
          achievements: [],
          seeking: []
        };

        try {
          const clubeRef = doc(db, 'clubes', auth.currentUser.uid);
          await setDoc(clubeRef, novoPerfilClube);
          console.log('✅ [CLUBE] Perfil criado automaticamente!');
          setClubeProfile(novoPerfilClube);
        } catch (error) {
          console.error('❌ [CLUBE] Erro ao criar perfil:', error);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSaveProfile = async (updatedProfile: Partial<ClubeProfile>) => {
    if (!auth.currentUser) return;
    
    console.log('💾 [CLUBE] Salvando perfil...');
    const result = await updateClubeProfile(auth.currentUser.uid, updatedProfile);
    
    if (result.success) {
      console.log('✅ [CLUBE] Perfil atualizado!');
      await loadProfiles();
    } else {
      console.error('❌ [CLUBE] Erro ao atualizar:', result.error);
      throw new Error(result.error);
    }
  };

  const handlePhotoUpdated = (newPhotoURL: string) => {
    console.log('📸 [CLUBE] Foto atualizada:', newPhotoURL);
    loadProfiles();
    setShowUploadModal(false);
  };

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
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-4">Carregando seu dashboard...</div>
        </div>
      </div>
    );
  }

  if (!userProfile || !clubeProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Erro ao carregar perfil</div>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-500 text-white rounded-lg">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Navbar */}
      <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white">VôleiHub</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Olá, {userProfile.displayName}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Dashboard do Clube</h1>
          <p className="text-gray-400">Gerencie seu clube e encontre talentos</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer" onClick={() => setShowUploadModal(true)}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 bg-gradient-to-br from-blue-500 to-cyan-600">
                    {userProfile.photoURL || clubeProfile.photoURL ? (
                      <img src={userProfile.photoURL || clubeProfile.photoURL} alt={clubeProfile.clubName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <div className="text-center text-white">
                      <Edit2 className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs font-semibold">Alterar</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-1 mt-4">{clubeProfile.clubName}</h2>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm font-semibold">Clube</span>
              </div>

              <div className="space-y-3">
                {clubeProfile.category && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">{clubeProfile.category}</span>
                  </div>
                )}
                {clubeProfile.foundedYear && clubeProfile.foundedYear > 0 && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Fundado em {clubeProfile.foundedYear}</span>
                  </div>
                )}
                {(clubeProfile.city || clubeProfile.state) && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{clubeProfile.city}{clubeProfile.city && clubeProfile.state ? ', ' : ''}{clubeProfile.state}</span>
                  </div>
                )}
                {clubeProfile.phone && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{clubeProfile.phone}</span>
                  </div>
                )}
                {clubeProfile.website && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Globe className="w-4 h-4" />
                    <a href={clubeProfile.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-blue-500 transition-colors">
                      {clubeProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {clubeProfile.seeking && clubeProfile.seeking.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-3">Estamos Procurando:</h3>
                  <div className="flex flex-wrap gap-2">
                    {clubeProfile.seeking.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-xs capitalize">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setShowEditModal(true)} className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sobre o Clube</h3>
              <p className="text-gray-400 leading-relaxed">{clubeProfile.description || 'Complete o perfil!'}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Estatísticas</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-500 mb-2">{clubeProfile.stats?.athletes || 0}</div>
                  <div className="text-gray-400 text-sm">Atletas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-500 mb-2">{clubeProfile.stats?.titles || 0}</div>
                  <div className="text-gray-400 text-sm">Títulos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-500 mb-2">{clubeProfile.stats?.matches || 0}</div>
                  <div className="text-gray-400 text-sm">Partidas</div>
                </div>
              </div>
            </div>

            {clubeProfile.achievements && clubeProfile.achievements.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Principais Conquistas</h3>
                <div className="space-y-3">
                  {clubeProfile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group">
                <Users className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">Buscar Atletas</h4>
                <p className="text-gray-400 text-sm">Encontre talentos</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                <UserPlus className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">Publicar Vaga</h4>
                <p className="text-gray-400 text-sm">Anuncie vagas</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-6 hover:border-green-500/50 transition-all cursor-pointer group">
                <Briefcase className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">Buscar Treinadores</h4>
                <p className="text-gray-400 text-sm">Profissionais qualificados</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-500/50 transition-all cursor-pointer group">
                <Trophy className="w-8 h-8 text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">Buscar Patrocínio</h4>
                <p className="text-gray-400 text-sm">Conecte-se</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditarPerfilClube isOpen={showEditModal} onClose={() => setShowEditModal(false)} clubeProfile={clubeProfile} userDisplayName={userProfile.displayName} onSave={handleSaveProfile} />

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-white/10 shadow-2xl p-6">
            <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
            <h2 className="text-2xl font-black text-white mb-6 text-center">Logo do Clube</h2>
            <UploadFotoPerfil userId={userProfile.uid} currentPhotoURL={userProfile.photoURL || clubeProfile.photoURL} onPhotoUpdated={handlePhotoUpdated} userType="clubes" />
          </div>
        </div>
      )}
    </div>
  );
}