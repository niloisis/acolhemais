import { CalendarIcon } from "@radix-ui/react-icons";
import { IoLocationOutline } from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { CiImageOn } from "react-icons/ci";

interface CardAcaoProps {
    image?: string;
    nomeAcao: string;
    nomeOng?: string; // Deixei opcional para evitar erros se não vier
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
    publicoAlvo = [], // Valor padrão para evitar erros
    necessidades = [] // Valor padrão
}: CardAcaoProps) => {

    // Juntando as tags para renderizar igual ao CardONG
    const tags = [...publicoAlvo, ...necessidades];

    return (
        <div className="flex flex-col gap-3 p-3 border border-[#EFEFF0] rounded-[22px] bg-white shadow-sm hover:shadow-md transition-all">
            
            {/* Imagem ou Placeholder */}
            {image ? (
                <img
                    src={image}
                    alt={`Imagem da ação ${nomeAcao}`}
                    className="h-32 w-full rounded-2xl object-cover"
                />
            ) : (
                <div className="h-32 w-full rounded-2xl object-cover bg-gray-100 flex justify-center items-center border border-dashed border-gray-200">
                    <CiImageOn className="h-10 w-10 text-gray-400" />
                </div>
            )}

            <div className="flex flex-col gap-1 px-1">
                {/* Título da Ação */}
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
                    {nomeAcao}
                </h2>

                {/* Nome da ONG (Subtítulo) */}
                {nomeOng && (
                    <h3 className="text-sm font-semibold text-gray-500 mb-1 truncate">
                        {nomeOng}
                    </h3>
                )}

                {/* Metadados (Data, Hora, Local) */}
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
                        {/* Ícone Azul conforme solicitado */}
                        <IoLocationOutline className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{endereco}</span>
                    </div>
                </div>
            </div>

            {/* Tags com estilo do Perfil (Pílulas brancas com borda azul) */}
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