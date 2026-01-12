import { Search, MapPin, Heart, Users, Trash2, Sparkles } from "lucide-react";
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
  onRedoTriage?: () => void;
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
  onClear,
  onRedoTriage
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
            
            if(Array.isArray(resCausas.data)) setCausasOptions(resCausas.data.map((i: any) => i.tipo || i.nome).sort());
            if(Array.isArray(resBairros.data)) setBairrosOptions(resBairros.data.map((i: any) => i.nome).sort());
            if(Array.isArray(resPublico.data)) setPublicoOptions(resPublico.data.map((i: any) => i.tipo || i.nome).sort());
        } catch (error) {
            console.error("Erro ao carregar filtros", error);
        }
    };
    fetchData();
  }, []);

  const hasActiveFilters = selectedCauses.length > 0 || selectedRegions.length > 0 || selectedTargets.length > 0 || searchTerm.length > 0;

  const hideScrollStyle = {
    msOverflowStyle: 'none' as const,
    scrollbarWidth: 'none' as const,
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      
      {/* --- LINHA 1: Recomendações e Limpar (Distância 32px) --- */}
      <div className="flex items-center gap-8 w-full min-h-[36px]">
          {/* Recomendações: flex-1 para ocupar o espaço */}
          {onRedoTriage && (
            <Button 
                variant="outline"
                onClick={onRedoTriage}
                className="flex-1 h-9 rounded-full text-xs font-bold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 active:scale-95 transition-all duration-200 shadow-sm justify-center"
            >
                <Sparkles className="w-3 h-3 mr-1.5 fill-blue-300" />
                Recomendações
            </Button>
          )}

          {/* Limpar: Sempre aparente (disabled se inativo) */}
          <Button 
            variant="ghost"
            size="sm" 
            onClick={onClear}
            disabled={!hasActiveFilters} // Desabilita visualmente se não houver filtros
            className={`h-9 rounded-full text-xs flex-shrink-0 px-3 transition-colors duration-200
                ${hasActiveFilters 
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100" 
                    : "text-gray-300 cursor-not-allowed hover:bg-transparent"
                }`}
          >
            <Trash2 className="w-3 h-3 mr-1" /> 
            Limpar
          </Button>
      </div>

      {/* --- LINHA 2: Barra de Pesquisa --- */}
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <Input
          placeholder="Pesquisar por nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full border-gray-200 bg-gray-50 h-12 text-sm placeholder:text-sm focus-visible:ring-blue-600 shadow-sm w-full transition-shadow hover:shadow-md"
        />
      </div>

      {/* --- LINHA 3: Filtros (Causas, Público, Local) --- */}
      <div 
        className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={hideScrollStyle}
      >
        <style>{`
            div::-webkit-scrollbar {
                display: none;
            }
        `}</style>
        
        {/* 1. Causas */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`h-9 rounded-full text-xs font-medium border-dashed flex-shrink-0 transition-all duration-200 active:scale-95
                    ${selectedCauses.length > 0 
                        ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 data-[state=open]:bg-red-100" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 data-[state=open]:bg-gray-100"}`}
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
            <DropdownMenuContent className="w-56 bg-white max-h-80 rounded-[16px] overflow-y-auto p-1 shadow-lg border-gray-100" align="start">
                <DropdownMenuLabel className="px-2 py-1.5">Filtrar por Causa</DropdownMenuLabel>
                <DropdownMenuSeparator className="-mx-1 my-1" />
                {causasOptions.map((causa) => (
                    <DropdownMenuCheckboxItem
                        key={causa}
                        checked={selectedCauses.includes(causa)}
                        onCheckedChange={() => onCauseChange(causa)}
                        className="cursor-pointer rounded-lg mx-1 my-0.5 focus:bg-gray-50"
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
                    className={`h-9 rounded-full text-xs font-medium border-dashed flex-shrink-0 transition-all duration-200 active:scale-95
                    ${selectedTargets.length > 0 
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 data-[state=open]:bg-green-100" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 data-[state=open]:bg-gray-100"}`}
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
            <DropdownMenuContent className="w-56 bg-white max-h-80 rounded-[16px] overflow-y-auto p-1 shadow-lg border-gray-100" align="start">
                <DropdownMenuLabel className="px-2 py-1.5">Filtrar por Público</DropdownMenuLabel>
                <DropdownMenuSeparator className="-mx-1 my-1" />
                {publicoOptions.map((publico) => (
                    <DropdownMenuCheckboxItem
                        key={publico}
                        checked={selectedTargets.includes(publico)}
                        onCheckedChange={() => onTargetChange(publico)}
                        className="cursor-pointer rounded-lg mx-1 my-0.5 focus:bg-gray-50"
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
                    className={`h-9 rounded-full text-xs font-medium border-dashed flex-shrink-0 transition-all duration-200 active:scale-95
                    ${selectedRegions.length > 0 
                        ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 data-[state=open]:bg-blue-100" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 data-[state=open]:bg-gray-100"}`}
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
            <DropdownMenuContent className="w-56 bg-white max-h-80 overflow-y-auto rounded-[16px] p-1 shadow-lg border-gray-100" align="start">
                <DropdownMenuLabel className="px-2 py-1.5">Filtrar por Bairro</DropdownMenuLabel>
                <DropdownMenuSeparator className="-mx-1 my-1" />
                {bairrosOptions.map((bairro) => (
                    <DropdownMenuCheckboxItem
                        key={bairro}
                        checked={selectedRegions.includes(bairro)}
                        onCheckedChange={() => onRegionChange(bairro)}
                        className="cursor-pointer rounded-lg mx-1 my-0.5 focus:bg-gray-50"
                    >
                        {bairro}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="w-2 flex-shrink-0" />
      </div>
    </div>
  );
};