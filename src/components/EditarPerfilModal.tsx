import { useState, useEffect } from 'react';
import { X, Save, User, MapPin, Phone, Ruler, Weight, Calendar, Target, MessageSquare, Trophy, Plus, Trash2 } from 'lucide-react';
import { AtletaProfile } from '../firebase/firestore';

interface EditarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  atletaProfile: AtletaProfile;
  userDisplayName: string;
  onSave: (updatedProfile: Partial<AtletaProfile>) => Promise<void>;
}

export default function EditarPerfilModal({ 
  isOpen, 
  onClose, 
  atletaProfile, 
  userDisplayName,
  onSave 
}: EditarPerfilModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position: '',
    height: 0,
    weight: 0,
    birthDate: '',
    city: '',
    state: '',
    phone: '',
    bio: '',
    statsAces: 0,
    statsBlocks: 0,
    statsAttacks: 0,
    achievements: [] as string[],
    videos: [] as string[],
    seeking: [] as ('clube' | 'patrocinio' | 'treinador')[]
  });

  const [newAchievement, setNewAchievement] = useState('');
  const [newVideo, setNewVideo] = useState('');

  // Carregar dados atuais quando o modal abre
  useEffect(() => {
    if (isOpen && atletaProfile) {
      setFormData({
        position: atletaProfile.position || '',
        height: atletaProfile.height || 0,
        weight: atletaProfile.weight || 0,
        birthDate: atletaProfile.birthDate || '',
        city: atletaProfile.city || '',
        state: atletaProfile.state || '',
        phone: atletaProfile.phone || '',
        bio: atletaProfile.bio || '',
        statsAces: atletaProfile.stats?.aces || 0,
        statsBlocks: atletaProfile.stats?.blocks || 0,
        statsAttacks: atletaProfile.stats?.attacks || 0,
        achievements: atletaProfile.achievements || [],
        videos: atletaProfile.videos || [],
        seeking: atletaProfile.seeking || []
      });
    }
  }, [isOpen, atletaProfile]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const addVideo = () => {
    if (newVideo.trim()) {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, newVideo.trim()]
      }));
      setNewVideo('');
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const toggleSeeking = (item: 'clube' | 'patrocinio' | 'treinador') => {
    setFormData(prev => ({
      ...prev,
      seeking: prev.seeking.includes(item)
        ? prev.seeking.filter(s => s !== item)
        : [...prev.seeking, item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile: Partial<AtletaProfile> = {
        position: formData.position,
        height: Number(formData.height),
        weight: Number(formData.weight),
        birthDate: formData.birthDate,
        city: formData.city,
        state: formData.state,
        phone: formData.phone,
        bio: formData.bio,
        stats: {
          aces: Number(formData.statsAces),
          blocks: Number(formData.statsBlocks),
          attacks: Number(formData.statsAttacks)
        },
        achievements: formData.achievements,
        videos: formData.videos,
        seeking: formData.seeking
      };

      await onSave(updatedProfile);
      alert('✅ Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Editar Perfil</h2>
              <p className="text-gray-400 text-sm mt-1">{userDisplayName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Informações Básicas
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Posição
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="">Selecione</option>
                    <option value="Levantador">Levantador</option>
                    <option value="Oposto">Oposto</option>
                    <option value="Ponteiro">Ponteiro</option>
                    <option value="Central">Central</option>
                    <option value="Líbero">Líbero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height || ''}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="Ex: 185"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="Ex: 80"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Contato e Localização */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Contato e Localização
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Ex: Rio de Janeiro"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Ex: RJ"
                    maxLength={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors uppercase"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Telefone/WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Ex: +55 21 99999-9999"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Biografia */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Sobre Você
              </h3>
              
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Conte sua história, suas conquistas e seus objetivos no vôlei..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors resize-none"
              />
              <p className="text-gray-400 text-xs mt-2">{formData.bio.length}/500 caracteres</p>
            </div>

            {/* Estatísticas */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Estatísticas
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Aces
                  </label>
                  <input
                    type="number"
                    value={formData.statsAces || ''}
                    onChange={(e) => handleChange('statsAces', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Bloqueios
                  </label>
                  <input
                    type="number"
                    value={formData.statsBlocks || ''}
                    onChange={(e) => handleChange('statsBlocks', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Ataques
                  </label>
                  <input
                    type="number"
                    value={formData.statsAttacks || ''}
                    onChange={(e) => handleChange('statsAttacks', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Conquistas */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                Conquistas
              </h3>
              
              <div className="space-y-3 mb-4">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                    <Trophy className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-300 flex-1">{achievement}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                  placeholder="Ex: Campeão Estadual 2023"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={addAchievement}
                  className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Estou Procurando */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Estou Procurando</h3>
              
              <div className="flex flex-wrap gap-3">
                {(['clube', 'patrocinio', 'treinador'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSeeking(item)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      formData.seeking.includes(item)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 px-6 py-4">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}