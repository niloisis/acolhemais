import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { MapPin, Check, Loader2 } from "lucide-react";
import { api } from "@/utils/api";

interface TriageData {
    lat: number | null;
    lon: number | null;
    interests: string[];
    addressLabel: string; // Para mostrar "Você está em: Caxangá"
}

export default function TriageModal({ onComplete }: { onComplete: (data: TriageData) => void }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    
    // Estados Step 1 (Localização)
    const [loadingLoc, setLoadingLoc] = useState(false);
    const [manualAddress, setManualAddress] = useState("");
    const [locationData, setLocationData] = useState<{lat: number, lon: number, label: string} | null>(null);

    // Estados Step 2 (Interesses)
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [causasOptions, setCausasOptions] = useState<string[]>([]); // Vindo da API

    useEffect(() => {
        // Verifica se já fez triagem antes
        const savedTriage = localStorage.getItem("user_triage");
        if (!savedTriage) {
            setOpen(true);
            // Carrega opções de causas
            api.get("/v1/necessidades").then(res => {
                setCausasOptions(res.data.map((i: any) => i.tipo));
            });
        } else {
            // Se já tem, avisa o pai (Home) para carregar recomendação direto
            onComplete(JSON.parse(savedTriage));
        }
    }, []);

    // --- LÓGICA PASSO 1: LOCALIZAÇÃO ---
    
    const handleGPS = () => {
        setLoadingLoc(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                // Busca nome da rua para feedback visual (Nominatim)
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const bairro = data.address?.suburb || data.address?.neighbourhood || "Localização Atual";
                    
                    setLocationData({ lat: latitude, lon: longitude, label: bairro });
                    setStep(2); // Avança
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoadingLoc(false);
                }
            }, (error) => {
                console.error(error);
                setLoadingLoc(false);
                alert("Erro ao obter GPS. Tente digitar o endereço.");
            });
        }
    };

    const handleManualAddress = async () => {
        if(!manualAddress) return;
        setLoadingLoc(true);
        try {
            // Busca coordenadas pelo texto (Recife fixo para facilitar TCC)
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${manualAddress}, Recife, Brazil`);
            const data = await res.json();
            
            if(data && data.length > 0) {
                setLocationData({ 
                    lat: parseFloat(data[0].lat), 
                    lon: parseFloat(data[0].lon), 
                    label: manualAddress 
                });
                setStep(2);
            } else {
                alert("Endereço não encontrado.");
            }
        } catch (e) { console.error(e); }
        setLoadingLoc(false);
    };

    // --- LÓGICA PASSO 2: INTERESSES ---

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(prev => prev.filter(i => i !== interest));
        } else {
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const finishTriage = () => {
        if (locationData) {
            const finalData: TriageData = {
                lat: locationData.lat,
                lon: locationData.lon,
                interests: selectedInterests,
                addressLabel: locationData.label
            };
            
            localStorage.setItem("user_triage", JSON.stringify(finalData));
            setOpen(false);
            onComplete(finalData);
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md bg-white rounded-xl" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-gray-800">
                        {step === 1 ? "Onde você está?" : "O que você precisa?"}
                    </DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div className="flex flex-col gap-6 py-4">
                        <Button 
                            onClick={handleGPS} 
                            className="h-14 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-xl gap-2 text-base font-medium"
                            disabled={loadingLoc}
                        >
                            {loadingLoc ? <Loader2 className="animate-spin" /> : <MapPin />}
                            Usar minha localização atual
                        </Button>
                        
                        <div className="relative flex items-center gap-2">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-400 uppercase font-bold">Ou digite</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="flex gap-2">
                            <Input 
                                placeholder="Ex: Várzea, Boa Viagem..." 
                                value={manualAddress}
                                onChange={e => setManualAddress(e.target.value)}
                                className="h-12 rounded-xl"
                            />
                            <Button onClick={handleManualAddress} disabled={loadingLoc} className="h-12 w-12 rounded-xl bg-gray-900 text-white">
                                <Check />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6 py-4">
                        <p className="text-center text-gray-500 text-sm">Selecione o que é prioridade para você hoje.</p>
                        
                        <div className="flex flex-wrap gap-2 justify-center max-h-60 overflow-y-auto">
                            {causasOptions.map(causa => (
                                <button
                                    key={causa}
                                    onClick={() => toggleInterest(causa)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                                        ${selectedInterests.includes(causa) 
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105" 
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                >
                                    {causa}
                                </button>
                            ))}
                        </div>

                        <Button onClick={finishTriage} className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg mt-2">
                            Ver recomendações
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}