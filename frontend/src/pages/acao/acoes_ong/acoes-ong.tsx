import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from "react-query";
import {api, serverURI} from "@/utils/api.ts";
import {Ong} from "@/pages/ong/@types/Ong.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {useEffect, useState} from "react";
import {ChevronLeftIcon} from '@radix-ui/react-icons';
import {CardAcao} from "@/components/ui/cardAcao.tsx";
import CreateAcaoModal from "@/pages/acao/acoes_ong/acao-register-modal.tsx";
import {FiPlusSquare} from "react-icons/fi";
import {Acao} from "@/pages/acao/acoes_ong/@types/Acao.ts";


export default function AcoesOng() {

    const [logoURL, setLogoURL] = useState<string>('');
    const {id} = useParams();
    const navigate = useNavigate();

    const ongQuery = useQuery(
        {
            queryKey: ["ong_profile", id],
            queryFn: async (): Promise<Ong> => {
                const {data} = await api.get<Ong>(`/v1/ong/${id}`);
                try {
                    await api.get(`/v1/ong/${id}/logo`);
                    setLogoURL(`/v1/ong/${id}/logo`);
                } catch (e) {
                    setLogoURL("");
                }
                return data;
            }
        }
    );
    const [banners, setBanners] = useState<{ [key: string]: string }>({});


    const acoesQuery = useQuery(
        {
            queryKey: ["ong_acoes", id],
            queryFn: async (): Promise<Acao[]> => {
                const {data} = await api.get<Acao[]>(`/v1/ong/${id}/acoes`);
                return data;
            }
        }
    );
    const {data: acoesData} = acoesQuery
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

        if (acoesData?.length) {
            fetchBanners();
        }
    }, [acoesData]);
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
                <div className="flex justify-between items-center p-2">
                    <Button
                        onClick={() => navigate(localStorage.getItem("ongId") === id ? `/ong/admin/${id}` : `/ong/${id}`)}>
                        <ChevronLeftIcon className="h-6 w-6"/>
                    </Button>
                    <img className="h-20 w-20" src="/images/logo-white.svg" onClick={() => navigate(`/`)}
                         alt={"Logo acolhe+"}/>
                    {
                        localStorage.getItem("ongId") === id ? (
                            <CreateAcaoModal trigger={
                                <FiPlusSquare className="h-6 w-6"/>
                            }/>
                        ) : (
                            <Button className="invisible">
                                <ChevronLeftIcon className="h-6 w-6"/>
                            </Button>
                        )
                    }

                </div>

                <div className="flex items-center justify-center w-full">
                    <input
                        className={"hidden"}
                        type="file"
                    />
                    <Avatar className="w-24 h-24 mt-2 border-2 border-[#2F49F3]">
                        {
                            logoURL ? (
                                <AvatarImage src={serverURI + `/v1/ong/${id}/logo`}/>
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
                            Ações e Eventos
                        </h1>
                        <p className="text-[#61646B]">
                            {ongQuery.data?.nome}
                        </p>
                    </div>
                </header>
                <div className="flex flex-col gap-4 pb-20 p-4">
                    {
                        acoesData && acoesData.length === 0 && (
                            <p className={"text-[#61646B] w-full text-center py-4"}>Não há ações no momento</p>
                        )
                    }
                    {acoesData?.map(acao => (
                        <div key={acao.id} onClick={() => navigate(`/ong/${id}/acoes/${acao.id}`)}>
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
            </main>
        </main>
    )
}