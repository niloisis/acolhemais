import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/common/Header"; 
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { CardONG } from "@/components/ui/cardONG";
import { CardAcao } from "@/components/ui/cardAcao";
import { serverURI, api } from "@/utils/api";
import TriageModal from "@/components/TriageModal";

export default function HomePage() {
  const navigate = useNavigate();
  
  // --- 1. PERSISTÊNCIA ---
  const getStoredState = (key: string, defaultVal: any) => {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultVal;
  };

  const [searchTerm, setSearchTerm] = useState(() => getStoredState("filter_search", ""));
  const [selectedCauses, setSelectedCauses] = useState<string[]>(() => getStoredState("filter_causes", []));
  const [selectedRegions, setSelectedRegions] = useState<string[]>(() => getStoredState("filter_regions", []));
  const [selectedTargets, setSelectedTargets] = useState<string[]>(() => getStoredState("filter_targets", []));
  const [showTriage, setShowTriage] = useState(false);

  useEffect(() => { sessionStorage.setItem("filter_search", JSON.stringify(searchTerm)); }, [searchTerm]);
  useEffect(() => { sessionStorage.setItem("filter_causes", JSON.stringify(selectedCauses)); }, [selectedCauses]);
  useEffect(() => { sessionStorage.setItem("filter_regions", JSON.stringify(selectedRegions)); }, [selectedRegions]);
  useEffect(() => { sessionStorage.setItem("filter_targets", JSON.stringify(selectedTargets)); }, [selectedTargets]);

  // --- 2. TRIAGEM ---
  useEffect(() => {
     const savedTriage = localStorage.getItem("user_triage");
     const hasClearedFilters = sessionStorage.getItem("user_cleared_filters");

     if (savedTriage && !hasClearedFilters) {
         const data = JSON.parse(savedTriage);
         const areFiltersEmpty = selectedCauses.length === 0 && selectedRegions.length === 0 && selectedTargets.length === 0 && searchTerm === "";
         
         if (areFiltersEmpty) {
             if (data.interests?.length > 0) setSelectedCauses(data.interests);
             if (data.addressLabel) setSelectedRegions([data.addressLabel]);
         }
     }
  }, []); 

  // --- 3. QUERY ONGS ---
  const { data: ongList, isLoading: loadingOngs } = useQuery(
    ["ongs", searchTerm, selectedCauses, selectedRegions, selectedTargets], 
    async () => {
        const params = new URLSearchParams();
        const savedTriage = localStorage.getItem("user_triage");
        const triageData = savedTriage ? JSON.parse(savedTriage) : null;

        if(searchTerm) params.append("search", searchTerm);
        if(selectedCauses.length > 0) params.append("category", selectedCauses.join(','));
        if(selectedTargets.length > 0) params.append("target", selectedTargets.join(','));
        if(selectedRegions.length > 0) params.append("location", selectedRegions.join(','));

        if (selectedRegions.length === 0 && triageData?.lat) {
            params.append("userLat", String(triageData.lat));
            params.append("userLon", String(triageData.lon));
        }

        const res = await api.get(`/v1/ong?${params.toString()}`);
        return res.data;
    },
    { keepPreviousData: true, staleTime: 1000 * 60 * 5 }
  );

  // --- 4. QUERY AÇÕES ---
  const { data: acoesList, isLoading: loadingAcoes } = useQuery(
    ["acoes", selectedCauses, selectedTargets, selectedRegions, searchTerm], 
    async () => {
        const params = new URLSearchParams();
        const savedTriage = localStorage.getItem("user_triage");
        const triageData = savedTriage ? JSON.parse(savedTriage) : null;

        if(searchTerm) params.append("search", searchTerm);
        if(selectedCauses.length > 0) params.append("category", selectedCauses.join(','));
        if(selectedTargets.length > 0) params.append("target", selectedTargets.join(','));
        if(selectedRegions.length > 0) params.append("location", selectedRegions.join(','));
        
        // Envia GPS para Ações também
        if (selectedRegions.length === 0 && triageData?.lat) {
            params.append("userLat", String(triageData.lat));
            params.append("userLon", String(triageData.lon));
        }

        const res = await api.get(`/v1/acoes?${params.toString()}`);
        return res.data;
    },
    { keepPreviousData: true, staleTime: 1000 * 60 * 5 }
  );

  // --- HANDLERS ---
  const handleTriageComplete = (data: any) => {
      localStorage.setItem("user_triage", JSON.stringify(data));
      sessionStorage.removeItem("user_cleared_filters");
      if (data.interests && data.interests.length > 0) setSelectedCauses(data.interests);
      if (data.addressLabel) setSelectedRegions([data.addressLabel]);
      setShowTriage(false);
  };

  const handleRedoTriage = () => {
      localStorage.removeItem("user_triage");
      sessionStorage.clear();
      setSearchTerm("");
      setSelectedCauses([]);
      setSelectedRegions([]);
      setSelectedTargets([]);
      setShowTriage(true);
  };

  const toggleFilter = (type: 'cause' | 'region' | 'target', value: string) => {
      let setList: any;
      let currentList: string[] = [];
      if (type === 'cause') { setList = setSelectedCauses; currentList = selectedCauses; }
      if (type === 'region') { setList = setSelectedRegions; currentList = selectedRegions; }
      if (type === 'target') { setList = setSelectedTargets; currentList = selectedTargets; }

      if (currentList.includes(value)) setList(currentList.filter(item => item !== value)); 
      else setList([...currentList, value]); 
  };

  const clearAllFilters = () => {
      sessionStorage.setItem("user_cleared_filters", "true");
      setSearchTerm("");
      setSelectedCauses([]);
      setSelectedRegions([]);
      setSelectedTargets([]);
  };

  // --- REMOVIDO: ---
  // A lógica antiga que tentava adivinhar o label foi deletada.
  // const getReferenceLabel = ... (DELETE)

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
       {showTriage && <TriageModal onComplete={handleTriageComplete} onClose={() => setShowTriage(false)} />}

       <main className="px-4 pb-4 pt-0 max-w-3xl mx-auto relative z-10 overflow-x-hidden">

        <Tabs defaultValue="ONGs" className="w-full">
          <TabsList className="w-full flex h-auto p-0 bg-transparent border-b border-gray-100 rounded-none mb-6">
            <TabsTrigger 
                value="ONGs" 
                className="flex-1 rounded-none bg-transparent py-4 text-base font-semibold text-gray-500 border-b-2 border-transparent transition-colors hover:text-blue-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none"
            >
              ONGs
            </TabsTrigger>
            <TabsTrigger 
                value="Ações e Eventos" 
                className="flex-1 rounded-none bg-transparent py-4 text-base font-semibold text-gray-500 border-b-2 border-transparent transition-colors hover:text-blue-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:outline-none"
            >
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
                onClear={clearAllFilters}
                onRedoTriage={handleRedoTriage}
             />
          </div>

          <TabsContent value="ONGs" className="space-y-4 mt-0">
            {ongList?.length === 0 && (
              <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">Nenhuma ONG encontrada.</p>
                  <p className="text-gray-400 text-sm">Tente ajustar seus filtros.</p>
              </div>
            )}

            {ongList?.map((ong: any) => (
              <div key={ong.id} className="cursor-pointer hover:scale-[1.01] transition-transform" 
                   onClick={() => navigate(`/ong/${ong.id}`)}>
                <CardONG
                  image={ong.images?.length > 0 ? `${serverURI}/v1/ong-image/${ong.images[0]}` : undefined}
                  nome={ong.nome}
                  endereco={ong.endereco}
                  publicoAlvo={ong.publico_alvo?.map((p: any) => p.tipo) || []}
                  necessidades={ong.necessidades?.map((n: any) => n.tipo) || []}
                  
                  // Props de evidência
                  scoreFinal={ong.scoreFinal}
                  scoreOverlap={ong.scoreOverlap}
                  scoreJaccard={ong.scoreJaccard}
                  
                  // AGORA ESTÁ CORRETO:
                  // Usamos o 'ong.distancia' (já calculado e ordenado pelo back)
                  distancia={ong.distancia}
                  // Usamos o 'ong.pontoReferencia' (o nome do bairro vencedor que veio do back)
                  pontoReferencia={ong.pontoReferencia} 
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="Ações e Eventos" className="space-y-4 mt-0">
            {acoesList?.length === 0 && <p className="text-gray-500 text-center py-48">Nenhuma ação encontrada.</p>}
            {acoesList?.map((acao: any) => {
               const ongName = acao.nomeOng || ongList?.find((o:any) => o.id === acao.ongId)?.nome;
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
                      endereco={`${acao.logradouro || acao.endereco}, ${acao.numero} - ${acao.bairro?.nome || acao.bairro}`}
                      
                      // Props de evidência AÇÕES
                      scoreFinal={acao.scoreFinal}
                      scoreOverlap={acao.scoreOverlap}
                      scoreJaccard={acao.scoreJaccard}
                      distancia={acao.distancia}
                      
                      // Correção aqui também:
                      pontoReferencia={acao.pontoReferencia}
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