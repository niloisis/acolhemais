import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/common/Header"; 
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { CardONG } from "@/components/ui/cardONG";
import { CardAcao } from "@/components/ui/cardAcao";
import { serverURI, api } from "@/utils/api";

export default function HomePage() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  // --- QUERY DE ONGS ---
  const { data: ongList, isLoading: loadingOngs } = useQuery(
    ["ongs", searchTerm, selectedCauses, selectedRegions, selectedTargets], 
    async () => {
        const params = new URLSearchParams();
        
        if(searchTerm) params.append("location", searchTerm);

        // MUDANÇA: Usamos join(',') para mandar todas as opções selecionadas
        if(selectedCauses.length > 0) params.append("category", selectedCauses.join(','));
        if(selectedRegions.length > 0 && !searchTerm) params.append("location", selectedRegions.join(','));
        if(selectedTargets.length > 0) params.append("target", selectedTargets.join(','));

        const res = await api.get(`/v1/ong?${params.toString()}`);
        return res.data;
    },
    { keepPreviousData: true }
  );

  // ... (useQuery de acoes igual ao anterior) ...
  const { data: acoesList, isLoading: loadingAcoes } = useQuery(
    ["acoes"],
    async () => {
        const res = await api.get("/v1/acoes");
        return res.data;
    }
  );

  // Toggle genérico
  const toggleFilter = (type: 'cause' | 'region' | 'target', value: string) => {
      let setList: any;
      let currentList: string[] = [];

      if (type === 'cause') { setList = setSelectedCauses; currentList = selectedCauses; }
      if (type === 'region') { setList = setSelectedRegions; currentList = selectedRegions; }
      if (type === 'target') { setList = setSelectedTargets; currentList = selectedTargets; }

      if (currentList.includes(value)) {
          setList(currentList.filter(item => item !== value)); 
      } else {
          setList([...currentList, value]); 
      }
  };

  const clearAllFilters = () => {
      setSearchTerm("");
      setSelectedCauses([]);
      setSelectedRegions([]);
      setSelectedTargets([]);
  };


  // ... (filtro de ações igual) ...
  const filteredAcoes = acoesList?.filter((acao: any) => {
    // 1. Texto
    const matchesSearch = acao.nome.toLowerCase().includes(searchTerm.toLowerCase());
    // 2. Região
    const matchesRegion = selectedRegions.length === 0 || 
        selectedRegions.some(region => acao.endereco?.toLowerCase().includes(region.toLowerCase()));
    
    return matchesSearch && matchesRegion;
  });

  if (loadingOngs || loadingAcoes) {
    return (
      <div className="min-h-screen bg-gray-50">
         <Header />
         <div className="p-4 space-y-4 max-w-3xl mx-auto mt-4">
            <Skeleton className="h-12 w-full rounded-full" />
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

        <main className="px-4 pb-4 pt-0 max-w-3xl mx-auto relative z-10 overflow-x-hidden">        <Tabs defaultValue="ONGs" className="w-full">
          {/* ... TabsList igual ... */}
          <TabsList className="w-full flex h-auto p-0 bg-transparent border-b border-gray-200 rounded-none mb-6">
            <TabsTrigger value="ONGs" className="flex-1 rounded-none bg-transparent py-4 text-base font-semibold text-gray-500 border-b-4 border-transparent transition-all hover:text-blue-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              ONGs
            </TabsTrigger>
            <TabsTrigger value="Ações e Eventos" className="flex-1 rounded-none bg-transparent py-4 text-base font-semibold text-gray-500 border-b-4 border-transparent transition-all hover:text-blue-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Ações e Eventos
            </TabsTrigger>
          </TabsList>

          <div className="rounded-xl mb-4 -mt-2">
             <SearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                
                selectedCauses={selectedCauses}
                onCauseChange={(v) => toggleFilter('cause', v)}
                
                selectedRegions={selectedRegions}
                onRegionChange={(v) => toggleFilter('region', v)}

                selectedTargets={selectedTargets}
                onTargetChange={(v) => toggleFilter('target', v)}
                
                onClear={clearAllFilters} // Limpa tudo de uma vez
             />
          </div>

          <TabsContent value="ONGs" className="space-y-4 mt-0">
            {ongList?.length === 0 && (
              <p className="text-gray-500 text-center py-48">Nenhuma ONG encontrada com esses filtros.</p>
            )}

            {ongList?.map((ong: any) => (
              <div key={ong.id} className="cursor-pointer hover:scale-[1.01] transition-transform" 
                   onClick={() => navigate(localStorage.getItem("ongId") === ong.id ? `/ong/admin/${ong.id}` : `/ong/${ong.id}`)}>
                <CardONG
                  image={ong.images?.length > 0 ? `${serverURI}/v1/ong-image/${ong.images[0]}` : undefined}
                  nome={ong.nome}
                  endereco={ong.endereco}
                  descricao={ong.descricao}
                  publicoAlvo={ong.publico_alvo?.map((p: any) => p.tipo) || []}
                  necessidades={ong.necessidades?.map((n: any) => n.tipo) || []}
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="Ações e Eventos" className="space-y-4 mt-0">
            {filteredAcoes?.length === 0 && (
              <p className="text-gray-500 text-center py-48">Nenhuma ação encontrada.</p>
            )}
            
            {filteredAcoes?.map((acao: any) => {
               const ongName = acao.nomeOng || ongList?.find((o:any) => o.id === acao.ongId)?.nome;
               
               // --- CORREÇÃO DA IMAGEM DA AÇÃO ---
               // Verifique se sua rota no backend é /v1/acao/:id/banner ou algo similar
               // Baseado no seu Controller anterior: static async getBanner(req: Request, res: Response)
               // Geralmente é mapeado para GET /v1/acoes/:id/banner
               const bannerUrl = `${serverURI}/v1/acoes/${acao.id}/banner`;

               return (
                  <div key={acao.id} className="cursor-pointer hover:scale-[1.01] transition-transform" 
                       onClick={() => navigate(`/ong/${acao.ongId || 'guest'}/acoes/${acao.id}`)}>
                    <CardAcao
                      image={bannerUrl} 
                      nomeAcao={acao.nome}
                      nomeOng={ongName}
                      dataAcao={`${acao.dia} de ${acao.mes} de ${acao.ano}`}
                      duracao={`${acao.inicio} - ${acao.termino}`}
                      endereco={`${acao.logradouro || acao.endereco}, ${acao.numero} - ${acao.bairro}`}
                    />
                  </div>
               )
            })}
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}