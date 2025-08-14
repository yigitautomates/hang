import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Calendar, Users, Heart, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

// Leaflet ikon sorunu çözümü
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ankara'daki lokasyonlar için koordinatlar
const locationCoords: { [key: string]: { lat: number; lng: number } } = {
  "Çankaya": { lat: 39.9187, lng: 32.8540 },
  "Bilkent": { lat: 39.8681, lng: 32.7491 },
  "Kızılay": { lat: 39.9208, lng: 32.8540 },
  "Ulus": { lat: 39.9400, lng: 32.8597 },
  "Bahçelievler": { lat: 39.9080, lng: 32.8360 },
  "Beşevler": { lat: 39.9300, lng: 32.8250 },
  "Ostim": { lat: 39.9030, lng: 32.7740 },
};

const categoryColors = {
  event: "#8B5CF6",
  dating: "#EF4444", 
  friendship: "#3B82F6",
};

const categoryLabels = {
  event: "Event",
  dating: "Dating",
  friendship: "Friendship",
};

// Kategori için özel ikonlar oluştur
const createCategoryIcon = (category: keyof typeof categoryColors) => {
  const color = categoryColors[category];
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Kullanıcı konumu ikonu
const userLocationIcon = L.divIcon({
  html: '<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>',
  className: 'user-location-icon',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MapViewProps {
  onEventSelect?: (event: Event) => void;
}

// Haritanın kullanıcı konumuna odaklanması için component
function LocationMarker({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, map]);

  if (!userLocation) return null;

  return (
    <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
      <Popup>Konumunuz</Popup>
    </Marker>
  );
}

export function MapView({ onEventSelect }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Event verilerini çek
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Kullanıcının konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
        },
        (error) => {
          console.log("Konum alınamadı:", error);
          // Varsayılan olarak Ankara merkez
          setUserLocation({ lat: 39.9334, lng: 32.8597 });
        }
      );
    } else {
      // Varsayılan olarak Ankara merkez
      setUserLocation({ lat: 39.9334, lng: 32.8597 });
    }
  }, []);

  // Event'e katılma
  const joinEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest("POST", `/api/events/${eventId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Etkinliğe katıldınız.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEventDetail(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Etkinliğe katılırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
    onEventSelect?.(event);
  };

  const getEventCoords = (event: Event) => {
    return locationCoords[event.location] || { lat: 39.9334, lng: 32.8597 };
  };

  const calculateDistance = (event: Event) => {
    if (!userLocation) return "? km";
    
    const eventCoords = getEventCoords(event);
    const R = 6371; // Dünya yarıçapı km
    const dLat = (eventCoords.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (eventCoords.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(eventCoords.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return `${Math.round(distance * 10) / 10} km`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [39.9334, 32.8597]; // Ankara merkez

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Navigation className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-semibold text-gray-900">Etkinlik Haritası</h1>
        </div>
        <div className="text-sm text-gray-500">
          {events.length} etkinlik
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Kullanıcı konumu */}
          <LocationMarker userLocation={userLocation} />
          
          {/* Event markerları */}
          {events.map((event) => {
            const coords = getEventCoords(event);
            const categoryKey = event.category as keyof typeof categoryColors;
            
            return (
              <Marker
                key={event.id}
                position={[coords.lat, coords.lng]}
                icon={createCategoryIcon(categoryKey)}
                eventHandlers={{
                  click: () => handleEventClick(event),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {event.participants?.length || 0}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleEventClick(event)}
                    >
                      Detayları Gör
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent className="max-w-md mx-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[selectedEvent.category as keyof typeof categoryColors] }}
                  />
                  <span>{selectedEvent.title}</span>
                </DialogTitle>
                <DialogDescription>
                  {categoryLabels[selectedEvent.category as keyof typeof categoryLabels]} • {calculateDistance(selectedEvent)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-gray-700">{selectedEvent.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedEvent.date} {selectedEvent.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{selectedEvent.participants?.length || 0} kişi katılıyor</span>
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => joinEventMutation.mutate(selectedEvent.id)}
                  disabled={joinEventMutation.isPending}
                >
                  {joinEventMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Katılınıyor...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Etkinliğe Katıl
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}