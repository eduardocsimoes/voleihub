import { useState } from 'react';
import { X, Briefcase, MapPin, Phone, Globe, CheckCircle, Loader2 } from 'lucide-react';
import { updateAgenteProfile, completeOnboarding } from '../firebase/firestore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

export default function OnboardingAgente({ isOpen, onClose, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [specialization, setSpecialization] = useState('');

  if (!isOpen) return null;

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const specializationOptions = [
    { value: 'transferencias', label: 'Transferências Nacionais' },
    { value: 'internacional', label: 'Mercado Internacional' },
    { value: 'patrocinio', label: 'Patrocínios e Marketing' },
    { value: 'carreira', label: 'Gestão de Carreira' },
    { value: 'contratos', label: 'Negociação de Contratos' }
  ];

  const handleComplete = async () => {
    if (!city || !state || !phone || !bio || !yearsOfExperience || !specialization) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateAgenteProfile(userId, {
        city,
        state,
        phone,
        website: website || undefined,
        bio,
        yearsOfExperience: Number(yearsOfExperience),
        specialization
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
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Complete seu Perfil</h2>
          <p className="text-gray-400">Preencha suas informações profissionais</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white mb-4">💼 Informações Profissionais</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: São Paulo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
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
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
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
              placeholder="https://www.seusite.com.br"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Anos de Experiência <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Ex: 8"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              required
              min="0"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Área de Especialização <span className="text-red-500">*</span>
            </label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
              required
            >
              <option value="">Selecione sua especialização</option>
              {specializationOptions.map((spec) => (
                <option key={spec.value} value={spec.value}>{spec.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Sobre Você <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Conte sobre sua experiência, principais negociações, filosofia de trabalho..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
              required
            ></textarea>
          </div>

          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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