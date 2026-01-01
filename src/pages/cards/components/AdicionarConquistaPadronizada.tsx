import { useEffect, useState } from "react";
import { X, Trophy, Award } from "lucide-react";
import type { Achievement } from "../../../firebase/firestore";

/* =====================================================
   CONSTANTES FIXAS
===================================================== */

type ChampionshipType =
  | "Municipal"
  | "Estadual"
  | "Nacional"
  | "Internacional";

interface ChampionshipOption {
  id: string;
  name: string;
  type: ChampionshipType;
}

const CHAMPIONSHIPS: ChampionshipOption[] = [
  { id: "cbs", name: "Campeonato Brasileiro de Seleções", type: "Nacional" },
  { id: "superliga", name: "Superliga Brasileira", type: "Nacional" },
  { id: "estadual", name: "Campeonato Estadual", type: "Estadual" },
  { id: "municipal", name: "Campeonato Municipal", type: "Municipal" },
];

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

/* =====================================================
   PROPS
===================================================== */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement & {
    championshipId?: string;
    championshipType?: ChampionshipType;
    state?: string;
    city?: string;
  }) => void;
  editData?: Achievement | null;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AdicionarConquistaPadronizada({
  isOpen,
  onClose,
  onSave,
}: Props) {

  /* ---------------- TIPO ---------------- */
  const [achievementType, setAchievementType] =
    useState<"Coletivo" | "Individual">("Coletivo");

  /* ---------------- CAMPEONATO ---------------- */
  const [championshipId, setChampionshipId] = useState("");
  const [customChampionship, setCustomChampionship] = useState("");
  const [championshipType, setChampionshipType] =
    useState<ChampionshipType | "">("");

  /* ---------------- DADOS ---------------- */
  const [year, setYear] = useState(new Date().getFullYear());
  const [club, setClub] = useState("");
  const [placement, setPlacement] =
    useState<"1º Lugar" | "2º Lugar" | "3º Lugar" | "Participante">("1º Lugar");
  const [award, setAward] = useState("");

  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const selectedChampionship = CHAMPIONSHIPS.find(
    (c) => c.id === championshipId
  );

  const finalChampionshipType =
    championshipId === "outro"
      ? championshipType
      : selectedChampionship?.type;

  useEffect(() => {
    if (selectedChampionship) {
      setChampionshipType(selectedChampionship.type);
    }
  }, [selectedChampionship]);

  if (!isOpen) return null;

  /* =====================================================
     SUBMIT
  ===================================================== */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const championshipName =
      championshipId === "outro"
        ? customChampionship
        : selectedChampionship?.name;

    if (!championshipName || !finalChampionshipType) return;

    if (achievementType === "Coletivo" && !placement) return;
    if (achievementType === "Individual" && !award.trim()) return;

    const achievement: Achievement & {
      championshipId?: string;
      championshipType?: ChampionshipType;
      state?: string;
      city?: string;
    } = {
      id: `achievement_${Date.now()}`,
      type: achievementType,
      championship: championshipName,
      year,
      club,

      placement: achievementType === "Coletivo" ? placement : undefined,
      award: achievementType === "Individual" ? award : undefined,

      championshipId:
        championshipId === "outro" ? undefined : championshipId,
      championshipType: finalChampionshipType,

      state:
        finalChampionshipType === "Estadual" ||
        finalChampionshipType === "Municipal"
          ? state
          : undefined,

      city:
        finalChampionshipType === "Municipal" ? city : undefined,
    };

    onSave(achievement);
    onClose();
  }

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl border border-white/10 shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
              <Trophy />
            </div>
            <h2 className="text-xl font-bold text-white">
              Nova Conquista
            </h2>
          </div>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* TIPO */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAchievementType("Coletivo")}
              className={`p-4 rounded-xl border transition-all ${
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
              className={`p-4 rounded-xl border transition-all ${
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
            onChange={(e) => setChampionshipId(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            required
          >
            <option value="">Selecione o campeonato</option>
            {CHAMPIONSHIPS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="outro">Outro</option>
          </select>

          {championshipId === "outro" && (
            <>
              <input
                value={customChampionship}
                onChange={(e) => setCustomChampionship(e.target.value)}
                placeholder="Nome do campeonato"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                required
              />

              <select
                value={championshipType}
                onChange={(e) =>
                  setChampionshipType(e.target.value as ChampionshipType)
                }
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

          {(finalChampionshipType === "Estadual" ||
            finalChampionshipType === "Municipal") && (
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            >
              <option value="">Estado</option>
              {STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          )}

          {finalChampionshipType === "Municipal" && (
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Município"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
          )}

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
          />

          <input
            value={club}
            onChange={(e) => setClub(e.target.value)}
            placeholder="Clube / Seleção"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            required
          />

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

          {achievementType === "Individual" && (
            <input
              value={award}
              onChange={(e) => setAward(e.target.value)}
              placeholder="Ex: MVP, Melhor Ponteiro"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
              required
            />
          )}

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
              Salvar Conquista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
