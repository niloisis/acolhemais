import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api.ts";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const loginSchema = z.object({
  login: z.string().email({ message: "Informe um email válido" }),
  senha: z.string().min(1, { message: "Informe sua senha" }),
  lembrar: z.boolean().optional(),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginApp() {
  const navigate = useNavigate();
  const [viewPassword, setViewPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "all",
  });

  const backgroundCurve = (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="250" cy="-50" rx="410" ry="410" fill="#2F49F3" />
    </svg>
  );

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    try {
      const response = await api.post("/login", {
        login: data.login,
        senha: data.senha,
        lembrar: data.lembrar
      });
      
      const { token, ongId } = response.data;
      
      // Salva Token
      await localStorage.setItem("token", token);
      
      // Lógica de Redirecionamento
      if (ongId) {
          await localStorage.setItem("ongId", ongId);
          toast.success("Bem-vindo de volta!");
          // CORREÇÃO: Redireciona para o Admin Profile
          navigate(`/ong/admin/${ongId}`); 
      } else {
          localStorage.removeItem("ongId");
          toast.success("Login realizado!");
          navigate("/"); // Usuário comum vai para Home
      }
      
    } catch (error: any) {
      console.error("Erro login:", error);
      
      // Tratamento de erro visual
      if (error.response?.status === 401 || error.response?.status === 403) {
          setError("senha", { message: "Email ou senha incorretos" });
          toast.error("Credenciais inválidas");
      } else if (error.code === "ERR_NETWORK") {
          toast.error("Sem conexão com o servidor");
      } else {
          toast.error("Ocorreu um erro inesperado");
      }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col">
      
      <div className="absolute top-0 left-0 w-full h-[45vh] z-0 pointer-events-none">
        {backgroundCurve}
      </div>

      <div className="relative z-10 -mt-12 px-6 pt-8 flex flex-col w-full">
        <div className="relative flex items-center justify-center w-full mb-4">
            <button 
                onClick={() => navigate("/")} 
                className="-mt-0.5 absolute left-0 text-white p-1 -ml-1 hover:bg-blue-700/30 rounded-full transition-colors"
            >
                <FiArrowLeft size={24} />
            </button>

            <img 
              src="/images/logo-white.svg" 
              alt="Logo Acolhe+" 
              className="h-24 mt-0.5 w-auto" 
            />
        </div>
        
        <h2 className="text-white text-3xl font-semibold mb-6 text-center">Bem-vindo!</h2>
        
        <div className="relative w-40 h-40 mx-auto rounded-full bg-transparent flex items-center justify-center mb-4">
           <img 
             src="/images/img-1.png" 
             alt="Ilustração Login" 
             className="w-full h-full object-contain drop-shadow-xl" 
           />
        </div>
      </div>

      <div className="relative z-10 flex-1 px-6 flex flex-col w-full max-w-md mx-auto">
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 bg-transparent">
          
          <div className="flex flex-col gap-1.5">
            <Label className="text-gray-500 ml-1 text-base">Email</Label>
            <Input
              placeholder="seu_email@email.com"
              {...register("login")}
              className="h-12 text-base rounded-[12px] border-gray-300 bg-white shadow-sm focus-visible:ring-blue-600 placeholder:text-gray-400"
            />
            {errors.login && (
              <span className="text-red-500 text-xs ml-1">{errors.login.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-gray-500 ml-1 text-base">Senha</Label>
            <div className="relative">
              <Input
                type={viewPassword ? "text" : "password"}
                placeholder="*******"
                {...register("senha")}
                className="h-12 text-base rounded-[12px] border-gray-300 bg-white shadow-sm focus-visible:ring-blue-600 pr-10 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setViewPassword(!viewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {viewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.senha && (
              <span className="text-red-500 text-xs ml-1">{errors.senha.message}</span>
            )}
          </div>

          <div className="flex justify-between items-center mt-1 mb-2">
             <div className="flex items-center space-x-2">
                <Checkbox id="lembrar" {...register("lembrar")} className="rounded-[4px]" />
                <label
                  htmlFor="lembrar"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500"
                >
                  Lembrar de mim
                </label>
             </div>
             <button type="button" className="text-sm text-gray-400 hover:text-gray-600">
                Esqueci a senha
             </button>
          </div>

          <Button 
            className="mt-2 w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-base shadow-lg shadow-blue-200 mb-10" 
            type="submit"
            disabled={isLoading} 
          >
            {isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Continuar"}
          </Button>
        </form>

        <div className="flex flex-row items-center justify-center mt-auto mb-8 gap-1 text-sm">
            <span className="text-gray-900 font-semibold">Gostaria de se cadastrar?</span>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button className="text-blue-600 font-bold underline hover:text-blue-800">
                   Clique aqui.
                </button>
              </DialogTrigger>
              
              <DialogContent className="fixed left-[50%] top-[50%] z-50 w-[90%] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white border-none p-6 pt-12 shadow-lg gap-4">
                  <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-center text-gray-800 mb-2">
                          Escolha seu perfil
                      </DialogTitle>
                      <DialogDescription className="hidden">Escolha seu tipo de conta</DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex flex-col gap-4 mt-2">
                    <Button 
                        variant="secondary" 
                        className="h-14 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-lg justify-center shadow-sm"
                        onClick={() => navigate("/")}
                    >
                        Sou Beneficiário
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="h-14 border-2 border-gray-100 hover:bg-blue-50 text-gray-700 font-semibold rounded-xl text-lg justify-center shadow-sm"
                        onClick={() => navigate("/ong/register")}
                    >
                        Sou ONG
                    </Button>
                  </div>
              </DialogContent>
            </Dialog>
        </div>

      </div>
    </div>
  );
}