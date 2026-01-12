import { IoLocationOutline } from "react-icons/io5";
import { ReadAloudBtn } from "./ReadAloudBtn"; 
import { MapPin } from "lucide-react"; 

interface CardONGProps {
    image?: string;
    nome: string;
    endereco: string;
    publicoAlvo: string[];
    necessidades: string[];
    referencia?: string;
    
    // Props de evidência
    scoreFinal?: string; 
    scoreOverlap?: string; 
    scoreJaccard?: string; 
    distancia?: string;
    pontoReferencia?: string | null;
}

const CardONG = ({ 
    image, nome, endereco, publicoAlvo, necessidades, referencia,
    scoreFinal, scoreOverlap, scoreJaccard, distancia, pontoReferencia 
}: CardONGProps) => {
    
    const tags = [...publicoAlvo, ...necessidades];
    const textoCausas = tags.length > 0 ? `Atua com: ${tags.join(", ")}.` : "";
    
    // --- LÓGICA DE TEXTO DE DISTÂNCIA ---
    const textoDistancia = distancia && distancia !== '--' 
        ? `Fica a ${distancia} de ${pontoReferencia || 'sua localização'}.` 
        : "";

    // Adicionado textoDistancia na leitura
    const textoParaLer = `OONGUE: ${nome}. Localizada em: ${endereco || "Endereço não informado"}. ${textoDistancia} ${referencia ? `Próximo a ${referencia}.` : ""} ${textoCausas}`;

    return (
        <div className="flex flex-col gap-3 p-3 border border-[#EFEFF0] rounded-[22px] bg-white shadow-sm hover:shadow-md transition-all w-full h-full relative group overflow-hidden pb-9"> 
            
            {/* BADGE DE MATCH */}
            {scoreFinal && parseInt(scoreFinal) > 0 && (
                <div className="absolute top-0 left-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-br-xl z-20 flex items-center gap-1 shadow-sm">
                    ✨ Match: {scoreFinal}%
                </div>
            )}

            <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full shadow-sm p-0.5">
                <ReadAloudBtn textToRead={textoParaLer} label={`Ouvir sobre a ONG ${nome}`} />
            </div>

            {image ? (
                <img src={image} alt={`Imagem da ONG ${nome}`} className="h-32 w-full rounded-2xl object-cover" />
            ) : (
                <div className="h-32 w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
            )}

            <div className="flex flex-col gap-1 px-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight truncate pr-2">{nome}</h2>
                <div className="flex gap-1.5 items-center">
                    <IoLocationOutline className="text-blue-600 flex-shrink-0 w-4 h-4" />
                    <span className="text-xs text-gray-500 truncate w-full" title={endereco}>
                        {endereco || "Endereço não informado"}
                    </span>
                </div>
            </div>

            <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide pb-1 mb-auto">
                {tags.map((item, index) => (
                    <span key={index} className="bg-white border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                        {item}
                    </span>
                ))}
            </div>

            {/* --- RODAPÉ --- */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-100 px-3 py-2 flex justify-between items-center text-[10px] text-gray-500 font-medium">
                <div className="flex items-center gap-3">
                    {/* Distância + Referência */}
                    <span className="flex items-center gap-1" title="Distância Real">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {distancia ? (
                            <>
                                {distancia}
                                {pontoReferencia && <span className="text-gray-400 ml-0.5 max-w-[80px] truncate"> de {pontoReferencia}</span>}
                            </>
                        ) : '--'}
                    </span>

                    <div className="h-3 w-px bg-gray-300"></div>

                    <div className="flex gap-2">
                        <span title="Jaccard (Comparativo)" className="text-gray-400">J: {scoreJaccard || '0%'}</span>
                        <span title="Overlap (Escolhido)" className="text-green-700 font-bold border-b border-green-200">O: {scoreOverlap || '0%'}</span>
                    </div>
                </div>
                
                <span className="text-xs font-bold text-gray-300 cursor-help" title="Algoritmo Híbrido">⚖️</span>
            </div>
        </div>
    );
};

export { CardONG };