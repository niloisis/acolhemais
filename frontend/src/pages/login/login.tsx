import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label.tsx";
import {FiEye, FiEyeOff} from "react-icons/fi";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {api} from "@/utils/api.ts";

const loginSchema = z.object({
    login: z.string().email({message: "Informe seu login"}),
    senha: z.string(),
});
type LoginSchema = z.infer<typeof loginSchema>;
export default function LoginApp() {
    const {
        register,
        handleSubmit,
        setError,
        formState: {errors},
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        mode: "all",
    })

    const navigate = useNavigate();
    const circle = {
        svg: (
            <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="250" cy="-50" rx="410" ry="410" fill="#2F49F3"/>
            </svg>
        ),
    };

    const [viewPassword, setViewPassword] = useState(false);
    type Credentials = {
        token: string;
        ongId: string;
    }

    const onSubmit = async (data: LoginSchema) => {
        try {
            const {data: credentials}: Credentials = await api.post("/login", data);
            await localStorage.setItem("token", credentials.token);
            await localStorage.setItem("ongId", credentials.ongId);
            navigate("/")
        } catch (error) {
            setError("senha", {message: `Credenciais inválidas`});
        }
    };

    return (
        <div className="h-screen px-6 overflow-scroll">
            <div className="fixed -top-[5vh] left-0 w-full h-[440px] z-[-1] pointer-events-none">
                {circle.svg}
            </div>
            <div className={"flex w-full justify-center items-center mt-4"}>
                <img className="h-16 w-16" src="/images/logo-white.svg" alt={"Logo acolhe+"}/>
            </div>
            <div className="flex flex-col items-center w-full mt-3 mb-8 gap-4">
                <h1 className="text-[#FAFAFA] text-3xl text-center mb-4 font-semibold">Bem-vindo!</h1>
                <img src="/images/img-1.png" alt="" className={"h-[17vh]"}/>
            </div>
            <Button className="w-full mb-4 bg-[#FFCF33] text-black" type="submit" onClick={() => navigate("/")}>
                Não sou ONG
            </Button>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <Label>Email</Label>
                    <Input
                        {...register("login")}
                    />
                    {errors.login && (
                        <span className="text-red-500 text-sm">{errors.login.message}</span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <Label>Senha</Label>
                    <div className="relative">
                        <Input
                            type={viewPassword ? "text" : "password"}
                            {...register("senha", {required: "Informe sua senha"})}
                        />
                        {viewPassword ? (
                            <FiEyeOff
                                onClick={() => setViewPassword(false)}
                                className="text-[#AFB1B6] absolute right-4 bottom-1/4 w-7 h-6 cursor-pointer"
                            />
                        ) : (
                            <FiEye
                                onClick={() => setViewPassword(true)}
                                className="text-[#AFB1B6] absolute right-4 bottom-1/4 w-7 h-6 cursor-pointer"
                            />
                        )}
                    </div>
                    {errors.senha && (
                        <span className="text-red-500 text-sm">{errors.senha.message}</span>
                    )}
                </div>

                <Button className="mt-4" type="submit">
                    Entrar
                </Button>
            </form>

            <div className="flex flex-row items-center justify-center mt-12 gap-2">
                <p>Sua ONG não tem conta?</p>
                <button className="text-blue-500 underline" onClick={() => navigate("/ong/register")}>Clique aqui.
                </button>
            </div>

        </div>
    );
}
