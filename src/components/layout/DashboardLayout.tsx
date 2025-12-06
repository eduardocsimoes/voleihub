// src/components/layout/DashboardLayout.tsx
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import HeaderAtleta from "../HeaderAtleta";
import Footer from "../Footer";
import { auth } from "../../firebase/config";
import { getUserProfile, AtletaProfile } from "../../firebase/firestore";

interface LayoutProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * Layout padrão do dashboard do atleta:
 * - Sidebar (desktop e mobile)
 * - HeaderAtleta
 * - Footer
 * - Área de conteúdo scrollável
 */
const DashboardLayout: React.FC<LayoutProps> = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const [atletaProfile, setAtletaProfile] = useState<AtletaProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const data = await getUserProfile(user.uid);
      if (data) setAtletaProfile(data);

      setLoadingProfile(false);
    }
    load();
  }, []);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        Carregando perfil...
      </div>
    );
  }

  if (!atletaProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        Não foi possível carregar o perfil do atleta.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:block w-64 border-r border-gray-800 bg-gray-900/40 backdrop-blur-xl">
        <Sidebar
          isOpen={true}
          setIsOpen={() => {}}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* SIDEBAR MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute left-0 top-0 w-64 h-full bg-gray-900 shadow-xl">
            <Sidebar
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
        </div>
      )}

      {/* COLUNA PRINCIPAL */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* HEADER FIXO */}
        <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
          <HeaderAtleta
            atletaProfile={atletaProfile}
            onMenuClick={() => setSidebarOpen(true)}
            onEditProfile={() => {}}
          />
        </div>

        {/* CONTEÚDO + FOOTER */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-1 p-6 lg:p-10 space-y-6">
            {title && (
              <h1 className="text-3xl font-bold mb-4 text-white">{title}</h1>
            )}
            {children}
          </main>

          {/* FOOTER SEMPRE EMBAIXO */}
          <div className="border-t border-gray-800 bg-gray-900/80">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
