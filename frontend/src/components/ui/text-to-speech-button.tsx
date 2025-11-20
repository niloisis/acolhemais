import { Button } from "@/components/ui/button";
import { Volume2, Pause, Play, Square } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface Props {
  text: string;
}

export function TextToSpeechButton({ text }: Props) {
  const { speak, pause, resume, stop, isSpeaking, isPaused } = useTextToSpeech();

  return (
    <div className="flex gap-2 items-center">
      {!isSpeaking && (
        <Button variant="outline" size="icon" onClick={() => speak(text)}>
          <Volume2 className="w-4 h-4" />
        </Button>
      )}

      {isSpeaking && !isPaused && (
        <Button variant="outline" size="icon" onClick={pause}>
          <Pause className="w-4 h-4" />
        </Button>
      )}

      {isPaused && (
        <Button variant="outline" size="icon" onClick={resume}>
          <Play className="w-4 h-4" />
        </Button>
      )}

      {isSpeaking && (
        <Button variant="outline" size="icon" onClick={stop}>
          <Square className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
