import { useState } from 'react';
import { Menu, X, CheckCircle, Users, BarChart3, Calendar, ChevronDown, Star } from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestão de Atletas",
      description: "Cadastro completo com histórico, estatísticas e evolução de cada jogador"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Análise de Performance",
      description: "Métricas detalhadas e relatórios visuais para acompanhar o desempenho"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Controle de Treinos",
      description: "Planejamento e registro de treinos com presença e atividades realizadas"
    }
  ];

  const steps = [
    { number: "01", title: "Cadastre sua equipe", description: "Crie sua conta e adicione seus atletas em minutos" },
    { number: "02", title: "Registre as atividades", description: "Acompanhe treinos, jogos e evolução diária" },
    { number: "03", title: "Analise os resultados", description: "Visualize dados e tome decisões baseadas em métricas reais" }
  ];

  const plans = [
    {
      name: "Starter",
      price: "Grátis",
      description: "Ideal para pequenas equipes",
      features: ["Até 15 atletas", "Funcionalidades básicas", "Suporte por email"],
      cta: "Começar grátis",
      highlighted: false
    },
    {
      name: "Pro",
      price: "R$ 49",
      period: "/mês",
      description: "Para equipes profissionais",
      features: ["Atletas ilimitados", "Todas as funcionalidades", "Relatórios avançados", "Suporte prioritário"],
      cta: "Iniciar teste grátis",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Customizado",
      description: "Para clubes e federações",
      features: ["Múltiplas equipes", "API personalizada", "Treinamento dedicado", "Gerente de conta"],
      cta: "Falar com vendas",
      highlighted: false
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Técnico - Vôlei Campeões SC",
      content: "O VôleiHub transformou a forma como gerencio minha equipe. Agora tenho dados concretos para cada decisão.",
      rating: 5
    },
    {
      name: "Marina Oliveira",
      role: "Coordenadora - Academia Vôlei Pro",
      content: "Plataforma intuitiva e completa. Economizamos horas de trabalho toda semana.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Como funciona o período de teste?",
      answer: "Você pode testar o plano Pro gratuitamente por 14 dias, sem necessidade de cartão de crédito."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas adicionais."
    },
    {
      question: "Os dados são seguros?",
      answer: "Absolutamente. Usamos criptografia de ponta e seguimos as melhores práticas de segurança da indústria."
    },
    {
      question: "Há suporte em português?",
      answer: "Sim, nosso suporte é 100% em português e está disponível para ajudar você."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">VôleiHub</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#funcionalidades" className="text-gray-700 hover:text-orange-600 transition">Funcionalidades</a>
              <a href="#como-funciona" className="text-gray-700 hover:text-orange-600 transition">Como Funciona</a>
              <a href="#planos" className="text-gray-700 hover:text-orange-600 transition">Planos</a>
              <a href="#depoimentos" className="text-gray-700 hover:text-orange-600 transition">Depoimentos</a>
              <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                Começar Agora
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
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              <a href="#funcionalidades" className="block text-gray-700 hover:text-orange-600">Funcionalidades</a>
              <a href="#como-funciona" className="block text-gray-700 hover:text-orange-600">Como Funciona</a>
              <a href="#planos" className="block text-gray-700 hover:text-orange-600">Planos</a>
              <a href="#depoimentos" className="block text-gray-700 hover:text-orange-600">Depoimentos</a>
              <button className="w-full px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Começar Agora
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestão Completa para
            <span className="text-orange-600"> Equipes de Vôlei</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforme dados em resultados. Gerencie atletas, treinos e performance em uma única plataforma profissional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-orange-600 text-white rounded-lg text-lg font-semibold hover:bg-orange-700 transition shadow-lg hover:shadow-xl">
              Começar Gratuitamente
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-semibold border-2 border-gray-200 hover:border-orange-600 transition">
              Ver Demonstração
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">Sem cartão de crédito • Teste grátis por 14 dias</p>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades Poderosas</h2>
            <p className="text-xl text-gray-600">Tudo que você precisa para gerenciar sua equipe com excelência</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="text-orange-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600">Simples, rápido e eficiente</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
            <p className="text-xl text-gray-600">Escolha o plano ideal para sua equipe</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl p-8 ${
                  plan.highlighted 
                    ? 'ring-2 ring-orange-600 shadow-xl scale-105' 
                    : 'shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-orange-600 text-sm font-bold mb-4">MAIS POPULAR</div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
                <button className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {plan.cta}
                </button>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">O Que Dizem Nossos Clientes</h2>
            <p className="text-xl text-gray-600">Técnicos e gestores que confiam no VôleiHub</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-orange-600 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-lg">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">Tire suas dúvidas sobre o VôleiHub</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${
                    openFaq === index ? 'transform rotate-180' : ''
                  }`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-orange-600 mb-4">VôleiHub</h3>
              <p className="text-gray-400">Gestão profissional para equipes de vôlei</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-600 transition">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Planos</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Demonstração</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-600 transition">Sobre</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Blog</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-600 transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-orange-600 transition">Termos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VôleiHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;