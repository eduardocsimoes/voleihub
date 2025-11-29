import React, { useState } from 'react';
import { LogOut, Bell, Settings, User, Menu, Shield, HelpCircle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { AtletaProfile } from '../firebase/firestore';

interface HeaderAtletaProps {
  atletaProfile: AtletaProfile;
  onMenuClick: () => void;
  onEditProfile: () => void;
}

export default function HeaderAtleta({ atletaProfile, onMenuClick, onEditProfile }: HeaderAtletaProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, type: 'message', text: 'Clube Minas Tênis viu seu perfil', time: '5 min atrás', unread: true },
    { id: 2, type: 'achievement', text: 'Nova conquista desbloqueada!', time: '1 hora atrás', unread: true },
    { id: 3, type: 'update', text: 'Seu perfil foi visualizado 15 vezes', time: '2 horas atrás', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-20 bg-gray-900/95 backdrop-blur-sm border-b border-orange-500/20 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center lg:hidden">
              <span className="text-white font-bold">V</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">VôleiHub</h1>
              <p className="text-gray-400 text-xs hidden sm:block">Dashboard do Atleta</p>
            </div>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Notificações</h3>
                      {unreadCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-gray-700/30' : ''
                        }`}
                      >
                        <p className="text-white text-sm mb-1">{notification.text}</p>
                        <p className="text-gray-400 text-xs">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-700">
                    <button className="w-full text-center text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors">
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
            >
              {atletaProfile.photoURL ? (
                <img 
                  src={atletaProfile.photoURL} 
                  alt={atletaProfile.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                  {atletaProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-white text-sm font-medium hidden sm:block">Menu</span>
            </button>

            {/* Dropdown de Perfil */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-white font-semibold">{atletaProfile.name}</p>
                    <p className="text-gray-400 text-sm">{atletaProfile.email}</p>
                    {atletaProfile.position && (
                      <p className="text-orange-400 text-xs mt-1">{atletaProfile.position}</p>
                    )}
                  </div>
                  <div className="py-2">
                    <button 
                      onClick={onEditProfile}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <User size={18} />
                      <span className="text-sm">Editar Perfil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors">
                      <Settings size={18} />
                      <span className="text-sm">Configurações</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors">
                      <Shield size={18} />
                      <span className="text-sm">Privacidade</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors">
                      <HelpCircle size={18} />
                      <span className="text-sm">Ajuda</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Sair</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}