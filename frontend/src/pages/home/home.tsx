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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ cause: "", region: "", sort: "" });

  const { data: ongList, isLoading: loadingOngs } = useOngs();
  const { data: acoesList, isLoading: loadingAcoes } = useAcoes();

  const handleFilterChange = (type: 'cause' | 'region' | 'sort', value: string) => {
    setFilters({ cause: "", region: "", sort: "", [type]: value });
  };

  const filteredOngs = ongList?.filter((ong) =>
    ong.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {/* FILTROS */}
          <div className="rounded-xl mb-4 -mt-2">
             <SearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                causePosition={filters.cause}
                onCauseChange={(v) => handleFilterChange('cause', v)}
                regionPosition={filters.region}
                onRegionChange={(v) => handleFilterChange('region', v)}
                sortPosition={filters.sort}
                onSortChange={(v) => handleFilterChange('sort', v)}
             />
          </div>

          {/* CONTEÚDO TAB: ONGs */}
          <TabsContent value="ONGs" className="space-y-4 mt-0">
            {filteredOngs?.length === 0 && (
              <p className="text-gray-500 text-center py-48">Nenhuma ONG encontrada.</p>
            )}

            {filteredOngs?.map((ong) => (
              <div key={ong.id} className="cursor-pointer" onClick={() => navigate(localStorage.getItem("ongId") === ong.id ? `/ong/admin/${ong.id}` : `/ong/${ong.id}`)}>
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
            {acoesList?.map((acao) => (
              <div key={acao.id} className="cursor-pointer" onClick={() => navigate(`/ong/${localStorage.getItem("ongId") || 'guest'}/acoes/${acao.id}`)}>
                <CardAcao
                  image={acao.bannerUrl || ""} 
                  nomeAcao={acao.nome}
                  dataAcao={`${acao.dia} de ${acao.mes} de ${acao.ano}`}
                  duracao={`${acao.inicio} - ${acao.termino}`}
                  endereco={`${acao.endereco}, ${acao.numero} - ${acao.bairro}`}
                />
              </div>
            ))}
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}