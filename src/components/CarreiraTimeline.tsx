import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CareerExperience, Achievement } from '../firebase/firestore';
import TimelineCarreira from './TimelineCarreira';
import AdicionarCarreira from './AdicionarCarreira';
import AdicionarConquistaPadronizada from '../pages/cards/components/AdicionarConquistaPadronizada';

import { 
  addExperience, 
  updateExperience, 
  deleteExperience,
  addAchievement,
  updateAchievement,
  deleteAchievement
} from '../firebase/firestore';

interface CarreiraTimelineProps {
  experiences: CareerExperience[];
  achievements: Achievement[];
  userId: string;
  onUpdate: () => void;
}

type ModalType = 'experience' | 'achievement' | null;

export default function CarreiraTimeline({ 
  experiences, 
  achievements, 
  userId,
  onUpdate 
}: CarreiraTimelineProps) {

  const [modalAberto, setModalAberto] = useState<ModalType>(null);
  const [editData, setEditData] = useState<CareerExperience | Achievement | null>(null);

  /* ===============================
     EXPERIENCE (CLUBES)
  =============================== */

  const handleSaveExperience = async (experience: CareerExperience) => {
    try {
      if (editData && 'clubName' in editData) {
        await updateExperience(userId, editData as CareerExperience, experience);
      } else {
        await addExperience(userId, experience);
      }
      onUpdate();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar experiência:', error);
    }
  };

  const handleEditExperience = (experience: CareerExperience) => {
    setEditData(experience);
    setModalAberto('experience');
  };

  const handleDeleteExperience = async (id: string) => {
    const experience = experiences.find(exp => exp.id === id);
    if (!experience) return;

    try {
      await deleteExperience(userId, experience);
      onUpdate();
    } catch (error) {
      console.error('Erro ao deletar experiência:', error);
    }
  };

  /* ===============================
     ACHIEVEMENTS (TÍTULOS)
  =============================== */

  const handleSaveAchievement = async (achievement: Achievement) => {
    try {
      if (editData && 'championship' in editData) {
        await updateAchievement(userId, editData as Achievement, achievement);
      } else {
        await addAchievement(userId, achievement);
      }
      onUpdate();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar conquista:', error);
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditData(achievement);
    setModalAberto('achievement');
  };

  const handleDeleteAchievement = async (id: string) => {
    const achievement = achievements.find(ach => ach.id === id);
    if (!achievement) return;

    try {
      await deleteAchievement(userId, achievement);
      onUpdate();
    } catch (error) {
      console.error('Erro ao deletar conquista:', error);
    }
  };

  /* ===============================
     CONTROLE MODAL
  =============================== */

  const handleCloseModal = () => {
    setModalAberto(null);
    setEditData(null);
  };

  const totalClubes = experiences?.length || 0;
  const totalTitulos = achievements?.length || 0;

  /* ===============================
     RENDER
  =============================== */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-gray-800/90 via-gray-800/80 to-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📖 Trajetória Profissional
            </h1>
            <p className="text-gray-400">
              A história da sua carreira no vôlei
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-blue-500/20 rounded-xl px-6 py-3 border border-blue-500/30">
              <div className="text-2xl font-bold text-white">{totalClubes}</div>
              <div className="text-blue-200 text-sm">Clubes</div>
            </div>
            <div className="bg-yellow-500/20 rounded-xl px-6 py-3 border border-yellow-500/30">
              <div className="text-2xl font-bold text-white">{totalTitulos}</div>
              <div className="text-yellow-200 text-sm">Títulos</div>
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditData(null);
              setModalAberto('experience');
            }}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all"
          >
            <Plus size={20} />
            Adicionar Clube
          </button>

          <button
            onClick={() => {
              setEditData(null);
              setModalAberto('achievement');
            }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all"
          >
            <Plus size={20} />
            Adicionar Título
          </button>
        </div>
      </div>

      {/* TIMELINE */}
      <TimelineCarreira
        experiences={experiences}
        achievements={achievements}
        onUpdate={() => onUpdate()}
        editMode={true}
        onAddExperience={() => {
          setEditData(null);
          setModalAberto('experience');
        }}
        onAddAchievement={() => {
          setEditData(null);
          setModalAberto('achievement');
        }}
        onEditExperience={handleEditExperience}
        onDeleteExperience={handleDeleteExperience}
        onEditAchievement={handleEditAchievement}
        onDeleteAchievement={handleDeleteAchievement}
      />

      {/* ===============================
         MODAIS
      =============================== */}

      {/* EXPERIÊNCIA */}
      {modalAberto === 'experience' && (
        <AdicionarCarreira
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveExperience}
          type="experience"
          editData={editData as CareerExperience | null}
          registeredClubs={experiences.map(e => e.clubName)}
        />
      )}

      {/* CRIAR TÍTULO (PADRONIZADO) */}
      {modalAberto === 'achievement' && !editData && (
        <AdicionarConquistaPadronizada
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveAchievement}
          registeredClubs={experiences.map(e => e.clubName)}
        />
      )}


      {/* EDITAR TÍTULO (LEGADO) */}
      {/*{modalAberto === 'achievement' && editData && (
        <AdicionarCarreira
          isOpen={true}
          onClose={handleCloseModal}
          onSave={handleSaveAchievement}
          type="achievement"
          editData={editData as Achievement}
          registeredClubs={experiences.map(e => e.clubName)}
        />
      )}*/}

    </div>
  );
}
