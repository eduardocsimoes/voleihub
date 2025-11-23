import { useState } from 'react';
import { X, Building2, MapPin, Phone, Globe, Instagram, CheckCircle, Loader2, Users } from 'lucide-react';
import { updateClubeProfile, completeOnboarding } from '../firebase/firestore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

export default function OnboardingClube({ isOpen, onClose, userId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Dados do Clube
  const [clubName, setClubName] = useState('');
  const [category, setCategory] = useState('');
  const [division, setDivision] = useState('');
  const [foundedYear, setFoundedYear] = useState('');

  // Step 2: Localização e Contato
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // Step 3: Sobre o Clube
  const [description, setDescription] = useState('');
  const [openPositions, setOpenPositions] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);

  if (!isOpen) return null;

  const categories = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'misto', label: 'Misto' }
  ];

  const divisions = [
    { value: 'superliga', label: 'Superliga' },
    { value: 'divisao-especial', label: 'Divisão Especial' },
    { value: 'serie-a', label: 'Série A' },
    { value: 'serie-b', label: 'Série B' },
    { value: 'estadual', label: 'Estadual' },
    { value: 'base', label: 'Base/Formação' }
  ];

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const positionOptions = [
    { value: 'levantador', label: 'Levantador' },
    { value: 'ponteiro', label: 'Ponteiro' },
    { value: 'central', label: 'Central' },
    { value: 'oposto', label: 'Oposto' },
    { value: 'libero', label: 'Líbero' }
  ];

  const facilityOptions = [
    { value: 'quadra-oficial', label: '🏐 Quadra Oficial' },
    { value: 'academia', label: '💪 Academia' },
    { value: 'fisioterapia', label: '🏥 Fisioterapia' },
    { value: 'vestiarios', label: '🚿 Vestiários' },
    { value: 'alojamento', label: '🏠 Alojamento' }
  ];

  const togglePosition = (value: string) => {
    if (openPositions.includes(value)) {
      setOpenPositions(openPositions.filter(p => p !== value));
    } else {
      setOpenPositions([...openPositions, value]);
    }
  };

  const toggleFacility = (value: string) => {
    if (facilities.includes(value)) {
      setFacilities(facilities.filter(f => f !== value));
    } else {
      setFacilities([...facilities, value]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!clubName || !category || !division || !foundedYear) {
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
    if (!description) {
      setError('Por favor, escreva uma descrição do clube');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateClubeProfile(userId, {
        clubName,
        category,
        division,
        foundedYear: Number(foundedYear),
        city,
        state,
        phone,
        website: website || undefined,
        instagram: instagram || undefined,
        description,
        openPositions,
        facilities
      });

      await completeOnboarding(userId);
      alert('Perfil do clube completo! Bem-vindo ao VôleiHub! 🎉');
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Complete o Perfil do Clube</h2>
          <p className="text-gray-400">Passo {step} de 3</p>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">🏐 Dados do Clube</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Nome do Clube <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Vôlei Cidade"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Selecione</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Divisão <span className="text-red-500">*</span>
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Selecione</option>
                  {divisions.map((div) => (
                    <option key={div.value} value={div.value}>{div.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Ano de Fundação <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 1990"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
            >
              Próximo
            </button>
          </div>
        )}

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
                  placeholder="Ex: Rio de Janeiro"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                placeholder="(21) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                placeholder="https://www.seuclube.com.br"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Instagram className="w-4 h-4 inline mr-1" />
                Instagram (opcional)
              </label>
              <input
                type="text"
                placeholder="@seuclube"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">ℹ️ Sobre o Clube</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Descrição do Clube <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Conte sobre a história do clube, conquistas, filosofia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                <Users className="w-4 h-4 inline mr-1" />
                Posições em Aberto (opcional)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {positionOptions.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => togglePosition(pos.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                      openPositions.includes(pos.value)
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Instalações (opcional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {facilityOptions.map((fac) => (
                  <button
                    key={fac.value}
                    type="button"
                    onClick={() => toggleFacility(fac.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${
                      facilities.includes(fac.value)
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {fac.label}
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
                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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