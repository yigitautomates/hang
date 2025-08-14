import { Heart, X, Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSwipe } from "@/hooks/use-swipe";
import type { Event } from "@shared/schema";

interface SwipeCardProps {
  event: Event;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const categoryColors = {
  event: "bg-purple-500",
  dating: "bg-red-500", 
  friendship: "bg-blue-500",
};

const categoryLabels = {
  event: "Etkinlik",
  dating: "Çıkma",
  friendship: "Arkadaşlık",
};

export function SwipeCard({ event, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const { elementRef, handlers } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    threshold: 100,
  });

  const handleLike = () => {
    if (elementRef.current) {
      elementRef.current.style.transform = 'translateX(100vw) rotate(30deg)';
      elementRef.current.style.opacity = '0';
    }
    setTimeout(onSwipeRight, 300);
  };

  const handlePass = () => {
    if (elementRef.current) {
      elementRef.current.style.transform = 'translateX(-100vw) rotate(-30deg)';
      elementRef.current.style.opacity = '0';
    }
    setTimeout(onSwipeLeft, 300);
  };

  const participantCount = event.participants?.length || 0;

  return (
    <Card 
      ref={elementRef}
      className="w-full bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-200 cursor-grab active:cursor-grabbing select-none"
      style={{ transition: 'none' }}
      {...handlers}
    >
      <img 
        src={event.image || "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
        alt={event.title}
        className="w-full h-48 object-cover"
        draggable={false}
      />
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`${categoryColors[event.category as keyof typeof categoryColors]} text-white px-3 py-1 rounded-full text-xs font-medium`}>
            {categoryLabels[event.category as keyof typeof categoryLabels]}
          </span>
          <span className="text-gray-600 text-sm">2 km uzakta</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>{event.date} {event.time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>{event.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, participantCount))].map((_, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full border-2 border-white"
                />
              ))}
              {participantCount > 3 && (
                <div className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{participantCount - 3}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {participantCount} people joining
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="w-12 h-12 bg-red-100 border-red-200 rounded-full p-0 hover:bg-red-200"
              onClick={handlePass}
            >
              <X className="w-5 h-5 text-red-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-12 h-12 bg-green-100 border-green-200 rounded-full p-0 hover:bg-green-200"
              onClick={handleLike}
            >
              <Heart className="w-5 h-5 text-green-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
