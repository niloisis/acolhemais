import { IoLocationOutline } from "react-icons/io5";

interface CardONGProps {
    image?: string;
    nome: string;
    endereco: string;
    descricao: string; // Mantive na interface para não quebrar quem chama, mas não renderizo
    publicoAlvo: string[];
    necessidades: string[];
}

const CardONG = ({ image, nome, endereco, publicoAlvo, necessidades }: CardONGProps) => {
    
    // Juntei as listas para facilitar a renderização, mas pode manter separado se preferir a ordem específica
    const tags = [...publicoAlvo, ...necessidades];

    return (
        <div className="flex flex-col gap-3 p-3 border border-[#EFEFF0] rounded-[22px] bg-white shadow-sm hover:shadow-md transition-all">
            {image && (
                <img
                    src={image}
                    alt={`Imagem da ONG ${nome}`}
                    className="h-32 w-full rounded-2xl object-cover" 
                />
            )}

            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">
                    {nome}
                </h2>

                <div className="flex gap-1 items-center">
                    {/* Ícone Azul */}
                    <IoLocationOutline className="text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{endereco}</span>
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

export { CardONG };