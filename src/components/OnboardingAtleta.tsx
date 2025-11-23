import { useState } from 'react';
import { X, User, MapPin, Phone, Calendar, Ruler, Weight, Target, CheckCircle, Loader2 } from 'lucide-react';
import { updateAtletaProfile, completeOnboarding } from '../firebase/firestore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

export default function OnboardingAtleta({ isOpen, onClose, userId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Dados Básicos
  const [position, setPosition] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Step 2: Localização e Contato
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3: Sobre Você
  const [bio, setBio] = useState('');
  const [seeking, setSeeking] = useState<('clube' | 'patrocinio' | 'treinador')[]>([]);

  if (!isOpen) return null;

  const positions = [
    { value: 'levantador', label: 'Levantador' },
    { value: 'ponteiro', label: 'Ponteiro' },
    { value: 'central', label: 'Central' },
    { value: 'oposto', label: 'Oposto' },
    { value: 'libero', label: 'Líbero' }
  ];

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const seekingOptions = [
    { value: 'clube' as const, label: 'Clube', icon: '🏐' },
    { value: 'patrocinio' as const, label: 'Patrocínio', icon: '💰' },
    { value: 'treinador' as const, label: 'Treinador', icon: '👨‍🏫' }
  ];

  const toggleSeeking = (value: 'clube' | 'patrocinio' | 'treinador') => {
    if (seeking.includes(value)) {
      setSeeking(seeking.filter(s => s !== value));
    } else {
      setSeeking([...seeking, value]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!position || !height || !weight || !birthDate) {
        setError('Por favor, preencha todos os campos obrigatórios');
        return;
      }
    }
    
    if (step === 2) {
      if (!city || !state || !phone) {
        setError('Por favor, preencha todos os campos obrigatórios');
        return;
      }
    }

    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!bio || seeking.length === 0) {
      setError('Por favor, escreva uma bio e selecione pelo menos um objetivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Atualizar perfil do atleta
      await updateAtletaProfile(userId, {
        position,
        height: Number(height),
        weight: Number(weight),
        birthDate,
        city,
        state,
        phone,
        bio,
        seeking
      });

      // Marcar onboarding como completo
      await completeOnboarding(userId);

      alert('Perfil completo! Bem-vindo ao VôleiHub! 🎉');
      onClose();
      window.location.reload(); // Recarregar para atualizar estado
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Complete seu Perfil</h2>
          <p className="text-gray-400">Passo {step} de 3</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Step 1: Dados Básicos */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">📊 Dados Básicos</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Posição <span className="text-red-500">*</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                required
              >
                <option value="">Selecione sua posição</option>
                {positions.map((pos) => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Altura (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Ex: 185"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  min="150"
                  max="220"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <Weight className="w-4 h-4 inline mr-1" />
                  Peso (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Ex: 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                  required
                  min="40"
                  max="150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data de Nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
            >
              Próximo
            </button>
          </div>
        )}

        {/* Step 2: Localização */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">📍 Localização e Contato</h3>
            
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                Voltar
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bio e Objetivos */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">✨ Sobre Você</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Bio / Apresentação <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Conte um pouco sobre você, sua trajetória no vôlei, conquistas..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">{bio.length}/500 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                <Target className="w-4 h-4 inline mr-1" />
                O que você está procurando? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {seekingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSeeking(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                      seeking.includes(option.value)
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`text-sm font-semibold ${
                      seeking.includes(option.value) ? 'text-orange-500' : 'text-gray-400'
                    }`}>
                      {option.label}
                    </span>
                    {seeking.includes(option.value) && (
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                disabled={loading}
              >
                Voltar
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
        )}
      </div>
    </div>
  );
}