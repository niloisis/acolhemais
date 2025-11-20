import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";
import {FiEdit} from "react-icons/fi";
import {IoCheckboxOutline, IoSettingsOutline} from "react-icons/io5";
import {MdArrowForwardIos, MdOutlineEmail} from "react-icons/md";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery, useQueryClient} from "react-query";
import {api, serverURI} from "@/utils/api.ts";
import {Ong} from "@/pages/ong/@types/Ong.ts";
import {TbWorld} from "react-icons/tb";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {FaInstagram, FaPhone, FaWhatsapp} from "react-icons/fa";
import {Textarea} from "@/components/ui/textarea.tsx";
import {z} from "zod";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {LuUpload} from "react-icons/lu";
import {toast} from "react-toastify";
import {CiCircleRemove} from "react-icons/ci";
import {RiAddCircleLine} from "react-icons/ri";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const ongDataSchema = z.object({
    descricao: z.string().min(10, "Dê mais detalhes sobre sua ONG"),
})
const contactSchema = z.object({
    tipo: z.string().refine(
        (value) =>
            ["EMAIL", "TELEFONE", "SITE", "WHATSAPP", "INSTAGRAM"].includes(value),
        {
            message: "Tipo inválido. Escolha uma das opções disponíveis.",
        }
    ),
    valor: z.string().min(2, "Este valor está incorreto"),
})

type OngUpdateSchema = z.infer<typeof ongDataSchema>
type AddContactSchema = z.infer<typeof contactSchema>


export default function OngAdminProfile() {

    const [logoURL, setLogoURL] = useState<string>('');
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const {id} = useParams()
    const queryClient = useQueryClient();
    const ongQuery = useQuery(
        {
            queryKey: "ong_profile",
            queryFn: async (): Ong => {
                const {data} = await api.get<Ong>(`/v1/ong/${id}`);
                try {
                    await api.get(`/v1/ong/${id}/logo`)
                    setLogoURL(`/v1/ong/${id}/logo`)
                } catch (e) {
                    setLogoURL("")
                }
                return data
            }
        })
    const {data: ongData, refetch} = ongQuery
    const {
        getValues,
        register: addContactRegister,
        formState: {errors, isValid},
        setValue,
        reset: resetContact,
    } = useForm<AddContactSchema>({
        resolver: zodResolver(contactSchema),
        mode: "all"
    })
    const {
        register,
        reset,
        control
    } = useForm<OngUpdateSchema>({
        resolver: zodResolver(ongDataSchema),
        mode: "all",
        defaultValues: {
            descricao: ongData?.descricao
        }
    })
    const navigate = useNavigate()
    const descriptionWatch = useWatch({control, name: "descricao"})
    const handleUpdate = async () => {
        await api.put(`/v1/ong/${id}/description`, {description: descriptionWatch})
        setEditMode(false);
        await refetch()
    }
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const logoInputRef = useRef<HTMLInputElement | null>(null);
    const ongId = localStorage.getItem("ongId");
    if (ongId !== id) {
        return navigate("/")
    }
    const handleAddContact = async () => {
        const {data} = await api.post(`/v1/ong/${id}/contact`, {
            tipo: getValues("tipo"),
            valor: getValues("valor"),
        });
        resetContact({
            tipo: "",
            valor: "",
        });
        await refetch()
    }

    const handleAddImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("picture", file);
        try {
            const response = await api.post(
                `/v1/ong/${id}/image`,
                formData
            );
            if (response.status === 201) {
                toast.success("Imagem enviada, aguarde um momento.")
            } else {
                toast.error("Não foi possível salvar sua imagem.")
            }
        } catch (error) {
            console.error(error);
        }
        await refetch()
    };

    const handleRemoveImage = async (id: string) => {
        await api.delete(`/v1/ong/${id}/image`);
        queryClient.setQueryData(["ong_profile"], (oldData: any) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                images: oldData.images.filter((image: any) => image !== id),
            };
        });
        await refetch()
    }

    const handleRemoveContact = async (id: string) => {
        await api.delete(`/v1/ong/contact/${id}`);
        queryClient.setQueryData(["ong_profile"], (oldData: any) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                contatos: oldData.contatos.filter((contato: any) => contato.id !== id),
            };
        });
        await refetch()
    }

    const handleChangeLogo = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("logo", file);
        try {
            const response = await api.post(
                `/v1/ong/${id}/logo`,
                formData
            );
            setLogoURL(`/v1/ong/${id}/logo?t=${Date.now()}`);
            if (response.status === 201) {
                toast.success("Logo alterada.")
            } else {
                toast.error("Não foi possível salvar sua imagem.")
            }
        } catch (error) {
            console.error(error);
        }
        await refetch()
    };
    useEffect(() => {
        if (ongData) {
            reset({
                descricao: ongData.descricao || "",
            });
        }
    }, [ongData, reset]);
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
                <div className="w-full flex justify-between items-center p-2">
                    <Button onClick={() => navigate(`/ong/admin/${id}/config`)}>
                        <IoSettingsOutline className="h-6 w-6"/>
                    </Button>
                    <img className="h-20 w-20" src="/images/logo-white.svg" alt={"Logo acolhe+"}
                         onClick={() => navigate("/")}/>
                    {
                        isEditMode ? (
                            <Button onClick={handleUpdate}>
                                <IoCheckboxOutline className="h-6 w-6"/>
                            </Button>
                        ) : (
                            <Button onClick={() => setEditMode(true)}>
                                <FiEdit className="h-6 w-6"/>
                            </Button>
                        )
                    }
                </div>
                <div className="flex items-center justify-center w-full">
                    {
                        isEditMode && (
                            <button
                                onClick={() => {
                                    if (logoInputRef.current) {
                                        logoInputRef.current.click()
                                    }
                                }}
                                className={"flex border border-white border-2 justify-center items-center absolute bg-black w-24 h-24 mt-2 rounded-full z-50 bg-opacity-40"}>
                                <FiEdit className="h-6 w-6 text-white"/>
                            </button>
                        )
                    }
                    <input
                        className={"hidden"}
                        type="file"
                        ref={logoInputRef}
                        onChange={handleChangeLogo}
                    />
                    <Avatar className="w-24 h-24 mt-2 border-2 border-[#2F49F3]">
                        {
                            logoURL ? (
                                <AvatarImage src={serverURI + logoURL + `?t=${Date.now()}`}/>

                            ) : (
                                <AvatarImage src={"/images/invalidLogo.png"}/>
                            )
                        }
                    </Avatar>
                </div>
            </header>
            <main className="px-4">
                <header>
                    <div className="mt-2 flex flex-col items-center justify-center w-full">
                        <h2 className="font-semibold text-[#19191B]">
                            {ongData?.nome}
                        </h2>
                        <p className="text-xs">
                            {ongData.endereco}
                        </p>
                    </div>
                    <div
                        className="flex items-center justify-center flex-wrap gap-2 max-h-36 overflow-scroll my-6">
                        {
                            ongData?.publico_alvo.map((p, key) => (
                                <div key={key}
                                     className={"bg-[#EFEFF0] text-sm text-[#19191B] w-auto py-2  px-6 rounded-full inline-block"}
                                >
                                    {p.tipo}
                                </div>
                            ))
                        }
                        {
                            ongData?.necessidades.map((p, key) => (
                                <div key={key}
                                     className={"bg-[#EFEFF0] text-sm text-[#19191B] w-auto py-2  px-6 rounded-full inline-block"}
                                >
                                    {p.tipo}
                                </div>
                            ))
                        }
                    </div>
                </header>
                <div className="overflow-scroll pb-20">
                    <article>
                        <h3 className="mb-2 font-medium">SOBRE</h3>

                        {
                            isEditMode ? (
                                <Textarea {...register("descricao")} />
                            ) : (
                                <p className="overflow-scroll text-sm ">
                                    {descriptionWatch}
                                </p>
                            )
                        }

                        <div className="flex items-center justify-start w-full overflow-scroll py-4 gap-3">
                            {
                                ongData?.images.length === 0 && (
                                    <span className="text-sm text-[#61646B]">Não há fotos recentes.</span>
                                )
                            }
                            {
                                ongData?.images.map((imageId, key) => (
                                    <div className={"relative"}>
                                        <button className="absolute h-8 w-8 m-2 left-40"
                                                onClick={() => handleRemoveImage(imageId)}>
                                            {
                                                isEditMode && (<CiCircleRemove className="h-8 w-8 text-white"/>)
                                            }

                                        </button>
                                        <img key={key} className="h-32 w-52 max-w-52 max-h-32 rounded-xl"
                                             src={serverURI + `/v1/ong-image/${imageId}`}/>
                                    </div>
                                ))
                            }
                        </div>
                        {
                            isEditMode ? (
                                <div>
                                    <Button
                                        className="mt-2 px-6"
                                        onClick={() => {
                                            if (fileInputRef.current) {
                                                fileInputRef.current.click();
                                            }
                                        }}
                                    >
                                        Adicionar imagem <LuUpload className="ml-6 h-4 w-4"/>
                                    </Button>
                                    <input
                                        className={"hidden"}
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAddImage}
                                    />
                                </div>
                            ) : (
                                <Button className="mt-2 px-6" onClick={() => navigate(`/ong/${id}/acoes`)}>
                                    Eventos e ações <MdArrowForwardIos className="ml-6 h-4 w-4"/>
                                </Button>
                            )
                        }

                    </article>
                    <article className="mt-8 flex flex-col items-start justify-start w-full relative">
                        <h3 className="mb-2 font-medium">CONTATO</h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                {
                                    isEditMode && (
                                        <button
                                            className="flex items-center justify-center w-12 h-12 bg-[#2F49F3] rounded-full absolute right-0">
                                            <RiAddCircleLine className="h-7 w-7 text-white"/>
                                        </button>
                                    )
                                }
                            </DialogTrigger>

                            <DialogContent className="w-11/12 bg-white rounded-xl">
                                <DialogHeader className="flex items-start">
                                    <DialogTitle>Adicionar um novo contato</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center space-x-2">
                                    <div className="grid flex-1 gap-2">
                                        <Select {...addContactRegister("tipo")}
                                                onValueChange={(e) =>
                                                    setValue("tipo", e)
                                                }>
                                            <SelectTrigger className="w-full border-[#61646B] rounded-full">
                                                <SelectValue placeholder="Tipo"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="EMAIL">Email</SelectItem>
                                                <SelectItem value="TELEFONE">Telefone</SelectItem>
                                                <SelectItem value="SITE">Site</SelectItem>
                                                <SelectItem value="WHATSAPP">Whatsapp</SelectItem>
                                                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {
                                            errors.tipo && (
                                                <p className="text-red-500">{errors.tipo.message}</p>
                                            )
                                        }
                                        <Input {...addContactRegister("valor")}/>
                                        {
                                            errors.valor && (
                                                <p className="text-red-500">{errors.valor.message}</p>
                                            )
                                        }
                                    </div>
                                </div>
                                <DialogFooter className="sm:justify-start">
                                    <DialogClose asChild>
                                        <Button onClick={handleAddContact} disabled={!isValid}>
                                            Adicionar
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className="flex flex-col gap-2">
                            {
                                ongData?.contatos.length === 0 && (
                                    <span className="text-sm text-[#61646B]">Não há contatos registrados.</span>
                                )
                            }
                            {
                                ongData?.contatos.map((p) => {
                                    switch (p.tipo) {
                                        case "EMAIL":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MdOutlineEmail/> {p.valor}
                                                    {
                                                        isEditMode && (
                                                            <CiCircleRemove onClick={() => handleRemoveContact(p.id)}/>
                                                        )
                                                    }
                                                </div>
                                            );
                                        case "TELEFONE":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaPhone/> {p.valor}
                                                    {
                                                        isEditMode && (
                                                            <CiCircleRemove onClick={() => handleRemoveContact(p.id)}/>
                                                        )
                                                    }
                                                </div>
                                            );
                                        case "SITE":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <TbWorld/> {p.valor}
                                                    {
                                                        isEditMode && (
                                                            <CiCircleRemove onClick={() => handleRemoveContact(p.id)}/>
                                                        )
                                                    }
                                                </div>
                                            );
                                        case "INSTAGRAM":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaInstagram/> {p.valor}
                                                    {
                                                        isEditMode && (
                                                            <CiCircleRemove onClick={() => handleRemoveContact(p.id)}/>
                                                        )
                                                    }
                                                </div>
                                            );
                                        case "WHATSAPP":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaWhatsapp/> {p.valor}
                                                    {
                                                        isEditMode && (
                                                            <CiCircleRemove onClick={() => handleRemoveContact(p.id)}/>
                                                        )
                                                    }

                                                </div>
                                            );
                                    }
                                })
                            }
                        </div>
                    </article>
                </div>
            </main>
        </main>
    )
}