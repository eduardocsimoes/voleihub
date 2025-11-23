import { useState } from 'react';
import { X, Award, MapPin, Phone, Globe, CheckCircle, Loader2, DollarSign } from 'lucide-react';
import { updatePatrocinadorProfile, completeOnboarding } from '../firebase/firestore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

export default function OnboardingPatrocinador({ isOpen, onClose, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  if (!isOpen) return null;

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const industryOptions = [
    { value: 'esportes', label: 'Esportes e Fitness' },
    { value: 'alimentacao', label: 'Alimentação e Bebidas' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'saude', label: 'Saúde e Bem-estar' },
    { value: 'moda', label: 'Moda e Vestuário' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'outros', label: 'Outros' }
  ];

  const interestOptions = [
    { value: 'atletas', label: '👤 Atletas Individuais' },
    { value: 'clubes', label: '🏐 Clubes' },
    { value: 'eventos', label: '🎉 Eventos' },
    { value: 'campeonatos', label: '🏆 Campeonatos' },
    { value: 'digital', label: '📱 Marketing Digital' },
    { value: 'uniforme', label: '👕 Uniformes/Equipamentos' }
  ];

  const toggleInterest = (value: string) => {
    if (interests.includes(value)) {
      setInterests(interests.filter(i => i !== value));
    } else {
      setInterests([...interests, value]);
    }
  };

  const handleComplete = async () => {
    if (!brandName || !industry || !city || !state || !phone || !description || interests.length === 0) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updatePatrocinadorProfile(userId, {
        brandName,
        industry,
        city,
        state,
        phone,
        website: website || undefined,
        budget: budget ? Number(budget) : undefined,
        description,
        interests
      });

      await completeOnboarding(userId);
      alert('Perfil completo! Bem-vindo ao VôleiHub! 🎉');
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao completar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Complete o Perfil da Marca</h2>
          <p className="text-gray-400">Preencha as informações da sua empresa</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">🏢 Informações da Marca</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nome da Marca/Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Empresa Sports"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Setor de Atuação <span className="text-red-500">*</span>
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
              required
            >
              <option value="">Selecione</option>
              {industryOptions.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Curitiba"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                required
              >
                <option value="">Selecione</option>
                {brazilianStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="(41) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website (opcional)
            </label>
            <input
              type="url"
              placeholder="https://www.suamarca.com.br"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget Anual para Patrocínios (opcional)
            </label>
            <input
              type="number"
              placeholder="Ex: 50000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Valor em R$ (opcional, mas ajuda a encontrar oportunidades)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Interesses em Patrocínio <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((interest) => (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => toggleInterest(interest.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold text-left ${
                    interests.includes(interest.value)
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {interest.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Sobre a Marca <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Conte sobre sua marca, valores, por que quer patrocinar o esporte..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none"
              required
            ></textarea>
          </div>

          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Completar Perfil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}