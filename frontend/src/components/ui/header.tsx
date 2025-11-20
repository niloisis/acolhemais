import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

export default function Header({ onListen }: { onListen: () => void }) {
  return (
    <header className="w-full bg-primary text-white py-3 shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        
        {/* Botão Login */}
        <Button 
          variant="secondary" 
          className="font-semibold text-primary"
        >
          Login
        </Button>

        {/* Logo */}
        <h1 className="text-xl font-bold tracking-wide">
          Acolhe+
        </h1>

        {/* Botão Ouvir */}
        <Button 
          onClick={onListen}
          variant="ghost"
          className="text-white hover:bg-white/20"
        >
          <Volume2 className="w-6 h-6 text-white" />
        </Button>

      </div>
    </header>
  );
}
