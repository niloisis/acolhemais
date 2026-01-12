import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx";
import { FiEdit, FiSettings, FiCamera, FiCalendar } from "react-icons/fi"; 
import { MdOutlineEmail, MdLocationOn } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { api, serverURI } from "@/utils/api.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ChangeEvent, useRef, useState } from "react";
import { FaInstagram, FaPhone, FaWhatsapp, FaGlobe } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { CiCircleRemove } from "react-icons/ci";
import { RiAddCircleLine } from "react-icons/ri";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

const contactSchema = z.object({
    tipo: z.string().min(1, "Selecione um tipo"),
    valor: z.string().min(2, "Valor inválido"),
});
const descSchema = z.object({ descricao: z.string() });

export default function OngAdminProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // ESTADOS
    const [isEditMode, setEditMode] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false); 
    const [logoTimestamp, setLogoTimestamp] = useState(Date.now()); 

    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Queries
    const { data: ongData, isLoading, refetch } = useQuery(["ong_profile", id], async () => {
        const res = await api.get(`/v1/ong/${id}`);
        return res.data;
    });

    const { register: registerDesc, control } = useForm({ 
        defaultValues: { descricao: ongData?.descricao || "" },
        resolver: zodResolver(descSchema)
    });
    
    const { register: registerContact, handleSubmit: submitContact, setValue: setContactType, reset: resetContact, formState: { isValid } } = useForm({
        resolver: zodResolver(contactSchema),
        mode: "onChange"
    });

    const descriptionWatch = useWatch({ control, name: "descricao", defaultValue: ongData?.descricao });

    // Actions
    const handleUpdateDescription = async () => {
        try {
            await api.put(`/v1/ong/${id}/description`, { description: descriptionWatch });
            setEditMode(false);
            toast.success("Descrição atualizada!");
            refetch();
        } catch { toast.error("Erro ao atualizar"); }
    };

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'logo' | 'image') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append(type === 'logo' ? 'logo' : 'picture', file);

        try {
            await api.post(`/v1/ong/${id}/${type}`, formData);
            
            if (type === 'logo') {
                setLogoTimestamp(Date.now()); 
                toast.success("Logo alterada com sucesso!");
            } else {
                toast.success("Imagem enviada!");
                refetch();
            }
        } catch { toast.error("Erro no envio"); }
    };

    const handleAddContact = async (data: any) => {
        try {
            await api.post(`/v1/ong/${id}/contact`, data);
            resetContact();
            setIsContactOpen(false); 
            refetch();
            toast.success("Contato adicionado!");
        } catch (error) {
            toast.error("Erro ao adicionar contato.");
        }
    };

    const handleDeleteItem = async (itemId: string, type: 'image' | 'contact') => {
        const endpoint = type === 'image' ? `/v1/ong/${itemId}/image` : `/v1/ong/contact/${itemId}`;
        await api.delete(endpoint);
        refetch();
    };

    const backgroundCurve = (
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="250" cy="-60" rx="410" ry="410" fill="#2F49F3" />
        </svg>
    );

    // --- HELPER DE LINKS ---
    const getContactLink = (type: string, value: string) => {
        const upperType = type ? type.toUpperCase() : "";
        const cleanValue = value.trim();

        switch (upperType) {
            case "EMAIL": return `mailto:${cleanValue}`;
            case "WHATSAPP":
                const numbersOnly = cleanValue.replace(/\D/g, '');
                const fullNumber = numbersOnly.length <= 11 ? `55${numbersOnly}` : numbersOnly;
                return `https://wa.me/${fullNumber}`;
            case "TELEFONE": return `tel:${cleanValue.replace(/\D/g, '')}`;
            case "INSTAGRAM":
                const username = cleanValue.replace('@', '').replace('https://instagram.com/', '').replace('/', '');
                return `https://instagram.com/${username}`;
            case "SITE": return cleanValue.startsWith('http') ? cleanValue : `https://${cleanValue}`;
            default: return "#";
        }
    };

    if (isLoading || !ongData) return <ProfileSkeleton />;

    const formatDate = (dateString: string | number) => {
        if (!dateString) return "Data não informada";
        if (typeof dateString === 'number') return `Desde ${dateString}`;
        return `Desde ${new Date(dateString).toLocaleDateString('pt-BR')}`;
    };

    const getIcon = (type: string) => {
        const upperType = type ? type.toUpperCase() : "";
        switch (upperType) {
            case "INSTAGRAM": return <FaInstagram className="text-pink-600" />;
            case "WHATSAPP": return <FaWhatsapp className="text-green-500" />;
            case "TELEFONE": return <FaPhone className="text-gray-600" />;
            case "SITE": return <FaGlobe className="text-blue-500" />;
            default: return <MdOutlineEmail className="text-gray-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
            <div className="relative w-full pb-20">
                
                <div className="flex -mt-10 justify-between items-center p-6 relative z-20 text-white">
                    <FiSettings className="w-6 h-6 cursor-pointer hover:text-blue-200 transition" onClick={() => navigate(`/ong/admin/${id}/config`)} />
                    
                    <img 
                        src={ongData.logo ? `${serverURI}/v1/ong/${id}/logo?t=${logoTimestamp}` : "/images/logo-white.svg"} 
                        alt="Logo ONG" 
                        className="h-24 w-auto object-contain cursor-pointer"
                        onClick={() => navigate('/')}
                    />

                    {isEditMode ? (
                        <span onClick={handleUpdateDescription} className="text-sm font-bold cursor-pointer bg-white text-blue-600 px-4 py-2 rounded-full shadow-sm hover:bg-blue-50 transition">
                            Salvar
                        </span>
                    ) : (
                        <FiEdit className="w-6 h-6 cursor-pointer hover:text-blue-200 transition" onClick={() => setEditMode(true)} />
                    )}
                </div>
                
                <div className="absolute top-0 left-0 w-full h-[40vh] z-0 pointer-events-none">
                    {backgroundCurve}
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex flex-col items-center relative z-20 px-6 -mt-20">
                {/* Avatar / Logo */}
                <div className="relative">
                    <Avatar className="w-28 h-28 border-[5px] border-white shadow-lg bg-white">
                        <AvatarImage 
                            src={`${serverURI}/v1/ong/${id}/logo?t=${logoTimestamp}`} 
                            className="object-cover" 
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-400 text-2xl font-bold">
                            {ongData.nome?.substring(0, 2).toUpperCase() || "ONG"}
                        </AvatarFallback>
                    </Avatar>
                    {isEditMode && (
                        <div className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition border-2 border-white" onClick={() => logoInputRef.current?.click()}>
                            <FiCamera size={16} />
                            <input type="file" hidden ref={logoInputRef} onChange={(e) => handleUpload(e, 'logo')} />
                        </div>
                    )}
                </div>

                {/* Nome */}
                <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">{ongData.nome}</h1>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
                    {[...ongData.publico_alvo, ...ongData.necessidades].map((tag: any, i: number) => (
                        <span key={i} className="bg-white border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
                            {tag.tipo}
                        </span>
                    ))}
                </div>

                {/* Sobre */}
                <div className="w-full mt-10 text-left">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3">Sobre</h3>
                    {isEditMode ? (
                        <Textarea {...registerDesc("descricao")} className="text-base text-gray-700 bg-gray-50 rounded-2xl border-gray-100 focus-visible:ring-blue-500 p-4" rows={6} />
                    ) : (
                        <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
                            {ongData.descricao || "Esta ONG ainda não possui uma descrição."}
                        </p>
                    )}
                </div>

                <div className="w-full mt-6 flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    
                    {/* Data */}
                    <div className="flex items-center gap-3 text-gray-700 text-sm">
                        <FiCalendar className="text-blue-600 w-5 h-5" />
                        <span className="font-medium">{formatDate(ongData.data_criacao)}</span>
                    </div>

                    {/* Endereço Completo */}
                    <div className="flex items-start gap-3 text-gray-700 text-sm">
                        <MdLocationOn className="text-blue-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="font-medium break-words leading-snug">
                            {ongData.endereco || "Endereço não cadastrado"}
                        </span>
                    </div>
                </div>

                {/* Galeria */}
                <div className="w-full mt-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg">Galeria</h3>
                        {isEditMode && (
                            <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 text-sm font-semibold flex items-center hover:underline">
                                <RiAddCircleLine className="mr-1 h-5 w-5" /> Adicionar foto
                            </button>
                        )}
                        <input type="file" hidden ref={fileInputRef} onChange={(e) => handleUpload(e, 'image')} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {ongData.images?.map((imgId: string) => (
                            <div key={imgId} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                                <img src={`${serverURI}/v1/ong-image/${imgId}`} alt="Galeria" className="w-full h-full object-cover" />
                                {isEditMode && (
                                    <button onClick={() => handleDeleteItem(imgId, 'image')} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-white transition">
                                        <CiCircleRemove size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {ongData.images?.length === 0 && <p className="text-gray-400 text-sm col-span-2 text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Sem fotos na galeria.</p>}
                    </div>
                </div>
                
                <div className="w-full mt-8">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-full h-12 text-base font-semibold shadow-md shadow-blue-200/50 transition-all active:scale-95" onClick={() => navigate(`/ong/${id}/acoes`)}>
                        Ver Ações e Eventos
                    </Button>
                </div>

                {/* Contatos */}
                <div className="w-full mt-10 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg">Contatos</h3>
                        {isEditMode && (
                            <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-blue-600 text-sm font-semibold flex items-center hover:underline"><RiAddCircleLine className="mr-1 h-5 w-5" /> Adicionar</button>
                                </DialogTrigger>
                                <DialogContent className="bg-white rounded-2xl w-[88%] max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                                    <DialogHeader><DialogTitle>Novo Contato</DialogTitle></DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Select onValueChange={(v) => setContactType("tipo", v)}>
                                            <SelectTrigger className="rounded-xl border-gray-200 h-12"><SelectValue placeholder="Tipo do contato" /></SelectTrigger>
                                            <SelectContent className="bg-white rounded-xl">
                                                {["EMAIL", "TELEFONE", "WHATSAPP", "INSTAGRAM", "SITE"].map(t => <SelectItem key={t} value={t} className="rounded-lg cursor-pointer">{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input placeholder=" " {...registerContact("valor")} className="rounded-xl border-gray-200 h-12" />
                                    </div>
                                    <DialogFooter><Button onClick={submitContact(handleAddContact)} disabled={!isValid} className="bg-blue-600 hover:bg-blue-700 rounded-full w-full h-12 font-semibold">Salvar Contato</Button></DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                    <div className="space-y-3">
                        {ongData.contatos?.map((c: any) => {
                            const link = getContactLink(c.tipo, c.valor);
                            
                            return (
                                <a 
                                    key={c.id} 
                                    href={link}
                                    target={c.tipo.toUpperCase() !== 'TELEFONE' && c.tipo.toUpperCase() !== 'EMAIL' ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex items-center gap-4 text-gray-800 text-base font-medium">
                                        <div className="text-2xl group-hover:scale-110 transition-transform">{getIcon(c.tipo)}</div>
                                        <span className="break-all group-hover:text-blue-600 transition-colors">{c.valor}</span>
                                    </div>
                                    
                                    {isEditMode ? (
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault(); // Impede o clique no link
                                                handleDeleteItem(c.id, 'contact');
                                            }} 
                                            className="text-gray-400 hover:text-red-500 transition p-1 z-10"
                                        >
                                            <CiCircleRemove size={24} />
                                        </button>
                                    ) : (
                                        <span className="text-gray-300 text-xl font-light group-hover:text-blue-400">›</span>
                                    )}
                                </a>
                            );
                        })}
                        {ongData.contatos?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhum contato cadastrado.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

const ProfileSkeleton = () => (
    <div className="min-h-screen bg-white">
        <Skeleton className="h-48 w-full rounded-b-[40px]" />
        <div className="flex flex-col items-center -mt-16 px-6 relative z-10">
            <Skeleton className="h-28 w-28 rounded-full border-4 border-white" />
            <Skeleton className="h-8 w-3/4 mt-4 rounded-lg" />
            <Skeleton className="h-5 w-1/2 mt-2 rounded-lg" />
            <div className="flex gap-2 mt-6">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="w-full mt-12 space-y-4">
                <Skeleton className="h-6 w-1/4 rounded-lg" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);