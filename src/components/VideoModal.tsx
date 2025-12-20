import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ open, onClose, videoUrl }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl p-4 relative border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
}
