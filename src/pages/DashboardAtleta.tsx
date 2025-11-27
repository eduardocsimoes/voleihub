import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit, User, Calendar, Ruler, Weight, Mail } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, updateUserProfile, AtletaProfile, CareerExperience, Achievement } from '../firebase/firestore';
import type { UserProfile } from '../firebase/firestore';
import TimelineCarreira from '../components/TimelineCarreira';
import AdicionarCarreira from '../components/AdicionarExperiencia';
import EditarPerfilModal from '../components/EditarPerfilModal';

export default function DashboardAtleta() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [atletaProfile, setAtletaProfile] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [editingExperience, setEditingExperience] = useState<CareerExperience | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const result = await getUserProfile(user.uid);
        
        if (result.success && result.data) {
          setUserProfile(result.data);
          
          if (result.data.profileType === 'atleta') {
            setAtletaProfile(result.data as AtletaProfile);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleSaveProfile = async (updates: Partial<AtletaProfile>) => {
    if (!auth.currentUser || !atletaProfile) return;

    try {
      const result = await updateUserProfile(auth.currentUser.uid, updates);
      
      if (result.success) {
        setAtletaProfile({ ...atletaProfile, ...updates });
        setUserProfile({ ...userProfile!, ...updates });
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handleAddExperience = async (experience: CareerExperience) => {
    if (!atletaProfile) return;
    const updatedExperiences = [...(atletaProfile.careerExperiences || []), experience];
    await handleSaveProfile({ careerExperiences: updatedExperiences });
    setShowAddExperience(false);
  };

  const handleUpdateExperience = async (updated: CareerExperience) => {
    if (!atletaProfile) return;
    const updatedList = atletaProfile.careerExperiences?.map(exp => exp.id === updated.id ? updated : exp) || [];
    await handleSaveProfile({ careerExperiences: updatedList });
    setEditingExperience(null);
    setShowAddExperience(false);
  };

  const handleDeleteExperience = async (id: string) => {
    if (!atletaProfile) return;
    const updatedExperiences = atletaProfile.careerExperiences?.filter(exp => exp.id !== id) || [];
    const clubToDelete = atletaProfile.careerExperiences?.find(exp => exp.id === id);
    const updatedAchievements = atletaProfile.careerAchievements?.filter(ach => 
      ach.club.toLowerCase() !== clubToDelete?.clubName.toLowerCase()
    ) || [];
    await handleSaveProfile({ careerExperiences: updatedExperiences, careerAchievements: updatedAchievements });
  };

  const handleEditExperience = (experience: CareerExperience) => {
    setEditingExperience(experience);
    setShowAddExperience(true);
  };

  const handleAddAchievement = async (achievement: Achievement) => {
    if (!atletaProfile) return;
    const updatedAchievements = [...(atletaProfile.careerAchievements || []), achievement];
    await handleSaveProfile({ careerAchievements: updatedAchievements });
    setShowAddAchievement(false);
  };

  const handleUpdateAchievement = async (updated: Achievement) => {
    if (!atletaProfile) return;
    const updatedList = atletaProfile.careerAchievements?.map(ach => ach.id === updated.id ? updated : ach) || [];
    await handleSaveProfile({ careerAchievements: updatedList });
    setEditingAchievement(null);
    setShowAddAchievement(false);
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!atletaProfile) return;
    const updatedList = atletaProfile.careerAchievements?.filter(ach => ach.id !== id) || [];
    await handleSaveProfile({ careerAchievements: updatedList });
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowAddAchievement(true);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || !atletaProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Perfil não encontrado</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏐</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">VôleiHub</h1>
                <p className="text-xs text-gray-400">Dashboard do Atleta</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-semibold transition-all border border-red-500/30">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative bg-gradient-to-br from-orange-500/10 via-red-600/10 to-purple-600/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 mb-8 overflow-hidden">
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30 transition-transform group-hover:scale-105">
                {atletaProfile.photoURL ? <img src={atletaProfile.photoURL} alt={atletaProfile.name} className="w-full h-full object-cover rounded-2xl" /> : <User className="w-16 h-16 text-white" />}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{atletaProfile.name}</h2>
                  {atletaProfile.position && <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold border border-orange-500/30">{atletaProfile.position}</span>}
                </div>
                <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30">
                  <Edit className="w-4 h-4" />
                  Editar Perfil
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-400">Email</p>
                  </div>
                  <p className="text-sm text-white font-semibold truncate">{atletaProfile.email}</p>
                </div>
                {atletaProfile.birthDate && (
                  <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">Nascimento</p>
                    </div>
                    <p className="text-sm text-white font-semibold">{atletaProfile.birthDate}</p>
                  </div>
                )}
                {atletaProfile.height && (
                  <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">Altura</p>
                    </div>
                    <p className="text-sm text-white font-semibold">{atletaProfile.height} cm</p>
                  </div>
                )}
                {atletaProfile.weight && (
                  <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Weight className="w-4 h-4 text-gray-400" />
                      <p className="text-xs text-gray-400">Peso</p>
                    </div>
                    <p className="text-sm text-white font-semibold">{atletaProfile.weight} kg</p>
                  </div>
                )}
              </div>
              {atletaProfile.bio && (
                <div className="mt-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                  <p className="text-gray-300 text-sm leading-relaxed">{atletaProfile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-500/20 rounded-xl"><span className="text-3xl">🏢</span></div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{atletaProfile.careerExperiences?.length || 0}</p>
                  <p className="text-blue-400 text-sm font-semibold">Clubes</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Equipes na carreira</p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-yellow-500/10 to-orange-600/10 backdrop-blur-xl rounded-2xl border border-yellow-500/20 p-6 overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-yellow-500/20 rounded-xl"><span className="text-3xl">🏆</span></div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{atletaProfile.careerAchievements?.length || 0}</p>
                  <p className="text-yellow-400 text-sm font-semibold">Títulos</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Conquistas profissionais</p>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-500/20 rounded-xl"><span className="text-3xl">⭐</span></div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{atletaProfile.careerExperiences?.reduce((total, exp) => {
                    const start = exp.startYear;
                    const end = exp.current ? new Date().getFullYear() : (exp.endYear || start);
                    return total + (end - start);
                  }, 0) || 0}</p>
                  <p className="text-purple-400 text-sm font-semibold">Anos</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Tempo de experiência</p>
            </div>
          </div>
        </div>

        <TimelineCarreira
          experiences={atletaProfile.careerExperiences || []}
          achievements={atletaProfile.careerAchievements || []}
          onUpdate={(exp, ach) => { handleSaveProfile({ careerExperiences: exp, careerAchievements: ach }); }}
          editMode={true}
          onAddExperience={() => { setEditingExperience(null); setShowAddExperience(true); }}
          onAddAchievement={() => { setEditingAchievement(null); setShowAddAchievement(true); }}
          onEditExperience={handleEditExperience}
          onDeleteExperience={handleDeleteExperience}
          onEditAchievement={handleEditAchievement}
          onDeleteAchievement={handleDeleteAchievement}
        />
      </div>

      {showEditModal && <EditarPerfilModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} atletaProfile={atletaProfile} onSave={handleSaveProfile} />}
      
      <AdicionarCarreira
        isOpen={showAddExperience}
        onClose={() => { setShowAddExperience(false); setEditingExperience(null); }}
        onSave={(exp) => { if (editingExperience) { handleUpdateExperience({ ...exp, id: editingExperience.id }); } else { handleAddExperience(exp); }}}
        type="experience"
        editData={editingExperience}
      />

      <AdicionarCarreira
        isOpen={showAddAchievement}
        onClose={() => { setShowAddAchievement(false); setEditingAchievement(null); }}
        onSave={(ach) => { if (editingAchievement) { handleUpdateAchievement({ ...ach, id: editingAchievement.id }); } else { handleAddAchievement(ach); }}}
        type="achievement"
        registeredClubs={atletaProfile.careerExperiences?.map(exp => exp.clubName) || []}
        editData={editingAchievement}
      />
    </div>
  );
}