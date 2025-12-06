import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardRouter from './pages/DashboardRouter';
import PublicAthleteProfile from "./pages/PerfilPublicoAtleta";
import PerfilPublicoAtletaPDF from "./pages/PerfilPublicoAtletaPDF";
import FeedAtletas from "./pages/FeedAtletas";
import FeedPerfilAtleta from "./pages/FeedPerfilAtleta";
import PerfilPublicoAtleta from "./pages/PerfilPublicoAtleta";
import PhysicalEvolutionMenu from "./pages/evolucao/PhysicalEvolutionMenu";
import AlturaAtleta from "./pages/evolucao/AlturaAtleta";

import {
  SeguidoresAtletaPage,
  SeguindoAtletaPage,
} from "./pages/SeguidoresSeguindoAtleta";
import SeguidoresAtleta from "./pages/SeguidoresAtleta";
import SeguindoAtleta from "./pages/SeguindoAtleta";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardRouter />} />
          
          {/* Rota pública do atleta */}
          <Route path="/perfil/:id" element={<PublicAthleteProfile />} />

          <Route path="/perfil-pdf/:id" element={<PerfilPublicoAtletaPDF />} />

          {/* 🔵 ROTAS DO FEED */}
          <Route path="/feed" element={<FeedAtletas />} />
          <Route path="/feed/perfil/:uid" element={<FeedPerfilAtleta />} />

          {/* Perfil público */}
          <Route path="/perfil/:id" element={<PerfilPublicoAtleta />} />

          {/* Listas de seguidores / seguindo
          <Route path="/perfil/:id/seguidores" element={<SeguidoresAtletaPage />} />
          <Route path="/perfil/:id/seguindo" element={<SeguindoAtletaPage />} />*/}

          {/* <Route path="/perfil/:id/seguidores" element={<SeguidoresAtleta />} />
          <Route path="/perfil/:id/seguindo" element={<SeguindoAtleta />} />

          <Route path="/evolucao" element={<PhysicalEvolutionMenu />} />
          <Route path="/evolucao/altura" element={<AlturaAtleta />} />
          <Route path="/evolucao/salto" element={<div>Em breve</div>} />
          <Route path="/evolucao/alcance" element={<div>Em breve</div>} />
          <Route path="/evolucao/envergadura" element={<EnvergaduraPage />} />
          <Route path="/evolucao/forca" element={<ForcaPage />} /> */}

          {/* Redirecionar qualquer rota desconhecida para home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}