import { GoArrowLeft } from "react-icons/go";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label.tsx";
import { Coordinates, Map } from "@/components/ui/map/map.tsx";
import { FiCheck, FiSearch, FiEye, FiEyeOff } from "react-icons/fi";
import { useMutation } from "react-query";
import { api } from "@/utils/api.ts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

// --- Lógica de Validação ---
function isValidCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]+/g, "");
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    const calcDV = (cnpj: string, pos: number[]) =>
        cnpj.slice(0, pos.length).split("").reduce((sum, num, i) => sum + parseInt(num, 10) * pos[i], 0);
    const d1 = calcDV(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;
    const d2 = calcDV(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;
    return parseInt(cnpj[12], 10) === (d1 < 2 ? 0 : 11 - d1) && parseInt(cnpj[13], 10) === (d2 < 2 ? 0 : 11 - d2);
}

const ongRegisterSchema = z.object({
    nome: z.string().min(3, "Informe o nome para continuar"),
    data_criacao: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida" }),
    cnpj: z.string().optional().refine((cnpj) => !cnpj || isValidCNPJ(cnpj), { message: "CNPJ inválido" }),
    
    // Campos de Endereço
    cep: z.string().min(8, "CEP obrigatório"),
    logradouro: z.string().min(1, "Rua obrigatória"),
    bairro: z.string().min(1, "Bairro obrigatório"),
    numero: z.string().min(1, "Número obrigatório"),
    complemento: z.string().optional(),
    localizacao: z.array(z.number()).length(2),
    endereco: z.string().optional(),

    publico_alvo: z.array(z.string()).min(1, { message: "Selecione ao menos um." }),
    necessidades: z.array(z.string()).min(1, { message: "Selecione ao menos uma." }),
    login: z.string().email({ message: "Email inválido" }),
    senha: z.string().min(8, { message: "Mínimo 8 caracteres" }),
    confirmar_senha: z.string(),
});

type OngRegisterSchema = z.infer<typeof ongRegisterSchema>;

const publicoAlvoOptions = ["Crianças", "Adolescentes", "Adultos", "Idosos", "Homens", "Mulheres", "LGBTQIA+", "Animais", "População negra", "População Indígena", "Pessoas com Deficiência"];
const necessidadesOptions = ["Assistência Social", "Educação", "Saúde", "Saúde Mental", "Meio Ambiente", "Combate à Pobreza", "Cultura e Arte", "Igualdade de Gênero", "Direitos Humanos", "Justiça Social", "Esporte e Lazer", "Comunidade", "Emergências", "Emprego"];

export default function OngRegister() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [viewPassword, setViewPassword] = useState(false);
    const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
    const [registerFinished, setRegisterFinished] = useState<{ finished: boolean; id: string }>({ finished: false, id: "" });

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        setError,
        trigger,
        control,
        formState: { errors },
    } = useForm<OngRegisterSchema>({
        resolver: zodResolver(ongRegisterSchema),
        mode: "all",
        defaultValues: {
            nome: "",
            data_criacao: "",
            cep: "",
            logradouro: "",
            bairro: "",
            numero: "",
            complemento: "",
            localizacao: [-8.063169, -34.871139],
            endereco: "",
            publico_alvo: [],
            necessidades: [],
            cnpj: "",
            login: "",
            senha: "",
            confirmar_senha: "",
        },
    });

    // --- CORREÇÃO DO ERRO: Hooks useWatch declarados aqui ---
    const cep = useWatch({ control, name: "cep" });
    // Essas duas linhas abaixo estavam faltando ou com erro no seu código
    const publicoAlvo = useWatch({ control, name: "publico_alvo" });
    const necessidades = useWatch({ control, name: "necessidades" });
    const localizacao = useWatch({ control, name: "localizacao" });

    // 1. Busca Endereço pelo CEP
    useEffect(() => {
        const fetchAddress = async () => {
            const cleanCep = cep?.replace(/\D/g, '') || "";
            if (cleanCep.length === 8) {
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                    const data = await res.json();
                    if (!data.erro) {
                        setValue("logradouro", data.logradouro);
                        setValue("bairro", data.bairro);
                        
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`);
                        const geoData = await geoRes.json();
                        if (geoData && geoData.length > 0) {
                            setValue("localizacao", [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
                        }
                    }
                } catch (e) { console.error("Erro CEP", e); }
            }
        };
        fetchAddress();
    }, [cep, setValue]);

    // 2. Atualiza inputs ao mover o mapa
    const handleChangeCoordinates = async (newCoordinates: Coordinates) => {
        setValue("localizacao", [newCoordinates.latitude, newCoordinates.longitude]);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoordinates.latitude}&lon=${newCoordinates.longitude}`);
            const data = await res.json();
            if (data && data.address) {
                setValue("logradouro", data.address.road || "");
                setValue("bairro", data.address.suburb || data.address.neighbourhood || "");
            }
        } catch (e) { console.error(e); }
    };

    const registerOngMutation = useMutation({
        mutationFn: async (data: OngRegisterSchema) => {
            // Monta endereço completo
            let enderecoFinal = "";
            if (data.logradouro && data.numero && data.bairro) {
                enderecoFinal = `${data.logradouro}, ${data.numero} - ${data.bairro}`;
                if (data.complemento && data.complemento.trim() !== "") {
                    enderecoFinal += ` (${data.complemento})`;
                }
            } else {
                enderecoFinal = `CEP: ${data.cep}`;
            }

            const payload = {
                ...data,
                endereco: enderecoFinal
            };

            // console.log("PAYLOAD ENVIADO", payload)
            
            const res = await api.post("/v1/ong", payload);
            return res.data;
        },
        onSuccess: async (data) => {
            try {
                const creds = await api.post("/login", { login: getValues("login"), senha: getValues("senha") });
                localStorage.setItem("token", creds.data.token);
                localStorage.setItem("ongId", data.id);
            } catch (e) { console.log(e); }
            setRegisterFinished({ finished: true, id: data.id });
        },
        onError: (error: any) => {
             setError("root", { message: error.response?.data?.message || "Erro ao cadastrar ONG." });
        }
    });

    const steps = [
        { title: "Qual o nome da sua ONG?", image: "/images/img-4.svg", field: "nome" },
        { title: "Em que ano a ONG foi criada?", image: "/images/img-5.svg", field: "data_criacao" },
        { title: "Por favor, informe o CNPJ da ONG.", image: "/images/img-9.svg", field: "cnpj" },
        { title: "Onde a ONG se localiza?", image: "/images/img-6.svg", field: "localizacao" },
        { title: "Selecione o(s) público(s) alvo.", image: "/images/img-7.svg", field: "publico_alvo" },
        { title: "Selecione a(s) causa(s) da ONG.", image: "/images/img-8.svg", field: "necessidades" },
        { title: "Crie seu acesso.", image: "/images/img-7-var.svg", field: "login" },
    ];

    const handleNextStep = async () => {
        const fieldToValidate = steps[currentStep].field as any;
        let stepIsValid = false;
        
        if (currentStep === 6) {
             stepIsValid = await trigger(["login", "senha", "confirmar_senha"]);
             if(getValues("senha") !== getValues("confirmar_senha")) {
                 setError("confirmar_senha", { message: "Senhas não conferem" });
                 stepIsValid = false;
             }
        } else if (currentStep === 2) {
             stepIsValid = await trigger("cnpj");
        } else if (currentStep === 3) {
             stepIsValid = await trigger(["logradouro", "bairro", "numero"]);
        } else {
             stepIsValid = await trigger(fieldToValidate);
        }

        if (stepIsValid) {
            if (currentStep === steps.length - 1) {
                await handleSubmit((data) => registerOngMutation.mutate(data))();
            } else {
                setCurrentStep((prev) => prev + 1);
            }
        }
    };

    const handlePreviousStep = () => {
        if (currentStep === 0) navigate("/login");
        else setCurrentStep((prev) => prev - 1);
    };

    const toggleSelection = (field: "publico_alvo" | "necessidades", value: string) => {
        const currentValues = getValues(field) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];
        setValue(field, newValues);
        trigger(field);
    };

    const inputClass = "h-12 rounded-[12px] border-gray-200 bg-white text-gray-700 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:border-gray-400 focus-visible:ring-offset-0";

    if (registerFinished.finished) {
        return (
            <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center px-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-md flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-[#9DEEBC] rounded-full flex items-center justify-center mb-6">
                         <FiCheck size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-normal text-gray-900 mb-4">Tudo Pronto!</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Que tal personalizar o perfil da <b>{getValues("nome")}</b> para atingir ainda mais pessoas?
                    </p>
                    <Button 
                        onClick={() => navigate(`/ong/admin/${registerFinished.id}`)}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-base"
                    >
                        Vamos nessa!
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col">
            <div className="w-full px-6 pt-8 pb-4 flex items-center gap-4 bg-gray-50">
                <button onClick={handlePreviousStep} className="p-2 rounded-full hover:bg-gray-200 transition">
                    <GoArrowLeft size={24} className="text-gray-700" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#FFCF33] transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full overflow-y-auto">
                
                <div className="flex flex-col items-center mt-4 mb-6">
                    <h2 className="text-xl font-normal text-center text-gray-900 mb-6 w-full">
                        {steps[currentStep].title}
                    </h2>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                        <div className="absolute inset-0 bg-[#FFCF33] rounded-full opacity-20 scale-90"></div>
                        <img 
                            src={steps[currentStep].image} 
                            alt="Ilustração" 
                            className="relative z-10 h-full object-contain" 
                        />
                    </div>
                </div>

                <div className="w-full flex-1">
                    
                    {currentStep === 0 && (
                        <Input placeholder="Digite o nome da ONG" {...register("nome")} className={inputClass} />
                    )}

                    {currentStep === 1 && (
                        <div className="flex justify-center">
                             <Input type="date" {...register("data_criacao")} className={`${inputClass} w-full text-center justify-center uppercase`} />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <Input placeholder="00.000.000/0000-00" {...register("cnpj")} className={inputClass} />
                    )}

                    {currentStep === 3 && (
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input placeholder="Digite o CEP para buscar" {...register("cep")} className={`${inputClass} pl-10`} />
                            </div>
                            
                            <div className="h-48 w-full rounded-[12px] overflow-hidden border border-gray-200 shadow-sm">
                                <Map cep={cep} coords={localizacao as [number, number]} onCoordinatesChange={handleChangeCoordinates} />
                            </div>
                            
                            <div>
                                <Label className="text-gray-500 font-normal mb-1 ml-1">Rua / Logradouro</Label>
                                <Input {...register("logradouro")} className={inputClass} placeholder="Av. Exemplo" />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label className="text-gray-500 font-normal ml-1">Bairro</Label>
                                    <Input {...register("bairro")} className={inputClass} />
                                </div>
                                <div className="w-24">
                                    <Label className="text-gray-500 font-normal ml-1">Número</Label>
                                    <Input {...register("numero")} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-500 font-normal ml-1">Complemento</Label>
                                <Input {...register("complemento")} className={inputClass} placeholder="Apto 101, Bloco C" />
                            </div>
                            
                            {(errors.cep || errors.logradouro || errors.numero || errors.bairro) && (
                                <p className="text-red-500 text-sm text-center">Preencha todos os campos de endereço</p>
                            )}
                        </div>
                    )}

                    {/* Passo 4: Público (Agora com useWatch funcionando) */}
                    {currentStep === 4 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {publicoAlvoOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => toggleSelection("publico_alvo", option)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        publicoAlvo?.includes(option)
                                            ? "bg-[#FFCF33] text-black shadow-sm scale-105"
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* Passo 5: Causas */}
                    {currentStep === 5 && (
                        <div className="flex flex-wrap gap-2 justify-center pb-4">
                            {necessidadesOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => toggleSelection("necessidades", option)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        necessidades?.includes(option)
                                            ? "bg-[#FFCF33] text-black shadow-sm scale-105"
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <Label className="text-gray-500 font-normal">Email de acesso</Label>
                                <Input {...register("login")} className={`${inputClass} mt-1`} placeholder="exemplo@email.com" />
                                {errors.login && <span className="text-red-500 text-xs">{errors.login.message}</span>}
                            </div>
                            <div className="relative">
                                <Label className="text-gray-500 font-normal">Senha</Label>
                                <Input 
                                    type={viewPassword ? "text" : "password"} 
                                    {...register("senha")} 
                                    className={`${inputClass} mt-1 pr-10`} 
                                    placeholder="********"
                                />
                                <button onClick={() => setViewPassword(!viewPassword)} className="absolute right-3 top-1/2 translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {viewPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                                {errors.senha && <span className="text-red-500 text-xs">{errors.senha.message}</span>}
                            </div>
                            <div className="relative">
                                <Label className="text-gray-500 font-normal">Confirmar Senha</Label>
                                <Input 
                                    type={viewConfirmPassword ? "text" : "password"} 
                                    {...register("confirmar_senha")} 
                                    className={`${inputClass} mt-1 pr-10`}
                                    placeholder="********" 
                                />
                                <button onClick={() => setViewConfirmPassword(!viewConfirmPassword)} className="absolute right-3 top-1/2 translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {viewConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                                {errors.confirmar_senha && <span className="text-red-500 text-xs">{errors.confirmar_senha.message}</span>}
                            </div>
                            {errors.root && <p className="text-red-500 text-center text-sm mt-2">{errors.root.message}</p>}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 pb-10 bg-gray-50 w-full max-w-md mx-auto">
                <Button
                    onClick={handleNextStep}
                    disabled={registerOngMutation.isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-base shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    {registerOngMutation.isLoading ? (
                        <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : currentStep === steps.length - 1 ? (
                        "Finalizar Cadastro"
                    ) : (
                        "Continuar"
                    )}
                </Button>
            </div>
        </div>
    );
}