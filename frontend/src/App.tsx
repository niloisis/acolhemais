import './index.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Componentes Gerais
import DesktopWarning from "@/components/DesktopWarning";
import LoginApp from "@/pages/login/login.tsx";
import HomePage from "@/pages/home/home.tsx";

// ONG - Cadastro e Perfil
import OngRegister from "@/pages/ong/register/ong-register.tsx";
import OngProfile from "@/pages/ong/profile/ong-profile.tsx";          // Visão Pública
import OngAdminProfile from "@/pages/ong/profile/ong-admin-profile.tsx"; // Visão Admin
import OngProfileUpdate from "@/pages/ong/profile/ong-profile-update.tsx";

// Ações
import AcoesOng from './pages/acao/acoes_ong/acoes-ong';              // Lista de Ações
import AcaoProfileOng from "@/pages/acao/acoes_ong/acao-profile-ong.tsx"; // Detalhe da Ação

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DesktopWarning />
        <Routes>
          {/* --- HOME & LOGIN --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginApp />} />

          {/* --- ONG: CADASTRO --- */}
          <Route path="/ong/register" element={<OngRegister />} />

          {/* --- ONG: ADMINISTRAÇÃO (Logado) --- */}
          <Route path="/ong/admin/:id" element={<OngAdminProfile />} />
          <Route path="/ong/admin/:id/config" element={<OngProfileUpdate />} />
          <Route path="/ong/admin/:id/acoes" element={<AcoesOng />} />

          {/* --- ONG: VISÃO PÚBLICA (Visitante) --- */}
          <Route path="/ong/:id" element={<OngProfile />} />
          
          {/* --- AÇÕES --- */}
          {/* Rota da Lista de Ações */}
          <Route path="/ong/:id/acoes" element={<AcoesOng />} />
          
          {/* Rota de Detalhe da Ação (Essa é a que exibe o AcaoProfileOng) */}
          <Route path="/ong/:id/acoes/:acaoId" element={<AcaoProfileOng />} />

        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  )
}

export default App