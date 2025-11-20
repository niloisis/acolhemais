import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "react-query";
import {api} from "@/utils/api.ts";
import {Ong} from "@/pages/ong/@types/Ong.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {useEffect, useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {FaArrowLeft} from "react-icons/fa";
import {FiEye, FiEyeOff} from "react-icons/fi";
import {TbEdit} from "react-icons/tb";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {toast} from "react-toastify";

const ongUpdatechema = z.object({
    nome: z.string().min(2, {message: "Nome inválido"}),
    added_publico_alvo: z.array(),
    removed_publico_alvo: z.array(),
    added_necessidades: z.array(),
    removed_necessidades: z.array(),
})
const ongPasswordchema = z.object({
    senha: z.string().min(8, {message: "Use pelo menos 8 caracteres"}),
    contraSenha: z.string().min(8, {message: "Use pelo menos 8 caracteres"}),
})
type OngUpdateSchema = z.infer<typeof ongUpdatechema>
type OngPasswordSchema = z.infer<typeof ongPasswordchema>

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
export default function OngProfileUpdate() {
    const {id} = useParams()
    const navigate = useNavigate()
    const ongQuery = useQuery(
        {
            queryKey: "ong_profile",
            queryFn: async (): Ong => {
                const {data} = await api.get<Ong>(`/v1/ong/${id}`);
                return data
            }
        })
    const {data: ongData} = ongQuery
    const {
        register,
        reset,
        errors,
        setValue,
        getValues,
    } = useForm<OngUpdateSchema>({
        resolver: zodResolver(ongUpdatechema),
        defaultValues: {
            nome: ongData?.nome,
            added_necessidades: [],
            removed_publico_alvo: [],
            added_publico_alvo: [],
            removed_necessidades: []
        }
    })
    const {
        formState: {errors: passwordErrors},
        setError: passwordSetError,
        reset: passwordReset,
        clearErrors,
        setValue: passwordSetValue,
        getValues: passwordGetValues,
    } = useForm<OngPasswordSchema>({
        resolver: zodResolver(ongPasswordchema),
        mode: "onChange",
    })
    const [viewPassword, setViewPassword] = useState(false)
    const [viewConfirmPassword, setViewConfirmPassword] = useState(false)
    const [isEqualsPassword, setIsEqualsPassword] = useState(false)
    const queryClient = useQueryClient();

    const handleChangePassword = async () => {
        try {
            await api.put(`/v1/ong/${id}/password`, {password: passwordGetValues("senha")})
            toast.success("Senha alterada")
        } catch (e) {
            toast.error("Falha ao alterar informações")
        }
    }

    const handleUpdate = async () => {
        try {
            await api.put(`/v1/ong/${id}`, {
                nome: getValues("nome"),
                added_necessidades: getValues("added_necessidades"),
                removed_publico_alvo: getValues("removed_publico_alvo"),
                added_publico_alvo: getValues("added_publico_alvo"),
                removed_necessidades: getValues("removed_necessidades")
            })
            toast.success("Informações alteradas")
            navigate(`/ong/admin/${id}`)
        } catch (e) {
            toast.error("Falha ao alterar informações")
        }
    }

    const handleItem = async (novoTipo: string, ongDataKeyOf: string) => {
        const filteredIfExists = ongData[ongDataKeyOf].filter(n => n.tipo === novoTipo);
        if (filteredIfExists.length > 0) {
            queryClient.setQueryData(["ong_profile"], (oldData: any) => {
                if (!oldData) return oldData;
                const newData = oldData[ongDataKeyOf].filter(n => n.tipo !== novoTipo);
                return {
                    ...oldData,
                    [ongDataKeyOf]: newData
                }
            })
            if (filteredIfExists[0].id) {
                const removed = getValues(`removed_${ongDataKeyOf}`) || [];
                if (!removed.includes(filteredIfExists[0].id)) {
                    setValue(`removed_${ongDataKeyOf}`, [...removed, filteredIfExists[0].id]);
                }

            }
            return
        }
        const item = {
            id: "",
            tipo: novoTipo,
        }
        queryClient.setQueryData(["ong_profile"], (oldData: any) => {
            if (!oldData) return oldData;
            const newData = [...(oldData[ongDataKeyOf]) || [], item]
            return {
                ...oldData,
                [ongDataKeyOf]: newData
            }
        })
        const added = getValues(`added_${ongDataKeyOf}`) || []
        setValue(`added_${ongDataKeyOf}`, [...added, novoTipo])
    }

    useEffect(() => {
        if (ongData) {
            setValue("nome", ongData.nome || "");
        }
    }, [ongData, reset]);

    if (ongQuery.isLoading) {
        return (
            <>
                <div>
                    <div className="flex w-full flex-col justify-center items-center gap-4">
                        <Skeleton className="h-24 w-full"/>
                        <Skeleton className="h-6 w-36 "/>
                    </div>
                    <div className="py-4 px-4 mt-4 flex flex-col justify-start w-full gap-4">
                        <Skeleton className="w-1/3 h-6 rounded-xl mb-4"/>
                        <Skeleton className="w-full h-16 rounded-xl"/>
                        <Skeleton className="w-full h-16 rounded-xl"/>
                        <Skeleton className="w-full h-16 rounded-xl"/>
                    </div>
                    <div className="mt-4 flex flex-col content-start items-start gap-4 px-4">
                        <Skeleton className="h-6 w-36 "/>
                        <div className="flex gap-4 flex-wrap">
                            <Skeleton className="h-8 w-24 rounded-full"/>
                            <Skeleton className="h-8 w-24 rounded-full"/>
                            <Skeleton className="h-8 w-24 rounded-full"/>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col content-start items-start gap-4 px-4">
                        <Skeleton className="h-6 w-36 "/>
                        <div className="flex gap-4 flex-wrap">
                            <Skeleton className="h-8 w-24 rounded-full"/>
                            <Skeleton className="h-8 w-24 rounded-full"/>
                            <Skeleton className="h-8 w-24 rounded-full"/>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-16">
                    <Skeleton className="h-12 w-9/12 rounded-full"/>
                </div>
            </>
        )
    }

    return (
        <main>
            <header className="w-full h-20 bg-[#2F49F3] bg-contain">
                <div className="w-3/5 flex justify-between items-center p-2">
                    <Button onClick={() => navigate(`/ong/admin/${id}`)}>
                        <FaArrowLeft className="h-6 w-6"/>
                    </Button>
                    <img className="h-20 w-20" src="/images/logo-white.svg" alt={"Logo acolhe+"}
                         onClick={() => navigate("/")}/>
                </div>
            </header>
            <main className="px-4">
                <h1 className="w-full text-center text-2xl mt-6 text-[#19191B]">
                    Configurações
                </h1>
                <div className="overflow-scroll mt-6">
                    <article>
                        <h3 className="mb-2 font-medium">Editar informações</h3>
                        <div className="flex flex-col gap-4">
                            <div className="relative w-full">
                                <label
                                    className="absolute top-2 left-3 text-gray-500 text-sm transition-all duration-200"
                                >
                                    Nome
                                </label>
                                <TbEdit className="absolute top-6 right-4 h-6 w-6 text-[#61646B]"/>
                                <Input
                                    {...register("nome")}
                                    id="nome"
                                    className="px-3 pt-[2.6rem] pb-6"
                                />
                                {errors?.nome && (
                                    <p className="text-red-500">{errors.nome.message}</p>
                                )}
                            </div>
                            <div className="relative w-full">
                                <label
                                    className="absolute top-2 left-3 text-gray-400 text-sm transition-all duration-200"
                                >
                                    Login
                                </label>
                                <Input
                                    disabled
                                    value={ongData?.login}
                                    className="px-3 pt-[2.6rem] pb-6"
                                />
                            </div>
                        </div>
                    </article>
                    <article className="mt-6 w-full">
                        <div className="flex w-full justify-between">
                            <h3 className="mb-2 font-medium">Público alvo</h3>
                            <TbEdit className="h-6 w-6 text-[#61646B]"/>
                        </div>
                        <div className={"flex gap-2 flex-wrap h-36 overflow-scroll"}>
                            {
                                publicoAlvoOptions.map(publicoAlvo => (
                                    <Button
                                        onClick={() => handleItem(publicoAlvo, "publico_alvo")}
                                        className={`w-auto py-0 hover:bg-${ongData.publico_alvo.some(pa => pa.tipo === publicoAlvo) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"}   ${ongData.publico_alvo.some(pa => pa.tipo === publicoAlvo) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"} text-[#19191B] focus:outline-none hover:bg-none`}
                                    >
                                        {publicoAlvo}
                                    </Button>
                                ))
                            }
                        </div>
                    </article>
                    <article className="mt-6 w-full">
                        <div className="flex w-full justify-between">
                            <h3 className="mb-2 font-medium">Necessidades</h3>
                            <TbEdit className="h-6 w-6 text-[#61646B]"/>
                        </div>
                        <div className={"flex gap-2 flex-wrap h-36 overflow-scroll"}>
                            {
                                necessidadesOptions.map(necessidade => (
                                    <Button
                                        onClick={() => handleItem(necessidade, "necessidades")}
                                        className={`w-auto py-0 hover:bg-${ongData.necessidades.some(pa => pa.tipo === necessidade) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"}   ${ongData.necessidades.some(pa => pa.tipo === necessidade) ? "bg-[#FFCF33]" : "bg-[#EFEFF0]"} text-[#19191B] focus:outline-none hover:bg-none`}
                                    >
                                        {necessidade}
                                    </Button>
                                ))
                            }
                        </div>
                    </article>
                    <Dialog onOpenChange={(open) => {
                        if (!open) {
                            passwordReset()
                        }
                    }}>
                        <DialogTrigger asChild>
                            <button className="flex mt-6 w-full justify-between">
                                <h3 className="mb-4 font-medium">Alterar senha</h3>
                                <TbEdit className="h-6 w-6 text-[#61646B]"/>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="w-11/12 bg-white rounded-xl">
                            <DialogHeader className="flex items-start">
                                <DialogTitle>Alterar senha</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <div>
                                        <Label>Nova senha</Label>
                                        <Input
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
                                            onChange={e => {
                                                passwordSetValue("senha", e.target.value)
                                                if (e.target.value.length < 8) {
                                                    passwordSetError("senha", {message: "Utilize ao menos 8 caracteres"})
                                                    return
                                                }
                                                if (e.target.value === passwordGetValues("contraSenha")) {
                                                    setIsEqualsPassword(true)
                                                    clearErrors("senha");
                                                } else {
                                                    passwordSetError("senha", {message: "As senhas não coincidem"})
                                                    setIsEqualsPassword(false)
                                                }
                                            }}/>
                                    </div>
                                    <div>
                                        <Label>Confirmar senha</Label>
                                        <Input
                                            type={viewConfirmPassword ? "text" : "password"}
                                            onChange={e => {
                                                passwordSetValue("contraSenha", e.target.value)
                                                if (e.target.value === passwordGetValues("senha")) {
                                                    setIsEqualsPassword(true)
                                                    clearErrors("senha");
                                                } else {
                                                    passwordSetError("senha", {message: "As senhas não coincidem"})
                                                    setIsEqualsPassword(false)
                                                }
                                            }}
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
                                    </div>
                                    {
                                        passwordErrors.senha &&
                                        <p className={"text-red-500"}>{passwordErrors.senha.message}</p>
                                    }
                                </div>
                            </div>
                            <DialogFooter className="sm:justify-start">
                                <DialogTrigger asChild>
                                    <Button disabled={!isEqualsPassword} onClick={handleChangePassword}>
                                        Salvar
                                    </Button>
                                </DialogTrigger>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex justify-center mt-4 mb-6">
                    <Button className="w-11/12" onClick={handleUpdate}>Salvar</Button>
                </div>

            </main>
        </main>
    )
}