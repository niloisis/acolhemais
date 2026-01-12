import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react"; // Removido useEffect da lógica de open
import { MapPin, Check, Loader2, X } from "lucide-react";
import { api } from "@/utils/api";

interface TriageData {
    lat: number | null;
    lon: number | null;
    interests: string[];
    addressLabel: string;
}

export default function TriageModal({ onComplete, onClose }: { onComplete: (data: TriageData) => void, onClose: () => void }) {
    // REMOVIDO: const [open, setOpen] = useState(false); 
    // O modal agora é controlado pelo pai (Home), se este componente foi renderizado, ele deve estar visível.
    
    const [step, setStep] = useState(1);
    
    // Estados Step 1 (Localização)
    const [loadingLoc, setLoadingLoc] = useState(false);
    const [manualAddress, setManualAddress] = useState("");
    const [locationData, setLocationData] = useState<{lat: number, lon: number, label: string} | null>(null);

    // Estados Step 2 (Interesses)
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [causasOptions, setCausasOptions] = useState<string[]>([]);

    useEffect(() => {
        // Carrega opções de causas apenas
        api.get("/v1/necessidades")
            .then(res => {
                if (Array.isArray(res.data)) {
                    setCausasOptions(res.data.map((i: any) => i.tipo));
                } else {
                    setCausasOptions(["Saúde", "Educação", "Alimentação"]);
                }
            })
            .catch(() => setCausasOptions(["Saúde", "Educação", "Alimentação"]));
    }, []);

    const handleGPS = () => {
        setLoadingLoc(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const bairro = data.address?.suburb || data.address?.neighbourhood || "Localização Atual";
                    
                    setLocationData({ lat: latitude, lon: longitude, label: bairro });
                    setStep(2);
                } catch (e) {
                    console.error(e);
                    alert("Erro ao obter endereço do GPS.");
                } finally {
                    setLoadingLoc(false);
                }
            }, (error) => {
                console.error(error);
                setLoadingLoc(false);
                alert("Erro ao obter GPS. Verifique as permissões.");
            });
        } else {
            setLoadingLoc(false);
            alert("Geolocalização não suportada.");
        }
    };

    const handleManualAddress = async () => {
        if(!manualAddress) return;
        setLoadingLoc(true);
        try {
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
            
            // Aqui decidimos se salvamos ou não. O ideal é deixar o Pai decidir,
            // mas podemos manter aqui para facilitar.
            localStorage.setItem("user_triage", JSON.stringify(finalData));
            
            // REMOVIDO: setOpen(false); -> Quem fecha é o pai agora
            onComplete(finalData);
        }
    };

    return (
        // Forçamos open={true} pois a visibilidade é controlada pelo {showTriage && ...} na Home
        <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-[370px] bg-white rounded-xl p-6" onPointerDownOutside={(e) => e.preventDefault()}>                
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                
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
                            {causasOptions.length > 0 ? (
                                causasOptions.map(causa => (
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
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">Carregando causas...</p>
                            )}
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