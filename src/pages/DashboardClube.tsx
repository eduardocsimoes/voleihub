import { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Calendar,
  Globe,
  Target,
  Users,
  Trophy,
  Edit2,
  LogOut,
  Briefcase,
  UserPlus,
  X
} from 'lucide-react';

import { auth, db } from '../firebase/config';
import {
  getUserProfile,
  getClubeProfile,
  updateClubeProfile,
  UserProfile,
  ClubeProfile
} from '../firebase/firestore';

import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

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
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 [CLUBE] Carregando perfis...');

      const userData = await getUserProfile(auth.currentUser.uid);
      if (userData) {
        setUserProfile(userData as UserProfile);
      }

      const clubeData = await getClubeProfile(auth.currentUser.uid);
      if (clubeData) {
        setClubeProfile(clubeData);
      } else {
        console.log('⚠️ [CLUBE] Clube não encontrado, criando padrão...');

        const novoPerfilClube: ClubeProfile = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || '',
          name: auth.currentUser.displayName || 'Clube',
          userType: 'clube',
          clubName: 'Meu Clube',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          onboardingCompleted: false,
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

        const clubeRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(clubeRef, novoPerfilClube);
        setClubeProfile(novoPerfilClube);
      }
    } catch (error) {
      console.error('❌ [CLUBE] Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSaveProfile = async (updatedProfile: Partial<ClubeProfile>) => {
    if (!auth.currentUser) return;

    try {
      await updateClubeProfile(auth.currentUser.uid, updatedProfile);
      await loadProfiles();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    }
  };

  const handlePhotoUpdated = () => {
    loadProfiles();
    setShowUploadModal(false);
  };

  const handleLogout = async () => {
    const confirm = window.confirm('Deseja realmente sair?');
    if (confirm) {
      await logout();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando dashboard...
      </div>
    );
  }

  if (!userProfile || !clubeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white flex-col">
        <p className="mb-4">Erro ao carregar perfil</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 rounded-xl">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/90">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-lg font-black">VôleiHub</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Olá, {clubeProfile.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">
        {/* Card Perfil */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col items-center mb-6">
            <div className="relative cursor-pointer" onClick={() => setShowUploadModal(true)}>
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                {clubeProfile.photoURL ? (
                  <img src={clubeProfile.photoURL} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold mt-4">{clubeProfile.clubName}</h2>
            <span className="text-xs mt-1 text-blue-400">Clube</span>
          </div>

          <div className="space-y-2 text-sm text-gray-400">
            {clubeProfile.category && <div><Target className="inline w-4 h-4 mr-2" />{clubeProfile.category}</div>}
            {clubeProfile.foundedYear && <div><Calendar className="inline w-4 h-4 mr-2" />Fundado em {clubeProfile.foundedYear}</div>}
            {(clubeProfile.city || clubeProfile.state) && <div><MapPin className="inline w-4 h-4 mr-2" />{clubeProfile.city} {clubeProfile.state}</div>}
            {clubeProfile.phone && <div><Phone className="inline w-4 h-4 mr-2" />{clubeProfile.phone}</div>}
            {clubeProfile.website && <div><Globe className="inline w-4 h-4 mr-2" />{clubeProfile.website}</div>}
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="mt-6 w-full py-3 bg-blue-600 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Editar Perfil
          </button>
        </div>

        {/* Cards Infos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold mb-2">Sobre o Clube</h3>
            <p className="text-gray-400">{clubeProfile.description}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-blue-500">{clubeProfile.stats?.athletes || 0}</div>
              <div className="text-gray-400 text-sm">Atletas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-500">{clubeProfile.stats?.titles || 0}</div>
              <div className="text-gray-400 text-sm">Títulos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-500">{clubeProfile.stats?.matches || 0}</div>
              <div className="text-gray-400 text-sm">Partidas</div>
            </div>
          </div>
        </div>
      </div>

      <EditarPerfilClube
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        clubeProfile={clubeProfile}
        userDisplayName={clubeProfile.name}
        onSave={handleSaveProfile}
      />

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4">
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <UploadFotoPerfil
              userId={clubeProfile.uid}
              currentPhotoURL={clubeProfile.photoURL}
              onPhotoUpdated={handlePhotoUpdated}
              userType="clubes"
            />
          </div>
        </div>
      )}
    </div>
  );
}
