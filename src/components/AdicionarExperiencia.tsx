import { useState } from 'react';
import { X, Building2, Trophy } from 'lucide-react';
import type { CareerExperience, Achievement } from '../firebase/firestore';

interface AdicionarExperienciaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: CareerExperience) => void;
  type: 'experience';
  registeredClubs?: string[];
}

interface AdicionarTituloProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
  type: 'achievement';
  registeredClubs?: string[];
}

type Props = AdicionarExperienciaProps | AdicionarTituloProps;

export default function AdicionarCarreira({ isOpen, onClose, onSave, type, registeredClubs = [] }: Props) {
  const [formData, setFormData] = useState<{
    clubName: string;
    position: string;
    startYear: number;
    endYear: number;
    current: boolean;
    description: string;
    championship: string;
    year: number;
    club: string;
    placement: '1º Lugar' | '2º Lugar' | '3º Lugar' | 'Participante';
    award: 'MVP' | 'Melhor Ponteiro' | 'Melhor Levantador' | 'Melhor Central' | 'Melhor Líbero' | 'Melhor Oposto' | 'Melhor Sacador' | 'Melhor Bloqueador' | 'Destaque' | 'Revelação';
    achievementType: 'Coletivo' | 'Individual';
  }>({
    clubName: '',
    position: 'Ponteiro',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    current: false,
    description: '',
    championship: '',
    year: new Date().getFullYear(),
    club: registeredClubs.length > 0 ? registeredClubs[0] : '',
    placement: '1º Lugar',
    award: 'MVP',
    achievementType: 'Coletivo'
  });

  const [showCustomClub, setShowCustomClub] = useState(false);

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
        championship: formData.championship,
        year: formData.year,
        club: formData.club,
        type: formData.achievementType,
        ...(formData.achievementType === 'Coletivo' 
          ? { placement: formData.placement }
          : { award: formData.award }
        )
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
      championship: '',
      year: new Date().getFullYear(),
      club: registeredClubs.length > 0 ? registeredClubs[0] : '',
      placement: '1º Lugar',
      award: 'MVP',
      achievementType: 'Coletivo'
    });
    setShowCustomClub(false);
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
              {type === 'experience' ? 'Adicionar Clube' : 'Adicionar Título/Prêmio'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {type === 'experience' ? (
            <>
              {/* FORMULÁRIO DE CLUBE (mantém igual) */}
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
              {/* TIPO: COLETIVO OU INDIVIDUAL */}
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
                    🏆 Título Coletivo
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
                    ⭐ Prêmio Individual
                  </button>
                </div>
              </div>

              {/* CAMPEONATO */}
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

              {/* CLUBE/SELEÇÃO */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Clube/Seleção *
                </label>
                {registeredClubs.length > 0 ? (
                  <>
                    <select
                      value={showCustomClub ? 'outro' : formData.club}
                      onChange={(e) => {
                        if (e.target.value === 'outro') {
                          setShowCustomClub(true);
                          setFormData({ ...formData, club: '' });
                        } else {
                          setShowCustomClub(false);
                          setFormData({ ...formData, club: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    >
                      {registeredClubs.map((clube) => (
                        <option key={clube} value={clube} className="bg-gray-800 text-white">
                          {clube}
                        </option>
                      ))}
                      <option value="outro" className="bg-gray-800 text-white">
                        ➕ Outro clube/seleção
                      </option>
                    </select>
                    
                    {showCustomClub && (
                      <input
                        type="text"
                        required
                        value={formData.club}
                        onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 mt-2"
                        placeholder="Digite o nome do clube ou seleção"
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.club}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                    placeholder="Ex: Minas Tênis Clube, Seleção Brasileira..."
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* ANO */}
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

                {/* COLOCAÇÃO (SE COLETIVO) OU PRÊMIO (SE INDIVIDUAL) */}
                {formData.achievementType === 'Coletivo' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Colocação *
                    </label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    >
                      <option value="1º Lugar" className="bg-gray-800 text-white">🥇 1º Lugar</option>
                      <option value="2º Lugar" className="bg-gray-800 text-white">🥈 2º Lugar</option>
                      <option value="3º Lugar" className="bg-gray-800 text-white">🥉 3º Lugar</option>
                      <option value="Participante" className="bg-gray-800 text-white">🏆 Participante</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Prêmio *
                    </label>
                    <select
                      value={formData.award}
                      onChange={(e) => setFormData({ ...formData, award: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="MVP" className="bg-gray-800 text-white">👑 MVP (Melhor Jogador)</option>
                      <option value="Melhor Ponteiro" className="bg-gray-800 text-white">🎯 Melhor Ponteiro</option>
                      <option value="Melhor Levantador" className="bg-gray-800 text-white">🎯 Melhor Levantador</option>
                      <option value="Melhor Central" className="bg-gray-800 text-white">🎯 Melhor Central</option>
                      <option value="Melhor Líbero" className="bg-gray-800 text-white">🎯 Melhor Líbero</option>
                      <option value="Melhor Oposto" className="bg-gray-800 text-white">🎯 Melhor Oposto</option>
                      <option value="Melhor Sacador" className="bg-gray-800 text-white">⚡ Melhor Sacador</option>
                      <option value="Melhor Bloqueador" className="bg-gray-800 text-white">🧱 Melhor Bloqueador</option>
                      <option value="Destaque" className="bg-gray-800 text-white">⭐ Destaque da Competição</option>
                      <option value="Revelação" className="bg-gray-800 text-white">🌟 Revelação</option>
                    </select>
                  </div>
                )}
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