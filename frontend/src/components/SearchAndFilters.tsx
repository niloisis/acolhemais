import { Search, MapPin, Heart, Users, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  selectedCauses: string[];
  onCauseChange: (value: string) => void;
  
  selectedRegions: string[];
  onRegionChange: (value: string) => void;

  selectedTargets: string[];
  onTargetChange: (value: string) => void;

  onClear: () => void;
}

export const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  selectedCauses,
  onCauseChange,
  selectedRegions,
  onRegionChange,
  selectedTargets,
  onTargetChange,
  onClear
}: SearchAndFiltersProps) => {
  
  const [causasOptions, setCausasOptions] = useState<string[]>([]);
  const [bairrosOptions, setBairrosOptions] = useState<string[]>([]);
  const [publicoOptions, setPublicoOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [resCausas, resBairros, resPublico] = await Promise.all([
                api.get("/v1/necessidades"),
                api.get("/v1/bairros"),
                api.get("/v1/publico-alvo")
            ]);
            
            setCausasOptions(resCausas.data.map((i: any) => i.tipo || i.nome).sort());
            setBairrosOptions(resBairros.data.map((i: any) => i.nome).sort());
            setPublicoOptions(resPublico.data.map((i: any) => i.tipo || i.nome).sort());
        } catch (error) {
            console.error("Erro ao carregar filtros", error);
        }
    };
    fetchData();
  }, []);

  const hasActiveFilters = selectedCauses.length > 0 || selectedRegions.length > 0 || selectedTargets.length > 0 || searchTerm.length > 0;

  // Estilo inline para esconder scrollbar em navegadores Webkit (Chrome/Safari) e Firefox
  const hideScrollStyle = {
    msOverflowStyle: 'none' as const,  /* IE and Edge */
    scrollbarWidth: 'none' as const,  /* Firefox */
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Barra de Pesquisa */}
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <Input
          placeholder="Pesquisar por nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full border-gray-200 bg-gray-50 h-12 text-sm placeholder:text-sm focus-visible:ring-blue-600 shadow-sm w-full"
        />
      </div>

      {/* Área dos Filtros (Carrossel Horizontal) 
          - flex-nowrap: Impede a quebra de linha
          - overflow-x-auto: Permite rolar lateralmente
          - -mx-4 px-4: Expande a área de rolagem até a borda da tela (mobile feel)
      */}
      <div 
        className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={hideScrollStyle} // Aplica o estilo para esconder a barra
      >
        <style>{`
            /* Esconde scrollbar no Chrome/Safari/Webkit */
            div::-webkit-scrollbar {
                display: none;
            }
        `}</style>
        
        {/* 1. Causas */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`h-9 rounded-full text-xs font-medium border-dashed flex-shrink-0 transition-all
                    ${selectedCauses.length > 0 
                        ? "bg-red-50 border-red-200 text-red-700" 
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                    <Heart className={`w-3 h-3 mr-1.5 ${selectedCauses.length > 0 ? "fill-red-700 text-red-700" : "text-gray-500"}`} />
                    Causas
                    {selectedCauses.length > 0 && (
                        <span className="ml-1.5 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {selectedCauses.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white max-h-80 overflow-y-auto" align="start">
                <DropdownMenuLabel>Filtrar por Causa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {causasOptions.map((causa) => (
                    <DropdownMenuCheckboxItem
                        key={causa}
                        checked={selectedCauses.includes(causa)}
                        onCheckedChange={() => onCauseChange(causa)}
                        className="cursor-pointer"
                    >
                        {causa}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>

        {/* 2. Público Alvo */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`h-9 rounded-full text-xs font-medium border-dashed flex-shrink-0 transition-all
                    ${selectedTargets.length > 0 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                    <Users className={`w-3 h-3 mr-1.5 ${selectedTargets.length > 0 ? "fill-green-700 text-green-700" : "text-gray-500"}`} />
                    Público
                    {selectedTargets.length > 0 && (
                        <span className="ml-1.5 bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {selectedTargets.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white max-h-80 overflow-y-auto" align="start">
                <DropdownMenuLabel>Filtrar por Público</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {publicoOptions.map((publico) => (
                    <DropdownMenuCheckboxItem
                        key={publico}
                        checked={selectedTargets.includes(publico)}
                        onCheckedChange={() => onTargetChange(publico)}
                        className="cursor-pointer"
                    >
                        {publico}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>

        {/* 3. Localização */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`h-9 rounded-full text-xs font-medium border-dashed flex-shrink-0 transition-all
                    ${selectedRegions.length > 0 
                        ? "bg-blue-50 border-blue-200 text-blue-700" 
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                    <MapPin className={`w-3 h-3 mr-1.5 ${selectedRegions.length > 0 ? "fill-blue-700 text-blue-700" : "text-gray-500"}`} />
                    Localização
                    {selectedRegions.length > 0 && (
                        <span className="ml-1.5 bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {selectedRegions.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white max-h-80 overflow-y-auto" align="start">
                <DropdownMenuLabel>Filtrar por Bairro</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {bairrosOptions.map((bairro) => (
                    <DropdownMenuCheckboxItem
                        key={bairro}
                        checked={selectedRegions.includes(bairro)}
                        onCheckedChange={() => onRegionChange(bairro)}
                        className="cursor-pointer"
                    >
                        {bairro}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>

        {/* Botão Limpar (Último item do scroll, aparece só se necessário) */}
        {hasActiveFilters && (
            <>
                {/* Uma barra vertical sutil para separar os filtros do botão limpar */}
                <div className="h-6 w-px bg-gray-200 mx-1 flex-shrink-0" />

                <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={onClear}
                    className="h-9 rounded-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 px-2"
                >
                    <Trash2 className="w-3 h-3 mr-1" /> 
                    Limpar
                </Button>
            </>
        )}
        
        {/* Espaçador final para garantir que o último item não cole na borda direita */}
        <div className="w-2 flex-shrink-0" />
      </div>
    </div>
  );
};