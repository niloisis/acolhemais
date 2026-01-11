import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/common/Header"; 
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { CardONG } from "@/components/ui/cardONG";
import { CardAcao } from "@/components/ui/cardAcao";
import { serverURI, api } from "@/utils/api";
import TriageModal from "@/components/TriageModal";

export default function HomePage() {
  const navigate = useNavigate();
  
  // ESTADOS (Filtros)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  
  // Estado para controlar se mostramos o Modal
  const [showTriage, setShowTriage] = useState(false);

  // Verifica localStorage ao carregar
  useEffect(() => {
     const savedTriage = localStorage.getItem("user_triage");
     if (!savedTriage) {
         setShowTriage(true);
     } else {
         // (Opcional) Se quiser carregar os filtros salvos ao reabrir o app:
         // const data = JSON.parse(savedTriage);
         // if(data.addressLabel) setSelectedRegions([data.addressLabel]);
         // if(data.interests) setSelectedCauses(data.interests);
     }
  }, []);

  // --- QUERY DE ONGS ---
  const { data: ongList, isLoading } = useQuery(
    ["ongs", searchTerm, selectedCauses, selectedRegions, selectedTargets], 
    async () => {
        const params = new URLSearchParams();

        if(searchTerm) params.append("search", searchTerm);
        
        // Passa os arrays para o backend
        if(selectedCauses.length > 0) params.append("category", selectedCauses.join(','));
        if(selectedRegions.length > 0) params.append("location", selectedRegions.join(','));
        if(selectedTargets.length > 0) params.append("target", selectedTargets.join(','));

        // Se o usuário usou GPS na triagem, poderiamos passar userLat/Lon aqui
        // mas para manter consistência visual com o filtro de bairro, vamos focar no 'location'
        
        const res = await api.get(`/v1/ong?${params.toString()}`);
        return res.data;
    },
    { keepPreviousData: true, staleTime: 1000 * 60 * 5 }
  );

  // --- QUERY AÇÕES ---
  const { data: acoesList } = useQuery(
    ["acoes", selectedCauses, selectedTargets, selectedRegions], 
    async () => {
        const params = new URLSearchParams();
        if(selectedCauses.length > 0) params.append("category", selectedCauses.join(','));
        if(selectedTargets.length > 0) params.append("target", selectedTargets.join(','));
        if(selectedRegions.length > 0) params.append("location", selectedRegions.join(','));
        const res = await api.get(`/v1/acoes?${params.toString()}`);
        return res.data;
    },
    { keepPreviousData: true, staleTime: 1000 * 60 * 5 }
  );

  // --- FUNÇÃO QUE RECEBE DADOS DA TRIAGEM ---
  const handleTriageComplete = (data: any) => {
      // 1. Salva no local storage (o modal já faz isso, mas garantimos)
      localStorage.setItem("user_triage", JSON.stringify(data));
      
      // 2. APLICA NOS FILTROS VISUAIS (Isso satisfaz seu requisito 2 e 3)
      if (data.interests && data.interests.length > 0) {
          setSelectedCauses(data.interests);
      }
      if (data.addressLabel) {
          // Se for GPS, o label pode ser o bairro. Se for manual, é o que ele digitou.
          setSelectedRegions([data.addressLabel]);
      }
      
      setShowTriage(false);
  };

  // Função para reabrir a triagem (Reset total)
  const handleRedoTriage = () => {
      localStorage.removeItem("user_triage");
      setSelectedCauses([]);
      setSelectedRegions([]);
      setSelectedTargets([]);
      setSearchTerm("");
      setShowTriage(true);
  };

  const toggleFilter = (type: string, value: string) => {
      // (Mesma lógica de antes...)
      if (type === 'cause') setSelectedCauses(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
      if (type === 'region') setSelectedRegions(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
      if (type === 'target') setSelectedTargets(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const clearAllFilters = () => {
      setSearchTerm("");
      setSelectedCauses([]);
      setSelectedRegions([]);
      setSelectedTargets([]);
  };

  // Filtro client-side simples para ações (fallback)
  const filteredAcoes = acoesList; 

  return (
    <div className="min-h-screen bg-white">
       <Header />

       {/* MODAL CONECTADO */}
       {showTriage && <TriageModal onComplete={handleTriageComplete} />}

       <main className="px-4 pb-4 pt-0 max-w-3xl mx-auto relative z-10 overflow-x-hidden">
        <Tabs defaultValue="ONGs" className="w-full">
          
          <TabsList className="w-full flex h-auto p-0 bg-transparent border-b border-gray-200 rounded-none mb-6">
             {/* ... Triggers das Tabs ... */}
             <TabsTrigger value="ONGs" className="flex-1 py-4 font-semibold text-gray-500 border-b-4 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">ONGs</TabsTrigger>
             <TabsTrigger value="Ações e Eventos" className="flex-1 py-4 font-semibold text-gray-500 border-b-4 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">Ações</TabsTrigger>
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
                
                // Passamos a função de refazer triagem
                onRedoTriage={handleRedoTriage}
             />
          </div>

          <TabsContent value="ONGs" className="space-y-4 mt-0">
             {/* ... Lista de ONGs com CardONG ... */}
             {ongList?.map((ong: any) => (
                  <div key={ong.id} onClick={() => navigate(`/ong/${ong.id}`)}>
                    <CardONG 
                        {...ong} 
                        // O backend agora manda a referencia baseada no raio!
                        referencia={ong.referencia} 
                        image={ong.images?.[0] ? `${serverURI}/v1/ong-image/${ong.images[0]}` : undefined}
                        publicoAlvo={ong.publico_alvo?.map((p:any) => p.tipo) || []}
                        necessidades={ong.necessidades?.map((n:any) => n.tipo) || []}
                    />
                  </div>
             ))}
          </TabsContent>

          <TabsContent value="Ações e Eventos" className="space-y-4 mt-0">
             {/* ... Lista de Ações ... */}
             {filteredAcoes?.map((acao: any) => (
                 <div key={acao.id} onClick={() => navigate(`/ong/${acao.ongId}/acoes/${acao.id}`)}>
                    <CardAcao 
                        {...acao}
                        image={`${serverURI}/v1/acoes/${acao.id}/banner`}
                        nomeOng={acao.nomeOng || ongList?.find((o:any) => o.id === acao.ongId)?.nome}
                    />
                 </div>
             ))}
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}