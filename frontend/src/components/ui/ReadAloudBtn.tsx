import { Button } from "@/components/ui/button";
import { Volume2, Square } from "lucide-react"; 
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useEffect } from "react";

interface ReadAloudProps {
  textToRead: string;
  label?: string; 
}

export const ReadAloudBtn = ({ textToRead, label = "Ouvir descrição" }: ReadAloudProps) => {
  const { speak, stop, isSpeaking, supported } = useTextToSpeech();

  // --- FUNÇÃO PARA REMOVER EMOJIS ---
  // Remove ícones visuais para não travar a leitura ou falar códigos estranhos
  const removeEmojis = (text: string) => {
    if (!text) return "";
    return text
      // Regex que cobre a maioria das faixas de emojis e símbolos gráficos
      .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
      // Remove espaços duplos que podem sobrar ao apagar o emoji
      .replace(/\s+/g, ' ') 
      .trim();
  };

  // Para o áudio se o componente sair da tela
  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (!supported) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`rounded-full p-2 h-10 w-10 transition-all ${
        isSpeaking 
          ? "bg-blue-600 text-white animate-pulse" // Falando
          : "bg-white text-blue-600 hover:bg-blue-50" // Parado
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Evita clicar no card
        
        if (isSpeaking) {
            stop();
        } else {
            // Limpa o texto antes de enviar para o hook de fala
            const cleanText = removeEmojis(textToRead);
            speak(cleanText);
        }
      }}
      title={label}
    >
      {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  );
};