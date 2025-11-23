type Props = {
    isOpen: boolean;
    onClose: () => void;
    mode: "login" | "register";
    switchMode: () => void;
  };
  
  export default function AuthModal({ isOpen, onClose, mode, switchMode }: Props) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
  
          <h2 className="text-3xl font-black text-center mb-6">
            {mode === "login" ? "Entrar na plataforma" : "Criar sua conta"}
          </h2>
  
          <form className="space-y-5">
            {mode === "register" && (
              <input
                type="text"
                placeholder="Nome completo"
                className="w-full border border-gray-200 px-5 py-4 rounded-xl focus:outline-none focus:border-orange-500"
              />
            )}
  
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-200 px-5 py-4 rounded-xl focus:outline-none focus:border-orange-500"
            />
  
            <input
              type="password"
              placeholder="Senha"
              className="w-full border border-gray-200 px-5 py-4 rounded-xl focus:outline-none focus:border-orange-500"
            />
  
            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-500 transition"
            >
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
  
          <div className="text-center mt-6 text-sm text-gray-500">
            {mode === "login" ? (
              <>
                Ainda não tem conta?{" "}
                <button
                  onClick={switchMode}
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Criar agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  onClick={switchMode}
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  