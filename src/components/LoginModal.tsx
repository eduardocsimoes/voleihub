import { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, resetPassword } from '../firebase/auth';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
};

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithEmail(email, password);
    
    if (result.success) {
      alert('Login realizado com sucesso!');
      onClose();
      setEmail('');
      setPassword('');
    } else {
      setError(getErrorMessage(result.error));
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    const result = await loginWithGoogle();
    
    if (result.success) {
      alert('Login com Google realizado com sucesso!');
      onClose();
    } else {
      setError(getErrorMessage(result.error));
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } else {
      setError(getErrorMessage(result.error));
    }
    
    setLoading(false);
  };

  const getErrorMessage = (error: string) => {
    if (error.includes('user-not-found')) return 'Usuário não encontrado';
    if (error.includes('wrong-password')) return 'Senha incorreta';
    if (error.includes('invalid-email')) return 'Email inválido';
    if (error.includes('too-many-requests')) return 'Muitas tentativas. Tente novamente mais tarde';
    if (error.includes('invalid-credential')) return 'Email ou senha incorretos';
    if (error.includes('popup-closed-by-user')) return 'Login cancelado';
    return 'Erro ao fazer login. Tente novamente.';
  };

  // Modal de reset de senha
  if (showResetPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowResetPassword(false)}></div>
        <div className="relative bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl animate-fade-in">
          <button onClick={() => setShowResetPassword(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Recuperar Senha</h2>
            <p className="text-gray-400">Digite seu email para receber o link de recuperação</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
              <p className="text-sm text-green-500">✓ Email de recuperação enviado! Verifique sua caixa de entrada.</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" 
                  required 
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => setShowResetPassword(false)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏐</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Bem-vindo de volta!</h2>
          <p className="text-gray-400">Entre para continuar sua jornada</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" 
                required 
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors" 
                required 
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="text-right">
            <button 
              type="button" 
              onClick={() => setShowResetPassword(true)}
              className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-900 text-gray-400">ou</span>
          </div>
        </div>
        
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continuar com Google
        </button>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Não tem uma conta? <button onClick={onSwitchToRegister} className="text-orange-500 font-semibold hover:text-orange-400 transition-colors">Cadastre-se grátis</button>
          </p>
        </div>
      </div>
    </div>
  );
}