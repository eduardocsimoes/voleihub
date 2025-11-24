import { useState, useEffect } from 'react';
import { X, Building2, Calendar, MapPin, Phone, Globe, FileText, Trophy, Target } from 'lucide-react';
import { ClubeProfile } from '../firebase/firestore';

interface EditarPerfilClubeProps {
  isOpen: boolean;
  onClose: () => void;
  clubeProfile: ClubeProfile;
  userDisplayName: string;
  onSave: (updatedProfile: Partial<ClubeProfile>) => Promise<void>;
}

export default function EditarPerfilClube({ 
  isOpen, 
  onClose, 
  clubeProfile, 
  userDisplayName,
  onSave 
}: EditarPerfilClubeProps) {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    clubName: '',
    foundedYear: 0,
    category: '',
    city: '',
    state: '',
    phone: '',
    website: '',
    description: '',
    statsAthletes: 0,
    statsTitles: 0,
    statsMatches: 0,
    achievements: [] as string[],
    seeking: [] as ('atletas' | 'treinadores' | 'patrocinadores')[]
  });

  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    if (isOpen && clubeProfile) {
      setFormData({
        clubName: clubeProfile.clubName || '',
        foundedYear: clubeProfile.foundedYear || 0,
        category: clubeProfile.category || '',
        city: clubeProfile.city || '',
        state: clubeProfile.state || '',
        phone: clubeProfile.phone || '',
        website: clubeProfile.website || '',
        description: clubeProfile.description || '',
        statsAthletes: clubeProfile.stats?.athletes || 0,
        statsTitles: clubeProfile.stats?.titles || 0,
        statsMatches: clubeProfile.stats?.matches || 0,
        achievements: clubeProfile.achievements || [],
        seeking: clubeProfile.seeking || []
      });
      setSuccessMessage('');
    }
  }, [isOpen, clubeProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 2) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const toggleSeeking = (item: 'atletas' | 'treinadores' | 'patrocinadores') => {
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
    setSuccessMessage('');

    try {
      const updatedProfile: Partial<ClubeProfile> = {
        clubName: formData.clubName,
        foundedYear: Number(formData.foundedYear),
        category: formData.category,
        city: formData.city,
        state: formData.state,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        stats: {
          athletes: Number(formData.statsAthletes),
          titles: Number(formData.statsTitles),
          matches: Number(formData.statsMatches)
        },
        achievements: formData.achievements,
        seeking: formData.seeking
      };

      await onSave(updatedProfile);
      setSuccessMessage('✅ Perfil atualizado com sucesso!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Editar Perfil</h2>
                <p className="text-sm text-gray-400">{userDisplayName}</p>
              </div>
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
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Informações do Clube
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nome do Clube
                  </label>
                  <input
                    type="text"
                    name="clubName"
                    value={formData.clubName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ex: Vôlei Clube Brasil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Ano de Fundação
                  </label>
                  <input
                    type="number"
                    name="foundedYear"
                    value={formData.foundedYear || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ex: 1995"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecione</option>
                    <option value="Profissional">Profissional</option>
                    <option value="Amador">Amador</option>
                    <option value="Juvenil">Juvenil</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Mirim">Mirim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Site Oficial
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>
            </div>

            {/* Localização e Contato */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Localização e Contato
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors uppercase"
                    placeholder="SP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Sobre o Clube
              </h3>
              
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Conte a história do clube, valores, missão, diferenciais..."
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.description.length}/500 caracteres
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-500" />
                Estatísticas
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Número de Atletas
                  </label>
                  <input
                    type="number"
                    name="statsAthletes"
                    value={formData.statsAthletes || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Títulos Conquistados
                  </label>
                  <input
                    type="number"
                    name="statsTitles"
                    value={formData.statsTitles || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Partidas Jogadas
                  </label>
                  <input
                    type="number"
                    name="statsMatches"
                    value={formData.statsMatches || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Conquistas */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-500" />
                Principais Conquistas
              </h3>
              
              <div className="space-y-3 mb-4">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                    <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-300 flex-1">{achievement}</span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
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
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: Campeão Estadual 2023"
                />
                <button
                  type="button"
                  onClick={addAchievement}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Estamos Procurando */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Estamos Procurando
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {(['atletas', 'treinadores', 'patrocinadores'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSeeking(item)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
                      formData.seeking.includes(item)
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center font-semibold">
              {successMessage}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 px-6 py-4">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}