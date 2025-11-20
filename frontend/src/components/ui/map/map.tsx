import {MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {useEffect, useState} from "react";
import AddressLatLon from "@/components/ui/map/@types/AddressLatLon.ts";

type Coordinates = {
    latitude: number;
    longitude: number;
};

const MapUpdater = ({position, setPosition, onCoordinatesChange}: {
    position: Coordinates | null,
    setPosition: (position: Coordinates) => void,
    onCoordinatesChange?: (newCoordinates: Coordinates) => void
}) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView([position.latitude, position.longitude], 13);
        }
    }, [position, map]);

    useMapEvents({
        click: (e) => {
            if (onCoordinatesChange) {
                onCoordinatesChange({latitude: e.latlng.lat, longitude: e.latlng.lng});
            }
            setPosition({latitude: e.latlng.lat, longitude: e.latlng.lng});
        },
    });

    return null;
};
const Map = ({pos, cep, onCoordinatesChange, height}: {
    pos?: Coordinates,
    cep?: string,
    height?: number,
    onCoordinatesChange?: (newCoordinates: Coordinates) => void
}) => {
    const [position, setPosition] = useState<Coordinates>({latitude: -8.063169, longitude: -34.871139});
    useEffect(() => {
        if (cep) {
            const fetchLocation = async () => {
                try {
                    const isCep = (input: string) => /^\d{8}$|^\d{5}-\d{3}$/.test(input);
                    if (isCep(cep)) {
                        const {latitude, longitude} = await getLatLonFromCep(cep);
                        setPosition({latitude, longitude});
                        if (onCoordinatesChange) {
                            onCoordinatesChange({latitude, longitude})
                        }
                    }

                } catch (_) {
                }
            };
            fetchLocation();
        }
    }, [cep]);

    useEffect(() => {
        if (pos) {
            setPosition(pos);
            if (onCoordinatesChange) {
                onCoordinatesChange(pos)
            }
        }
    }, [pos]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                    });
                    if (onCoordinatesChange) onCoordinatesChange({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    })
                },
                (error) => {
                    console.error(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            console.error("Geolocalização não é suportada pelo navegador.");
        }
    }, []);

    useEffect(() => {
        const checkPermissionAndGetLocation = async () => {
            try {
                const permissionStatus = await navigator.permissions.query({name: "geolocation"});

                if (permissionStatus.state === "granted") {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const newPosition = {
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude,
                            };
                            setPosition(newPosition);
                            if (onCoordinatesChange) onCoordinatesChange(newPosition);
                        },
                        {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
                    );
                }

                permissionStatus.onchange = () => {
                    if (permissionStatus.state === "granted") {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                const newPosition = {
                                    latitude: pos.coords.latitude,
                                    longitude: pos.coords.longitude,
                                };
                                setPosition(newPosition);
                                if (onCoordinatesChange) onCoordinatesChange(newPosition);
                            },
                            {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
                        );
                    }
                };
            } catch (error) {
                console.error(error);
            }
        };
        checkPermissionAndGetLocation();
    }, []);


    return (
        <div className={"overflow-none"}>
            <MapContainer center={[position.latitude, position.longitude]} zoom={13}
                          style={{width: "100%", height: height ? height : "14rem"}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <Marker position={[position.latitude, position.longitude]}>
                    <Popup>Você está aqui</Popup>
                </Marker>
                <MapUpdater position={position} setPosition={setPosition} onCoordinatesChange={onCoordinatesChange}/>
            </MapContainer>
        </div>
    );
};


const getLatLonFromCep = async (cep: string): Promise<AddressLatLon> | null => {
    try {
        const isValidCep = /^\d{5}-?\d{3}$/.test(cep);
        if (!isValidCep) {
            return;
        }

        const cleanedCep = cep.replace("-", "");

        const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const data = await response.json();

        if (data.erro) {
            const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/search.php?q=${cep}&format=jsonv2`
            );
            const geoData = await geoResponse.json();
            if (geoData.length > 0) {
                const {lat, lon} = geoData[0];
                const reverseGeoResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`
                );
                const reverseGeoData = await reverseGeoResponse.json();
                const address = reverseGeoData.display_name || "Endereço não encontrado";
                return {latitude: parseFloat(lat), longitude: parseFloat(lon), address};
            }
        }
        const address = `${data.logradouro}, ${data.localidade}, ${data.uf}, Brasil`;
        const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=jsonv2`
        );
        const geoData = await geoResponse.json();

        if (geoData.length > 0) {
            const {lat, lon} = geoData[0];
            return {latitude: parseFloat(lat), longitude: parseFloat(lon), address: address};
        }
    } catch (error) {
        console.error("Erro ao buscar dados de CEP ou coordenadas:", error);
    }
};

export {Map, Coordinates, getLatLonFromCep} ;
