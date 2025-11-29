import { useState } from 'react';
import { X } from 'lucide-react';
import { register } from '../firebase/auth';
import { ProfileType } from '../firebase/firestore';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
};

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: Props) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const profileOptions = [
    { type: 'atleta' as ProfileType, label: 'Atleta', icon: '🏐', description: 'Jogador de vôlei' },
    { type: 'clube' as ProfileType, label: 'Clube', icon: '🏛️', description: 'Time ou associação' },
    { type: 'treinador' as ProfileType, label: 'Treinador', icon: '👨‍🏫', description: 'Técnico ou professor' },
    { type: 'agente' as ProfileType, label: 'Agente', icon: '💼', description: 'Empresário esportivo' },
    { type: 'patrocinador' as ProfileType, label: 'Patrocinador', icon: '💰', description: 'Empresa ou investidor' }
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfile) {
      setError('Selecione um tipo de perfil');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(email, password, name, selectedProfile);
      alert('Cadastro realizado com sucesso! Complete seu perfil.');
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-2">Criar Conta</h2>
          <p className="text-gray-400">Escolha seu tipo de perfil e cadastre-se</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Seleção de Perfil */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Tipo de Perfil <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profileOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setSelectedProfile(option.type)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedProfile === option.type
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span className={`text-sm font-bold ${
                    selectedProfile === option.type ? 'text-orange-500' : 'text-white'
                  }`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-400">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Seu nome completo"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="seu@email.com"
              required
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Confirmar Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Digite a senha novamente"
              required
              minLength={6}
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || !selectedProfile}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          {/* Link para Login */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-orange-500 font-semibold hover:text-orange-400 transition-colors"
              >
                Fazer login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}