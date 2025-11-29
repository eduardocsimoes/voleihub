import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AtletaProfile, CareerExperience, Achievement } from '../firebase/firestore';
import { 
  getUserProfile, 
  addExperience, 
  updateExperience, 
  deleteExperience,
  addAchievement,
  updateAchievement,
  deleteAchievement
} from '../firebase/firestore';
import { Calendar, Ruler, Weight, Edit } from 'lucide-react';
import TimelineCarreira from '../components/TimelineCarreira';
import AdicionarCarreira from '../components/AdicionarCarreira';
import EditarPerfilModal from '../components/EditarPerfilModal';
import Sidebar from '../components/Sidebar';
import HeaderAtleta from '../components/HeaderAtleta';
import Footer from '../components/Footer';
import BadgesSection from '../components/BadgesSection';
import StatisticsSection from '../components/StatisticsSection';
import EmptyState from '../components/EmptyState';
import CarreiraTimeline from '../components/CarreiraTimeline';

type ModalType = 'experience' | 'achievement' | 'editProfile' | null;

export default function DashboardAtleta() {
  const { currentUser } = useAuth();
  const [atletaProfile, setAtletaProfile] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalAberto, setModalAberto] = useState<ModalType>(null);
  const [editData, setEditData] = useState<CareerExperience | Achievement | null>(null);

  const loadProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setAtletaProfile(profile);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const handleSaveExperience = async (experience: CareerExperience) => {
    if (!currentUser) return;
    try {
      if (editData && 'clubName' in editData) {
        await updateExperience(currentUser.uid, editData as CareerExperience, experience);
      } else {
        await addExperience(currentUser.uid, experience);
      }
      await loadProfile();
      setModalAberto(null);
      setEditData(null);
    } catch (error) {
      console.error('Erro ao salvar experiência:', error);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!currentUser || !atletaProfile) return;
    const experience = atletaProfile.experiences?.find(exp => exp.id === id);
    if (!experience) return;
    try {
      await deleteExperience(currentUser.uid, experience);
      await loadProfile();
    } catch (error) {
      console.error('Erro ao deletar experiência:', error);
    }
  };

  const handleEditExperience = (experience: CareerExperience) => {
    setEditData(experience);
    setModalAberto('experience');
  };

  const handleSaveAchievement = async (achievement: Achievement) => {
    if (!currentUser) return;
    try {
      if (editData && 'championship' in editData) {
        await updateAchievement(currentUser.uid, editData as Achievement, achievement);
      } else {
        await addAchievement(currentUser.uid, achievement);
      }
      await loadProfile();
      setModalAberto(null);
      setEditData(null);
    } catch (error) {
      console.error('Erro ao salvar conquista:', error);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!currentUser || !atletaProfile) return;
    const achievement = atletaProfile.achievements?.find(ach => ach.id === id);
    if (!achievement) return;
    try {
      await deleteAchievement(currentUser.uid, achievement);
      await loadProfile();
    } catch (error) {
      console.error('Erro ao deletar conquista:', error);
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditData(achievement);
    setModalAberto('achievement');
  };

  const calcularAnosCarreira = () => {
    if (!atletaProfile?.experiences || atletaProfile.experiences.length === 0) return 0;
    const experiencias = [...atletaProfile.experiences].sort((a, b) => a.startYear - b.startYear);
    const primeiroAno = experiencias[0].startYear;
    const anoAtual = new Date().getFullYear();
    return anoAtual - primeiroAno;
  };

  const totalClubes = atletaProfile?.experiences?.length || 0;
  const totalTitulos = atletaProfile?.achievements?.length || 0;
  const anosCarreira = calcularAnosCarreira();
  const isProfileEmpty = totalClubes === 0 && totalTitulos === 0;
  const registeredClubs = atletaProfile?.experiences?.map(exp => exp.clubName) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="lg:ml-20">
        {atletaProfile && (
          <HeaderAtleta
            atletaProfile={atletaProfile}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onEditProfile={() => setModalAberto('editProfile')}
          />
        )}

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeSection === 'overview' && (
              <>
                {isProfileEmpty ? (
                  <EmptyState
                    onAddClube={() => setModalAberto('experience')}
                    onAddTitulo={() => setModalAberto('achievement')}
                    onEditProfile={() => setModalAberto('editProfile')}
                  />
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-orange-500/20">
                      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <div className="relative">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-orange-500/30 bg-gradient-to-br from-orange-500 to-red-600">
                            {atletaProfile?.photoURL ? (
                              <img src={atletaProfile.photoURL} alt={atletaProfile.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                                {atletaProfile?.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{atletaProfile?.name}</h1>
                              <p className="text-orange-400 text-lg font-semibold">{atletaProfile?.position || 'Posição não definida'}</p>
                            </div>
                            <button onClick={() => setModalAberto('editProfile')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                              <Edit size={18} />
                              <span className="hidden sm:inline">Editar</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {atletaProfile?.birthDate && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Calendar size={16} className="text-orange-400" />
                                <span className="text-sm">{new Date(atletaProfile.birthDate).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                            {atletaProfile?.height && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Ruler size={16} className="text-orange-400" />
                                <span className="text-sm">{atletaProfile.height}cm</span>
                              </div>
                            )}
                            {atletaProfile?.weight && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <Weight size={16} className="text-orange-400" />
                                <span className="text-sm">{atletaProfile.weight}kg</span>
                              </div>
                            )}
                          </div>

                          {atletaProfile?.bio && (
                            <p className="text-gray-400 mt-4 leading-relaxed">{atletaProfile.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                        <div className="text-4xl font-bold text-white mb-2">{totalClubes}</div>
                        <div className="text-blue-200">Clubes</div>
                      </div>
                      <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
                        <div className="text-4xl font-bold text-white mb-2">{totalTitulos}</div>
                        <div className="text-yellow-200">Títulos</div>
                      </div>
                      <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
                        <div className="text-4xl font-bold text-white mb-2">{anosCarreira}</div>
                        <div className="text-green-200">Anos de Carreira</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-orange-500/30 hover:border-orange-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">📅 Trajetória Profissional</h2>
                          <p className="text-gray-300 mb-4">Confira sua história completa no vôlei: clubes, títulos e conquistas em uma timeline interativa.</p>
                          <div className="flex gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><span className="text-xl">🏟️</span></div>
                              <div>
                                <div className="text-2xl font-bold text-white">{totalClubes}</div>
                                <div className="text-sm text-gray-400">Clubes</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center"><span className="text-xl">🏆</span></div>
                              <div>
                                <div className="text-2xl font-bold text-white">{totalTitulos}</div>
                                <div className="text-sm text-gray-400">Títulos</div>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setActiveSection('trajetoria')} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all hover:scale-105">
                            <span>Ver Trajetória Completa</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        <div className="hidden lg:block">
                          <div className="w-32 h-32 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center">
                            <span className="text-6xl">📖</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeSection === 'statistics' && <StatisticsSection />}
            
            {activeSection === 'trajetoria' && (
              <CarreiraTimeline
                experiences={atletaProfile?.experiences || []}
                achievements={atletaProfile?.achievements || []}
                userId={currentUser?.uid || ''}
                onUpdate={loadProfile}
              />
            )}
            
            {activeSection === 'achievements' && <BadgesSection />}

            {activeSection === 'profile' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Perfil Completo</h2>
                <p className="text-gray-400">Seção em desenvolvimento.</p>
              </div>
            )}
            {activeSection === 'gallery' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Galeria de Fotos</h2>
                <p className="text-gray-400">Seção em desenvolvimento.</p>
              </div>
            )}
            {activeSection === 'documents' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Documentos</h2>
                <p className="text-gray-400">Seção em desenvolvimento.</p>
              </div>
            )}
            {activeSection === 'messages' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Mensagens</h2>
                <p className="text-gray-400">Seção em desenvolvimento.</p>
              </div>
            )}
            {activeSection === 'settings' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
                <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>
                <p className="text-gray-400">Seção em desenvolvimento.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {modalAberto === 'experience' && (
        <AdicionarCarreira 
          isOpen={true} 
          onClose={() => { setModalAberto(null); setEditData(null); }} 
          onSave={handleSaveExperience} 
          type="experience" 
          registeredClubs={registeredClubs} 
          editData={editData as CareerExperience | null} 
        />
      )}
      {modalAberto === 'achievement' && (
        <AdicionarCarreira 
          isOpen={true} 
          onClose={() => { setModalAberto(null); setEditData(null); }} 
          onSave={handleSaveAchievement} 
          type="achievement" 
          registeredClubs={registeredClubs} 
          editData={editData as Achievement | null} 
        />
      )}
      {modalAberto === 'editProfile' && atletaProfile && (
        <EditarPerfilModal 
          isOpen={true} 
          onClose={() => setModalAberto(null)} 
          atletaProfile={atletaProfile} 
          onSuccess={loadProfile} 
        />
      )}
    </div>
  );
}