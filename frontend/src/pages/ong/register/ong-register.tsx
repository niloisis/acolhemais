import {GoArrowLeft} from "react-icons/go";
import {z} from "zod";
import {Progress} from "@/components/ui/progress";
import {Button} from "@/components/ui/button";
import {useState} from "react";

import "leaflet/dist/leaflet.css";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm, useWatch} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label.tsx";
import {RiArrowDownSLine, RiArrowUpSLine} from "react-icons/ri";
import {Coordinates, Map} from "@/components/ui/map/map.tsx"
import {FiEye, FiEyeOff} from "react-icons/fi";
import {useMutation} from "react-query";
import {api} from "@/utils/api.ts";
import {AiOutlineLoading3Quarters} from "react-icons/ai";
import {Ong} from "@/pages/ong/@types/Ong.ts";
import {useNavigate} from "react-router-dom";
import {AxiosResponse} from "axios";


function isValidCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/[^\d]+/g, "");
    if (cnpj.length !== 14) return false;

    if (/^(\d)\1+$/.test(cnpj)) return false;

    const calcDV = (cnpj: string, pos: number[]) =>
        cnpj
            .slice(0, pos.length)
            .split("")
            .reduce((sum, num, i) => sum + parseInt(num, 10) * pos[i], 0);

    const d1 = calcDV(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;
    const d2 = calcDV(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) % 11;

    return (
        parseInt(cnpj[12], 10) === (d1 < 2 ? 0 : 11 - d1) &&
        parseInt(cnpj[13], 10) === (d2 < 2 ? 0 : 11 - d2)
    );
}

const ongRegisterSchema = z.object({
    nome: z.string().min(3, "Informe o nome para continuar"),
    data_criacao: z.number().min(1900, "Ano inválido").max(new Date().getFullYear(), "Ano inválido"),
    cnpj: z
        .string()
        .optional()
        .refine((cnpj) => !cnpj || isValidCNPJ(cnpj), {message: "CNPJ inválido"}),
    cep: z.string()
        .optional()
        .refine((cep) => !cep || /^\d{8}$|^\d{5}-\d{3}$/.test(cep), {
            message: "CEP inválido",
        }),
    localizacao: z
        .array(z.number())
        .length(2, {message: "Localização deve conter latitude e longitude."})
        .refine(
            ([latitude, longitude]) =>
                latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180,
            {message: "Latitude ou longitude inválida."}
        ),
    publico_alvo: z.array(z.string())
        .min(1, {message: "Selecione ao menos um público."}),
    necessidades: z.array(z.string())
        .min(1, {message: "Selecione ao menos um público."}),
    login: z.string().email({message: "Este email não é valido"}),
    senha: z.string().min(8, {message: "No mínimo 8 caracteres."}),
    confirmar_senha: z.string(),
})

type OngRegisterSchema = z.infer<typeof ongRegisterSchema>

const publicoAlvoOptions = [
    "Crianças",
    "Adolescentes",
    "Adultos",
    "Idosos",
    "Homens",
    "Mulheres",
    "População negra",
    "População Indígena",
    "LGBTQIA+",
    "Pessoas com Deficiência",
];

const necessidadesOptions = [
    "Assistência Social",
    "Educação",
    "Saúde",
    "Saúde Mental",
    "Meio Ambiente",
    "Combate à Pobreza e Fome",
    "Cultura e Arte",
    "Igualdade de Gênero",
    "Direitos Humanos",
    "Justiça Social",
    "Esporte e Lazer",
    "Animais",
    "Desenvolvimento Comunitário",
    "Desastres e emergências",
    "Emprego",
];
export default function OngRegister() {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        setError,
        trigger,
        formState: {errors, isValid},
        control
    } = useForm<OngRegisterSchema>({
        resolver: zodResolver(ongRegisterSchema),
        mode: "all",
        defaultValues: {
            nome: "",
            data_criacao: 2024,
            cep: "",
            localizacao: [-8.063169, -34.871139],
            publico_alvo: [publicoAlvoOptions[0]],
            necessidades: [necessidadesOptions[1]],
            cnpj: "",
            login: "ong@ong.com.br",
            senha: "12345678",
            confirmar_senha: "12345678"
        }
    })
    const steps: any[] = [
        {
            image: "/images/img-4.svg",
            title: "Qual o nome da sua ONG?"
        },
        {
            image: "/images/img-5.svg",
            title: "Em que ano a ONG foi criada?"
        },
        {
            image: "/images/img-9.svg",
            title: "Por favor, informe o CNPJ da ONG, caso ela tenha um."
        },
        {
            image: "/images/img-6.svg",
            title: "Onde a ONG se localiza?"
        },
        {
            title: "Selecione o(s) público(s) alvo da sua ONG.",
            image: "/images/img-7.svg",
        },
        {
            title: "Selecione a(s) causa(s) que sua ONG atende.",
            image: "/images/img-8.svg",
        },
        {
            title: "Quase lá! Informe um email e senha para acessar a conta.",
            image: "/images/img-7-var.svg",
        },
    ];

    const totalSteps = 7;
    const [currentStep, setCurrentStep] = useState(0);
    const [registerFinished, setRegisterFinished] = useState<{ finished: boolean, id: string }>({
        finished: false,
        id: ""
    });
    const registerOngMutation = useMutation({
        mutationKey: "register",
        mutationFn: async (ongRegister: OngRegisterSchema): Ong => {
            try {
                const {data} = await api.post<AxiosResponse<Ong>>("/v1/ong", ongRegister);
                return data
            } catch (error) {
                console.error(error);
                throw new Error("Algo falhou na sua solicitação.");
            }

        },
        onSuccess: async (data) => {
            try {
                const {data: credentials} = await api.post("/login", {
                    login: getValues("login"),
                    senha: getValues("senha")
                });
                localStorage.setItem("token", credentials.token);
            } catch (e) {
                console.log(e)
            }
            localStorage.setItem("ongId", data.id);
            setRegisterFinished({finished: true, id: data.id})
        },
    })

    const onSubmit = async (data: OngRegisterSchema) => {
        if (!handleConfirmPassword()) {
            setError("confirmar_senha", {
                message: "As senhas não coincidem"
            })
            return
        }

        try {
            await registerOngMutation.mutateAsync(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNextStep = async () => {
        if (currentStep === 3 && (getValues("localizacao")[0] === 0 || getValues("localizacao")[1] === 0)) {
            setError("cep", {
                type: "manual",
                message: "Não encontramos seu endereço.",
            });
            return;
        }
        if (currentStep === 5) {
            setValue("login", "")
            setValue("senha", "")
            setValue("confirmar_senha", "")
        }
        if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep === 0) {
            navigate("/login")
            return
        }
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
        if (currentStep === 6) {
            setValue("login", "ong@ong.com.br")
            setValue("senha", "123455677")
            setValue("confirmar_senha", "123455677")
        }
        if (registerFinished) {
            setRegisterFinished({finished: false, id: ""})
        }
    };

    const handleConfirmPassword = (): boolean => {
        return getValues("confirmar_senha") === getValues("senha")
    }
    const cep = useWatch({control, name: "cep"})
    const publicoAlvo: string[] = useWatch({control, name: "publico_alvo"})
    const necessidades: string[] = useWatch({control, name: "necessidades"})

    const [viewPassword, setViewPassword] = useState(false)
    const [viewConfirmPassword, setViewConfirmPassword] = useState(false)

    const handleChangeCoordinates = (newCoordinates: Coordinates) => {
        setValue("localizacao", [newCoordinates.latitude, newCoordinates.longitude])
    }
    return (
        <div className="px-4 overflow-scroll h-screen">
            {
                registerFinished.finished ? (
                        <>
                            <div className="flex flex-row justify-center items-center w-full mt-12 mb-12 gap-4">
                                <div className="h-2 w-3/4">
                                    <Progress
                                        className="bg-[#9DEEBC]"
                                        value={(currentStep / (totalSteps - 1)) * 100}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col justify-between content-center h-[82%]">
                                <div className="text-[#19191B] text-2xl flex flex-col items-center gap-10">
                                    <h2 className="text-center">Tudo Pronto!</h2>
                                    <div className="w-full h-64 flex justify-center">
                                        <img src={"/images/img-7.svg"}/>
                                    </div>
                                    <p className="text-2xl text-center w-[75%]">
                                        Que tal personalizar o perfil da <b>{getValues("nome")}</b> para
                                        atingir ainda mais pessoas?
                                    </p>
                                </div>
                                <div className="w-full flex justify-center">
                                    <Button onClick={() => navigate(`/ong/admin/${registerFinished.id}`)}
                                            className="w-[92%]">Vamos nessa!</Button>
                                </div>
                            </div>
                        </>
                    )
                    :
                    (
                        <form onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                              className={"h-[90%] flex flex-col justify-between py-8"}
                              onSubmit={handleSubmit(onSubmit)}>
                            <div className={"flex flex-col gap-4"}>
                                <div className="flex flex-row items-center w-full gap-4">
                                    <Button
                                        className="p-0"
                                        variant="icon"
                                        type="button"
                                        onClick={handlePreviousStep}
                                    >
                                        <GoArrowLeft className="w-7 h-7"/>
                                    </Button>
                                    <div className="h-2 w-3/4">
                                        <Progress value={(currentStep / (totalSteps - 1)) * 100}/>
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col gap-2">
                                    <div className="flex flex-col gap-10 w-full">
                                        <div
                                            className="text-[#19191B] h-full text-2xl flex flex-col items-center gap-10">
                                            <h2 className="text-center">{steps[currentStep].title}</h2>
                                            <div className="w-full h-36 flex justify-center">
                                                <img src={steps[currentStep].image}/>
                                            </div>
                                        </div>
                                        {currentStep === 0 && (
                                            <div className="flex flex-col">
                                                <Label>
                                                    Nome
                                                </Label>
                                                <Input
                                                    id="nome"
                                                    type="text"
                                                    {...register("nome")}
                                                />
                                                {errors.nome && (
                                                    <p className="text-red-500">{errors.nome.message}</p>
                                                )}
                                            </div>
                                        )}
                                        {
                                            currentStep === 1 && (
                                                <>
                                                    <div className="w-full flex flex-col items-center gap-2">
                                                        <Button
                                                            className="p-0 w-12"
                                                            variant="icon"
                                                            type="button"
                                                            onClick={() => {
                                                                const currentValue = getValues("data_criacao") || new Date().getFullYear();
                                                                if (currentValue < new Date().getFullYear()) {
                                                                    setValue("data_criacao", currentValue + 1);
                                                                }
                                                            }}
                                                        >
                                                            <RiArrowUpSLine
                                                                className="w-7 h-7 text-[#AFB1B6] hover:text-[#2F49F3] transition-colors duration-300"/>
                                                        </Button>
                                                        <div className="flex flex-col w-1/2">
                                                            <Input
                                                                min={1900}
                                                                max={new Date().getFullYear()}
                                                                className="text-center"
                                                                type="number"
                                                                {...register("data_criacao", {valueAsNumber: true})}
                                                            />
                                                            {errors.data_criacao && (
                                                                <p className="text-red-500">{errors.data_criacao.message}</p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            className="p-0 w-12"
                                                            variant="icon"
                                                            type="button"
                                                            onClick={() => {
                                                                const currentValue = getValues("data_criacao") || new Date().getFullYear();
                                                                if (currentValue > 1900) {
                                                                    setValue("data_criacao", currentValue - 1);
                                                                }
                                                            }}
                                                        >
                                                            <RiArrowDownSLine
                                                                className="w-7 h-7 text-[#AFB1B6] hover:text-[#2F49F3] transition-colors duration-300"/>
                                                        </Button>
                                                    </div>
                                                </>
                                            )
                                        }
                                    </div>
                                    {
                                        currentStep === 2 && (
                                            <div className="flex flex-col">
                                                <Label>
                                                    CNPJ (Opcional)
                                                </Label>
                                                <Input
                                                    type="text"
                                                    {...register("cnpj")}
                                                />
                                                {errors.cnpj && (
                                                    <p className="text-red-500">{errors.cnpj.message}</p>
                                                )}
                                            </div>
                                        )
                                    }
                                    {
                                        currentStep === 3 && (
                                            <>
                                                <div>
                                                    <Label>CEP da ONG</Label>
                                                    <Input
                                                        id="cep"
                                                        {...register("cep")}
                                                    />
                                                    {errors.cep && (
                                                        <p className="text-red-500 ">{errors.cep.message}</p>
                                                    )}
                                                    <div
                                                        className={errors.cep ? "h-56 mt-2 overflow-hidden" : "h-56 mt-8 overflow-hidden"}>
                                                        <Map cep={cep} onCoordinatesChange={handleChangeCoordinates}/>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }
                                    {
                                        currentStep === 4 && (
                                            <>
                                                <div className="mt-10 flex gap-2 w-11/12 flex-wrap justify-center">
                                                    {publicoAlvoOptions.map((option) => (
                                                        <Button
                                                            key={option}
                                                            onClick={() => {
                                                                let values = getValues("publico_alvo");
                                                                if (!values.includes(option)) {
                                                                    values.push(option);
                                                                    setValue("publico_alvo", values)
                                                                } else {
                                                                    values = values.filter((item) => item !== option);
                                                                    setValue("publico_alvo", values)
                                                                }
                                                                trigger("publico_alvo")
                                                            }}
                                                            type="button"
                                                            className={`w-auto py-0 hover:bg-${publicoAlvo?.includes(option) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"} ${publicoAlvo?.includes(option) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"} text-[#19191B] focus:outline-none hover:bg-none`}
                                                        >
                                                            {option}
                                                        </Button>
                                                    ))}
                                                    {errors.publico_alvo && (
                                                        <p className="text-red-500 ">{errors.publico_alvo.message}</p>
                                                    )}
                                                </div>
                                            </>
                                        )
                                    }
                                    {
                                        currentStep === 5 && (
                                            <>
                                                <div
                                                    className="flex gap-2 mt-10 w-11/12 flex-wrap justify-center h-60 overflow-y-scroll">
                                                    {necessidadesOptions.map((option) => (
                                                        <Button
                                                            key={option}
                                                            onClick={() => {
                                                                let values = getValues("necessidades");
                                                                if (!values.includes(option)) {
                                                                    values.push(option);
                                                                    setValue("necessidades", values)
                                                                } else {
                                                                    values = values.filter((item) => item !== option);
                                                                    setValue("necessidades", values)
                                                                }
                                                                trigger("necessidades")
                                                            }}
                                                            type="button"
                                                            className={`w-auto py-0 hover:bg-${necessidades?.includes(option) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"} ${necessidades?.includes(option) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"} text-[#19191B] focus:outline-none hover:bg-none`}
                                                        >
                                                            {option}
                                                        </Button>
                                                    ))}
                                                    {errors.necessidades && (
                                                        <p className="text-red-500 ">{errors.necessidades.message}</p>
                                                    )}
                                                </div>
                                            </>
                                        )
                                    }
                                    {
                                        currentStep === 6 && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <Label>Email</Label>
                                                    <Input
                                                        {...register("login")}
                                                    />
                                                    {
                                                        errors.login && (
                                                            <p className="text-red-500 ">{errors.login.message}</p>
                                                        )
                                                    }
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Label>Senha</Label>
                                                    <div className="relative">
                                                        <Input
                                                            {...register("senha")}
                                                            type={viewPassword ? "text" : "password"}
                                                            icon={
                                                                viewPassword ? (
                                                                    <FiEyeOff
                                                                        onClick={() => setViewPassword(false)}
                                                                        className="text-[#AFB1B6] absolute right-4 bottom-1/4 w-7 h-6"
                                                                    />
                                                                ) : (
                                                                    <FiEye
                                                                        onClick={() => setViewPassword(true)}
                                                                        className="text-[#AFB1B6] absolute right-4 bottom-1/4 w-7 h-6"
                                                                    />
                                                                )
                                                            }
                                                        />
                                                        {
                                                            errors.senha && (
                                                                <p className="text-red-500 ">{errors.senha.message}</p>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Label>Confirmar senha:</Label>
                                                    <div className="relative">
                                                        <Input
                                                            {...register("confirmar_senha")}
                                                            type={viewConfirmPassword ? "text" : "password"}
                                                            icon={viewConfirmPassword ? (
                                                                <FiEyeOff
                                                                    onClick={() => setViewConfirmPassword(false)}
                                                                    className="text-[#AFB1B6] absolute right-4 bottom-1/4 w-7 h-6"
                                                                />
                                                            ) : (
                                                                <FiEye
                                                                    onClick={() => setViewConfirmPassword(true)}
                                                                    className="text-[#AFB1B6] absolute right-4 bottom-1/4 w-7 h-6"
                                                                />
                                                            )}
                                                        />
                                                        {
                                                            errors.confirmar_senha && (
                                                                <p className="text-red-500 ">{errors.confirmar_senha.message}</p>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        registerOngMutation.isError && (
                                            <p className="text-red-500 ">{(registerOngMutation.error as Error)?.message || "Ocorreu um erro."}</p>
                                        )
                                    }
                                </div>
                            </div>
                            {
                                registerOngMutation.isLoading ? (
                                    <Button
                                        disabled={true}
                                        className="w-full"
                                        type={currentStep === totalSteps - 1 ? "submit" : "button"}
                                        onClick={handleNextStep}
                                    >
                                        Registrando ONG
                                        <AiOutlineLoading3Quarters className="animate-spin"/>
                                    </Button>
                                ) : (
                                    <div className="flex justify-between w-full">
                                        <Button
                                            disabled={!isValid}
                                            className={"w-full"}
                                            type={currentStep === totalSteps - 1 ? "submit" : "button"}
                                            onClick={handleNextStep}
                                        >
                                            {currentStep === totalSteps - 1 ? "Finalizar" : "Continuar"}
                                        </Button>
                                    </div>
                                )
                            }
                        </form>
                    )
            }
        </div>
    );
}
