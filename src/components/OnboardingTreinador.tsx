import { useState } from 'react';
import { X, GraduationCap, MapPin, Phone, CheckCircle, Loader2, Award, Briefcase } from 'lucide-react';
import { updateTreinadorProfile, completeOnboarding } from '../firebase/firestore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

export default function OnboardingTreinador({ isOpen, onClose, userId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [mentorshipPrice, setMentorshipPrice] = useState('');
  const [availability, setAvailability] = useState('');

  if (!isOpen) return null;

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const specialtyOptions = [
    { value: 'tecnica', label: '⚡ Técnica Individual' },
    { value: 'tatica', label: '🧠 Tática de Jogo' },
    { value: 'fisica', label: '💪 Preparação Física' },
    { value: 'psicologia', label: '🎯 Psicologia Esportiva' },
    { value: 'levantamento', label: '🤚 Levantamento' },
    { value: 'defesa', label: '🛡️ Defesa e Recepção' }
  ];

  const toggleSpecialty = (value: string) => {
    if (specialties.includes(value)) {
      setSpecialties(specialties.filter(s => s !== value));
    } else {
      setSpecialties([...specialties, value]);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!city || !state || !phone)) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleComplete = async () => {
    if (!bio || !yearsOfExperience || specialties.length === 0) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await updateTreinadorProfile(userId, {
        city,
        state,
        phone,
        bio,
        yearsOfExperience: Number(yearsOfExperience),
        specialties,
        mentorshipPrice: mentorshipPrice ? Number(mentorshipPrice) : undefined,
        availability: availability || undefined
      });

      await completeOnboarding(userId);
      alert('Perfil completo! Bem-vindo ao VôleiHub! 🎉');
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
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
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Complete seu Perfil</h2>
          <p className="text-gray-400">Passo {step} de 2</p>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {step === 1 && (
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
                  placeholder="Ex: Belo Horizonte"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
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
                placeholder="(31) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Valor da Mentoria/Hora (opcional)
              </label>
              <input
                type="number"
                placeholder="Ex: 150"
                value={mentorshipPrice}
                onChange={(e) => setMentorshipPrice(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Disponibilidade (opcional)
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">Selecione</option>
                <option value="integral">Tempo Integral</option>
                <option value="parcial">Parcial</option>
                <option value="freelancer">Freelancer</option>
                <option value="consultoria">Consultoria</option>
              </select>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
            >
              Próximo
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Experiência e Especialidades</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Anos de Experiência <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 10"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                <Award className="w-4 h-4 inline mr-1" />
                Especialidades <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {specialtyOptions.map((spec) => (
                  <button
                    key={spec.value}
                    type="button"
                    onClick={() => toggleSpecialty(spec.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold text-left ${
                      specialties.includes(spec.value)
                        ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Sobre Você <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Conte sobre sua experiência, metodologia, conquistas como treinador..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                required
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                disabled={loading}
              >
                Voltar
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
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