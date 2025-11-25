import { useState } from 'react';
import { X, Building2, Trophy } from 'lucide-react';

interface CareerExperience {
  id: string;
  clubName: string;
  position: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  description?: string;
}

interface Achievement {
  id: string;
  title: string;
  year: number;
  championship: string;
  placement: 'Campeão' | 'Vice-Campeão' | '3º Lugar' | 'Participante';
  type: 'Coletivo' | 'Individual';
}

interface AdicionarExperienciaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: CareerExperience) => void;
  type: 'experience';
}

interface AdicionarTituloProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
  type: 'achievement';
}

type Props = AdicionarExperienciaProps | AdicionarTituloProps;

export default function AdicionarCarreira({ isOpen, onClose, onSave, type }: Props) {
  const [formData, setFormData] = useState<{
    clubName: string;
    position: string;
    startYear: number;
    endYear: number;
    current: boolean;
    description: string;
    title: string;
    year: number;
    championship: string;
    placement: 'Campeão' | 'Vice-Campeão' | '3º Lugar' | 'Participante';
    achievementType: 'Coletivo' | 'Individual';
  }>({
    clubName: '',
    position: 'Ponteiro',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    current: false,
    description: '',
    title: '',
    year: new Date().getFullYear(),
    championship: '',
    placement: 'Campeão',
    achievementType: 'Coletivo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'experience') {
      const experience: CareerExperience = {
        id: Date.now().toString(),
        clubName: formData.clubName,
        position: formData.position,
        startYear: formData.startYear,
        endYear: formData.current ? undefined : formData.endYear,
        current: formData.current,
        description: formData.description
      };
      onSave(experience);
    } else {
      const achievement: Achievement = {
        id: Date.now().toString(),
        title: formData.title,
        year: formData.year,
        championship: formData.championship,
        placement: formData.placement,
        type: formData.achievementType
      };
      onSave(achievement);
    }

    // Reset
    setFormData({
      clubName: '',
      position: 'Ponteiro',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      current: false,
      description: '',
      title: '',
      year: new Date().getFullYear(),
      championship: '',
      placement: 'Campeão',
      achievementType: 'Coletivo'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {type === 'experience' ? (
              <Building2 className="w-6 h-6 text-blue-500" />
            ) : (
              <Trophy className="w-6 h-6 text-yellow-500" />
            )}
            <h2 className="text-xl font-bold text-white">
              {type === 'experience' ? 'Adicionar Clube' : 'Adicionar Título'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'experience' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nome do Clube *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clubName}
                  onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Minas Tênis Clube"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Posição *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Levantador">Levantador</option>
                  <option value="Oposto">Oposto</option>
                  <option value="Ponteiro">Ponteiro</option>
                  <option value="Central">Central</option>
                  <option value="Líbero">Líbero</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Ano Início *
                  </label>
                  <input
                    type="number"
                    required
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.startYear}
                    onChange={(e) => setFormData({ ...formData, startYear: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Ano Fim
                  </label>
                  <input
                    type="number"
                    disabled={formData.current}
                    min={formData.startYear}
                    max={new Date().getFullYear()}
                    value={formData.endYear}
                    onChange={(e) => setFormData({ ...formData, endYear: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="current"
                  checked={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5"
                />
                <label htmlFor="current" className="text-sm text-gray-300">
                  Jogo atualmente neste clube
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Conquistas, destaques, experiência..."
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Título/Prêmio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  placeholder="Ex: Superliga 2023"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Campeonato *
                </label>
                <input
                  type="text"
                  required
                  value={formData.championship}
                  onChange={(e) => setFormData({ ...formData, championship: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                  placeholder="Ex: Superliga Brasileira"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Ano *
                  </label>
                  <input
                    type="number"
                    required
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Colocação *
                  </label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Campeão">🥇 Campeão</option>
                    <option value="Vice-Campeão">🥈 Vice</option>
                    <option value="3º Lugar">🥉 3º Lugar</option>
                    <option value="Participante">Participante</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tipo *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, achievementType: 'Coletivo' })}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      formData.achievementType === 'Coletivo'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    🏆 Coletivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, achievementType: 'Individual' })}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      formData.achievementType === 'Individual'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    ⭐ Individual
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                type === 'experience'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:shadow-lg hover:shadow-yellow-500/50'
              } text-white`}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}