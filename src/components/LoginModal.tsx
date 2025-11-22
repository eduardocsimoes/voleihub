interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-black"
          >
            ✕
          </button>
  
          <h2 className="text-2xl font-bold mb-4 text-center">Entrar</h2>
  
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border rounded-lg"
            />
  
            <input
              type="password"
              placeholder="Senha"
              className="w-full p-3 border rounded-lg"
            />
  
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default LoginModal;
  