import { useState, useEffect } from 'react';
import { X, User, Calendar, Ruler, Weight, MapPin, FileText } from 'lucide-react';
import type { AtletaProfile } from '../firebase/firestore';

interface EditarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  atletaProfile: AtletaProfile;
  onSave: (updates: Partial<AtletaProfile>) => Promise<void>;
}

export default function EditarPerfilModal({
  isOpen,
  onClose,
  atletaProfile,
  onSave
}: EditarPerfilModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    birthDate: '',
    height: '',
    weight: '',
    position: 'Ponteiro',
    city: '',
    state: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: atletaProfile.name || '',
        bio: atletaProfile.bio || '',
        birthDate: atletaProfile.birthDate || '',
        height: atletaProfile.height?.toString() || '',
        weight: atletaProfile.weight?.toString() || '',
        position: atletaProfile.position || 'Ponteiro',
        city: atletaProfile.city || '',
        state: atletaProfile.state || ''
      });
    }
  }, [isOpen, atletaProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave({
        name: formData.name,
        bio: formData.bio,
        birthDate: formData.birthDate,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        position: formData.position,
        city: formData.city,
        state: formData.state
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl border border-white/10 shadow-2xl shadow-black/50 max-h-[90vh] overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/20 to-red-600/20 border-b border-white/10 p-6">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl"><User className="w-6 h-6" /></div>
              <div>
                <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
                <p className="text-gray-400 text-sm mt-1">Atualize suas informações pessoais</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors" disabled={saving}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><User className="w-4 h-4 text-orange-400" />Nome Completo *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" placeholder="Seu nome completo" />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><FileText className="w-4 h-4 text-blue-400" />Biografia</label>
            <textarea rows={4} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" placeholder="Conte um pouco sobre você, sua trajetória, objetivos..." />
            <p className="text-gray-500 text-xs mt-2">Esta descrição aparecerá no seu perfil público</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><MapPin className="w-4 h-4 text-purple-400" />Posição *</label>
              <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all">
                <option value="Ponteiro" className="bg-gray-800">Ponteiro</option>
                <option value="Oposto" className="bg-gray-800">Oposto</option>
                <option value="Central" className="bg-gray-800">Central</option>
                <option value="Levantador" className="bg-gray-800">Levantador</option>
                <option value="Líbero" className="bg-gray-800">Líbero</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><Calendar className="w-4 h-4 text-green-400" />Data de Nascimento</label>
              <input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><Ruler className="w-4 h-4 text-blue-400" />Altura (cm)</label>
              <input type="number" min="150" max="250" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="180" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><Weight className="w-4 h-4 text-yellow-400" />Peso (kg)</label>
              <input type="number" min="40" max="150" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all" placeholder="75" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><MapPin className="w-4 h-4 text-red-400" />Cidade</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" placeholder="São Paulo" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2"><MapPin className="w-4 h-4 text-pink-400" />Estado</label>
              <input type="text" maxLength={2} value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all uppercase" placeholder="SP" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg hover:shadow-orange-500/50 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Salvando...' : '✓ Salvar Alterações'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}