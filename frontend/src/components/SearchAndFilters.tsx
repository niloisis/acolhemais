import { Search, MapPin, Heart, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Opções
const causasOptions = [
    "Assistência Social", "Educação", "Saúde", "Saúde Mental", 
    "Meio Ambiente", "Combate à Pobreza", "Cultura e Arte", 
    "Igualdade de Gênero", "Direitos Humanos", "Justiça Social", 
    "Esporte e Lazer", "Animais", "Comunidade", "Emergências", "Emprego"
].sort();

const bairrosRecife = [
    "Boa Viagem", "Santo Amaro", "Derby", "Espinheiro", "Graças", 
    "Casa Forte", "Várzea", "Madalena", "Torre", "Casa Amarela", 
    "Encruzilhada", "Rosarinho", "Jaqueira", "Cordeiro", "Iputinga", "Recife Antigo"
].sort();

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  // Agora recebem arrays de strings
  selectedCauses: string[];
  onCauseChange: (value: string) => void; // Função que adiciona/remove
  
  selectedRegions: string[];
  onRegionChange: (value: string) => void; // Função que adiciona/remove

  onClear: () => void;
}

export const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  selectedCauses,
  onCauseChange,
  selectedRegions,
  onRegionChange,
  onClear,
}: SearchAndFiltersProps) => {
  
  const hasActiveFilters = selectedCauses.length > 0 || selectedRegions.length > 0 || searchTerm.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      
      {/* Barra de Pesquisa */}
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <Input
          placeholder="Pesquisar por nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full border-gray-200 bg-gray-50 h-12 text-sm placeholder:text-sm focus-visible:ring-blue-600"
        />
      </div>

      {/* Área dos Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
        
        {/* Dropdown Causas (Multi-Select) */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`h-9 rounded-full text-xs font-medium border-dashed ${selectedCauses.length > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-300 text-gray-600"}`}
                >
                    <Heart className={`w-3 h-3 mr-2 ${selectedCauses.length > 0 ? "fill-blue-700" : ""}`} />
                    Causas
                    {selectedCauses.length > 0 && (
                        <span className="ml-1 bg-blue-200 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full">
                            {selectedCauses.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white" align="start">
                <DropdownMenuLabel>Filtrar por Causa</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-y-auto">
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
                </div>
            </DropdownMenuContent>
        </DropdownMenu>

        {/* Dropdown Localização (Multi-Select) */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`h-9 rounded-full text-xs font-medium border-dashed ${selectedRegions.length > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "border-gray-300 text-gray-600"}`}
                >
                    <MapPin className={`w-3 h-3 mr-2 ${selectedRegions.length > 0 ? "fill-blue-700" : ""}`} />
                    Localização
                    {selectedRegions.length > 0 && (
                        <span className="ml-1 bg-blue-200 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full">
                            {selectedRegions.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white" align="start">
                <DropdownMenuLabel>Filtrar por Bairro</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-y-auto">
                    {bairrosRecife.map((bairro) => (
                        <DropdownMenuCheckboxItem
                            key={bairro}
                            checked={selectedRegions.includes(bairro)}
                            onCheckedChange={() => onRegionChange(bairro)}
                            className="cursor-pointer"
                        >
                            {bairro}
                        </DropdownMenuCheckboxItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>

        {/* Botão Limpar Inteligente */}
        <Button 
            variant="outline"
            size="sm" 
            onClick={onClear}
            disabled={!hasActiveFilters} // Desativado por padrão
            className={`h-9 rounded-full text-xs transition-all border-dashed
                ${hasActiveFilters 
                    ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white" // Ativo (Vermelhinho)
                    : "border-transparent text-gray-300 bg-transparent" // Inativo (Invisível/Cinza)
                }
            `}
        >
            <X className="w-3 h-3 mr-1" /> Limpar
        </Button>
      </div>
    </div>
  );
};