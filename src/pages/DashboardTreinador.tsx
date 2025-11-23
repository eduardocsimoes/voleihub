import { useState, useEffect } from 'react';
import { GraduationCap, MapPin, Phone, DollarSign, Award, Edit2, LogOut, Trophy, BookOpen, Users } from 'lucide-react';
import { auth } from '../firebase/config';
import { getUserProfile, getTreinadorProfile, UserProfile, TreinadorProfile } from '../firebase/firestore';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function DashboardTreinador() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [treinadorProfile, setTreinadorProfile] = useState<TreinadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (auth.currentUser) {
        const userResult = await getUserProfile(auth.currentUser.uid);
        const treinadorResult = await getTreinadorProfile(auth.currentUser.uid);

        if (userResult.success && userResult.data) {
          setUserProfile(userResult.data);
        }

        if (treinadorResult.success && treinadorResult.data) {
          setTreinadorProfile(treinadorResult.data);
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

  if (!userProfile || !treinadorProfile) {
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
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
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Dashboard do Treinador</h1>
          <p className="text-gray-400">Gerencie seus alunos, cursos e mentorias</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">{userProfile.displayName}</h2>
                <span className="mt-2 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm">
                  Treinador
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <span>{treinadorProfile.city} - {treinadorProfile.state}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-purple-500" />
                  <span>{treinadorProfile.phone}</span>
                </div>
                {treinadorProfile.yearsOfExperience && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span>{treinadorProfile.yearsOfExperience} anos de experiência</span>
                  </div>
                )}
                {treinadorProfile.mentorshipPrice && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                    <span>R$ {treinadorProfile.mentorshipPrice}/hora</span>
                  </div>
                )}
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            </div>

            {/* Specialties */}
            {treinadorProfile.specialties && treinadorProfile.specialties.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {treinadorProfile.specialties.map((specialty) => (
                    <span key={specialty} className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Sobre Mim</h3>
              <p className="text-gray-300 leading-relaxed">
                {treinadorProfile.bio || 'Nenhuma bio adicionada ainda.'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-purple-500 mb-2">
                  {treinadorProfile.courses?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Cursos</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-purple-500 mb-2">
                  0
                </div>
                <div className="text-sm text-gray-400">Alunos</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-black text-purple-500 mb-2">
                  {treinadorProfile.certifications?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Certificações</div>
              </div>
            </div>

            {/* Courses */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  Meus Cursos
                </h3>
                <button className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors">
                  Criar Curso
                </button>
              </div>

              {treinadorProfile.courses && treinadorProfile.courses.length > 0 ? (
                <div className="space-y-4">
                  {treinadorProfile.courses.map((course) => (
                    <div key={course.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white">{course.title}</h4>
                        <span className="text-purple-500 font-semibold">R$ {course.price}</span>
                      </div>
                      <p className="text-sm text-gray-400">{course.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhum curso criado ainda.</p>
                  <button className="mt-4 px-6 py-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors">
                    Criar Primeiro Curso
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
                <p className="text-sm text-gray-400">Encontre atletas para mentorar</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className="font-bold text-white">Clubes</h4>
                </div>
                <p className="text-sm text-gray-400">Encontre oportunidades em clubes</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}