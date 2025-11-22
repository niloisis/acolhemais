import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/common/Header"; 
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { CardONG } from "@/components/ui/cardONG";
import { CardAcao } from "@/components/ui/cardAcao";
import { useOngs, useAcoes } from "@/hooks/useHomeData"; 
import { serverURI } from "@/utils/api";

export default function HomePage() {
  const navigate = useNavigate();
  
  // ESTADOS DE FILTRO (Arrays para múltipla escolha)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Hooks de Dados
  const { data: ongList, isLoading: loadingOngs } = useOngs();
  const { data: acoesList, isLoading: loadingAcoes } = useAcoes();

  // Função Toggle (Adicionar/Remover filtro)
  const toggleFilter = (type: 'cause' | 'region', value: string) => {
      const setList = type === 'cause' ? setSelectedCauses : setSelectedRegions;
      const currentList = type === 'cause' ? selectedCauses : selectedRegions;

      if (currentList.includes(value)) {
          setList(currentList.filter(item => item !== value)); // Remove
      } else {
          setList([...currentList, value]); // Adiciona
      }
  };

  const clearFilters = () => {
      setSearchTerm("");
      setSelectedCauses([]);
      setSelectedRegions([]);
  };

  // --- LÓGICA DE FILTROS ONGS ---
  const filteredOngs = ongList?.filter((ong) => {
    // 1. Texto (Busca por nome)
    const matchesSearch = ong.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Causas (Se houver causas selecionadas, a ONG deve ter Pelo Menos UMA delas)
    const matchesCause = selectedCauses.length === 0 || 
        ong.necessidades?.some(n => selectedCauses.includes(n.tipo)) || 
        ong.publico_alvo?.some(p => selectedCauses.includes(p.tipo));

    // 3. Região (Se houver regiões, o endereço deve conter o texto da região/bairro)
    const matchesRegion = selectedRegions.length === 0 || 
        selectedRegions.some(region => ong.endereco?.toLowerCase().includes(region.toLowerCase()));

    return matchesSearch && matchesCause && matchesRegion;
  });

  // --- LÓGICA DE FILTROS AÇÕES ---
  const filteredAcoes = acoesList?.filter((acao) => {
    // 1. Texto
    const matchesSearch = acao.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Região (Baseado no ENDEREÇO DA AÇÃO)
    const matchesRegion = selectedRegions.length === 0 || 
        selectedRegions.some(region => acao.endereco?.toLowerCase().includes(region.toLowerCase()));

    // 3. Causa (Baseado na ONG Organizadora)
    let matchesCause = true;
    if (selectedCauses.length > 0) {
        // Tenta achar a ONG pai na lista já carregada
        const parentOng = ongList?.find(o => o.id === acao.ongId || o.nome === acao.nomeOng);
        
        if (parentOng) {
             matchesCause = 
                parentOng.necessidades?.some(n => selectedCauses.includes(n.tipo)) || 
                parentOng.publico_alvo?.some(p => selectedCauses.includes(p.tipo));
        } else {
            // Se não achou a ONG pai, por segurança não mostra se tiver filtro de causa ativo
            // (Ou mude para 'true' se quiser mostrar ações órfãs)
            matchesCause = false; 
        }
    }

    return matchesSearch && matchesRegion && matchesCause;
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

      <main className="p-4 max-w-3xl mx-auto -mt-4 relative z-10">
        <Tabs defaultValue="ONGs" className="w-full">

          <TabsList className="w-full flex h-auto p-0 bg-transparent border-b border-gray-200 rounded-none mb-6">
            
            <TabsTrigger 
              value="ONGs" 
              className="flex-1 rounded-none bg-transparent py-4 text-base font-semibold text-gray-500 border-b-4 border-transparent transition-all hover:text-blue-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
            >
              ONGs
            </TabsTrigger>
            
            <TabsTrigger 
              value="Ações e Eventos" 
              className="flex-1 rounded-none bg-transparent py-4 text-base font-semibold text-gray-500 border-b-4 border-transparent transition-all hover:text-blue-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
            >
              Ações e Eventos
            </TabsTrigger>

          </TabsList>

          {/* FILTROS (Agora usando a versão multi-select) */}
          <div className="rounded-xl mb-4 -mt-2">
             <SearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                
                // Props novas para Multi-Select
                selectedCauses={selectedCauses}
                onCauseChange={(v) => toggleFilter('cause', v)}
                
                selectedRegions={selectedRegions}
                onRegionChange={(v) => toggleFilter('region', v)}
                
                onClear={clearFilters}
             />
          </div>

          {/* CONTEÚDO TAB: ONGs */}
          <TabsContent value="ONGs" className="space-y-4 mt-0">
            {filteredOngs?.length === 0 && (
              <p className="text-gray-500 text-center py-48">Nenhuma ONG encontrada.</p>
            )}

            {filteredOngs?.map((ong) => (
              <div key={ong.id} className="cursor-pointer hover:scale-[1.01] transition-transform" 
                   onClick={() => navigate(localStorage.getItem("ongId") === ong.id ? `/ong/admin/${ong.id}` : `/ong/${ong.id}`)}>
                <CardONG
                  image={ong.images?.length > 0 ? `${serverURI}/v1/ong-image/${ong.images[0]}` : undefined}
                  nome={ong.nome}
                  endereco={ong.endereco}
                  descricao={ong.descricao}
                  publicoAlvo={ong.publico_alvo?.map((p) => p.tipo) || []}
                  necessidades={ong.necessidades?.map((n) => n.tipo) || []}
                />
              </div>
            ))}
          </TabsContent>

          {/* CONTEÚDO TAB: AÇÕES */}
          <TabsContent value="Ações e Eventos" className="space-y-4 mt-0">
            {filteredAcoes?.length === 0 && (
              <p className="text-gray-500 text-center py-48">Nenhuma ação encontrada.</p>
            )}
            
            {filteredAcoes?.map((acao) => {
               // Pega o nome da ONG para exibir no card (se não vier na ação, busca na lista de ONGs)
               const ongName = acao.nomeOng || ongList?.find(o => o.id === acao.ongId)?.nome;

               return (
                  <div key={acao.id} className="cursor-pointer hover:scale-[1.01] transition-transform" 
                       onClick={() => navigate(`/ong/${acao.ongId || 'guest'}/acoes/${acao.id}`)}>
                    <CardAcao
                      image={acao.bannerUrl || ""} 
                      nomeAcao={acao.nome}
                      nomeOng={ongName}
                      dataAcao={`${acao.dia} de ${acao.mes} de ${acao.ano}`}
                      duracao={`${acao.inicio} - ${acao.termino}`}
                      endereco={`${acao.endereco}, ${acao.numero} - ${acao.bairro}`}
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