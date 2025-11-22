interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  const RegisterModal = ({ isOpen, onClose }: RegisterModalProps) => {
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
  
          <h2 className="text-2xl font-bold mb-4 text-center">
            Criar Conta
          </h2>
  
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Nome completo"
              className="w-full p-3 border rounded-lg"
            />
  
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
  
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
              Criar conta
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default RegisterModal;
  