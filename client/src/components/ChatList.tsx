import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Event, Conversation } from "@shared/schema";

import { SimpleChatRoom } from "./SimpleChatRoom";

const categoryColors = {
  event: "bg-purple-500",
  dating: "bg-red-500", 
  friendship: "bg-blue-500",
};

const categoryLabels = {
  event: "Event",
  dating: "Dating",
  friendship: "Friendship",
};

export function ChatList() {
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { event: Event }) | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<(Conversation & { event: Event })[]>;
    },
  });

  if (selectedConversation) {
    return (
      <SimpleChatRoom 
        conversation={selectedConversation} 
        onBack={() => setSelectedConversation(null)} 
      />
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Messages</h2>
        <p className="text-gray-600">Group chats for events you've joined</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading chats...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-white text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No chats yet</h3>
          <p className="text-gray-600">Group chats will appear here when you join events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedConversation(conversation)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Etkinlik Görseli */}
                  <img 
                    src={conversation.event.image || "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
                    alt={conversation.event.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    {/* Kategori Badge */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`${categoryColors[conversation.event.category as keyof typeof categoryColors]} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                        {categoryLabels[conversation.event.category as keyof typeof categoryLabels]}
                      </span>
                    </div>
                    
                    {/* Etkinlik Başlığı */}
                    <h3 className="font-semibold text-gray-800 truncate">{conversation.event.title}</h3>
                    
                    {/* Etkinlik Detayları */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{conversation.event.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{conversation.event.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{conversation.event.participants?.length || 0} participants</span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ taraf - Son aktivite */}
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {conversation.lastActivity ? new Date(conversation.lastActivity).toLocaleDateString('en-US') : 'Today'}
                    </div>
                    <MessageCircle className="w-5 h-5 text-purple-600 mt-1 ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}