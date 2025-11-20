import { Label } from "./label";
import { Button } from "@/components/ui/button";
import { MdPlace } from "react-icons/md";

const img_acao = "/images/test.png";
const nome_acao = "abelheemo lindinho ORORORORORORORORORORORORORORORORORORORORORORORORORORORORORORORORORORO";
const local_acao = "av runeterra, 48";
const publico_alvo_acao = ["jogos", "ORORORORORORORORORORORORORORORORO", "jogos", "jogos", "jogos", "gai  ", "jogos", "jogos", "jogos"];

const CardHome = () => {
  return (
    <div className="border border-gray-300 rounded-xl shadow-lg overflow-hidden p-2">
    <div className="">
        <div className="w-full h-48 overflow-hidden flex items-center justify-center rounded-xl">
        <img src={img_acao} alt="Imagem da ação" className="rounded-xl object-cover w-full h-full" />
        </div>
    </div>
    <div className="overflow-hidden break-words">
        <p className="mt-2 text-lg font-normal">{nome_acao}</p>
        <div className="flex items-center">
        <MdPlace className="text-[#61646B]" />
        <Label>  <a 
    href={`https://www.google.com/maps/search/${encodeURIComponent(local_acao)}`} 
    target="_blank" 
    rel="noopener noreferrer"
    className="font-normal hover:font-bold hover:underline focus:font-bold focus:underline"
  >
    {local_acao}
  </a></Label>
        </div>
    </div>
    <div className="overflow-hidden break-words">
        <div className="flex-row">
        {publico_alvo_acao.map((item, index) => (
            <Button key={index} className="w-auto py-0 bg-[#EFEFF0] text-[#19191B] m-1">
            {item}
            </Button>
        ))}
        </div>
    </div>
    </div>

  );
};

export { CardHome };
