import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import { uploadProfilePhoto, resizeImage } from '../firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

interface UploadFotoPerfilProps {
  userId: string;
  currentPhotoURL?: string;
  onPhotoUpdated: (newPhotoURL: string) => void;
  userType: 'users' | 'atletas' | 'clubes' | 'treinadores' | 'agentes' | 'patrocinadores';
}

export default function UploadFotoPerfil({ 
  userId, 
  currentPhotoURL, 
  onPhotoUpdated,
  userType 
}: UploadFotoPerfilProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou WEBP.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      console.log('📸 Redimensionando imagem...');
      const resizedFile = await resizeImage(selectedFile, 400, 400, 0.9);

      console.log('📤 Fazendo upload...');
      const result = await uploadProfilePhoto(userId, resizedFile);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Erro ao fazer upload');
      }

      console.log('💾 Atualizando Firestore...');
      
      // Atualizar no Firestore (users)
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        photoURL: result.url
      });

      // Atualizar no Firestore (perfil específico)
      const profileRef = doc(db, userType, userId);
      await updateDoc(profileRef, {
        photoURL: result.url
      });

      console.log('✅ Foto atualizada com sucesso!');
      
      // Callback
      onPhotoUpdated(result.url);

      // Limpar preview
      setPreview(null);
      setSelectedFile(null);
      
      alert('✅ Foto atualizada com sucesso!');

    } catch (error: any) {
      console.error('❌ Erro:', error);
      setError(error.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview ou Foto Atual */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-gradient-to-br from-orange-500 to-red-600">
            {preview || currentPhotoURL ? (
              <img
                src={preview || currentPhotoURL}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Botão de Upload (overlay) */}
          {!preview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
            >
              <div className="text-center text-white">
                <Camera className="w-8 h-8 mx-auto mb-1" />
                <span className="text-xs font-semibold">Alterar Foto</span>
              </div>
            </button>
          )}
        </div>

        {/* Input escondido */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Botão visível de upload */}
        {!preview && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Escolher Foto
          </button>
        )}
      </div>

      {/* Preview Controls */}
      {preview && (
        <div className="flex flex-col gap-2">
          <div className="text-center text-sm text-gray-400 mb-2">
            Preview da nova foto
          </div>
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg hover:shadow-orange-500/50 text-white rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Salvar Foto
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Instruções */}
      <div className="text-center text-xs text-gray-500">
        <p>JPG, PNG ou WEBP • Máximo 5MB</p>
        <p>Recomendado: 400x400px</p>
      </div>
    </div>
  );
}