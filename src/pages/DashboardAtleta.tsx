import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AtletaProfile, CareerExperience, Achievement } from '../firebase/firestore';
import PerfilCompletoAtleta from "./PerfilCompletoAtleta";
import { auth } from "../firebase/config";
import AdicionarConquistaPadronizada 
from "./cards/components/AdicionarConquistaPadronizada";

import { 
  getUserProfile, 
  updateAtletaProfile,
  addExperience, 
  updateExperience, 
  deleteExperience,
  addAchievement,
  updateAchievement,
  deleteAchievement
} from '../firebase/firestore';
import { 
  Calendar, 
  Ruler, 
  Weight, 
  Edit, 
  MapPin, 
  Trophy, 
  TrendingUp, 
  Eye, 
  Users, 
  Award, 
  Clock, 
  Star 
} from 'lucide-react';

import AdicionarCarreira from '../components/AdicionarCarreira';
import EditarPerfilModal from '../components/EditarPerfilModal';
import Sidebar from '../components/Sidebar';
import HeaderAtleta from '../components/HeaderAtleta';
import Footer from '../components/Footer';
import BadgesSection from '../components/BadgesSection';
import StatisticsSection from '../components/StatisticsSection';
import EmptyState from '../components/EmptyState';
import CarreiraTimeline from '../components/CarreiraTimeline';
import TimelineHorizontal from '../components/TimelineHorizontal';
import RankingAtletas from "./RankingAtletas";
import XPHistory from "../components/XPHistory";
import PhysicalEvolutionMenu from "./evolucao/PhysicalEvolutionMenu";
import AlturaAtleta from "./evolucao/AlturaAtleta";
import SaltoAtleta from "./evolucao/SaltoAtleta";
import AthleteCardsPage from "./cards/AthleteCardsPage";

// 🔥 Gamificação
import { calculateAthleteGamification } from '../gamification/gamification';

type ModalType = 'experience' | 'achievement' | 'editProfile' | null;

export default function DashboardAtleta() {
  const { currentUser } = useAuth();
  const [atletaProfile, setAtletaProfile] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalAberto, setModalAberto] = useState<ModalType>(null);
  const [editData, setEditData] = useState<CareerExperience | Achievement | null>(null);
  const [selectedClub, setSelectedClub] = useState<CareerExperience | null>(null);

  const loadProfile = async () => {
    try {
        if (!currentUser) return;   // ← ADICIONAR
  
        setLoading(true);
  
        const profile = await getUserProfile(currentUser.uid);
  
        if (profile) {
  
            const newHistoryEntry = {
                date: new Date().toISOString(),
                xp: profile.careerScore || 0,
                reason: "Recalculo automático"
            };
  
            await updateAtletaProfile(profile.uid, {
                xpHistory: [
                    ...(profile.xpHistory || []),
                    newHistoryEntry
                ]
            });
  
            setAtletaProfile({
                ...profile,
                xpHistory: [
                    ...(profile.xpHistory || []),
                    newHistoryEntry
                ]
            });
        }
  
        setLoading(false);
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
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
      // Deletar experiência
      await deleteExperience(currentUser.uid, experience);
      
      // Deletar TODOS os títulos vinculados a este clube
      const titlesFromClub = atletaProfile.achievements?.filter(ach => ach.club === experience.clubName) || [];
      for (const achievement of titlesFromClub) {
        await deleteAchievement(currentUser.uid, achievement);
      }
      
      await loadProfile();
    } catch (error) {
      console.error('Erro ao deletar experiência:', error);
    }
  };

  const handleDeleteExperienceFromTimeline = async (experience: CareerExperience) => {
    if (!currentUser || !atletaProfile) return;
    try {
      // Deletar experiência
      await deleteExperience(currentUser.uid, experience);
      
      // Deletar TODOS os títulos vinculados a este clube
      const titlesFromClub = atletaProfile.achievements?.filter(ach => ach.club === experience.clubName) || [];
      for (const achievement of titlesFromClub) {
        await deleteAchievement(currentUser.uid, achievement);
      }
      
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

  const handleDeleteAchievementFromTimeline = async (achievement: Achievement) => {
    if (!currentUser) return;
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

  const calcularIdade = () => {
    if (!atletaProfile?.birthDate) return null;
    const hoje = new Date();
    const nascimento = new Date(atletaProfile.birthDate);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const calcularAnosCarreira = () => {
    if (!atletaProfile?.experiences || atletaProfile.experiences.length === 0) return 0;
    const experiencias = [...atletaProfile.experiences].sort((a, b) => a.startYear - b.startYear);
    const primeiroAno = experiencias[0].startYear;
    const anoAtual = new Date().getFullYear();
    return anoAtual - primeiroAno;
  };

  const getClubAchievements = (clubName: string) => {
    return atletaProfile?.achievements?.filter(ach => ach.club === clubName) || [];
  };

  const getCurrentClub = () => {
    return atletaProfile?.experiences?.find(exp => exp.current);
  };

  const totalClubes = atletaProfile?.experiences?.length || 0;
  const totalCompeticoes = atletaProfile?.achievements?.length || 0;
  const totalTitulos = atletaProfile?.achievements?.filter(
    (ach) => ach.placement === '1º Lugar'
  ).length || 0;
  const anosCarreira = calcularAnosCarreira();
  const idade = calcularIdade();
  const clubeAtual = getCurrentClub();
  const isProfileEmpty = totalClubes === 0 && totalCompeticoes === 0;
  const registeredClubs = atletaProfile?.experiences?.map(exp => exp.clubName) || [];


  const principaisConquistas = (atletaProfile?.achievements || [])
    .filter((ach) => 
      (ach.placement && ach.placement !== 'Participante') ||
      (ach.award && ach.award.trim() !== '')
    )
    .sort((a, b) => b.year - a.year);

  // 🔢 Gamificação (XP, nível, título, progresso)
  const gamification = calculateAthleteGamification(atletaProfile);
  const {
    xp,
    level,
    title: levelTitle,
    nextLevelXP,
    progress
  } = gamification;

  // Ordenar experiências por ano
  const sortedExperiences = [...(atletaProfile?.experiences || [])].sort((a, b) => a.startYear - b.startYear);

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

        <main className="p-4 sm:p-6 lg:p-8 mt-16">
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
                    {/* HERO SECTION - Perfil Principal */}
                    <div className="bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                      <div className="relative h-32 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                      </div>
                      
                      <div className="relative px-6 pb-6 -mt-16">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                          {/* Foto de Perfil */}
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-900 bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl">
                              {atletaProfile?.photoURL ? (
                                <img src={atletaProfile.photoURL} alt={atletaProfile.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                                  {atletaProfile?.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            {/* Botão Alterar Foto */}
                            <button
                              onClick={() => setModalAberto('editProfile')}
                              className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Alterar foto"
                            >
                              <div className="text-center">
                                <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-white text-xs font-medium">Alterar</span>
                              </div>
                            </button>
                            {clubeAtual && (
                              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                ATIVO
                              </div>
                            )}
                          </div>

                          {/* Informações Principais */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">{atletaProfile?.name}</h1>

                                {/* ===================== GAMIFICAÇÃO ===================== */}
                                <div className="mt-4 bg-gray-800/40 border border-purple-500/40 p-4 rounded-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <div className="text-purple-400 font-semibold">
                                        Nível {gamification.level} • {gamification.title}
                                      </div>
                                      <div className="text-gray-400 text-sm">
                                        {gamification.xp} XP • Próximo nível com {gamification.nextLevelXP} XP
                                      </div>
                                    </div>

                                    <div className="text-purple-300 font-bold text-lg">
                                      {gamification.progress}%
                                    </div>
                                  </div>

                                  {/* Barra de progresso */}
                                  <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                                      style={{ width: `${gamification.progress}%` }}
                                    />
                                  </div>
                                </div>

                              </div>
                              <button 
                                onClick={() => setModalAberto('editProfile')} 
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                              >
                                <Edit size={18} />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                            </div>

                            {/* Stats Rápidos */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {atletaProfile?.height && (
                                <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
                                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                    <Ruler size={14} />
                                    <span>Altura</span>
                                  </div>
                                  <div className="text-white font-bold">{atletaProfile.height}cm</div>
                                </div>
                              )}
                              {atletaProfile?.weight && (
                                <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
                                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                    <Weight size={14} />
                                    <span>Peso</span>
                                  </div>
                                  <div className="text-white font-bold">{atletaProfile.weight}kg</div>
                                </div>
                              )}
                              {atletaProfile?.city && (
                                <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
                                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                    <MapPin size={14} />
                                    <span>Localização</span>
                                  </div>
                                  <div className="text-white font-bold text-sm">{atletaProfile.city}/{atletaProfile.state}</div>
                                </div>
                              )}
                              <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700/50">
                                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                  <Clock size={14} />
                                  <span>Carreira</span>
                                </div>
                                <div className="text-white font-bold">{anosCarreira} anos</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        {atletaProfile?.bio && (
                          <div className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                            <p className="text-gray-300 leading-relaxed">{atletaProfile.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ESTATÍSTICAS EM DESTAQUE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <Users className="w-8 h-8 text-blue-400" />
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{totalClubes}</div>
                        <div className="text-blue-200 text-sm">Clubes na Carreira</div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <Trophy className="w-8 h-8 text-yellow-400" />
                          <Star className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{totalTitulos}</div>
                        <div className="text-yellow-200 text-sm">Títulos Conquistados</div>
                      </div>

                      <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <Eye className="w-8 h-8 text-green-400" />
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">245</div>
                        <div className="text-green-200 text-sm">Visualizações do Perfil</div>
                      </div>

                      {/* CARD DE GAMIFICAÇÃO */}
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <Award className="w-8 h-8 text-purple-400" />
                          <Star className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                          Nível {level}
                        </div>
                        <div className="text-purple-100 text-sm mb-3">
                          {levelTitle}
                        </div>
                        <div className="mt-1">
                          <div className="flex items-center justify-between text-[11px] text-purple-100 mb-1">
                            <span>{xp} XP</span>
                            <span>
                              {nextLevelXP <= xp
                                ? 'Nível máximo'
                                : `Próx. nível: ${nextLevelXP} XP`}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-purple-900/40 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-purple-400 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TIMELINE HORIZONTAL */}
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">📅 Linha do Tempo da Carreira</h2>
                          <p className="text-gray-400 text-sm">Clique em um clube para ver as conquistas</p>
                        </div>
                        <button
                          onClick={() => setActiveSection('trajetoria')}
                          className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                        >
                          Ver detalhes →
                        </button>
                      </div>

                      {sortedExperiences.length > 0 ? (
                        <div className="relative">
                          {/* Linha horizontal */}
                          <div className="absolute left-0 right-0 top-12 h-0.5 bg-gradient-to-r from-orange-500/20 via-orange-500/50 to-orange-500/20"></div>

                          {/* Cards dos clubes */}
                          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-gray-800">
                            {sortedExperiences.map((exp) => {
                              const achievements = getClubAchievements(exp.clubName);
                              const isSelected = selectedClub?.id === exp.id;
                              const isCurrent = exp.current;

                              return (
                                <div key={exp.id} className="flex-shrink-0 w-64">
                                  <button
                                    onClick={() => setSelectedClub(isSelected ? null : exp)}
                                    className={`w-full text-left transition-all ${
                                      isSelected ? 'scale-105' : 'hover:scale-102'
                                    }`}
                                  >
                                    {/* Ano */}
                                    <div className="text-center mb-3">
                                      <div className="inline-block bg-orange-500/20 text-orange-400 px-4 py-1 rounded-full text-sm font-bold border border-orange-500/30">
                                        {exp.startYear} {exp.endYear ? `- ${exp.endYear}` : '- Atual'}
                                      </div>
                                    </div>

                                    {/* Card do Clube */}
                                    <div className={`bg-gradient-to-br ${
                                      isCurrent 
                                        ? 'from-orange-500/20 to-orange-600/20 border-orange-500/50' 
                                        : isSelected
                                        ? 'from-blue-500/20 to-blue-600/20 border-blue-500/50'
                                        : 'from-gray-700/50 to-gray-800/50 border-gray-600/30'
                                    } backdrop-blur-sm rounded-xl p-4 border-2 relative overflow-hidden`}>
                                      {isCurrent && (
                                        <div className="absolute top-2 right-2">
                                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">ATUAL</span>
                                        </div>
                                      )}

                                      <div className="mb-3">
                                        <h3 className="text-white font-bold text-lg mb-1">{exp.clubName}</h3>
                                        <p className="text-gray-400 text-sm">{exp.position}</p>
                                      </div>

                                      {achievements.length > 0 && (
                                        <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                          <Trophy size={16} />
                                          <span className="font-medium">
                                            {achievements.length} {achievements.length === 1 ? 'competição' : 'competições'}
                                          </span>
                                        </div>
                                      )}

                                      {exp.description && (
                                        <p className="text-gray-400 text-xs mt-2 line-clamp-2">{exp.description}</p>
                                      )}
                                    </div>
                                  </button>

                                  {/* Conquistas do clube selecionado */}
                                  {isSelected && achievements.length > 0 && (
                                    <div className="mt-4 space-y-2 animate-fadeIn">
                                      {achievements.map((ach) => (
                                        <div key={ach.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                          <div className="flex items-start gap-2">
                                            <Trophy size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                              <div className="text-white font-medium text-sm break-words">
                                                {ach.championship}
                                              </div>
                                              <div className="text-yellow-400 text-xs">
                                                {ach.year} • {ach.placement || ach.award}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          Nenhuma experiência cadastrada ainda
                        </div>
                      )}
                    </div>

                    {/* PRINCIPAIS CONQUISTAS */}
                    {atletaProfile?.achievements && atletaProfile.achievements.length > 0 && (() => {
                      
                      const filtered = atletaProfile.achievements
                        .filter(ach =>
                          ach.type === 'Individual' ||
                          ach.placement === '1º Lugar' ||
                          ach.placement === '2º Lugar' ||
                          ach.placement === '3º Lugar'
                        )
                        .sort((a, b) => b.year - a.year);

                      if (filtered.length === 0) return null;

                      // Máximo de 10 cards (até 5 por linha × 2 linhas)
                      const visible = filtered.slice(0, 10);

                      return (
                        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 
                                        backdrop-blur-sm rounded-2xl p-5 border border-yellow-500/20">

                          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Star className="text-yellow-400" />
                            Principais Conquistas
                          </h2>

                          {/* GRID OTIMIZADO: 1 → 2 → 4 → 5 COLUNAS */}
                          <div className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            md:grid-cols-3
                            lg:grid-cols-4
                            xl:grid-cols-5
                            gap-4
                          ">
                            {visible.map((ach) => (
                              <div 
                                key={ach.id}
                                className="bg-gray-800/40 rounded-lg p-3 border border-yellow-500/20 
                                          hover:bg-gray-800/60 transition-all shadow-sm flex flex-col justify-between"
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <div className="w-7 h-7 bg-yellow-500/20 rounded flex items-center justify-center">
                                    <Trophy className="text-yellow-400" size={15} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                                      {ach.championship}
                                    </h3>

                                    <p className="text-gray-400 text-xs mb-1 truncate">
                                      {ach.club} • {ach.year}
                                    </p>
                                  </div>
                                </div>

                                {(ach.placement || ach.award) && (
                                  <span className="inline-block bg-yellow-500/20 text-yellow-400 text-xs 
                                                  font-semibold px-2 py-0.5 rounded text-center">
                                    {ach.placement || ach.award}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => setActiveSection('trajetoria')}
                            className="w-full mt-4 text-yellow-400 hover:text-yellow-300 
                                      text-sm font-medium text-center transition-colors"
                          >
                            Ver todas as {filtered.length} conquistas →
                          </button>
                        </div>
                      );
                    })()}

                    {/* ÚLTIMAS ATIVIDADES */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Quem viu seu perfil */}
                      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                          <Eye className="text-blue-400" size={20} />
                          Visualizações Recentes
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              MT
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">Minas Tênis Clube</div>
                              <div className="text-gray-400 text-xs">Há 2 horas</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                              SC
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">Sada Cruzeiro</div>
                              <div className="text-gray-400 text-xs">Há 5 horas</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                              FL
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">Flamengo</div>
                              <div className="text-gray-400 text-xs">Ontem</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Próximos passos */}
                      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                          <TrendingUp className="text-orange-400" size={20} />
                          Próximos Passos
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              1
                            </div>
                            <div>
                              <div className="text-white font-medium text-sm">Adicione uma foto profissional</div>
                              <div className="text-gray-400 text-xs mt-1">Perfis com foto têm 3x mais visualizações</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              2
                            </div>
                            <div>
                              <div className="text-white font-medium text-sm">Complete suas estatísticas</div>
                              <div className="text-gray-400 text-xs mt-1">Dados técnicos atraem mais clubes</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              3
                            </div>
                            <div>
                              <div className="text-white font-medium text-sm">Adicione vídeos de jogos</div>
                              <div className="text-gray-400 text-xs mt-1">Mostre seu desempenho em ação</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeSection === 'statistics' && <StatisticsSection />}
            {activeSection === 'xp-history' && (
              <XPHistory history={atletaProfile?.xpHistory} />
            )}

            {activeSection === 'trajetoria' && (
              <div className="space-y-6">
                {/* Botões de Ação */}
                <div className="flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => setModalAberto('experience')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50 text-white rounded-xl font-semibold transition-all"
                  >
                    <span className="text-xl">+</span>
                    Adicionar Clube
                  </button>
                  <button
                    onClick={() => setModalAberto('achievement')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:shadow-lg hover:shadow-yellow-500/50 text-white rounded-xl font-semibold transition-all"
                  >
                    <span className="text-xl">+</span>
                    Adicionar Título
                  </button>
                </div>
                
                {/* Timeline Horizontal */}
                <TimelineHorizontal
                  experiences={atletaProfile?.experiences || []}
                  achievements={atletaProfile?.achievements || []}
                  onEditClub={handleEditExperience}
                  onDeleteClub={handleDeleteExperienceFromTimeline}
                  onEditAchievement={handleEditAchievement}
                  onDeleteAchievement={handleDeleteAchievementFromTimeline}
                />
              </div>
            )}
            
            {activeSection === "evolucao-fisica" && (
              <PhysicalEvolutionMenu
                onNavigate={(sec) => setActiveSection(sec)}
              />
            )}

            {activeSection === 'altura' && <AlturaAtleta />}
            {activeSection === 'salto' && <SaltoAtleta />}
            {activeSection === 'cards' && <AthleteCardsPage />}
            {activeSection === 'achievements' && (<BadgesSection atletaProfile={atletaProfile ?? null} />)}
            {activeSection === 'ranking-atletas' && <RankingAtletas />}

            {activeSection === 'profile' && (
              <PerfilCompletoAtleta atleta={atletaProfile} />
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
        <AdicionarConquistaPadronizada
          isOpen={true}
          onClose={() => {
            setModalAberto(null);
            setEditData(null);
          }}
          onSave={handleSaveAchievement}
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
