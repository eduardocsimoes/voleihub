import { useState, useEffect } from "react";
import { X, Trophy, Award } from "lucide-react";
import type { Achievement } from "../../../firebase/firestore";

/* =====================================================
   CONSTANTES
===================================================== */

type ChampionshipType = "Municipal" | "Estadual" | "Nacional" | "Internacional";

interface ChampionshipOption {
  id: string;
  name: string;
  type: ChampionshipType;
}

const CATEGORIES = [
  "Sub-12",
  "Sub-13",
  "Sub-14",
  "Sub-15",
  "Sub-16",
  "Sub-17",
  "Sub-18",
  "Sub-19",
  "Sub-20",
  "Sub-21",
  "Sub-23",
  "Adulto-Amador",
  "Adulto-Profissional",
] as const;

type ChampionshipCategory = (typeof CATEGORIES)[number];

const CHAMPIONSHIPS: ChampionshipOption[] = [
  { id: "estadual", name: "Campeonato Estadual", type: "Estadual" },
  { id: "municipal", name: "Campeonato Municipal", type: "Municipal" },

  // ✅ IDs únicos (evita duplicidade no <select>)
  { id: "copa_estadual", name: "Copa Estadual", type: "Estadual" },
  { id: "copa_municipal", name: "Copa Municipal", type: "Municipal" },

  { id: "cbs", name: "Campeonato Brasileiro de Seleções", type: "Nacional" },
  { id: "cbi", name: "Campeonato Brasileiro Interclubes", type: "Nacional" },
  { id: "jebs", name: "Jogos Escolares Brasileiros", type: "Nacional" },
  { id: "taca_parana", name: "Taça Paraná de Voleibol", type: "Nacional" },
  { id: "copa_minas", name: "Copa Minas de Voleibol", type: "Nacional" },
  { id: "superliga_a", name: "Superliga A", type: "Nacional" },
  { id: "superliga_b", name: "Superliga B", type: "Nacional" },
  { id: "superliga_c", name: "Superliga C", type: "Nacional" },
  {
    id: "sul_americano_selecoes",
    name: "Campeonato Sul-Americano de Seleções",
    type: "Internacional",
  },
  {
    id: "pan_americano_selecoes",
    name: "Copa Pan-Americana de Seleções",
    type: "Internacional",
  },
  {
    id: "mundial_selecoes",
    name: "Campeonato Mundial de Seleções",
    type: "Internacional",
  },
];

const STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

/* =====================================================
   PROPS
===================================================== */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registeredClubs: string[];
  editData?: Achievement | null;
  onSave: (
    achievement: Achievement & {
      championshipId?: string;
      championshipType?: ChampionshipType;
      championshipCategory?: ChampionshipCategory;
      state?: string;
      city?: string;
    }
  ) => void;
}

/* =====================================================
   COMPONENTE
===================================================== */

export default function AdicionarConquistaPadronizada({
  isOpen,
  onClose,
  onSave,
  registeredClubs,
  editData,
}: Props) {
  /* ---------------- TIPO ---------------- */
  const [achievementType, setAchievementType] = useState<"Coletivo" | "Individual">(
    "Coletivo"
  );

  /* ---------------- OUTRO CAMPEONATO ---------------- */
  const [customChampionship, setCustomChampionship] = useState("");

  /* ---------------- CAMPEONATO ---------------- */
  const [championshipId, setChampionshipId] = useState("");
  const [championshipType, setChampionshipType] = useState<ChampionshipType | "">("");

  const [category, setCategory] = useState<ChampionshipCategory | "">("");

  /* ---------------- DADOS ---------------- */
  const [year, setYear] = useState(new Date().getFullYear());
  const [club, setClub] = useState("");
  const [placement, setPlacement] = useState<
    "1º Lugar" | "2º Lugar" | "3º Lugar" | "Participante"
  >("1º Lugar");
  const [award, setAward] = useState("");

  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const finalChampionshipType = championshipType;

  /* =====================================================
     EDIÇÃO: PRÉ-CARREGAR DADOS
  ===================================================== */
  useEffect(() => {
    if (!isOpen) return;
    if (!editData) return;

    // Tipo
    setAchievementType(editData.type === "Individual" ? "Individual" : "Coletivo");

    // Ano / Clube
    if (typeof editData.year === "number") setYear(editData.year);
    setClub(editData.club ?? "");

    // Categoria
    setCategory((editData as any).championshipCategory ?? "");

    // Estado / Cidade
    setState(editData.state ?? "");
    setCity(editData.city ?? "");

    // Colocação / Prêmio
    setPlacement(((editData as any).placement as any) ?? "1º Lugar");
    setAward(editData.award ?? "");

    // Campeonato
    const hasChampionshipId = !!(editData as any).championshipId;
    const champId = (editData as any).championshipId as string | undefined;
    const champName = editData.championship;

    // tenta casar por id+nome -> por nome -> por id
    const match =
      (hasChampionshipId
        ? CHAMPIONSHIPS.find((c) => c.id === champId && c.name === champName)
        : undefined) ||
      CHAMPIONSHIPS.find((c) => c.name === champName) ||
      (hasChampionshipId ? CHAMPIONSHIPS.find((c) => c.id === champId) : undefined);

    if (match) {
      setChampionshipId(match.id);
      setChampionshipType(match.type);
      setCustomChampionship("");
    } else {
      setChampionshipId("outro");
      setCustomChampionship(champName ?? "");
      setChampionshipType(((editData as any).championshipType as ChampionshipType) ?? "");
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  /* =====================================================
     SUBMIT
  ===================================================== */

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const isOutro = championshipId === "outro";
    const selected = isOutro ? undefined : CHAMPIONSHIPS.find((c) => c.id === championshipId);

    // Validações principais
    if (!finalChampionshipType || !category) return;

    // Se for "outro", precisa ter nome preenchido
    if (isOutro && !customChampionship.trim()) return;

    // Se NÃO for outro, precisa existir o selected
    if (!isOutro && !selected) return;

    if (achievementType === "Coletivo" && !placement) return;
    if (achievementType === "Individual" && !award.trim()) return;

    // Para Estadual/Municipal precisa de estado; para Municipal precisa de cidade
    if (
      (finalChampionshipType === "Estadual" || finalChampionshipType === "Municipal") &&
      !state
    )
      return;
    if (finalChampionshipType === "Municipal" && !city.trim()) return;

    const achievement: Achievement & {
      championshipId?: string;
      championshipType?: ChampionshipType;
      championshipCategory?: ChampionshipCategory;
      state?: string;
      city?: string;
    } = {
      // ✅ mantém o mesmo ID quando está editando
      id: editData?.id ?? `achievement_${Date.now()}`,
      type: achievementType,

      championship: isOutro ? customChampionship.trim() : selected!.name,
      championshipId: isOutro ? undefined : selected!.id,

      championshipType: finalChampionshipType as ChampionshipType,
      championshipCategory: category as ChampionshipCategory,

      year,
      club,

      placement: achievementType === "Coletivo" ? placement : undefined,
      award: achievementType === "Individual" ? award : undefined,

      state:
        finalChampionshipType === "Estadual" || finalChampionshipType === "Municipal"
          ? state
          : undefined,

      city: finalChampionshipType === "Municipal" ? city.trim() : undefined,
    };

    onSave(achievement);
    onClose();
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
              <Trophy />
            </div>
            <h2 className="text-xl font-bold text-white">
              {editData ? "Editar Conquista" : "Nova Conquista"}
            </h2>
          </div>

          <button onClick={onClose} type="button">
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* FORM (ROLÁVEL) */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        >
          {/* TIPO */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAchievementType("Coletivo")}
              className={`p-4 rounded-xl border ${
                achievementType === "Coletivo"
                  ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              <Trophy className="mx-auto mb-2" />
              Título Coletivo
            </button>

            <button
              type="button"
              onClick={() => setAchievementType("Individual")}
              className={`p-4 rounded-xl border ${
                achievementType === "Individual"
                  ? "bg-purple-500/20 border-purple-500 text-purple-400"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              <Award className="mx-auto mb-2" />
              Prêmio Individual
            </button>
          </div>

          {/* CAMPEONATO */}
          <select
            value={championshipId}
            onChange={(e) => {
              const value = e.target.value;
              setChampionshipId(value);

              if (value === "outro") {
                // tipo escolhido manualmente
                setChampionshipType("");
              } else {
                const found = CHAMPIONSHIPS.find((c) => c.id === value);
                setChampionshipType(found ? found.type : "");
              }

              // reseta dependências
              setCustomChampionship("");
              setState("");
              setCity("");
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            required
          >
            <option value="">Selecione o campeonato</option>
            {CHAMPIONSHIPS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="outro">Outro</option>
          </select>

          {/* OUTRO: NOME DO CAMPEONATO */}
          {championshipId === "outro" && (
            <>
              <input
                value={customChampionship}
                onChange={(e) => setCustomChampionship(e.target.value)}
                placeholder="Nome do campeonato"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                required
              />

              {/* OUTRO: TIPO DO CAMPEONATO */}
              <select
                value={championshipType}
                onChange={(e) => {
                  setChampionshipType(e.target.value as ChampionshipType);
                  setState("");
                  setCity("");
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                required
              >
                <option value="">Tipo do campeonato</option>
                <option value="Municipal">Municipal</option>
                <option value="Estadual">Estadual</option>
                <option value="Nacional">Nacional</option>
                <option value="Internacional">Internacional</option>
              </select>
            </>
          )}

          {/* CATEGORIA */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ChampionshipCategory)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            required
          >
            <option value="">Categoria</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* ESTADO */}
          {(finalChampionshipType === "Estadual" || finalChampionshipType === "Municipal") && (
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            >
              <option value="">Estado</option>
              {STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          )}

          {/* CIDADE */}
          {finalChampionshipType === "Municipal" && (
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Município"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
          )}

          {/* ANO */}
          <input
            type="number"
            min="1950"
            max={new Date().getFullYear()}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          />

          {/* CLUBE */}
          <select
            value={club}
            onChange={(e) => setClub(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            required
          >
            <option value="">Selecione o Clube / Seleção</option>
            {registeredClubs.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* COLETIVO */}
          {achievementType === "Coletivo" && (
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as any)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            >
              <option value="1º Lugar">🥇 1º Lugar</option>
              <option value="2º Lugar">🥈 2º Lugar</option>
              <option value="3º Lugar">🥉 3º Lugar</option>
              <option value="Participante">🏆 Participante</option>
            </select>
          )}

          {/* INDIVIDUAL */}
          {achievementType === "Individual" && (
            <input
              value={award}
              onChange={(e) => setAward(e.target.value)}
              placeholder="Ex: MVP, Melhor Ponteiro"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 rounded-xl text-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white font-semibold"
            >
              {editData ? "Salvar Alterações" : "Salvar Conquista"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
