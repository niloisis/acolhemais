import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { api, serverURI } from "@/utils/api.ts";
import { Ong } from "@/pages/ong/@types/Ong.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { CardAcao } from "@/components/ui/cardAcao.tsx";
import CreateAcaoModal from "@/pages/acao/acoes_ong/acao-register-modal.tsx";
import { FiPlusSquare } from "react-icons/fi";
import { Acao } from "@/pages/acao/acoes_ong/@types/Acao.ts";

export default function AcoesOng() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Cache Buster para Logo
    const [logoTimestamp] = useState(Date.now());

    // 1. Busca ONG
    const { data: ongData, isLoading: loadingOng } = useQuery(["ong_profile", id], async () => {
        const res = await api.get<Ong>(`/v1/ong/${id}`);
        return res.data;
    });

    // 2. Busca Ações
    const { data: acoesData, isLoading: loadingAcoes } = useQuery(["ong_acoes", id], async () => {
        const res = await api.get<Acao[]>(`/v1/ong/${id}/acoes`);
        return res.data;
    });

    // 3. Busca Banners
    const [banners, setBanners] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        const fetchBanners = async () => {
            const bannersMap: { [key: string]: string } = {};
            await Promise.all(
                acoesData?.map(async (acao) => {
                    try {
                        await api.get(`/v1/acoes/${acao.id}/banner`);
                        bannersMap[acao.id] = `/v1/acoes/${acao.id}/banner`;
                    } catch {
                        bannersMap[acao.id] = "";
                    }
                }) || []
            );
            setBanners(bannersMap);
        };
        if (acoesData?.length) fetchBanners();
    }, [acoesData]);

    if (loadingOng || loadingAcoes) return <ProfileSkeleton />;

    const backgroundCurve = (
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="250" cy="-60" rx="410" ry="410" fill="#2F49F3" />
        </svg>
    );

    const isOwner = localStorage.getItem("ongId") === id;

    return (
        <div className="min-h-screen bg-white -mt-2 pb-20 overflow-x-hidden">
            
            {/* --- HEADER AZUL + CURVA --- */}
            <div className="relative w-full pb-10">
                <div className="flex -mt-0.5 justify-between items-center p-6 relative z-20 text-white">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-blue-700">
                        <FaArrowLeft className="w-8 h-8" /> 
                    </Button>
                    
                    <img 
                        src="/images/logo-white.svg" 
                        alt="Logo Acolhe+" 
                        className="h-24 w-auto object-contain cursor-pointer absolute left-1/2 -translate-x-1/2"
                        onClick={() => navigate('/')}
                    />

                    {isOwner ? (
                        <CreateAcaoModal trigger={
                            <div className="text-white hover:bg-blue-700 rounded-md cursor-pointer transition flex items-center justify-center">
                                <FiPlusSquare className="w-6 h-6" />
                            </div>
                        }/>
                    ) : (
                        <div className="w-10"></div>
                    )}
                </div>
                
                <div className="absolute -top-8 left-0 w-full h-[40vh] z-0 pointer-events-none">
                    {backgroundCurve}
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="flex flex-col items-center relative z-20 px-6">
                
                {/* Avatar (Imagem de perfil da ONG) */}
                <div className="relative">
                    <Avatar className="w-28 h-28 border-[5px] border-white shadow-lg bg-white">
                        <AvatarImage 
                            src={`${serverURI}/v1/ong/${id}/logo?t=${logoTimestamp}`}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-400 text-2xl font-bold">
                            {ongData?.nome?.substring(0, 2).toUpperCase() || "ONG"}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Títulos (Ordem alterada conforme solicitado) */}
                <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">{ongData?.nome || "Nome da ONG"}</h1>
                <p className="text-gray-500 text-m mt-1 font-medium text-center">Ações e Eventos</p>

                {/* Lista de Cards */}
                <div className="w-full mt-8 flex flex-col gap-4 pb-20">
                    {acoesData && acoesData.length === 0 && (
                        <div className="text-center py-10 flex flex-col items-center">
                            <p className="text-gray-400 text-sm">Não há ações cadastradas no momento.</p>
                        </div>
                    )}

                    {acoesData?.map(acao => (
                        <div key={acao.id} onClick={() => navigate(`/ong/${id}/acoes/${acao.id}`)} className="cursor-pointer transition-transform hover:scale-[1.01]">
                            <CardAcao
                                image={(banners[acao.id] ? serverURI + banners[acao.id] : "")}
                                nomeAcao={acao.nome}
                                dataAcao={`${acao.dia} de ${acao.mes} de ${acao.ano}`}
                                duracao={`${acao.inicio} - ${acao.termino}`}
                                endereco={`${acao.endereco}, ${acao.numero} - ${acao.bairro}`}
                            />
                        </div>
                    ))}
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
            <Skeleton className="h-8 w-40 mt-4 rounded-lg" />
            <div className="w-full mt-8 space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);