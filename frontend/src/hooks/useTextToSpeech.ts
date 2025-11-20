import { useState, useEffect, useRef } from "react";

export function useTextToSpeech() {
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => synth.cancel(); // interrompe ao desmontar o componente
  }, [synth]);

  const speak = (text: string) => {
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsSpeaking(true);
  };

  const pause = () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return { speak, pause, resume, stop, isSpeaking, isPaused };
}
