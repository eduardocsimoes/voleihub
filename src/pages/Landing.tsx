import { useState } from "react";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0a09] via-[#1f0900] to-black text-white font-sans">

      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-3xl font-black text-orange-500 tracking-tight">
          VôleiHub
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowLogin(true)}
            className="text-white/70 hover:text-white"
          >
            Entrar
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-6 py-3 rounded-xl shadow-lg"
          >
            Criar conta
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="py-32 text-center bg-gradient-to-br from-orange-500/20 to-red-500/10">
        <h2 className="text-6xl font-black mb-6 leading-tight drop-shadow-xl">
          A nova geração de gestão esportiva
        </h2>
        <p className="text-orange-100/80 max-w-3xl mx-auto text-xl mb-12">
          Controle atletas, treinos e desempenho com uma plataforma moderna, rápida e focada em resultados.
        </p>
        <button
          onClick={() => setShowRegister(true)}
          className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-12 py-5 rounded-2xl text-xl shadow-2xl hover:scale-105 transition"
        >
          Começar agora
        </button>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-24 grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-10">
        {[
          { title: "Gestão total", desc: "Controle total de atletas, treinos e campeonatos." },
          { title: "Performance ao vivo", desc: "Dados e métricas em tempo real." },
          { title: "Relatórios inteligentes", desc: "Decisões mais rápidas e eficientes." },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-3xl p-10 hover:border-orange-500 transition shadow-lg"
          >
            <h3 className="text-2xl font-bold text-orange-400 mb-4">
              {item.title}
            </h3>
            <p className="text-orange-100/70 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 text-center bg-[#0c0502]">
        <h3 className="text-5xl font-black mb-16">
          Como funciona
        </h3>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-10">
          {[
            "Cadastre seus atletas",
            "Crie treinos inteligentes",
            "Acompanhe resultados em tempo real",
          ].map((text, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 p-10 rounded-3xl hover:border-orange-500 transition shadow-lg"
            >
              <span className="text-6xl font-black text-orange-500 drop-shadow-lg">
                {i + 1}
              </span>
              <p className="mt-6 text-xl font-semibold text-white">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-r from-orange-500 to-red-500 text-black text-center">
        <h3 className="text-5xl font-black mb-6 drop-shadow-xl">
          Leve sua equipe ao máximo nível
        </h3>
        <button
          onClick={() => setShowRegister(true)}
          className="bg-black text-white font-bold px-14 py-6 rounded-2xl text-xl shadow-2xl hover:bg-white hover:text-black transition"
        >
          Criar conta gratuita
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-orange-200/50 text-sm bg-black/50">
        © {new Date().getFullYear()} VôleiHub. Todos os direitos reservados.
      </footer>

      {/* MODAIS */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
}
