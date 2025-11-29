import React from 'react';
import { 
  Home, 
  User, 
  BarChart3, 
  Trophy, 
  Image, 
  FileText, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Visão Geral', icon: Home },
  { id: 'trajetoria', label: 'Trajetória', icon: Calendar },
  { id: 'profile', label: 'Perfil Completo', icon: User },
  { id: 'statistics', label: 'Estatísticas', icon: BarChart3 },
  { id: 'achievements', label: 'Conquistas', icon: Trophy },
  { id: 'gallery', label: 'Galeria', icon: Image },
  { id: 'documents', label: 'Documentos', icon: FileText },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare, badge: 3 },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen, activeSection, setActiveSection }: SidebarProps) {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-sm border-r border-orange-500/20
          transition-all duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? 'w-64' : 'lg:w-20'}
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-6 bg-orange-500 text-white p-1 rounded-full shadow-lg hover:bg-orange-600 transition-colors hidden lg:block"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            {isOpen && (
              <div>
                <h2 className="text-white font-bold text-lg">VôleiHub</h2>
                <p className="text-gray-400 text-xs">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip para sidebar fechada */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info (bottom) */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-500/20">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">Atleta</p>
                <p className="text-gray-400 text-xs truncate">Online</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}