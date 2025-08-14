import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwipeCard } from "@/components/SwipeCard";
import { EventForm } from "@/components/EventForm";
import { MapView } from "@/components/MapView";
import { ChatList } from "@/components/ChatList";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

const categoryButtons = [
  { id: "all", label: "All" },
  { id: "event", label: "Events" },
  { id: "dating", label: "Dating" },
  { id: "friendship", label: "Friendship" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("discover");
  const [activeCategory, setActiveCategory] = useState("all");
  const [swipedEvents, setSwipedEvents] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load swiped events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("swipedEvents");
    if (saved) {
      try {
        const parsedEvents = JSON.parse(saved);
        setSwipedEvents(new Set(parsedEvents));
      } catch (error) {
        // Reset if parsing fails
        setSwipedEvents(new Set());
        localStorage.removeItem("swipedEvents");
      }
    }
  }, []);

  // Save swiped events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("swipedEvents", JSON.stringify([...swipedEvents]));
    } catch (error) {
      console.log("Failed to save swiped events");
    }
  }, [swipedEvents]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json() as Promise<Event[]>;
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });

  const swipeMutation = useMutation({
    mutationFn: async (data: { eventId: number; action: "like" | "pass" }) => {
      return apiRequest("POST", "/api/swipes", data);
    },
    onSuccess: (_, variables) => {
      setSwipedEvents(prev => new Set([...prev, variables.eventId]));
      if (variables.action === "like") {
        toast({
          title: "Katıldın! 🎉",
          description: "Etkinlik organizatörü ile iletişime geçebilirsin.",
        });
      }
    },
  });

  const filteredEvents = events.filter(event => {
    if (swipedEvents.has(event.id)) return false;
    if (activeCategory === "all") return true;
    return event.category === activeCategory;
  });

  const handleSwipe = (eventId: number, action: "like" | "pass") => {
    swipeMutation.mutate({ eventId, action });
  };

  const renderDiscoverTab = () => (
    <div>
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Heart className="text-white text-sm" />
            </div>
            <h1 className="text-2xl font-bold">HANG</h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1"
              onClick={() => {
                setSwipedEvents(new Set());
                localStorage.removeItem("swipedEvents");
                toast({ title: "Reset", description: "All events will appear again" });
              }}
            >
              Reset
            </Button>
            <Button variant="ghost" size="sm" className="w-10 h-10 bg-white bg-opacity-20 rounded-full p-0">
              <Bell className="text-white" />
            </Button>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="mt-6 flex space-x-2 overflow-x-auto">
          {categoryButtons.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              size="sm"
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-white text-purple-700"
                  : "bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Event Cards */}
      <div className="p-4 space-y-4 pb-24">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Events Near You</h2>
          <p className="text-sm text-gray-600">Swipe to join!</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {swipedEvents.size > 0 ? "You've seen them all!" : "No events yet"}
            </h3>
            <p className="text-gray-600">
              {swipedEvents.size > 0 ? "New events will be added soon." : "Create the first event!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <SwipeCard
                key={event.id}
                event={event}
                onSwipeLeft={() => handleSwipe(event.id, "pass")}
                onSwipeRight={() => handleSwipe(event.id, "like")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="p-4 space-y-6 pb-24">
      {/* Profile Header */}
      <div className="text-center">
        <img 
          src={userProfile?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
          alt="Profil"
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-800">{userProfile?.name || "Kullanıcı"}</h2>
        <p className="text-gray-600">{userProfile?.bio || "Henüz bio eklenmemiş"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{swipedEvents.size}</div>
          <div className="text-sm text-gray-600">Katıldığım</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-red-500">0</div>
          <div className="text-sm text-gray-600">Oluşturduğum</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-green-500">0</div>
          <div className="text-sm text-gray-600">Arkadaş</div>
        </div>
      </div>

      {/* Settings placeholder */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Settings</h3>
        <div className="space-y-2">
          <div className="w-full bg-white rounded-xl p-4 shadow-sm text-center text-gray-600">
            Settings coming soon
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative overflow-hidden">
      {activeTab === "discover" && renderDiscoverTab()}
      {activeTab === "map" && <MapView />}
      {activeTab === "messages" && <ChatList />}
      {activeTab === "create" && <EventForm />}
      {activeTab === "profile" && renderProfileTab()}
      
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
