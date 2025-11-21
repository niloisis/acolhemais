import { Button } from "@/components/ui/button.tsx";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx";

import { MdOutlineEmail, MdLocationOn } from "react-icons/md";

import { FaArrowLeft } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import { useQuery } from "react-query";

import { api, serverURI } from "@/utils/api.ts";

import { Skeleton } from "@/components/ui/skeleton.tsx";

import { useState } from "react";

import { FaInstagram, FaPhone, FaWhatsapp, FaGlobe } from "react-icons/fa";

import { FiCalendar } from "react-icons/fi";



export default function OngProfile() {

    const { id } = useParams();

    const navigate = useNavigate();

   

    // Estado para garantir cache buster na logo se precisar (geralmente não precisa na visão pública, mas mantém consistência)

    const [logoTimestamp] = useState(Date.now());



    const { data: ongData, isLoading } = useQuery(["ong_profile_public", id], async () => {

        const res = await api.get(`/v1/ong/${id}`);

        return res.data;

    });



    if (isLoading || !ongData) return <ProfileSkeleton />;



    // Helpers

    const formatDate = (dateString: string | number) => {
        if (!dateString) return "Data não informada";
        if (typeof dateString === 'number') return `Desde ${dateString}`;
        return `Desde ${new Date(dateString).toLocaleDateString('pt-BR')}`;
    };



    const getIcon = (type: string) => {
        switch (type) {
            case "INSTAGRAM": return <FaInstagram className="text-pink-600" />;
            case "WHATSAPP": return <FaWhatsapp className="text-green-500" />;
            case "TELEFONE": return <FaPhone className="text-gray-600" />;
            case "SITE": return <FaGlobe className="text-blue-500" />;
            default: return <MdOutlineEmail className="text-gray-600" />;
        }
    };

    const backgroundCurve = (
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="250" cy="-60" rx="410" ry="410" fill="#2F49F3" />
        </svg>
    );

    return (

        <div className="min-h-screen bg-white pb-20 overflow-x-hidden">

            {/* --- HEADER E CURVA (Igual Admin, mas sem botões de edição) --- */}
            <div className="relative w-full pb-20">
                <div className="flex -mt-10 justify-between items-center p-6 relative z-20 text-white">
                    {/* Botão Voltar */}
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-blue-700">
                        <FaArrowLeft className="w-6 h-6 cursor-pointer hover:text-blue-200 transition" />
                    </Button>

                   

                    {/* Logo Central */}

                    <img
                        src={ongData.logo ? `${serverURI}/v1/ong/${id}/logo?t=${logoTimestamp}` : "/images/logo-white.svg"}
                        alt="Logo ONG"
                        className="h-24 w-auto object-contain cursor-pointer"
                        onClick={() => navigate('/')}

                    />



                    {/* Espaço Vazio para balancear o layout (Onde ficava o Edit) */}

                    <div className="w-10"></div>

                </div>

               

                <div className="absolute top-0 left-0 w-full h-[40vh] z-0 pointer-events-none">

                    {backgroundCurve}

                </div>

            </div>



            {/* --- CONTEÚDO PRINCIPAL --- */}

            <div className="flex flex-col items-center relative z-20 px-6 -mt-20">

               

                {/* Avatar */}

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

                </div>



                {/* Nome */}

                <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">{ongData.nome}</h1>



                {/* Tags (Pílulas) */}

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

                    <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">

                        {ongData.descricao || "Esta ONG ainda não possui uma descrição."}

                    </p>

                </div>



                {/* Data e Localização */}

                <div className="w-full mt-6 flex flex-col gap-3">

                    <div className="flex items-center gap-3 text-gray-600 text-sm font-medium">

                        <FiCalendar className="text-blue-600 w-5 h-5" />

                        <span>{formatDate(ongData.data_criacao)}</span>

                    </div>



                    <div className="flex items-center gap-3 text-gray-600 text-sm font-medium">

                        <MdLocationOn className="text-blue-600 w-5 h-5 flex-shrink-0" />

                        <span className="break-words">{ongData.endereco || "Endereço não informado"}</span>

                    </div>
                </div>

                {/* Galeria */}
                <div className="w-full mt-10">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">Galeria</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {ongData.images?.map((imgId: string) => (
                            <div key={imgId} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                                <img src={`${serverURI}/v1/ong-image/${imgId}`} alt="Galeria" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {ongData.images?.length === 0 && <p className="text-gray-400 text-sm col-span-2 text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Sem fotos na galeria.</p>}
                    </div>
                </div>

                {/* Botão de Ações */}
                <div className="w-full mt-8">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-full h-12 text-base font-semibold shadow-md shadow-blue-200/50 transition-all active:scale-95" onClick={() => navigate(`/ong/${id}/acoes`)}>
                        Ver Ações e Eventos
                    </Button>
                </div>

                {/* Contatos */}

                <div className="w-full mt-10 mb-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">Contatos</h3>                   

                    <div className="space-y-3">
                        {ongData.contatos?.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-4 text-gray-800 text-base font-medium">
                                    <div className="text-2xl">{getIcon(c.tipo)}</div>
                                    <span className="break-all">{c.valor}</span>
                                </div>
                            </div>
                        ))}
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