// src/components/feed/FeedCard.tsx
import { MapPin, Calendar } from "lucide-react"; // Ícones
import { Card, CardContent } from "@/components/ui/card"; // Shadcn
import { Badge } from "@/components/ui/badge"; // Shadcn
import { Ong, Event } from "@/types/acolhe";

interface FeedCardProps {
  data: Ong | Event;
}

export const FeedCard = ({ data }: FeedCardProps) => {
  return (
    <Card className="overflow-hidden rounded-2xl border-none shadow-sm mb-4">
      {/* Imagem de topo */}
      <div className="h-32 w-full bg-gray-200">
        <img 
          src={data.imageUrl} 
          alt="Capa" 
          className="h-full w-full object-cover"
        />
      </div>

      <CardContent className="p-4">
        {/* Lógica condicional: Se for evento, mostra título. Se for ONG, mostra nome */}
        {data.type === 'event' ? (
          <>
            <h3 className="font-bold text-lg text-gray-900">{data.title}</h3>
            <p className="text-sm font-semibold text-gray-600 mb-1">{data.ongName}</p>
          </>
        ) : (
          <h3 className="font-bold text-lg text-gray-900 mb-1">{data.name}</h3>
        )}

        {/* Localização (e Data se for evento) */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center text-gray-500 text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {data.location}
          </div>
          
          {data.type === 'event' && (
            <div className="flex items-center text-gray-500 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {data.date}
            </div>
          )}
        </div>

        {/* Tags / Categorias */}
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};