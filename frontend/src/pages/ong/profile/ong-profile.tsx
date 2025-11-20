import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { IoHomeOutline } from "react-icons/io5";
import { MdArrowForwardIos, MdOutlineEmail } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { api, serverURI } from "@/utils/api.ts";
import { Ong } from "@/pages/ong/@types/Ong.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { useState } from "react";
import { FaInstagram, FaPhone, FaWhatsapp } from "react-icons/fa";
import { z } from "zod";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

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


export default function OngProfile() {

    const [logoURL, setLogoURL] = useState<string>('');
    const { id } = useParams()
    const ongQuery = useQuery(
        {
            queryKey: "ong_profile",
            queryFn: async (): Ong => {
                const { data } = await api.get<Ong>(`/v1/ong/${id}`);
                try {
                    await api.get(`/v1/ong/${id}/logo`)
                    setLogoURL(`/v1/ong/${id}/logo`)
                } catch (e) {
                    setLogoURL("")
                }
                return data
            }
        })
    const { data: ongData } = ongQuery
    const navigate = useNavigate()

    if (ongQuery.isLoading) {
        return (
            <>
                <div className="mt-24 flex w-full flex-col justify-center items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-36 " />
                    <Skeleton className="h-4 w-28 " />
                    <div className="mt-8 flex gap-4">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                </div>
                <div className="py-4 px-4 mt-6">
                    <Skeleton className="w-full h-36 rounded-xl" />
                    <div className="flex gap-4 py-4">
                        <Skeleton className="w-32 h-24 rounded-xl" />
                        <Skeleton className="w-32 h-24 rounded-xl" />
                        <Skeleton className="w-32 h-24 rounded-xl" />
                    </div>
                    <Skeleton className="w-36 h-12 rounded-full" />
                </div>
                <div className="mt-10 flex flex-col content-start items-start gap-4 px-4">
                    <Skeleton className="h-6 w-36 " />
                    <Skeleton className="h-4 w-28 " />
                    <Skeleton className="h-4 w-28 " />
                </div>
            </>
        )
    }

    return (
        <main>
            <header className="bg-[url(/images/circle.svg)] w-full h-52 bg-no-repeat bg-contain">
                <div className="w-full flex justify-between items-center p-2">
                    <Button onClick={() => navigate(`/`)}>
                        <ChevronLeftIcon className="h-6 w-6" />
                    </Button>
                    <img className="h-20 w-20" src="/images/logo-white.svg" onClick={() => navigate("/")}
                        alt={"Logo acolhe+"} />
                    <Button className="invisible">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex items-center justify-center w-full">
                    <input
                        className={"hidden"}
                        type="file"
                    />
                    <Avatar className="w-24 h-24 mt-2 border-2 border-[#2F49F3]">
                        {
                            logoURL ? (
                                <AvatarImage src={serverURI + `/v1/ong/${id}/logo`} />
                            ) : (
                                <AvatarImage src={"/images/invalidLogo.png"} />
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
                        <p className="overflow-scroll text-sm ">
                            {ongData.descricao}
                        </p>
                        <div className="flex items-center justify-start w-full overflow-scroll py-4 gap-3">
                            {
                                ongData?.images.length === 0 && (
                                    <span className="text-sm text-[#61646B]">Não há fotos recentes.</span>
                                )
                            }
                            {
                                ongData?.images.map((imageId, key) => (
                                    <div className={"relative"}>
                                        <img key={key} className="h-32 w-52 max-w-52 max-h-32 rounded-xl"
                                            src={serverURI + `/v1/ong-image/${imageId}`} />
                                    </div>
                                ))
                            }
                        </div>
                        <Button className="mt-2 px-6" onClick={() => navigate(`/ong/${id}/acoes`)}>
                            Eventos e ações <MdArrowForwardIos className="ml-6 h-4 w-4" />
                        </Button>

                    </article>
                    <article className="mt-8 flex flex-col items-start justify-start w-full relative">
                        <h3 className="mb-2 font-medium">CONTATO</h3>
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
                                                    <MdOutlineEmail /> {p.valor}
                                                </div>
                                            );
                                        case "TELEFONE":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaPhone /> {p.valor}
                                                </div>
                                            );
                                        case "SITE":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <IoHomeOutline /> {p.valor}
                                                </div>
                                            );
                                        case "INSTAGRAM":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaInstagram /> {p.valor}
                                                </div>
                                            );
                                        case "WHATSAPP":
                                            return (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaWhatsapp /> {p.valor}
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