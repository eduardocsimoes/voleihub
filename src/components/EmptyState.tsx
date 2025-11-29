import React from 'react';
import { CheckCircle2, Circle, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddClube: () => void;
  onAddTitulo: () => void;
  onEditProfile: () => void;
}

export default function EmptyState({ onAddClube, onAddTitulo, onEditProfile }: EmptyStateProps) {
  const checklist = [
    { id: 1, text: 'Complete seu perfil básico', done: true },
    { id: 2, text: 'Adicione foto de perfil', done: false },
    { id: 3, text: 'Cadastre sua primeira experiência', done: false },
    { id: 4, text: 'Adicione suas conquistas', done: false },
    { id: 5, text: 'Preencha suas estatísticas', done: false },
  ];

  const completedTasks = checklist.filter(item => item.done).length;
  const progress = (completedTasks / checklist.length) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🏐</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Bem-vindo ao VôleiHub!
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Estamos felizes em ter você aqui! Complete seu perfil para aumentar suas chances de ser encontrado por clubes e treinadores.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Complete seu Perfil</h3>
            <p className="text-gray-400 text-sm">
              Perfis completos têm 5x mais visualizações
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-500">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-gray-400">Completo</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
            >
              {item.done ? (
                <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-gray-500 flex-shrink-0" />
              )}
              <span className={item.done ? 'text-gray-400 line-through' : 'text-white'}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onEditProfile}
          className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-orange-500/50 transition-all text-left"
        >
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
            <Plus size={24} className="text-orange-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">Editar Perfil</h3>
          <p className="text-gray-400 text-sm">
            Adicione suas informações pessoais, foto e dados básicos
          </p>
        </button>

        <button
          onClick={onAddClube}
          className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all text-left"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
            <Plus size={24} className="text-blue-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">Adicionar Clube</h3>
          <p className="text-gray-400 text-sm">
            Cadastre os clubes por onde passou em sua carreira
          </p>
        </button>

        <button
          onClick={onAddTitulo}
          className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-yellow-500/50 transition-all text-left"
        >
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-colors">
            <Plus size={24} className="text-yellow-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">Adicionar Título</h3>
          <p className="text-gray-400 text-sm">
            Registre suas conquistas e títulos conquistados
          </p>
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
          💡 Dicas para um perfil de sucesso
        </h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Use uma foto profissional e de boa qualidade</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Descreva suas experiências de forma detalhada</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Mantenha suas estatísticas sempre atualizadas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>Adicione todas as suas conquistas e títulos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}