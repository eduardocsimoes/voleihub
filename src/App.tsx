import { useState, useEffect } from 'react';
import { Menu, X, Users, Target, TrendingUp, BookOpen, ShoppingBag, Award, Briefcase, Building2, GraduationCap, Trophy, Sparkles, ArrowRight, Star, CheckCircle, ChevronDown, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase/config';
import { registerWithEmail, loginWithEmail, loginWithGoogle, logout } from './firebase/auth';

// Declaração para suportar <style jsx>
declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

// Login Modal Component
function LoginModal({ isOpen, onClose, onSwitchToRegister }: { isOpen: boolean; onClose: () => void; onSwitchToRegister: () => void }) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Login em desenvolvimento!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏐</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Bem-vindo de volta!</h2>
          <p className="text-gray-400">Entre para continuar sua jornada</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" placeholder="seu@email.com" className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" required />
            </div>
          </div>
          <div className="text-right">
            <button type="button" className="text-sm text-orange-500 hover:text-orange-400 transition-colors">Esqueceu a senha?</button>
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
            Entrar
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-900 text-gray-400">ou</span></div>
        </div>
        <button type="button" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuar com Google
        </button>
        <div className="text-center mt-6">
          <p className="text-gray-400">Não tem uma conta? <button onClick={onSwitchToRegister} className="text-orange-500 font-semibold hover:text-orange-400 transition-colors">Cadastre-se grátis</button></p>
        </div>
      </div>
    </div>
  );
}

// Register Modal Component
function RegisterModal({ isOpen, onClose, onSwitchToLogin }: { isOpen: boolean; onClose: () => void; onSwitchToLogin: () => void }) {
  const [selectedProfile, setSelectedProfile] = useState('');

  if (!isOpen) return null;

  const profiles = [
    { id: 'atleta', name: 'Atleta', icon: Users },
    { id: 'clube', name: 'Clube', icon: Building2 },
    { id: 'treinador', name: 'Treinador', icon: GraduationCap },
    { id: 'agente', name: 'Agente', icon: Briefcase },
    { id: 'patrocinador', name: 'Patrocinador', icon: Award }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) {
      alert('Por favor, selecione um tipo de perfil');
      return;
    }
    alert(`Registro como ${selectedProfile} em desenvolvimento!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8 animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏐</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Crie sua conta</h2>
          <p className="text-gray-400">Comece sua jornada no VôleiHub</p>
        </div>
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-4 text-center">Qual é o seu perfil?</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {profiles.map((profile) => {
              const Icon = profile.icon;
              return (
                <button key={profile.id} type="button" onClick={() => setSelectedProfile(profile.id)} className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${selectedProfile === profile.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <Icon className={`w-6 h-6 ${selectedProfile === profile.id ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className={`text-xs font-semibold ${selectedProfile === profile.id ? 'text-orange-500' : 'text-gray-400'}`}>{profile.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Nome completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Seu nome" className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" placeholder="seu@email.com" className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" placeholder="Mínimo 8 caracteres" className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" required minLength={8} />
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500" required />
            <label htmlFor="terms" className="text-sm text-gray-400">Aceito os <a href="#" className="text-orange-500 hover:text-orange-400">Termos de Uso</a> e a <a href="#" className="text-orange-500 hover:text-orange-400">Política de Privacidade</a></label>
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
            Criar Conta Grátis
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-900 text-gray-400">ou</span></div>
        </div>
        <button type="button" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuar com Google
        </button>
        <div className="text-center mt-6">
          <p className="text-gray-400">Já tem uma conta? <button onClick={onSwitchToLogin} className="text-orange-500 font-semibold hover:text-orange-400 transition-colors">Entrar</button></p>
        </div>
      </div>
    </div>
  );
}

export default function VoleihubEcosystem() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('atleta');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Detectar seções visíveis para animação
      const sections = document.querySelectorAll('[data-animate]');
      const newVisibleSections = new Set(visibleSections);

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        if (isVisible) {
          newVisibleSections.add(section.id);
        }
      });

      setVisibleSections(newVisibleSections);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  const profiles = [
    {
      id: 'atleta',
      name: 'Atletas',
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      tagline: 'Seja visto. Seja contratado.',
      benefits: [
        'Perfil profissional completo',
        'Encontre clubes e oportunidades',
        'Conecte-se com agentes e patrocinadores',
        'Acesso a treinadores especializados',
        'Métricas de desempenho',
        'Marketplace exclusivo de equipamentos'
      ]
    },
    {
      id: 'clube',
      name: 'Clubes',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      tagline: 'Encontre talentos. Construa times.',
      benefits: [
        'Busque atletas por filtros avançados',
        'Publique vagas abertas',
        'Encontre treinadores qualificados',
        'Conecte-se com patrocinadores',
        'Compre kits em escala',
        'Página institucional profissional'
      ]
    },
    {
      id: 'treinador',
      name: 'Treinadores',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      tagline: 'Ensine. Mentore. Impacte.',
      benefits: [
        'Divulgue seu trabalho',
        'Ofereça mentorias personalizadas',
        'Venda cursos e conteúdos',
        'Encontre clubes e atletas',
        'Crie sua marca pessoal',
        'Monetize seu conhecimento'
      ]
    },
    {
      id: 'agente',
      name: 'Agentes',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      tagline: 'Conecte. Negocie. Prospere.',
      benefits: [
        'Rede de atletas e clubes',
        'Facilite transferências',
        'Gerencie carreiras',
        'Acesso a oportunidades exclusivas',
        'Ferramentas de negociação',
        'Comissões transparentes'
      ]
    },
    {
      id: 'patrocinador',
      name: 'Patrocinadores',
      icon: <Award className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      tagline: 'Invista. Promova. Cresça.',
      benefits: [
        'Encontre atletas e clubes',
        'Campanhas direcionadas',
        'Métricas de ROI',
        'Gestão de contratos',
        'Visibilidade de marca',
        'Acesso a dados de engajamento'
      ]
    }
  ];

  const pillars = [
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Rede Profissional',
      description: 'LinkedIn do esporte. Conecte-se com atletas, clubes, treinadores e empresários.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: 'Hub de Educação',
      description: 'Cursos, mentorias e trilhas de especialização para todos os perfis.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <ShoppingBag className="w-12 h-12" />,
      title: 'Marketplace',
      description: 'Equipamentos personalizados por posição. De joelheiras a kits completos.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <TrendingUp className="w-12 h-6" />,
      title: 'Autonomia Total',
      description: 'Controle sua carreira, finanças e visibilidade no mundo esportivo.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { value: '10k+', label: 'Atletas' },
    { value: '500+', label: 'Clubes' },
    { value: '1k+', label: 'Treinadores' },
    { value: '200+', label: 'Patrocinadores' }
  ];

  const faqs = [
    {
      question: 'Como funciona o VôleiHub?',
      answer: 'O VôleiHub é um ecossistema completo que conecta todos os agentes do mundo esportivo. Você cria seu perfil, define seus objetivos e a plataforma conecta você com as oportunidades certas.'
    },
    {
      question: 'É gratuito para atletas?',
      answer: 'Sim! Atletas têm acesso gratuito ao perfil básico. Planos premium oferecem recursos avançados de visibilidade e analytics.'
    },
    {
      question: 'Como os clubes encontram atletas?',
      answer: 'Clubes podem buscar atletas usando filtros avançados: posição, altura, estatísticas, vídeos de jogos, localização e muito mais.'
    },
    {
      question: 'Posso vender cursos na plataforma?',
      answer: 'Sim! Treinadores podem criar e vender cursos, mentorias e conteúdos educacionais diretamente na plataforma.'
    }
  ];

  const currentProfile = profiles.find(p => p.id === selectedProfile);

  if (!currentProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 shadow-lg shadow-orange-500/5' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 transform group-hover:rotate-12 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-orange-500/50">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                VôleiHub
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#perfis" className="text-gray-300 hover:text-orange-500 transition-all duration-300 font-medium hover:scale-105">Para Quem</a>
              <a href="#pilares" className="text-gray-300 hover:text-orange-500 transition-all duration-300 font-medium hover:scale-105">Como Funciona</a>
              <a href="#faq" className="text-gray-300 hover:text-orange-500 transition-all duration-300 font-medium hover:scale-105">FAQ</a>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2.5 text-gray-300 hover:text-white transition-all duration-300 font-semibold hover:scale-105"
              >
                Entrar
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="group px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 font-bold relative overflow-hidden"
              >
                <span className="relative z-10">Começar Grátis</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            <button 
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <a href="#perfis" className="block text-gray-300 hover:text-orange-500 py-2 transition-colors">Para Quem</a>
              <a href="#pilares" className="block text-gray-300 hover:text-orange-500 py-2 transition-colors">Como Funciona</a>
              <a href="#faq" className="block text-gray-300 hover:text-orange-500 py-2 transition-colors">FAQ</a>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="w-full px-6 py-3 text-gray-300 hover:text-white border border-white/10 rounded-xl font-semibold transition-all hover:bg-white/5"
              >
                Entrar
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-sm font-semibold text-orange-500">O Ecossistema Esportivo Completo</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up animation-delay-200">
              O LinkedIn do
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                Mundo Esportivo
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Conecte-se, cresça e monetize sua carreira. Uma plataforma onde <strong className="text-white">atletas</strong>, <strong className="text-white">clubes</strong>, <strong className="text-white">treinadores</strong>, <strong className="text-white">agentes</strong> e <strong className="text-white">patrocinadores</strong> encontram oportunidades reais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-600">
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-lg font-bold hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Criar Meu Perfil Grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="group px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-xl text-lg font-bold border-2 border-white/20 hover:border-orange-500 hover:bg-white/20 transition-all duration-300">
                Ver Como Funciona
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 animate-fade-in-up group cursor-pointer"
                  style={{ animationDelay: `${800 + index * 100}ms` }}
                >
                  <div className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilares */}
      <section id="pilares" className="py-24 bg-gradient-to-b from-transparent to-gray-900/50" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Um Ecossistema. Infinitas Possibilidades.
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Muito mais que uma plataforma de gestão. Um hub de autonomia profissional e financeira.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, index) => (
              <div 
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-block p-4 bg-gradient-to-br ${pillar.color} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-orange-500 transition-colors duration-300">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfis Interativos */}
      <section id="perfis" className="py-24" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Feito Para Você
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Selecione seu perfil e descubra como o VôleiHub impulsiona sua carreira
            </p>
          </div>

          {/* Seletor de Perfis */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up animation-delay-200">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  selectedProfile === profile.id
                    ? `bg-gradient-to-r ${profile.color} text-white shadow-lg shadow-orange-500/30 scale-105`
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 hover:scale-105'
                }`}
              >
                {profile.icon}
                {profile.name}
              </button>
            ))}
          </div>

          {/* Conteúdo do Perfil Selecionado */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 hover:border-orange-500/30 transition-all duration-500 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className={`inline-block p-4 bg-gradient-to-br ${currentProfile.color} rounded-2xl mb-6 animate-float shadow-lg shadow-orange-500/30`}>
                  {currentProfile.icon}
                </div>
                <h3 className="text-4xl font-black mb-4">{currentProfile.name}</h3>
                <p className="text-2xl text-gray-400 mb-8 font-semibold">{currentProfile.tagline}</p>
                
                <ul className="space-y-4 mb-8">
                  {currentProfile.benefits.map((benefit, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-3 animate-fade-in-left group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-gray-300 text-lg group-hover:text-white transition-colors">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">Criar Perfil de {currentProfile.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 flex items-center justify-center hover:border-orange-500/50 transition-all duration-500 hover:scale-105 hover:rotate-2 animate-float">
                  <div className={`text-8xl bg-gradient-to-br ${currentProfile.color} bg-clip-text text-transparent`}>
                    {currentProfile.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Diferenciado */}
      <section className="py-24 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Target className="w-16 h-16 mx-auto mb-6 text-white animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-fade-in-up">
            Sua Carreira. Suas Regras.
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Autonomia profissional, financeira e estratégica. Comece hoje mesmo e transforme seu futuro no esporte.
          </p>
          
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="group px-12 py-5 bg-white text-orange-600 rounded-xl text-xl font-black hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl inline-flex items-center gap-3 animate-fade-in-up animation-delay-400 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Criar Meu Perfil Grátis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <p className="mt-6 text-white/80 text-sm animate-fade-in-up animation-delay-600">
            ✓ Sem cartão de crédito • ✓ Perfil básico gratuito • ✓ Comece em 2 minutos
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24" data-animate>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Dúvidas Frequentes
            </h2>
            <p className="text-xl text-gray-400">
              Tudo que você precisa saber sobre o VôleiHub
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-white/5 transition-colors group"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-white pr-8 group-hover:text-orange-500 transition-colors">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform duration-300 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className={`transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="animate-fade-in-up">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 hover:rotate-12 transition-transform duration-300">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black">VôleiHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                O ecossistema completo para o mundo esportivo.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-100">
              <h4 className="font-bold mb-4">Perfis</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Atletas</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Clubes</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Treinadores</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Agentes</a></li>
              </ul>
            </div>
            
            <div className="animate-fade-in-up animation-delay-200">
              <h4 className="font-bold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Educação</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div className="animate-fade-in-up animation-delay-300">
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 VôleiHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modais */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }

        .animation-delay-4000 {
          animation-delay: 4000ms;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}