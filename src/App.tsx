import { useState } from 'react';
import { Menu, X, Users, Target, TrendingUp, BookOpen, ShoppingBag, Award, Briefcase, Building2, GraduationCap, Trophy, Sparkles, ArrowRight, Star, CheckCircle, ChevronDown } from 'lucide-react';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

export default function VoleihubEcosystem() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('atleta');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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
    return null; // Fallback de segurança
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 transform group-hover:rotate-12 transition-transform duration-300">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                VôleiHub
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#perfis" className="text-gray-300 hover:text-orange-500 transition">Para Quem</a>
              <a href="#pilares" className="text-gray-300 hover:text-orange-500 transition">Como Funciona</a>
              <a href="#faq" className="text-gray-300 hover:text-orange-500 transition">FAQ</a>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2.5 text-gray-300 hover:text-white transition font-semibold"
              >
                Entrar
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 font-bold"
              >
                Começar Grátis
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-4 py-4 space-y-3">
              <a href="#perfis" className="block text-gray-300 hover:text-orange-500 py-2">Para Quem</a>
              <a href="#pilares" className="block text-gray-300 hover:text-orange-500 py-2">Como Funciona</a>
              <a href="#faq" className="block text-gray-300 hover:text-orange-500 py-2">FAQ</a>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="w-full px-6 py-3 text-gray-300 hover:text-white border border-white/10 rounded-xl font-semibold"
              >
                Entrar
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold"
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-500">O Ecossistema Esportivo Completo</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              O LinkedIn do
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
                Mundo Esportivo
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              Conecte-se, cresça e monetize sua carreira. Uma plataforma onde <strong className="text-white">atletas</strong>, <strong className="text-white">clubes</strong>, <strong className="text-white">treinadores</strong>, <strong className="text-white">agentes</strong> e <strong className="text-white">patrocinadores</strong> encontram oportunidades reais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-lg font-bold hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                Criar Meu Perfil Grátis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-xl text-lg font-bold border-2 border-white/20 hover:border-orange-500 hover:bg-white/20 transition-all duration-300">
                Ver Como Funciona
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
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
      <section id="pilares" className="py-24 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
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
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:scale-105"
              >
                <div className={`inline-block p-4 bg-gradient-to-br ${pillar.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfis Interativos */}
      <section id="perfis" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Feito Para Você
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Selecione seu perfil e descubra como o VôleiHub impulsiona sua carreira
            </p>
          </div>

          {/* Seletor de Perfis */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfile(profile.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  selectedProfile === profile.id
                    ? `bg-gradient-to-r ${profile.color} text-white shadow-lg scale-105`
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {profile.icon}
                {profile.name}
              </button>
            ))}
          </div>

          {/* Conteúdo do Perfil Selecionado */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className={`inline-block p-4 bg-gradient-to-br ${currentProfile.color} rounded-2xl mb-6`}>
                  {currentProfile.icon}
                </div>
                <h3 className="text-4xl font-black mb-4">{currentProfile.name}</h3>
                <p className="text-2xl text-gray-400 mb-8 font-semibold">{currentProfile.tagline}</p>
                
                <ul className="space-y-4">
                  {currentProfile.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button className="mt-8 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
                  Criar Perfil de {currentProfile.name}
                </button>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
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
          <Target className="w-16 h-16 mx-auto mb-6 text-white" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Sua Carreira. Suas Regras.
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Autonomia profissional, financeira e estratégica. Comece hoje mesmo e transforme seu futuro no esporte.
          </p>
          
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-lg font-bold hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            Criar Meu Perfil Grátis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-6 text-white/80 text-sm">
            ✓ Sem cartão de crédito • ✓ Perfil básico gratuito • ✓ Comece em 2 minutos
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
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
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-white pr-8">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-orange-500 flex-shrink-0 transition-transform duration-300 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black">VôleiHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                O ecossistema completo para o mundo esportivo.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Perfis</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition">Atletas</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Clubes</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Treinadores</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Agentes</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition">Educação</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Marketplace</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Termos</a></li>
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
    </div>
  );
}