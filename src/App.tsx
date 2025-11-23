import { useState } from "react";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-black text-orange-600 tracking-tight">VôleiHub</h1>
          <nav className="hidden md:flex space-x-6 font-medium">
            <a href="#sobre" className="hover:text-orange-600">Sobre</a>
            <a href="#recursos" className="hover:text-orange-600">Recursos</a>
            <a href="#ecossistema" className="hover:text-orange-600">Ecossistema</a>
            <a href="#planos" className="hover:text-orange-600">Planos</a>
          </nav>

          <button
            onClick={() => {
              setAuthMode("login");
              setAuthOpen(true);
            }}
            className="border border-orange-600 text-orange-600 px-6 py-2 rounded-xl font-semibold hover:bg-orange-50"
          >
            Entrar
          </button>

          <button
            onClick={() => {
              setAuthMode("register");
              setAuthOpen(true);
            }}
            className="bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-500"
          >
            Criar conta
          </button>
          
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 bg-gradient-to-br from-orange-50 to-white text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            A nova geração da
            <span className="text-orange-600 block">liberdade no esporte</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Uma plataforma criada para dar autonomia real a atletas, clubes, treinadores, agentes e patrocinadores.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-orange-500">
              Criar conta gratuita
            </button>
            <button className="border-2 border-orange-600 text-orange-600 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-orange-50">
              Ver demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-4xl font-bold mb-6">
              Mais que uma plataforma. Um ecossistema.
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              O VôleiHub conecta atletas a oportunidades reais: clubes, patrocinadores,
              treinadores, agentes, cursos e produtos — tudo em um único ambiente inteligente.
            </p>
          </div>

          <div className="bg-orange-50 p-10 rounded-3xl shadow-lg">
            <ul className="space-y-4 text-lg font-medium">
              <li>⚡ Autonomia profissional</li>
              <li>⚡ Vitrine pública para carreira</li>
              <li>⚡ Conexões diretas e oportunidades reais</li>
              <li>⚡ Plataforma de crescimento esportivo</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-4xl font-extrabold mb-16">Recursos principais</h3>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Perfil Pro", desc: "Currículo esportivo inteligente" },
              { title: "Vitrine Pública", desc: "Seja encontrado por clubes" },
              { title: "Match Inteligente", desc: "Algoritmo que conecta oportunidades" },
              { title: "Marketplace", desc: "Equipamentos personalizados" },
              { title: "Educação", desc: "Cursos e mentorias" },
              { title: "Gestão de Carreira", desc: "Controle total da trajetória" }
            ].map((item, index) => (
              <div key={index} className="bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition">
                <h4 className="text-2xl font-bold mb-4 text-orange-600">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecossistema */}
      <section id="ecossistema" className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-extrabold mb-10">
            Um ecossistema completo
          </h3>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-16">
            Cada perfil dentro do VôleiHub tem autonomia para crescer, monetizar e conectar.
          </p>

          <div className="grid md:grid-cols-5 gap-6 text-sm font-semibold">
            {[
              "Atletas",
              "Clubes",
              "Treinadores",
              "Agentes",
              "Patrocinadores"
            ].map((role, i) => (
              <div key={i} className="bg-orange-600 text-white py-6 rounded-xl shadow-lg">
                {role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-extrabold mb-16">Planos</h3>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Free", price: "R$0", desc: "Ideal para iniciar" },
              { name: "Pro", price: "R$49", desc: "Para atletas competitivos" },
              { name: "Elite", price: "R$199", desc: "Para alto rendimento" }
            ].map((plan, index) => (
              <div key={index} className="bg-white p-12 rounded-3xl shadow-lg hover:scale-105 transition">
                <h4 className="text-2xl font-bold mb-4">{plan.name}</h4>
                <div className="text-4xl font-black text-orange-600 mb-4">{plan.price}</div>
                <p className="text-gray-600 mb-6">{plan.desc}</p>
                <button className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-orange-500">
                  Escolher plano
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-500 text-sm">
        © 2025 VôleiHub — Autonomia começa aqui.
      </footer>
    </div>
  );
}
