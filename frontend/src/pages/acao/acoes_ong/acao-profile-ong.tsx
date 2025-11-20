import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "react-query";
import {api, serverURI} from "@/utils/api.ts";
import {Ong} from "@/pages/ong/@types/Ong.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ChangeEvent, useRef, useState} from "react";
import {CalendarIcon, ChevronLeftIcon} from '@radix-ui/react-icons';
import {FiEdit} from "react-icons/fi";
import {Acao} from "@/pages/acao/acoes_ong/@types/Acao.ts";
import {GoClock} from "react-icons/go";
import {IoCheckboxOutline, IoLocationOutline} from "react-icons/io5";
import {Textarea} from "@/components/ui/textarea.tsx";
import {toast} from "react-toastify";
import {CiImageOn} from "react-icons/ci";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";

const updateAcaoSchema = z.object({
    descricao: z.string().min(3, {message: "Insira um nome maior"}),
    como_participar: z.number().min(1, {message: "Escolha uma data válida"}).max(31, {message: "Escolha uma data válida"}),
    link_contato: z.string(),
})
type UpdateAcaoSchema = z.infer<typeof updateAcaoSchema>
export default function AcaoProfileOng() {

    const [logoURL, setLogoURL] = useState<string>('');
    const [bannerURL, setBannerURL] = useState<string>('');
    const {id: ongId, acaoId} = useParams();
    const bannerInputRef = useRef<HTMLInputElement | null>(null);
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const navigate = useNavigate();
    const ongQuery = useQuery(
        {
            queryKey: ["ong_profile", ongId],
            queryFn: async (): Promise<Ong> => {
                const {data} = await api.get<Ong>(`/v1/ong/${ongId}`);
                try {
                    await api.get(`/v1/ong/${ongId}/logo`);
                    setLogoURL(`/v1/ong/${ongId}/logo`);
                } catch (e) {
                    setLogoURL("");
                }
                try {
                    await api.get(`/v1/acoes/${acaoId}/banner`);
                    setBannerURL(`/v1/acoes/${acaoId}/banner`);
                } catch (e) {
                    setBannerURL("");
                }
                return data;
            }
        }
    );

    const acaoQuery = useQuery(
        {
            queryKey: ["ong_acao", acaoId],
            queryFn: async (): Promise<Acao> => {
                const {data} = await api.get<Acao>(`/v1/acoes/${acaoId}`);
                return data;
            }
        }
    );
    const {data: acaoData, refetch} = acaoQuery
    const {
        register,
        getValues
    } = useForm<UpdateAcaoSchema>({
        resolver: zodResolver(updateAcaoSchema),
        mode: "onChange",
        defaultValues: {
            descricao: acaoData?.descricao,
            como_participar: acaoData?.como_participar,
            link_contato: acaoData?.link_contato,
        }
    })
    const queryClient = useQueryClient()
    const onSubmit = async () => {
        await api.put(`/v1/acoes/${acaoId}`, {
            descricao: getValues("descricao"),
            como_participar: getValues("como_participar"),
            link_contato: getValues("link_contato"),
        })
        await refetch();
    };
    const handleChangeBanner = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("banner", file);
        try {
            const response = await api.post(
                `/v1/acoes/${acaoId}/banner`,
                formData
            );
            setBannerURL(`/v1/acoes/${acaoId}/banner?t=${Date.now()}`);
            if (response.status === 201) {
                toast.success("Banner alterado.")
            } else {
                toast.error("Não foi possível salvar sua imagem.")
            }
        } catch (error) {
            console.error(error);
        }
        await refetch()
    };
    if (ongQuery.isLoading) {
        return (
            <>
                <div className="mt-24 flex w-full flex-col justify-center items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full"/>
                    <Skeleton className="h-6 w-36 "/>
                    <Skeleton className="h-4 w-28 "/>
                    <div className="mt-8 flex gap-4">
                        <Skeleton className="h-8 w-24 rounded-full"/>
                        <Skeleton className="h-8 w-24 rounded-full"/>
                        <Skeleton className="h-8 w-24 rounded-full"/>
                    </div>
                </div>
                <div className="py-4 px-4 mt-6">
                    <Skeleton className="w-full h-36 rounded-xl"/>
                    <div className="flex gap-4 py-4">
                        <Skeleton className="w-32 h-24 rounded-xl"/>
                        <Skeleton className="w-32 h-24 rounded-xl"/>
                        <Skeleton className="w-32 h-24 rounded-xl"/>
                    </div>
                    <Skeleton className="w-36 h-12 rounded-full"/>
                </div>
                <div className="mt-10 flex flex-col content-start items-start gap-4 px-4">
                    <Skeleton className="h-6 w-36 "/>
                    <Skeleton className="h-4 w-28 "/>
                    <Skeleton className="h-4 w-28 "/>
                </div>
            </>
        )
    }

    return (
        <main>
            <header className="bg-[url(/images/circle.svg)] w-full h-52 bg-no-repeat bg-contain">
                {
                    localStorage.getItem("ongId") === ongId ? (
                        <>
                            <div className="w-full flex justify-between items-center p-2">
                                <Button onClick={() => window.history.back()}>
                                    <ChevronLeftIcon className="h-6 w-6"/>
                                </Button>
                                <img className="h-20 w-20" src="/images/logo-white.svg" onClick={() => navigate("/")}
                                     alt={"Logo acolhe+"}/>
                                {
                                    isEditMode ? (
                                        <Button onClick={async () => {
                                            await onSubmit()
                                            setEditMode(false)
                                        }}>
                                            <IoCheckboxOutline className="h-6 w-6"/>
                                        </Button>
                                    ) : (
                                        <Button onClick={() => setEditMode(true)}>
                                            <FiEdit className="h-6 w-6"/>
                                        </Button>
                                    )
                                }
                            </div>
                        </>
                    ) : (
                        <div className="w-full flex justify-between items-center p-2">
                            <Button onClick={() => navigate(`/ong/${ongId}/acoes`)}>
                                <ChevronLeftIcon className="h-6 w-6"/>
                            </Button>
                            <img className="h-20 w-20" src="/images/logo-white.svg" onClick={() => navigate("/")}
                                 alt={"Logo acolhe+"}/>
                            <Button className="invisible">
                                <ChevronLeftIcon className="h-6 w-6"/>
                            </Button>
                        </div>
                    )
                }

                <div className="flex items-center justify-center w-full">
                    <input
                        className={"hidden"}
                        type="file"
                        ref={bannerInputRef}
                        onChange={handleChangeBanner}
                    />
                    <Avatar className="w-28 h-28 mt-2 border-2 border-[#2F49F3]">
                        {
                            logoURL ? (
                                <AvatarImage src={serverURI + `/v1/ong/${ongId}/logo`}/>
                            ) : (
                                <AvatarImage src={"/images/invalidLogo.png"}/>
                            )
                        }
                    </Avatar>
                </div>
            </header>
            <main>
                <header>
                    <div className="mt-3 flex flex-col items-center justify-center w-full">
                        <h1 className="text-[#19191B] text-2xl">
                            {acaoData?.nome}
                        </h1>
                        <p className="text-[#61646B]">
                            {ongQuery.data?.nome}
                        </p>
                    </div>
                </header>

                <div className="flex flex-col gap-4 p-4 px-6">
                    <div className={"w-full relative"}>
                        {
                            isEditMode && (
                                <button
                                    onClick={() => {
                                        if (bannerInputRef.current) {
                                            bannerInputRef.current.click()
                                        }
                                    }}
                                    className={"flex justify-center items-center absolute bg-black w-full h-32 max-h-32 mt-4 rounded-xl z-50 bg-opacity-40"}>
                                    <FiEdit className="h-6 w-6 text-white"/>
                                </button>
                            )
                        }
                        {
                            bannerURL ? (
                                <img
                                    src={serverURI + bannerURL}
                                    className="h-32 w-full max-h-32 rounded-xl object-cover mt-4"
                                />
                            ) : (
                                <div
                                    className="h-32 w-full max-h-32 rounded-xl object-cover mt-4 bg-[#AFB1B6] flex justify-center items-center"
                                >
                                    <CiImageOn className={"h-12 w-12 text-white"}/>
                                </div>
                            )
                        }
                    </div>

                    <div className={"flex flex-col gap-1"}>
                        <h3 className="text-sm font-medium mb-1">Sobre o evento</h3>
                        <div className="flex gap-1 items-center">
                            <CalendarIcon className="text-[#61646B]"/>
                            <span
                                className="text-sm text-[#61646B]">{`${acaoData?.dia} de ${acaoData?.mes} de ${acaoData?.ano}`}</span>
                        </div>
                        <div className="flex gap-1 items-center">
                            <GoClock className="text-[#61646B]"/>
                            <span
                                className="text-sm text-[#61646B]">{`${acaoData?.inicio} - ${acaoData?.termino}`}</span>
                        </div>

                        <div className="flex gap-1 items-center">
                            <IoLocationOutline className="text-[#61646B]"/>
                            <span
                                className="text-sm text-[#61646B]">{`${acaoData?.endereco}, ${acaoData?.numero} - ${acaoData?.bairro}`}</span>
                        </div>
                        {
                            isEditMode ? (
                                <div className={"py-4"}>
                                    <Textarea className={"text-sm -mb-4"}
                                              defaultValue={acaoData?.descricao} {...register("descricao")} />
                                </div>
                            ) : (
                                <p className={"text-sm py-4"}>
                                    {acaoData?.descricao}
                                </p>
                            )
                        }

                    </div>
                    <div className={"flex flex-col"}>
                        <div className={"flex flex-col gap-1"}>
                            <h3 className="text-sm font-medium">Como participar</h3>
                            {
                                isEditMode ? (
                                    <div className={"py-4"}>
                                        <Textarea className={"text-sm"}
                                                  defaultValue={acaoData?.como_participar} {...register("como_participar")} />
                                    </div>
                                ) : (
                                    <p className={"text-sm"}>
                                        {acaoData?.como_participar}
                                    </p>
                                )
                            }
                        </div>
                        {
                            isEditMode && (
                                <div className={"pb-4"}>
                                    <Label>Link de contato</Label>
                                    <Input className={"text-sm"} placeholder={"Adicione um link de whatsapp, site e etc."}
                                           defaultValue={acaoData?.link_contato} {...register("link_contato")} />
                                </div>
                            )
                        }
                        {isEditMode && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className={"bg-[#AFB1B6] mb-8"}>Excluir evento</Button>
                                </DialogTrigger>

                                <DialogContent className="w-11/12 bg-white rounded-xl">
                                    <DialogHeader className="flex items-start">
                                        <DialogTitle>Tem certeza que quer remover essa ação?</DialogTitle>
                                    </DialogHeader>
                                    <DialogFooter className="sm:justify-start">
                                        <DialogClose asChild>
                                            <div className={"flex gap-4"}>
                                                <Button className={"w-full"} onClick={async () => {
                                                    await api.delete(`/v1/acoes/${acaoData.id}`)
                                                    await queryClient.invalidateQueries(["ong_acoes", ongId]);
                                                    navigate(`/ong/${ongId}/acoes`)
                                                }}>
                                                    Excluir
                                                </Button>
                                                <Button className={"w-full bg-[#AFB1B6]"}>
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {
                            acaoData?.link_contato && (
                                <Button
                                    className="mt-8"
                                    onClick={() => window.location.href = acaoData?.link_contato}
                                >
                                    Entrar em contato
                                </Button>
                            )
                        }
                    </div>
                </div>
            </main>
        </main>
    )
}