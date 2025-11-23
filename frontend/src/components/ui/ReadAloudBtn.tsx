import { Button } from "@/components/ui/button";
import { Volume2, Square } from "lucide-react"; // Certifique-se de ter lucide-react instalado
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useEffect } from "react";

interface ReadAloudProps {
  textToRead: string;
  label?: string; // Texto opcional para acessibilidade
}

export const ReadAloudBtn = ({ textToRead, label = "Ouvir descrição" }: ReadAloudProps) => {
  const { speak, stop, isSpeaking, supported } = useTextToSpeech();

  // Para o áudio se o componente sair da tela
  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (!supported) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`rounded-full p-2 h-10 w-10 transition-all ${ // Aumentei para h-12 w-12
        isSpeaking 
          ? "bg-blue-600 text-white animate-pulse" // Falando: Fundo Azul, ícone branco
          : "bg-white text-blue-600 hover:bg-blue-50" // Parado: Fundo Branco, ícone Azul Forte
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Evita clicar no card quando clica no som
        isSpeaking ? stop() : speak(textToRead);
      }}
      title={label}
    >
      {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  );
};