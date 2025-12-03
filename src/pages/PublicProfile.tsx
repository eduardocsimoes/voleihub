// src/pages/PerfilPublicoAtleta.tsx
import React, { useEffect, useState } from "react";
import {
  AtletaProfile,
  Achievement,
  CareerExperience,
  getUserProfile,
} from "../firebase/firestore";
import {
  User,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Award,
  Trophy,
  Medal,
  Share2,
  Mail,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import Footer from "../components/Footer";
import { calculateAthleteGamification } from "../gamification/gamification";

function calcularIdade(birthDate?: string) {
  if (!birthDate) return null;
  const hoje = new Date();
  const nascimento = new Date(birthDate);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

function calcularAnosCarreira(experiences?: CareerExperience[]) {
  if (!experiences || experiences.length === 0) return 0;
  const ordenadas = [...experiences].sort((a, b) => a.startYear - b.startYear);
  const primeiroAno = ordenadas[0].startYear;
  const anoAtual = new Date().getFullYear();
  return anoAtual - primeiroAno;
}

type EscopoCarreira = "Nacional" | "Estadual" | "Municipal/Outros";

function detectarEscopo(ach: Achievement): EscopoCarreira {
  const nome = ach.championship.toLowerCase();
  if (
    nome.includes("cbs") ||
    nome.includes("brasileiro") ||
    nome.includes("nacional")
  ) {
    return "Nacional";
  }
  if (
    nome.includes("estadual") ||
    nome.includes("campeonato do estado") ||
    nome.includes("paranaense") ||
    nome.includes("catarinense") ||
    nome.includes("mineiro") ||
    nome.includes("carioca") ||
    nome.includes("paulista")
  ) {
    return "Estadual";
  }
  return "Municipal/Outros";
}

function ordenarPorMedalha(a: Achievement, b: Achievement) {
  const peso: Record<string, number> = {
    "1º Lugar": 1,
    "2º Lugar": 2,
    "3º Lugar": 3,
    Participante: 4,
  };
  const pa = a.placement ? peso[a.placement] ?? 99 : 99;
  const pb = b.placement ? peso[b.placement] ?? 99 : 99;

  if (pa !== pb) return pa - pb;
  return b.year - a.year;
}

interface GrupoCarreira {
  titulo: string;
  conquistas: Achievement[];
}

function agruparCarreira(achievements: Achievement[]): GrupoCarreira[] {
  const competitivas = achievements.filter(
    (a) =>
      a.placement === "1º Lugar" ||
      a.placement === "2º Lugar" ||
      a.placement === "3º Lugar"
  );

  const grupos: Record<EscopoCarreira, Achievement[]> = {
    Nacional: [],
    Estadual: [],
    "Municipal/Outros": [],
  };

  competitivas.forEach((a) => {
    const escopo = detectarEscopo(a);
    grupos[escopo].push(a);
  });

  const resultado: GrupoCarreira[] = [];

  (["Nacional", "Estadual", "Municipal/Outros"] as EscopoCarreira[]).forEach(
    (escopo) => {
      if (grupos[escopo].length > 0) {
        const ordenadas = [...grupos[escopo]].sort(ordenarPorMedalha);
        resultado.push({
          titulo: `Carreira ${escopo}`,
          conquistas: ordenadas,
        });
      }
    }
  );

  return resultado;
}

export default function PerfilPublicoAtleta() {
  const [atleta, setAtleta] = useState<AtletaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const uid = search.get("id");

    if (!uid) {
      setErro("Perfil não encontrado. Link inválido.");
      setLoading(false);
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        const perfil = await getUserProfile(uid);
        if (!perfil) {
          setErro("Perfil não encontrado ou não está disponível publicamente.");
          setLoading(false);
          return;
        }
        setAtleta(perfil);
      } catch (error) {
        console.error("Erro ao carregar perfil público:", error);
        setErro("Ocorreu um erro ao carregar o perfil.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando perfil...</div>
      </div>
    );
  }

  if (erro || !atleta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-gray-900/80 border border-red-500/40 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-semibold mb-2">Ops!</p>
            <p className="text-gray-300 mb-4">
              {erro || "Perfil não encontrado."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const idade = calcularIdade(atleta.birthDate);
  const anosCarreira = calcularAnosCarreira(atleta.experiences);
  const clubeAtual =
    atleta.experiences?.find((e) => e.current) || atleta.experiences?.slice(-1)[0];

  const gamification = calculateAthleteGamification(atleta);
  const { xp, level, title: levelTitle, progress } = gamification;

  const gruposCarreira = agruparCarreira(atleta.achievements || []);
  const premiosIndividuais =
    (atleta.achievements || []).filter(
      (a) => a.type === "Individual" || (!!a.award && a.award.trim() !== "")
    ) || [];

  const idsConquistasPrincipais = new Set(
    gruposCarreira.flatMap((g) => g.conquistas.map((c) => c.id))
  );

  const demaisConquistas =
    (atleta.achievements || []).filter(
      (a) =>
        !idsConquistasPrincipais.has(a.id) &&
        !premiosIndividuais.some((p) => p.id === a.id)
    ) || [];

  const linkCompartilhavel = window.location.href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col">
      {/* Top bar simples */}
      <header className="w-full border-b border-orange-500/30 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold">
              V
            </div>
            <div>
              <p className="text-sm font-semibold">VôleiHub</p>
              <p className="text-xs text-gray-400">Perfil público do atleta</p>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(linkCompartilhavel);
                alert("Link copiado para a área de transferência!");
              } catch {
                alert("Não foi possível copiar o link.");
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-700 hover:border-orange-500/70 hover:bg-orange-500/10 transition-colors"
          >
            <Share2 size={14} />
            Copiar link do currículo
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* HERO / CABEÇALHO */}
          <section className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 border border-gray-700/70 rounded-3xl overflow-hidden shadow-xl">
            <div className="h-28 bg-gradient-to-r from-orange-500/30 via-purple-600/30 to-blue-500/30" />

            <div className="p-6 sm:p-8 -mt-16 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end">
              {/* Foto / iniciais */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-gray-900 bg-gradient-to-br from-orange-500 to-red-600 overflow-hidden shadow-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold">
                  {atleta.photoURL ? (
                    <img
                      src={atleta.photoURL}
                      alt={atleta.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{atleta.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {clubeAtual && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    Atleta em atividade
                  </div>
                )}
              </div>

              {/* Infos principais */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User size={20} className="text-orange-400" />
                      <h1 className="text-2xl sm:text-3xl font-bold">
                        {atleta.name}
                      </h1>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-300">
                      {atleta.position && (
                        <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-600/70">
                          Posição: <strong>{atleta.position}</strong>
                        </span>
                      )}
                      {idade !== null && (
                        <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-600/70">
                          {idade} anos
                        </span>
                      )}
                      {clubeAtual && (
                        <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-600/70">
                          Clube atual:{" "}
                          <strong>{clubeAtual.clubName}</strong>
                        </span>
                      )}
                      {atleta.city && (
                        <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-600/70 inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {atleta.city}/{atleta.state}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card de nível / gamificação */}
                  <div className="bg-gradient-to-br from-purple-600/40 to-indigo-600/40 border border-purple-400/60 rounded-2xl px-4 py-3 text-sm shadow-lg w-full sm:w-64">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-xs text-purple-100/80">
                          Índice de carreira VôleiHub
                        </p>
                        <p className="font-semibold">
                          Nível {level} • {levelTitle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-purple-100/80">XP total</p>
                        <p className="font-bold">{xp} XP</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-purple-900/40 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-2 bg-gradient-to-r from-purple-300 to-purple-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo curto */}
                <p className="text-gray-200 text-sm leading-relaxed mb-4">
                  {atleta.bio
                    ? atleta.bio
                    : "Atleta de voleibol em busca de novas oportunidades para evoluir na carreira esportiva e representar clubes em alto nível competitivo."}
                </p>

                {/* Indicadores rápidos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-gray-900/70 border border-gray-700/70 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Calendar size={14} />
                      <span>Carreira</span>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {anosCarreira} anos
                    </p>
                  </div>

                  {atleta.height && (
                    <div className="bg-gray-900/70 border border-gray-700/70 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Ruler size={14} />
                        <span>Altura</span>
                      </div>
                      <p className="text-white font-semibold text-sm">
                        {atleta.height} cm
                      </p>
                    </div>
                  )}

                  {atleta.weight && (
                    <div className="bg-gray-900/70 border border-gray-700/70 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Weight size={14} />
                        <span>Peso</span>
                      </div>
                      <p className="text-white font-semibold text-sm">
                        {atleta.weight} kg
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-900/70 border border-gray-700/70 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Trophy size={14} />
                      <span>Competições</span>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {(atleta.achievements || []).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CONTATOS / CTA */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-gray-900/80 border border-gray-700/70 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-300 mb-1">
                  Interessado(a) em avaliar este atleta?
                </p>
                <p className="text-lg font-semibold">
                  Utilize este currículo como base para contato, análise e
                  indicação em clubes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-sm font-semibold shadow-lg transition-transform hover:scale-105">
                  <ArrowUpRight size={16} />
                  Quero falar com o atleta
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(linkCompartilhavel);
                      alert("Link copiado para a área de transferência!");
                    } catch {
                      alert("Não foi possível copiar o link.");
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-600 hover:border-orange-500/70 bg-gray-900/60 text-sm font-medium transition-colors"
                >
                  <Share2 size={16} />
                  Compartilhar currículo
                </button>
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-700/70 rounded-2xl p-5 space-y-3 text-sm">
              <p className="text-gray-300 font-semibold mb-1">
                Contatos cadastrados
              </p>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail size={16} className="text-orange-400" />
                <span>{atleta.email}</span>
              </div>
              {atleta.phone && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={16} className="text-orange-400" />
                  <span>{atleta.phone}</span>
                </div>
              )}
              {atleta.city && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={16} className="text-orange-400" />
                  <span>
                    {atleta.city}/{atleta.state}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* CARREIRA (CAMPEONATOS) */}
          {gruposCarreira.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Medal className="text-yellow-400" />
                  <h2 className="text-xl font-bold">Carreira em Campeonatos</h2>
                </div>
                <p className="text-xs text-gray-400">
                  Organizado por nível (Nacional, Estadual, Municipal) e
                  medalha.
                </p>
              </div>

              <div className="space-y-5">
                {gruposCarreira.map((grupo) => (
                  <div
                    key={grupo.titulo}
                    className="bg-gray-900/80 border border-yellow-500/20 rounded-2xl p-4 sm:p-5"
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="text-yellow-400" size={18} />
                      {grupo.titulo}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {grupo.conquistas.slice(0, 12).map((ach) => (
                        <div
                          key={ach.id}
                          className="bg-gray-800/70 border border-yellow-500/20 rounded-xl px-3 py-2 text-sm flex flex-col justify-between"
                        >
                          <div>
                            <p className="font-semibold text-white leading-snug">
                              {ach.championship}
                            </p>
                            <p className="text-xs text-gray-300 mt-1">
                              {ach.club} • {ach.year}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-semibold">
                              <Medal size={12} />
                              {ach.placement}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PRÊMIOS INDIVIDUAIS */}
          {premiosIndividuais.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="text-purple-400" />
                <h2 className="text-xl font-bold">Prêmios Individuais</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {premiosIndividuais.slice(0, 9).map((a) => (
                  <div
                    key={a.id}
                    className="bg-gradient-to-br from-purple-700/30 to-indigo-700/30 border border-purple-400/40 rounded-2xl p-4 text-sm"
                  >
                    <p className="font-semibold text-white mb-1">
                      {a.award || "Reconhecimento Individual"}
                    </p>
                    <p className="text-xs text-gray-200">
                      {a.championship}
                      {a.club ? ` • ${a.club}` : ""} • {a.year}
                    </p>
                    <p className="text-xs text-purple-100/80 mt-1">
                      {a.placement
                        ? `Desempenho: ${a.placement}`
                        : "Destaque por performance individual"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DEMAIS CONQUISTAS */}
          {demaisConquistas.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="text-gray-300" />
                <h2 className="text-xl font-bold">Outras Conquistas</h2>
              </div>
              <div className="bg-gray-900/70 border border-gray-700/70 rounded-2xl p-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {demaisConquistas.slice(0, 12).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between bg-gray-800/70 rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="text-white font-medium leading-snug">
                          {a.championship}
                        </p>
                        <p className="text-xs text-gray-400">
                          {a.club} • {a.year}
                        </p>
                      </div>
                      <span className="text-xs text-gray-300">
                        {a.placement || "Participação"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* HISTÓRICO DE CLUBES */}
          {atleta.experiences && atleta.experiences.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-400" />
                <h2 className="text-xl font-bold">Histórico de Clubes</h2>
              </div>
              <div className="bg-gray-900/80 border border-blue-500/30 rounded-2xl p-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...atleta.experiences]
                    .sort((a, b) => a.startYear - b.startYear)
                    .map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-gray-800/70 rounded-xl px-3 py-3 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{exp.clubName}</p>
                          {exp.current && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-semibold">
                              Atual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-300">
                          {exp.position}
                        </p>
                        <p className="text-xs text-gray-400">
                          {exp.startYear}{" "}
                          {exp.endYear ? `- ${exp.endYear}` : "- atual"}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-gray-300 mt-1">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
