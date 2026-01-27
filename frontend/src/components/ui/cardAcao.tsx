import { CalendarIcon } from "@radix-ui/react-icons";
import { IoLocationOutline } from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { CiImageOn } from "react-icons/ci";
import { useState, useMemo } from "react";
import { ReadAloudBtn } from "./ReadAloudBtn"; 
import { MapPin } from "lucide-react";

interface CardAcaoProps {
    image?: string;
    nomeAcao: string;
    nomeOng?: string;
    dataAcao: string;
    duracao: string;
    endereco: string;
    publicoAlvo?: string[];
    necessidades?: string[];
    
    // Props para Evidência
    scoreFinal?: string; 
    scoreOverlap?: string; 
    scoreJaccard?: string; 
    distancia?: string;
    pontoReferencia?: string | null;

    // NOVAS PROPS PARA CHECAGEM DE DATA
    dia?: number;
    mes?: string;
    ano?: number;
}

const CardAcao = ({
    image, nomeAcao, nomeOng, duracao, dataAcao, endereco, 
    publicoAlvo = [], necessidades = [],
    scoreFinal, scoreOverlap, scoreJaccard, distancia, pontoReferencia,
    dia, mes, ano
}: CardAcaoProps) => {
    
    const [imageError, setImageError] = useState(false);
    const tags = [...publicoAlvo, ...necessidades];
    
    // Tratamento de texto para leitura
    const duracaoParaLer = duracao ? `das ${duracao.replace(/-/, "às")}` : "Horário a definir";
    
    // --- LÓGICA DE TEXTO DE DISTÂNCIA ---
    const textoDistancia = distancia && distancia !== '--' 
        ? `Fica a ${distancia} de ${pontoReferencia || 'sua localização'}.` 
        : "";

    // Adicionado textoDistancia ao final
    const textoParaLer = `Evento: ${nomeAcao}. Organizado por: ${nomeOng || "uma ONG parceira"}. Data: ${dataAcao}. Horário: ${duracaoParaLer}. Local: ${endereco}. ${textoDistancia}`;

    // --- LÓGICA VISUAL DE PASSADO ---
    const isPast = useMemo(() => {
        if (!dia || !mes || !ano) return false;
        
        const meses: { [key: string]: number } = {
            "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3, "Maio": 4, "Junho": 5,
            "Julho": 6, "Agosto": 7, "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11
        };
        
        const mesKey = mes.charAt(0).toUpperCase() + mes.slice(1).toLowerCase();
        const mesIndex = meses[mesKey] !== undefined ? meses[mesKey] : 0;
        
        const eventDate = new Date(ano, mesIndex, dia, 23, 59, 59);
        const now = new Date();

        return eventDate < now;
    }, [dia, mes, ano]);

    const containerClasses = `flex flex-col gap-3 p-3 border border-[#EFEFF0] rounded-[22px] bg-white shadow-sm hover:shadow-md transition-all w-full h-full relative group overflow-hidden pb-9 
        ${isPast ? 'grayscale opacity-60 hover:opacity-80 hover:grayscale-0' : 'hover:shadow-md'}`;

    return (
        <div className={containerClasses}>
            
            {/* BADGE DE PASSADO OU MATCH */}
            {isPast ? (
                <div className="absolute top-0 left-0 bg-gray-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-br-xl z-20 shadow-sm">
                    Encerrado
                </div>
            ) : (
                scoreFinal && parseInt(scoreFinal) > 0 && (
                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-br-xl z-20 flex items-center gap-1 shadow-sm">
                        ✨ Match: {scoreFinal}%
                    </div>
                )
            )}

            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm p-0.5">
                <ReadAloudBtn textToRead={textoParaLer} label={`Ouvir detalhes do evento ${nomeAcao}`} />
            </div>

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
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate pr-8">
                    {nomeAcao}
                </h2>

                {nomeOng && (
                    <h3 className="text-sm font-medium text-blue-600 mb-1 truncate">
                        {nomeOng}
                    </h3>
                )}

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

            <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide pb-1 mt-1 mb-auto">
                {tags.map((item, index) => (
                    <span
                        key={index}
                        className="bg-white border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
                    >
                        {item}
                    </span>
                ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-100 px-3 py-2 flex justify-between items-center text-[10px] text-gray-500 font-medium rounded-b-[22px]">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Distância Real">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {distancia ? (
                            <>
                                {distancia}
                                {pontoReferencia && (
                                    <span className="text-gray-400 ml-0.5 max-w-[80px] truncate">
                                        de {pontoReferencia}
                                    </span>
                                )}
                            </>
                        ) : '--'}
                    </span>

                    <div className="h-3 w-px bg-gray-300"></div>

                    <div className="flex gap-2">
                        <span title="Jaccard" className="text-gray-400">
                            J: {scoreJaccard || '0%'}
                        </span>
                        <span title="Overlap" className="text-green-700 font-bold border-b border-green-200">
                            O: {scoreOverlap || '0%'}
                        </span>
                    </div>
                </div>
                
                {/*<span className="text-xs font-bold text-gray-300 cursor-help" title="Algoritmo Híbrido">
                    ⚖️
                </span>*/}
            </div>
        </div>
    );
};

export { CardAcao };