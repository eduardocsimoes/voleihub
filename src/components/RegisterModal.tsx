import { X, Mail, Lock, User, Users, Building2, GraduationCap, Briefcase, Award } from 'lucide-react';
import { useState } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [selectedProfile, setSelectedProfile] = useState('');

  if (!isOpen) return null;

  const profiles = [
    { id: 'atleta', name: 'Atleta', icon: Users },
    { id: 'clube', name: 'Clube', icon: Building2 },
    { id: 'treinador', name: 'Treinador', icon: GraduationCap },
    { id: 'agente', name: 'Agente', icon: Briefcase },
    { id: 'patrocinador', name: 'Patrocinador', icon: Award }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) {
      alert('Por favor, selecione um tipo de perfil');
      return;
    }
    // Aqui você implementará a lógica de registro
    alert(`Registro como ${selectedProfile} em desenvolvimento!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏐</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Crie sua conta</h2>
          <p className="text-gray-400">Comece sua jornada no VôleiHub</p>
        </div>

        {/* Profile Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-4 text-center">
            Qual é o seu perfil?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {profiles.map((profile) => {
              const Icon = profile.icon;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setSelectedProfile(profile.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                    selectedProfile === profile.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${
                    selectedProfile === profile.id ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-xs font-semibold ${
                    selectedProfile === profile.id ? 'text-orange-500' : 'text-gray-400'
                  }`}>
                    {profile.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nome completo
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Seu nome"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                required
                minLength={8}
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-orange-500"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              Aceito os{' '}
              <a href="#" className="text-orange-500 hover:text-orange-400">
                Termos de Uso
              </a>{' '}
              e a{' '}
              <a href="#" className="text-orange-500 hover:text-orange-400">
                Política de Privacidade
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
          >
            Criar Conta Grátis
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-900 text-gray-400">ou</span>
          </div>
        </div>

        {/* Social Register */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>
        </div>

        {/* Switch to Login */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-orange-500 font-semibold hover:text-orange-400 transition-colors"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}