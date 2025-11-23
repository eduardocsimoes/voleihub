interface Props {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export default function LoginModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md relative text-black">
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">
            ✕
          </button>
  
          <h2 className="text-2xl font-bold mb-6 text-center">
            Entrar
          </h2>
  
          <input className="w-full p-3 border mb-3 rounded-lg" placeholder="Email" />
          <input className="w-full p-3 border mb-5 rounded-lg" placeholder="Senha" type="password" />
  
          <button className="w-full bg-sky-500 text-black font-bold py-3 rounded-lg">
            Entrar
          </button>
        </div>
      </div>
    );
  }
  