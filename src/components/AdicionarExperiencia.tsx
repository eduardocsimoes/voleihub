import { useState, useEffect } from 'react';
import { X, Building2, Trophy, Calendar, MapPin } from 'lucide-react';
import type { CareerExperience, Achievement } from '../firebase/firestore';

interface AdicionarExperienciaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experience: CareerExperience) => void;
  type: 'experience';
  registeredClubs?: string[];
  editData?: CareerExperience | null;
}

interface AdicionarTituloProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
  type: 'achievement';
  registeredClubs?: string[];
  editData?: Achievement | null;
}

type Props = AdicionarExperienciaProps | AdicionarTituloProps;

export default function AdicionarCarreira({ isOpen, onClose, onSave, type, registeredClubs = [], editData = null }: Props) {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (!isOpen) {
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
      return;
    }

    if (editData) {
      if (type === 'experience') {
        const exp = editData as CareerExperience;
        setFormData(prev => ({
          ...prev,
          clubName: exp.clubName,
          position: exp.position,
          startYear: exp.startYear,
          endYear: exp.endYear || new Date().getFullYear(),
          current: exp.current,
          description: exp.description || ''
        }));
      } else {
        const ach = editData as Achievement;
        setFormData(prev => ({
          ...prev,
          championship: ach.championship,
          year: ach.year,
          club: ach.club,
          placement: ach.placement || '1º Lugar',
          award: ach.award || 'MVP',
          achievementType: ach.type
        }));
        if (registeredClubs.length > 0 && !registeredClubs.includes(ach.club)) {
          setShowCustomClub(true);
        }
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'experience') {
      const experience: any = {
        id: editData?.id || Date.now().toString(),
        clubName: formData.clubName,
        position: formData.position,
        startYear: formData.startYear,
        endYear: formData.current ? undefined : formData.endYear,
        current: formData.current,
        description: formData.description
      };
      onSave(experience);
    } else {
      const achievement: any = {
        id: editData?.id || Date.now().toString(),
        championship: formData.championship,
        year: formData.year,
        club: formData.club,
        type: formData.achievementType,
        placement: formData.achievementType === 'Coletivo' ? formData.placement : undefined,
        award: formData.achievementType === 'Individual' ? formData.award : undefined
      };
      onSave(achievement);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl border border-white/10 shadow-2xl shadow-black/50 max-h-[90vh] overflow-hidden">
        {/* Header com gradiente */}
        <div className={`relative overflow-hidden ${
          type === 'experience' 
            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-600/20' 
            : 'bg-gradient-to-r from-yellow-500/20 to-orange-600/20'
        } border-b border-white/10 p-6`}>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                type === 'experience'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {type === 'experience' ? (
                  <Building2 className="w-6 h-6" />
                ) : (
                  <Trophy className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {type === 'experience' 
                    ? (editData ? 'Editar Clube' : 'Adicionar Clube')
                    : (editData ? 'Editar Título/Prêmio' : 'Adicionar Título/Prêmio')
                  }
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {type === 'experience' 
                    ? 'Preencha as informações da sua experiência profissional'
                    : 'Registre suas conquistas e premiações'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form com scroll */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {type === 'experience' ? (
            <>
              {/* Nome do Clube */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Nome do Clube *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clubName}
                  onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Ex: Minas Tênis Clube, Seleção Brasileira..."
                />
              </div>

              {/* Posição */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  Posição *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="Ponteiro" className="bg-gray-800">Ponteiro</option>
                  <option value="Oposto" className="bg-gray-800">Oposto</option>
                  <option value="Central" className="bg-gray-800">Central</option>
                  <option value="Levantador" className="bg-gray-800">Levantador</option>
                  <option value="Líbero" className="bg-gray-800">Líbero</option>
                </select>
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Ano Início *
                  </label>
                  <input
                    type="number"
                    required
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.startYear}
                    onChange={(e) => setFormData({ ...formData, startYear: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-red-400" />
                    Ano Fim {formData.current && '(Atual)'}
                  </label>
                  <input
                    type="number"
                    disabled={formData.current}
                    min={formData.startYear}
                    max={new Date().getFullYear()}
                    value={formData.endYear}
                    onChange={(e) => setFormData({ ...formData, endYear: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Checkbox Atual */}
              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-white/5 text-green-500 focus:ring-2 focus:ring-green-500/20"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">Jogo atualmente neste clube</p>
                  <p className="text-gray-400 text-sm">Marque se você ainda faz parte do elenco</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${formData.current ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
              </label>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder="Conquistas, destaques, responsabilidades, experiências marcantes..."
                />
                <p className="text-gray-500 text-xs mt-2">Descreva sua experiência neste clube e principais conquistas</p>
              </div>
            </>
          ) : (
            <>
              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Tipo de Conquista *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, achievementType: 'Coletivo' })}
                    className={`p-4 rounded-xl font-semibold transition-all border-2 ${
                      formData.achievementType === 'Coletivo'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-sm">Título Coletivo</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, achievementType: 'Individual' })}
                    className={`p-4 rounded-xl font-semibold transition-all border-2 ${
                      formData.achievementType === 'Individual'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-sm">Prêmio Individual</div>
                  </button>
                </div>
              </div>

              {/* Campeonato */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Campeonato/Competição *
                </label>
                <input
                  type="text"
                  required
                  value={formData.championship}
                  onChange={(e) => setFormData({ ...formData, championship: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="Ex: Superliga Brasileira, Copa do Brasil..."
                />
              </div>

              {/* Clube/Seleção */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
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
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all mt-2"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                    placeholder="Ex: Minas Tênis Clube, Seleção Brasileira..."
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ano */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Ano *
                  </label>
                  <input
                    type="number"
                    required
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  />
                </div>

                {/* Colocação ou Prêmio */}
                {formData.achievementType === 'Coletivo' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Colocação *
                    </label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                    >
                      <option value="1º Lugar" className="bg-gray-800">🥇 1º Lugar (Campeão)</option>
                      <option value="2º Lugar" className="bg-gray-800">🥈 2º Lugar (Vice)</option>
                      <option value="3º Lugar" className="bg-gray-800">🥉 3º Lugar</option>
                      <option value="Participante" className="bg-gray-800">🏆 Participante</option>
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
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="MVP" className="bg-gray-800">👑 MVP (Melhor Jogador)</option>
                      <option value="Melhor Ponteiro" className="bg-gray-800">🎯 Melhor Ponteiro</option>
                      <option value="Melhor Levantador" className="bg-gray-800">🎯 Melhor Levantador</option>
                      <option value="Melhor Central" className="bg-gray-800">🎯 Melhor Central</option>
                      <option value="Melhor Líbero" className="bg-gray-800">🎯 Melhor Líbero</option>
                      <option value="Melhor Oposto" className="bg-gray-800">🎯 Melhor Oposto</option>
                      <option value="Melhor Sacador" className="bg-gray-800">⚡ Melhor Sacador</option>
                      <option value="Melhor Bloqueador" className="bg-gray-800">🧱 Melhor Bloqueador</option>
                      <option value="Destaque" className="bg-gray-800">⭐ Destaque da Competição</option>
                      <option value="Revelação" className="bg-gray-800">🌟 Revelação</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                type === 'experience'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-blue-500/50 text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:shadow-yellow-500/50 text-white'
              }`}
            >
              {editData ? '✓ Salvar Alterações' : '+ Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}