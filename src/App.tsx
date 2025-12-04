import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardRouter from './pages/DashboardRouter';
import PublicAthleteProfile from "./pages/PublicProfile";
import PerfilPublicoAtletaPDF from "./pages/PerfilPublicoAtletaPDF";

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

          {/* Redirecionar qualquer rota desconhecida para home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}