import { useState } from "react";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="bg-[#020617] min-h-screen text-white font-sans">

      {/* NAVBAR MODERNA */}
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          VôleiHub
        </h1>

        <div className="space-x-4">
          <button
            onClick={() => setShowLogin(true)}
            className="text-slate-300 hover:text-white transition"
          >
            Entrar
          </button>

          <button
            onClick={() => setShowRegister(true)}
            className="bg-primary px-6 py-3 rounded-xl font-semibold text-black hover:bg-accent transition"
          >
            Criar conta
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-green-500/20 blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-10 py-32 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Plataforma inteligente para gestão de atletas
          </h2>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            Monitore treinos, desempenho físico, estatísticas de jogos e evolução
            dos atletas em um sistema moderno, rápido e intuitivo.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowRegister(true)}
              className="bg-primary text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-accent transition"
            >
              Começar agora
            </button>

            <button
              onClick={() => setShowLogin(true)}
              className="border border-white/20 px-10 py-4 rounded-xl hover:bg-white/10 transition"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-28 bg-[#020617]">
        <div className="max-w-6xl mx-auto px-10 grid md:grid-cols-3 gap-10">

          {[
            {
              title: "Gestão completa",
              desc: "Administre atletas, treinos, avaliações e campeonatos.",
            },
            {
              title: "Desempenho em tempo real",
              desc: "Estatísticas avançadas e métricas de performance.",
            },
            {
              title: "Relatórios inteligentes",
              desc: "Insights detalhados para decisões estratégicas.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/10 hover:border-primary transition"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">
                {item.title}
              </h3>
              <p className="text-slate-300">{item.desc}</p>
            </div>
          ))}

        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-28 bg-gradient-to-b from-[#020617] to-[#020617]/95">
        <div className="max-w-6xl mx-auto px-10 text-center">
          <h3 className="text-4xl font-extrabold mb-16">Como funciona</h3>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Cadastre seus atletas" },
              { step: "02", title: "Gerencie os treinos" },
              { step: "03", title: "Acompanhe a evolução" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-primary transition"
              >
                <span className="text-5xl font-extrabold text-primary">
                  {item.step}
                </span>
                <h4 className="text-2xl font-bold mt-4">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 bg-gradient-to-r from-blue-600 to-green-500 text-black text-center">
        <h3 className="text-4xl font-extrabold mb-6">
          Pronto para evoluir sua gestão esportiva?
        </h3>

        <button
          onClick={() => setShowRegister(true)}
          className="bg-black text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-black transition"
        >
          Criar conta gratuita
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-slate-400 text-sm bg-[#020617]">
        © {new Date().getFullYear()} VôleiHub. Todos os direitos reservados.
      </footer>

      {/* MODAIS */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
};

export default Landing;
