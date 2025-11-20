import './index.css'
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import OngRegister from "@/pages/ong/register/ong-register.tsx";
import OngProfileUpdate from "@/pages/ong/profile/ong-profile-update.tsx";
import LoginApp from "@/pages/login/login.tsx";
import HomePage from "@/pages/home/home.tsx";
import OngProfile from "@/pages/ong/profile/ong-profile.tsx";
import OngAdminProfile from "@/pages/ong/profile/ong-admin-profile.tsx";
import AcoesOng from './pages/acao/acoes_ong/acoes-ong';
import AcaoProfileOng from "@/pages/acao/acoes_ong/acao-profile-ong.tsx";
import DesktopWarning from "@/components/DesktopWarning";

const queryClient = new QueryClient();

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <DesktopWarning/>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/login" element={<LoginApp/>}/>
                    <Route path="/ong/register" element={<OngRegister/>}/>
                    <Route path="/ong/admin/:id" element={<OngAdminProfile/>}/>
                    <Route path="/ong/:id" element={<OngProfile/>}/>
                    <Route path="/ong/admin/:id/config" element={<OngProfileUpdate/>}/>
                    <Route path="/ong/admin/:id/acoes" element={<AcoesOng/>}/>
                    <Route path="/ong/:id/acoes/:acaoId" element={<AcaoProfileOng/>}/>
                    <Route path="/ong/:id/acoes" element={<AcoesOng/>}/>
                </Routes>
            </BrowserRouter>
            <ToastContainer/>
        </QueryClientProvider>
    )
}

export default App
