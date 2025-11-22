import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export type Coordinates = {
    latitude: number;
    longitude: number;
};

interface MapProps {
    cep?: string;
    // NOVA PROP: Permite controlar o mapa por fora
    coords?: [number, number]; 
    onCoordinatesChange: (coords: Coordinates) => void;
}

// Atualiza a visão do mapa quando o centro muda
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    // Usei setView para ser instantâneo, mas poderia ser flyTo
    map.setView(center, map.getZoom()); 
    return null;
}

function LocationMarker({ position, setPosition, onCoordinatesChange }: any) {
    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            onCoordinatesChange({ latitude: newPos.lat, longitude: newPos.lng });
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export function Map({ cep, coords, onCoordinatesChange }: MapProps) {
    // Posição inicial
    const [position, setPosition] = useState<L.LatLng | null>(new L.LatLng(-8.063169, -34.871139));

    // 1. Efeito do CEP (Mantido, mas simplificado pois o Form agora controla a busca maior)
    useEffect(() => {
        const fetchCoordinates = async () => {
            if (cep && cep.replace(/\D/g, '').length === 8) {
                // A lógica pesada de busca agora pode ficar no formulário se quiser, 
                // mas mantemos aqui para garantir que o mapa se mova se só o CEP mudar.
                // (Opcional: Você pode remover esse useEffect se confiar 100% na prop 'coords' vinda do pai)
            }
        };
        fetchCoordinates();
    }, [cep]);

    // 2. NOVO EFEITO: Quando 'coords' muda (vindo do input de endereço), atualiza o mapa
    useEffect(() => {
        if (coords && coords[0] !== 0 && coords[1] !== 0) {
            const newPos = new L.LatLng(coords[0], coords[1]);
            setPosition(newPos);
        }
    }, [coords]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => {}, // Sucesso (opcional)
                (error) => console.warn("Geo bloqueada", error)
            );
        }
    }, []);

    return (
        <MapContainer
            center={position || [-8.063169, -34.871139]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* O ChangeView é quem faz a mágica de mover o mapa */}
            {position && <ChangeView center={[position.lat, position.lng]} />}
            
            <LocationMarker 
                position={position} 
                setPosition={setPosition} 
                onCoordinatesChange={onCoordinatesChange} 
            />
        </MapContainer>
    );
}