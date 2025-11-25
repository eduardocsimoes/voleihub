import { useState, useEffect } from 'react';
import { User, MapPin, Phone, Ruler, Weight, Calendar, Target, TrendingUp, Edit2, LogOut, Trophy, X } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, getAtletaProfile, updateAtletaProfile, UserProfile, AtletaProfile, db } from '../firebase/firestore';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import EditarPerfilModal from '../components/EditarPerfilModal';
import UploadFotoPerfil from '../components/UploadFotoPerfil';

import TimelineCarreira from '../components/TimelineCarreira';
import AdicionarCarreira from '../components/AdicionarExperiencia';

export default function DashboardAtleta() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [atletaProfile, setAtletaProfile] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);

  const loadProfiles = async () => {
    if (auth.currentUser) {
      console.log('🔄 Carregando perfis...');
      
      const userResult = await getUserProfile(auth.currentUser.uid);
      if (userResult.success && userResult.data) {
        console.log('✅ Perfil de usuário carregado');
        setUserProfile(userResult.data);
      }

      const atletaResult = await getAtletaProfile(auth.currentUser.uid);
      if (atletaResult.success && atletaResult.data) {
        console.log('✅ Perfil de atleta encontrado');
        setAtletaProfile(atletaResult.data);
      } else {
        console.log('⚠️ Perfil de atleta não encontrado, criando...');
        
        const novoPerfilAtleta: AtletaProfile = {
          userId: auth.currentUser.uid,
          position: 'Não definido',
          height: 0,
          weight: 0,
          birthDate: '',
          city: '',
          state: '',
          phone: '',
          bio: 'Complete seu perfil para se destacar!',
          stats: { aces: 0, blocks: 0, attacks: 0 },
          videos: [],
          achievements: [],
          seeking: []
        };

        try {
          const atletaRef = doc(db, 'atletas', auth.currentUser.uid);
          await setDoc(atletaRef, novoPerfilAtleta);
          console.log('✅ Perfil de atleta criado automaticamente!');
          setAtletaProfile(novoPerfilAtleta);
        } catch (error) {
          console.error('❌ Erro ao criar perfil de atleta:', error);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSaveProfile = async (updatedProfile: Partial<AtletaProfile>) => {
    if (!auth.currentUser) return;
    
    console.log('💾 Salvando perfil atualizado...');
    const result = await updateAtletaProfile(auth.currentUser.uid, updatedProfile);
    
    if (result.success) {
      console.log('✅ Perfil atualizado com sucesso!');
      await loadProfiles();
    } else {
      console.error('❌ Erro ao atualizar:', result.error);
      throw new Error(result.error);
    }
  };

  const handleAddExperience = async (experience: any) => {
    console.log('🔵 handleAddExperience chamado!');  // ← ADICIONE ESTA LINHA
    if (!auth.currentUser || !atletaProfile) return;
    
    const updated = {
      careerExperiences: [...(atletaProfile.careerExperiences || []), experience]
    };
    
    await handleSaveProfile(updated);
    setShowAddExperience(false);
  };
  
  const handleAddAchievement = async (achievement: any) => {
    if (!auth.currentUser || !atletaProfile) return;
    
    const updated = {
      careerAchievements: [...(atletaProfile.careerAchievements || []), achievement]
    };
    
    await handleSaveProfile(updated);
    setShowAddAchievement(false);
  };

  const handlePhotoUpdated = (newPhotoURL: string) => {
    console.log('📸 Foto atualizada:', newPhotoURL);
    // Recarregar perfis para atualizar foto
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
          <div className="text-gray-400 text-sm">Aguarde um momento</div>
        </div>
      </div>
    );
  }

  if (!userProfile || !atletaProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Erro ao carregar perfil</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Voltar para Home
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
              {/* Avatar com Upload */}
              <div className="flex flex-col items-center mb-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setShowUploadModal(true)}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 bg-gradient-to-br from-orange-500 to-red-600">
                    {userProfile.photoURL || atletaProfile.photoURL ? (
                      <img
                        src={userProfile.photoURL || atletaProfile.photoURL}
                        alt={userProfile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay de hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <div className="text-center text-white">
                      <Edit2 className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs font-semibold">Alterar</span>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-1 mt-4">{userProfile.displayName}</h2>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-semibold">
                  Atleta
                </span>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">{atletaProfile.position || 'Posição não definida'}</span>
                </div>
                
                {atletaProfile.height && atletaProfile.height > 0 && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Ruler className="w-4 h-4" />
                    <span className="text-sm">{atletaProfile.height} cm</span>
                  </div>
                )}

                {atletaProfile.weight && atletaProfile.weight > 0 && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Weight className="w-4 h-4" />
                    <span className="text-sm">{atletaProfile.weight} kg</span>
                  </div>
                )}

                {atletaProfile.birthDate && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(atletaProfile.birthDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}

                {(atletaProfile.city || atletaProfile.state) && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{atletaProfile.city}{atletaProfile.city && atletaProfile.state ? ', ' : ''}{atletaProfile.state}</span>
                  </div>
                )}

                {atletaProfile.phone && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{atletaProfile.phone}</span>
                  </div>
                )}
              </div>

              {/* Seeking */}
              {atletaProfile.seeking && atletaProfile.seeking.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-3">Estou Procurando:</h3>
                  <div className="flex flex-wrap gap-2">
                    {atletaProfile.seeking.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-xs capitalize">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <button 
                onClick={() => setShowEditModal(true)}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sobre Mim</h3>
              <p className="text-gray-400 leading-relaxed">
                {atletaProfile.bio || 'Adicione uma biografia para se destacar! Conte sua história, suas conquistas e seus objetivos.'}
              </p>
            </div>

            <TimelineCarreira
              experiences={atletaProfile.careerExperiences || []}
              achievements={atletaProfile.careerAchievements || []}
              onUpdate={(exp, ach) => {
                handleSaveProfile({
                  careerExperiences: exp,
                  careerAchievements: ach
                });
              }}
              editMode={true}
              onAddExperience={() => {
                console.log('🟢 CALLBACK CHAMADO!');
                setShowAddExperience(true);
              }}
              onAddAchievement={() => {
                console.log('🟡 CALLBACK CHAMADO!');
                setShowAddAchievement(true);
              }}
            />
            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Estatísticas</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-orange-500 mb-2">
                    {atletaProfile.stats?.aces || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Aces</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-orange-500 mb-2">
                    {atletaProfile.stats?.blocks || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Bloqueios</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-orange-500 mb-2">
                    {atletaProfile.stats?.attacks || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Ataques</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {atletaProfile.achievements && atletaProfile.achievements.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Conquistas</h3>
                <div className="space-y-3">
                  {atletaProfile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/50 transition-all cursor-pointer group">
                <TrendingUp className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">Buscar Clubes</h4>
                <p className="text-gray-400 text-sm">Encontre oportunidades em clubes</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group">
                <Target className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-bold mb-2">Buscar Treinadores</h4>
                <p className="text-gray-400 text-sm">Encontre treinadores especializados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <EditarPerfilModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        atletaProfile={atletaProfile}
        userDisplayName={userProfile.displayName}
        onSave={handleSaveProfile}
      />

      {/* Modal de Upload de Foto */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-white/10 shadow-2xl p-6">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <h2 className="text-2xl font-black text-white mb-6 text-center">Foto de Perfil</h2>
            
            <UploadFotoPerfil
              userId={userProfile.uid}
              currentPhotoURL={userProfile.photoURL || atletaProfile.photoURL}
              onPhotoUpdated={handlePhotoUpdated}
              userType="atletas"
            />
          </div>
        </div>
      )}

    {/* Modal Adicionar Clube */}
    <AdicionarCarreira
      isOpen={showAddExperience}
      onClose={() => setShowAddExperience(false)}
      onSave={handleAddExperience}
      type="experience"
    />

    {/* Modal Adicionar Título */}
    <AdicionarCarreira
      isOpen={showAddAchievement}
      onClose={() => setShowAddAchievement(false)}
      onSave={handleAddAchievement}
      type="achievement"
    />
    </div>
  );
}