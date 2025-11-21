import { useNavigate } from "react-router-dom";
import { TbLogout2, TbLogin2 } from "react-icons/tb"; 
import { CgProfile } from "react-icons/cg";
import { Button } from "@/components/ui/button";

export default function Header() {
  const navigate = useNavigate();
  const ongId = localStorage.getItem("ongId");
  const isLoggedIn = !!ongId;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ongId");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="w-full h-16 bg-blue-600 flex justify-center items-center shadow-md">
      <div className="flex justify-between items-center w-full max-w-3xl px-4">

        {/* ESQUERDA */}
        {isLoggedIn ? (
          <Button
            variant="ghost"
            onClick={handleLogout}
            // ADICIONEI: [&_svg]:size-10
            // Isso força o ícone a ter 40px (size-10) e ignora o padrão do shadcn
            className="w-12 h-12 rounded-full text-white hover:bg-blue-700 flex items-center justify-center [&_svg]:size-7"
          >
            <TbLogout2 />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogin}
            // ADICIONEI: [&_svg]:size-10 e ajustei w-12 h-12 para ficar igual ao logout
            className="w-12 h-12 rounded-full text-white hover:bg-blue-700 flex items-center justify-center [&_svg]:size-7"
          >
            <TbLogin2 />
          </Button>
        )}

        {/* LOGO CENTRAL */}
        <img
          src="/images/logo-white.svg"
          alt="Logo Acolhe+"
          className="h-24 mt-1 w-auto"
        />

        {/* DIREITA */}
        {isLoggedIn ? (
          <Button
            variant="ghost"
            onClick={() => navigate(`/ong/admin/${ongId}`)}
            // ADICIONEI: [&_svg]:size-10
            className="w-12 h-12 rounded-full text-white hover:bg-blue-700 flex items-center justify-center [&_svg]:size-7"
          >
            <CgProfile />
          </Button>
        ) : (
          <div className="w-12" />
        )}

      </div>
    </header>
  );
}