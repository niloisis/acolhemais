import { useQuery } from "react-query"; // Ou @tanstack/react-query se for v4/v5
import { api, serverURI } from "@/utils/api";
import { Ong, Acao } from "@/types";

// Hook para ONGs
export const useOngs = () => {
  return useQuery(["ong_list"], async () => {
    const { data } = await api.get<Ong[]>("/v1/ong/");
    return data;
  });
};

// Hook para Ações (Já resolvendo a questão dos banners!)
export const useAcoes = () => {
  return useQuery(["acoes_list"], async () => {
    // 1. Busca as ações
    const { data: acoes } = await api.get<Acao[]>("/v1/acoes");
    
    // 2. Busca os banners de todas as ações em paralelo
    const acoesComBanner = await Promise.all(
      acoes.map(async (acao) => {
        try {
          // Tenta buscar o banner
          const bannerPath = `/v1/acoes/${acao.id}/banner`;
          await api.get(bannerPath); // Verifica se existe
          return { ...acao, bannerUrl: `${serverURI}${bannerPath}` };
        } catch {
          // Se der erro, retorna sem banner
          return { ...acao, bannerUrl: "" };
        }
      })
    );

    return acoesComBanner;
  });
};