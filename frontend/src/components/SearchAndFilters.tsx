import { Search, MapPin, Heart, ListFilter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  causePosition: string;
  onCauseChange: (value: string) => void;
  regionPosition: string;
  onRegionChange: (value: string) => void;
  sortPosition: string;
  onSortChange: (value: string) => void;
}

export const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  causePosition,
  onCauseChange,
  regionPosition,
  onRegionChange,
  sortPosition,
  onSortChange,
}: SearchAndFiltersProps) => {
  
  // Função auxiliar para limpar filtros se precisar
  const clearFilters = () => {
    onCauseChange("");
    onRegionChange("");
    onSortChange("");
    onSearchChange("");
  };

  const hasActiveFilters = causePosition || regionPosition || sortPosition || searchTerm;

  return (
    <div className="flex flex-col gap-3 w-full">
      
      {/* Barra de Pesquisa */}
      <div className="relative w-full">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <Input
          placeholder="Pesquisar ONGs ou Ações..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-full border-gray-200 bg-gray-50 h-10 text-sm placeholder:text-sm focus-visible:ring-blue-600"        />
      </div>

      {/* Área dos Filtros (Selects) */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        
        {/* Filtro de Causas */}
        <Select value={causePosition} onValueChange={onCauseChange}>
          <SelectTrigger className="w-[140px] rounded-full border-gray-200 bg-white text-xs font-medium h-9">
            <div className="flex items-center gap-2">
               <Heart className="w-3 h-3 text-pink-500" />
               <SelectValue placeholder="Causas" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="educacao">Educação</SelectItem>
            <SelectItem value="saude">Saúde</SelectItem>
            <SelectItem value="meio-ambiente">Meio Ambiente</SelectItem>
            <SelectItem value="animais">Animais</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Região */}
        <Select value={regionPosition} onValueChange={onRegionChange}>
          <SelectTrigger className="w-[150px] rounded-full border-gray-200 bg-white text-xs font-medium h-9">
            <div className="flex items-center gap-2">
               <MapPin className="w-3 h-3 text-blue-500" />
               <SelectValue placeholder="Localização" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recife">Recife</SelectItem>
            <SelectItem value="olinda">Olinda</SelectItem>
            <SelectItem value="jaboatao">Jaboatão</SelectItem>
            <SelectItem value="interior">Interior</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Ordenação (Opcional) */}
        <Select value={sortPosition} onValueChange={onSortChange}>
          <SelectTrigger className="w-[130px] rounded-full border-gray-200 bg-white text-xs font-medium h-9">
             <div className="flex items-center gap-2">
               <ListFilter className="w-3 h-3 text-gray-500" />
               <SelectValue placeholder="Ordenar" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Mais Recentes</SelectItem>
            <SelectItem value="antigos">Mais Antigos</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Botão de Limpar (só aparece se tiver filtro) */}
        {hasActiveFilters && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-9 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
            >
                <X className="w-3 h-3 mr-1" /> Limpar
            </Button>
        )}
      </div>
    </div>
  );
};