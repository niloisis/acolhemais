import { CalendarIcon } from "@radix-ui/react-icons";
import { IoLocationOutline } from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { CiImageOn } from "react-icons/ci";
import { useState } from "react";
import { ReadAloudBtn } from "./ReadAloudBtn"; 

interface CardAcaoProps {
    image?: string;
    nomeAcao: string;
    nomeOng?: string;
    dataAcao: string;
    duracao: string;
    endereco: string;
    publicoAlvo?: string[];
    necessidades?: string[];
}

const CardAcao = ({
    image,
    nomeAcao,
    nomeOng,
    duracao,
    dataAcao,
    endereco,
    publicoAlvo = [],
    necessidades = []
}: CardAcaoProps) => {
    
    const [imageError, setImageError] = useState(false);
    const tags = [...publicoAlvo, ...necessidades];

    // Lógica de leitura (Hífen para "às")
    const duracaoParaLer = duracao ? `das ${duracao.replace(/-/, "às")}` : "Horário a definir";

    const textoParaLer = `Evento: ${nomeAcao}. Organizado por: ${nomeOng || "uma ONG parceira"}. Data: ${dataAcao}. Horário: ${duracaoParaLer}. Local: ${endereco}.`;

    return (
        <div className="flex flex-col gap-3 p-3 border border-[#EFEFF0] rounded-[22px] bg-white shadow-sm hover:shadow-md transition-all w-full cursor-pointer relative group">
            
            {/* Botão de Áudio */}
            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm p-0.5">
                <ReadAloudBtn textToRead={textoParaLer} label={`Ouvir detalhes do evento ${nomeAcao}`} />
            </div>

            {/* Imagem / Placeholder */}
            {!imageError && image ? (
                <img
                    src={image}
                    alt={`Imagem da ação ${nomeAcao}`}
                    className="h-32 w-full rounded-2xl object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="h-32 w-full rounded-2xl object-cover bg-gray-100 flex justify-center items-center border border-dashed border-gray-200">
                    <CiImageOn className="h-10 w-10 text-gray-400" />
                </div>
            )}

            <div className="flex flex-col gap-1 px-1">
                {/* Título */}
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate pr-8">
                    {nomeAcao}
                </h2>

                {/* Nome da ONG */}
                {nomeOng && (
                    <h3 className="text-sm font-medium text-blue-600 mb-1 truncate">
                        {nomeOng}
                    </h3>
                )}

                {/* Info (Data, Hora, Local) */}
                <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex gap-2 items-center text-xs text-gray-500">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>{dataAcao}</span>
                    </div>
                    
                    <div className="flex gap-2 items-center text-xs text-gray-500">
                        <GoClock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{duracao}</span>
                    </div>

                    <div className="flex gap-2 items-center text-xs text-gray-500">
                        <IoLocationOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{endereco}</span>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide pb-1 mt-1">
                {tags.map((item, index) => (
                    <span
                        key={index}
                        className="bg-white border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
};

export { CardAcao };