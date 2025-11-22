import { IoLocationOutline } from "react-icons/io5";

interface CardONGProps {
    image?: string;
    nome: string;
    endereco: string;
    descricao?: string;
    publicoAlvo: string[];
    necessidades: string[];
}

const CardONG = ({ image, nome, endereco, publicoAlvo, necessidades }: CardONGProps) => {
    
    const tags = [...publicoAlvo, ...necessidades];

    return (
        <div className="flex flex-col gap-3 p-3 border border-[#EFEFF0] rounded-[22px] bg-white shadow-sm hover:shadow-md transition-all w-full h-full">
            {image ? (
                <img
                    src={image}
                    alt={`Imagem da ONG ${nome}`}
                    className="h-32 w-full rounded-2xl object-cover" 
                />
            ) : (
                // Placeholder caso não tenha imagem
                <div className="h-32 w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    Sem imagem
                </div>
            )}

            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
                    {nome}
                </h2>

                <div className="flex gap-1.5 items-center">
                    {/* Ícone Azul e fixo (não espreme) */}
                    <IoLocationOutline className="text-blue-600 flex-shrink-0 w-4 h-4" />
                    
                    {/* Endereço com Truncate (Corta com '...' se for muito grande) */}
                    <span className="text-xs text-gray-500 truncate w-full" title={endereco}>
                        {endereco || "Endereço não informado"}
                    </span>
                </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide pb-1 mt-auto">
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

export { CardONG };