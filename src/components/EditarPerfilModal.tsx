import { useState, useEffect, useRef } from 'react';
import { X, User, Calendar, Ruler, Weight, MapPin, Phone, FileText, Camera, Upload } from 'lucide-react';
import { AtletaProfile, updateAtletaProfile } from '../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

interface EditarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  atletaProfile: AtletaProfile;
  onSuccess: () => void;
}

export default function EditarPerfilModal({ 
  isOpen, 
  onClose, 
  atletaProfile,
  onSuccess
}: EditarPerfilModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    birthDate: '',
    height: 0,
    weight: 0,
    city: '',
    state: '',
    phone: '',
    bio: '',
    photoURL: ''
  });

  useEffect(() => {
    if (isOpen && atletaProfile) {
      setFormData({
        name: atletaProfile.name || '',
        position: atletaProfile.position || '',
        birthDate: atletaProfile.birthDate || '',
        height: atletaProfile.height || 0,
        weight: atletaProfile.weight || 0,
        city: atletaProfile.city || '',
        state: atletaProfile.state || '',
        phone: atletaProfile.phone || '',
        bio: atletaProfile.bio || '',
        photoURL: atletaProfile.photoURL || ''
      });
      setPhotoPreview(atletaProfile.photoURL || null);
      setPhotoFile(null);
      setSuccessMessage('');
    }
  }, [isOpen, atletaProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 2) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setPhotoFile(file);
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return formData.photoURL || null;

    try {
      setUploadingPhoto(true);
      
      // Criar referência no Storage
      const storageRef = ref(storage, `profile-photos/${atletaProfile.uid}/${Date.now()}_${photoFile.name}`);
      
      // Upload
      await uploadBytes(storageRef, photoFile);
      
      // Obter URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('Erro ao fazer upload da foto. Tente novamente.');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      // Upload da foto (se houver)
      let photoURL = formData.photoURL;
      if (photoFile) {
        const uploadedURL = await uploadPhoto();
        if (uploadedURL) {
          photoURL = uploadedURL;
        }
      }

      const updatedProfile: Partial<AtletaProfile> = {
        name: formData.name,
        position: formData.position,
        birthDate: formData.birthDate,
        height: Number(formData.height),
        weight: Number(formData.weight),
        city: formData.city,
        state: formData.state,
        phone: formData.phone,
        bio: formData.bio,
        photoURL: photoURL
      };

      await updateAtletaProfile(atletaProfile.uid, updatedProfile);
      setSuccessMessage('✅ Perfil atualizado com sucesso!');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Editar Perfil</h2>
                <p className="text-sm text-gray-400">{atletaProfile.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
          <div className="space-y-6">
            {/* Foto de Perfil */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-500" />
                Foto de Perfil
              </h3>
              
              <div className="flex items-center gap-6">
                {/* Preview da Foto */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-700 bg-gradient-to-br from-orange-500 to-red-600">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                        {formData.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  {photoFile && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Nova
                    </div>
                  )}
                </div>

                {/* Botões de Upload */}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    <Upload size={20} />
                    <span>Escolher Foto</span>
                  </button>
                  
                  <p className="text-gray-400 text-sm mt-2">
                    Formatos: JPG, PNG, GIF (máx. 5MB)
                  </p>
                  
                  {photoFile && (
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {photoFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Informações Pessoais
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Posição
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors [&>option]:bg-gray-800 [&>option]:text-white"
                  >
                    <option value="" className="bg-gray-800 text-white">Selecione</option>
                    <option value="Levantador" className="bg-gray-800 text-white">Levantador</option>
                    <option value="Oposto" className="bg-gray-800 text-white">Oposto</option>
                    <option value="Central" className="bg-gray-800 text-white">Central</option>
                    <option value="Ponteiro" className="bg-gray-800 text-white">Ponteiro</option>
                    <option value="Líbero" className="bg-gray-800 text-white">Líbero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            {/* Características Físicas */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-orange-500" />
                Características Físicas
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleChange}
                    min="140"
                    max="230"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="185"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleChange}
                    min="40"
                    max="150"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="75"
                  />
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Localização
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors uppercase"
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Sobre Você
              </h3>
              
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                placeholder="Conte um pouco sobre você, sua trajetória, objetivos..."
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.bio.length}/500 caracteres
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center font-semibold">
              {successMessage}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 px-6 py-4">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingPhoto}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingPhoto}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/50 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading || uploadingPhoto ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {uploadingPhoto ? 'Enviando foto...' : 'Salvando...'}
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}