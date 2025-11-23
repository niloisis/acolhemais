import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { api, serverURI } from "@/utils/api.ts";
import { Ong } from "@/pages/ong/@types/Ong.ts";
import { Acao } from "@/pages/acao/acoes_ong/@types/Acao.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ChangeEvent, useRef, useState } from "react";
import { CalendarIcon } from '@radix-ui/react-icons';
import { FiEdit, FiCamera, FiTrash2 } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import { GoClock } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { Textarea } from "@/components/ui/textarea.tsx";
import { toast } from "react-toastify";
import { CiImageOn } from "react-icons/ci";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReadAloudBtn } from "@/components/ui/ReadAloudBtn"; // 1. Importar
import {
    Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog.tsx";

const updateAcaoSchema = z.object({
    descricao: z.string().min(3, { message: "Descrição muito curta" }),
    como_participar: z.string().min(3, { message: "Texto muito curto" }),
    link_contato: z.string().optional(),
});

type UpdateAcaoSchema = z.infer<typeof updateAcaoSchema>;

export default function AcaoProfileOng() {

    // Estados
    const [logoURL, setLogoURL] = useState<string>('');
    const [bannerURL, setBannerURL] = useState<string>('');
    const [bannerTimestamp, setBannerTimestamp] = useState(Date.now());
    const [isEditMode, setEditMode] = useState<boolean>(false);
    
    const { id: paramOngId, acaoId } = useParams(); // Renomeei para paramOngId
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const bannerInputRef = useRef<HTMLInputElement | null>(null);

    // 1. Busca Ação (Primeiro buscamos a ação para saber de quem ela é)
    const acaoQuery = useQuery({
        queryKey: ["ong_acao", acaoId],
        queryFn: async (): Promise<Acao> => {
            const { data } = await api.get<Acao>(`/v1/acoes/${acaoId}`);
            try {
                await api.get(`/v1/acoes/${acaoId}/banner`);
                setBannerURL(`/v1/acoes/${acaoId}/banner`);
            } catch (e) { setBannerURL(""); }
            return data;
        }
    });

    const { data: acaoData, refetch } = acaoQuery;

    // 2. CORREÇÃO DO BUG:
    // O ID da ONG agora vem estritamente dos dados da ação, ignorando a URL.
    const ownerOngId = acaoData?.ongId;

    // 3. Busca ONG (Só executa quando tivermos o ID do dono da ação)
    const ongQuery = useQuery({
        queryKey: ["ong_profile", ownerOngId],
        queryFn: async (): Promise<Ong> => {
            const { data } = await api.get<Ong>(`/v1/ong/${ownerOngId}`);
            try {
                await api.get(`/v1/ong/${ownerOngId}/logo`);
                setLogoURL(`/v1/ong/${ownerOngId}/logo`);
            } catch (e) { setLogoURL(""); }
            return data;
        },
        enabled: !!ownerOngId // Só busca se o ID existir
    });

    const { register, handleSubmit, getValues } = useForm<UpdateAcaoSchema>({
        resolver: zodResolver(updateAcaoSchema),
        mode: "onChange",
        values: {
            descricao: acaoData?.descricao || "",
            como_participar: typeof acaoData?.como_participar === 'string' ? acaoData.como_participar : "",
            link_contato: acaoData?.link_contato || "",
        }
    });

    const onSubmit = async () => {
        try {
            await api.put(`/v1/acoes/${acaoId}`, {
                descricao: getValues("descricao"),
                como_participar: getValues("como_participar"),
                link_contato: getValues("link_contato"),
            });
            toast.success("Evento atualizado!");
            setEditMode(false);
            await refetch();
        } catch (e) {
            toast.error("Erro ao atualizar.");
        }
    };

    const handleChangeBanner = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("banner", file);
        try {
            const response = await api.post(`/v1/acoes/${acaoId}/banner`, formData);
            if (response.status === 201) {
                toast.success("Banner alterado!");
                setBannerTimestamp(Date.now());
                setBannerURL(`/v1/acoes/${acaoId}/banner`);
            } else {
                toast.error("Não foi possível salvar a imagem.");
            }
        } catch (error) {
            toast.error("Erro no envio.");
        }
        await refetch();
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/v1/acoes/${acaoId}`);
            await queryClient.invalidateQueries(["ong_acoes", ownerOngId]);
            toast.success("Evento excluído.");
            navigate(`/ong/${ownerOngId}/acoes`);
        } catch (e) {
            toast.error("Erro ao excluir.");
        }
    };

    if (acaoQuery.isLoading) return <div className="min-h-screen bg-white"></div>;

    // Verifica se o usuário logado é o dono (comparando com o ID real da ação)
    const isOwner = localStorage.getItem("ongId") === ownerOngId;
    
    const backgroundCurve = (
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="250" cy="-105" rx="410" ry="410" fill="#2F49F3" />
        </svg>
    );

    const inputClass = "rounded-[12px] border-gray-200 bg-white text-gray-700 shadow-sm focus-visible:ring-blue-600";

    // Função de navegação para o perfil da ONG correta
    const handleNavigateToOng = () => {
        if (ownerOngId) {
            navigate(`/ong/${ownerOngId}`);
        }
    };

    // --- 2. PREPARAR O TEXTO PARA LEITURA ---
    const textoParaLer = `
        Evento: ${acaoData?.nome}. 
        Realizado pela ONG: ${ongQuery.data?.nome || "Parceira"}. 
        Sobre o evento: ${acaoData?.descricao || "Sem descrição"}. 
        Data: ${acaoData?.dia} de ${acaoData?.mes} de ${acaoData?.ano}. 
        Horário: das ${acaoData?.inicio?.replace(':', ' e ')} às ${acaoData?.termino?.replace(':', ' e ')}. 
        Local: ${acaoData?.endereco}, número ${acaoData?.numero}, bairro ${acaoData?.bairro}. 
        Como participar: ${acaoData?.como_participar || "Entre em contato"}.
    `;

    return (
        <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
            
            {/* --- 3. BOTÃO FLUTUANTE DE LEITURA (FIXED) --- */}
            <div className="fixed bottom-10 right-6 z-50">
                <div className="bg-white p-1 rounded-full shadow-xl border-2 border-blue-100">
                    <ReadAloudBtn 
                        textToRead={textoParaLer} 
                        label="Ouvir detalhes do evento" 
                    />
                </div>
            </div>

            {/* HEADER AZUL */}
            <div className="relative w-full pb-20">
                <div className="flex -mt-2 justify-between items-center p-6 relative z-20 text-white">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-blue-700">
                        <FaArrowLeft className="w-6 h-6" />
                    </Button>
                    
                    <img 
                        src="/images/logo-white.svg" 
                        alt="Logo" 
                        className="h-24 w-auto object-contain cursor-pointer absolute left-1/2 -translate-x-1/2"
                        onClick={() => navigate('/')}
                    />

                    {isOwner ? (
                        isEditMode ? (
                            <span onClick={handleSubmit(onSubmit)} className="text-sm font-bold cursor-pointer bg-white text-blue-600 px-4 py-2 rounded-full shadow-sm hover:bg-blue-50 transition">
                                Salvar
                            </span>
                        ) : (
                            <FiEdit className="w-6 h-6 cursor-pointer hover:text-blue-200 transition" onClick={() => setEditMode(true)} />
                        )
                    ) : (
                        <div className="w-10"></div>
                    )}
                </div>
                
                <div className="absolute top-0 left-0 w-full h-[40vh] z-0 pointer-events-none">
                    {backgroundCurve}
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex flex-col -mt-12 items-center relative z-20 px-6">
                
                {/* Avatar da ONG (Clicável) */}
                <div 
                    className="relative mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleNavigateToOng}
                >
                    <Avatar className="w-28 h-28 border-[4px] border-white shadow-lg bg-white">
                        <AvatarImage src={logoURL ? serverURI + logoURL : "/images/invalidLogo.png"} className="object-cover" />
                        <AvatarFallback>ONG</AvatarFallback>
                    </Avatar>
                </div>

                {/* Título e Nome da ONG (Clicável) */}
                <h1 className="text-2xl font-bold text-gray-900 text-center leading-tight">{acaoData?.nome}</h1>
                
                <p 
                    className="text-gray-500 text-sm mt-1 font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                    onClick={handleNavigateToOng}
                >
                    {ongQuery.data?.nome || "Carregando ONG..."}
                </p>

                {/* BANNER */}
                <div className="w-full mt-8 relative">
                    <div className="aspect-video w-full rounded-[22px] overflow-hidden bg-gray-100 shadow-sm relative">
                        {isEditMode && (
                            <div 
                                className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center cursor-pointer transition hover:bg-black/40"
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-md border border-white/50 text-white">
                                    <FiCamera size={24} />
                                </div>
                                <input type="file" hidden ref={bannerInputRef} onChange={handleChangeBanner} />
                            </div>
                        )}

                        {bannerURL ? (
                            <img 
                                src={`${serverURI}${bannerURL}?t=${bannerTimestamp}`} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                                <CiImageOn size={48} />
                            </div>
                        )}
                    </div>
                </div>

                {/* SOBRE O EVENTO */}
                <div className="w-full mt-8 text-left">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">Sobre o Evento</h3>
                    {isEditMode ? (
                        <Textarea 
                            {...register("descricao")} 
                            className={`${inputClass} p-4 min-h-[120px]`} 
                            placeholder="Descreva o evento..." 
                        />
                    ) : (
                        <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                            {acaoData?.descricao || "Sem descrição informada."}
                        </p>
                    )}
                </div>

                {/* METADADOS */}
                <div className="w-full mt-6 bg-gray-50 p-5 rounded-[22px] border border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-gray-700 text-sm">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{`${acaoData?.dia} de ${acaoData?.mes} de ${acaoData?.ano}`}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 text-sm">
                        <GoClock className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{`${acaoData?.inicio} - ${acaoData?.termino}`}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 text-sm">
                        <IoLocationOutline className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium break-words">{`${acaoData?.endereco}, ${acaoData?.numero} - ${acaoData?.bairro}`}</span>
                    </div>
                </div>

                {/* COMO PARTICIPAR */}
                <div className="w-full mt-6 text-left">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">Como participar</h3>
                    {isEditMode ? (
                        <Textarea 
                            {...register("como_participar")} 
                            className={`${inputClass} p-4 min-h-[100px]`} 
                            placeholder="Explique como participar..." 
                        />
                    ) : (
                        <p className="text-gray-600 text-base leading-relaxed">
                            {acaoData?.como_participar || "Entre em contato para saber mais."}
                        </p>
                    )}
                </div>

                {/* BOTÃO PRINCIPAL / EXCLUIR */}
                <div className="w-full mt-10 mb-10">
                    {isEditMode ? (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label>Link para contato (Botão)</Label>
                                <Input 
                                    {...register("link_contato")} 
                                    className={`${inputClass} h-12 px-4`} 
                                    placeholder="https://wa.me/..." 
                                />
                            </div>
                            
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="w-full h-12 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-semibold mt-4 shadow-none">
                                        <FiTrash2 className="mr-2" /> Excluir evento
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[90%] rounded-[22px] bg-white">
                                    <DialogHeader><DialogTitle>Excluir evento?</DialogTitle></DialogHeader>
                                    <p className="text-sm text-gray-500">Esta ação é irreversível.</p>
                                    <DialogFooter className="flex gap-2 mt-4">
                                        <DialogClose asChild><Button variant="outline" className="flex-1 rounded-full">Cancelar</Button></DialogClose>
                                        <Button variant="destructive" className="flex-1 rounded-full bg-red-600" onClick={handleDelete}>Excluir</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                         acaoData?.link_contato && (
                            <Button 
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold shadow-lg shadow-blue-200"
                                onClick={() => window.open(acaoData.link_contato, '_blank')}
                            >
                                Entrar em contato
                            </Button>
                         )
                    )}
                </div>

            </div>
        </div>
    );
}