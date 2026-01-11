import { IoLocationOutline } from "react-icons/io5";
import { ReadAloudBtn } from "./ReadAloudBtn"; 
import { MapPin } from "lucide-react";

interface CardONGProps {
    image?: string;
    nome: string;
    endereco: string;
    descricao?: string;
    publicoAlvo: string[];
    necessidades: string[];
    referencia?: string; // Prop para indicar o bairro de referência (ex: "Próximo a Várzea")
}

const CardONG = ({ image, nome, endereco, publicoAlvo, necessidades, referencia }: CardONGProps) => {
    
    const tags = [...publicoAlvo, ...necessidades];
    
    const textoCausas = tags.length > 0 ? `Atua com: ${tags.join(", ")}.` : "";

    // Junta tudo no texto final para leitura
    const textoParaLer = `ONG: ${nome}. Localizada em: ${endereco || "Endereço não informado"}. ${referencia ? `Próximo a ${referencia}.` : ""} ${textoCausas}`;

    return (
        <div className="flex flex-col gap-3 p-3 border border-[#EFEFF0] rounded-[22px] bg-white shadow-sm hover:shadow-md transition-all w-full h-full relative group overflow-hidden">
            
            {/* --- NOVO: BADGE DE PROXIMIDADE --- */}
            {/* Posicionado no Topo Esquerdo para não bater no botão de áudio */}
            {referencia && (
                <div className="absolute top-0 left-0 bg-blue-600/95 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-br-xl z-20 flex items-center gap-1 shadow-sm pointer-events-none">
                    <MapPin className="w-3 h-3" />
                    Próximo a {referencia}
                </div>
            )}

            {/* Botão de áudio (Mantido no Topo Direito) */}
            <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full shadow-sm p-0.5">
                <ReadAloudBtn textToRead={textoParaLer} label={`Ouvir sobre a ONG ${nome}`} />
            </div>

            {/* Imagem */}
            {image ? (
                <img
                    src={image}
                    alt={`Imagem da ONG ${nome}`}
                    className="h-32 w-full rounded-2xl object-cover" 
                />
            ) : (
                <div className="h-32 w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    Sem imagem
                </div>
            )}

            {/* Conteúdo de Texto */}
            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate pr-2">
                    {nome}
                </h2>

                <div className="flex gap-1.5 items-center">
                    <IoLocationOutline className="text-blue-600 flex-shrink-0 w-4 h-4" />
                    <span className="text-xs text-gray-500 truncate w-full" title={endereco}>
                        {endereco || "Endereço não informado"}
                    </span>
                </div>
            </div>

            {/* Tags (Scrollável horizontalmente se tiver muitas) */}
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