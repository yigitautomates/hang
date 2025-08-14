import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, Conversation, Message } from "@shared/schema";

interface ChatRoomProps {
  conversation: Conversation & { event: Event };
  onBack: () => void;
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

export function ChatRoom({ conversation, onBack }: ChatRoomProps) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/events", conversation.eventId, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/events/${conversation.eventId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<Message[]>;
    },
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/events/${conversation.eventId}/messages`, { content });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/events", conversation.eventId, "messages"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (messageText.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Bugün";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Dün";
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 pt-12">
        <div className="flex items-center space-x-3 mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <img 
            src={conversation.event.image || "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
            alt={conversation.event.title}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="text-lg font-bold">{conversation.event.title}</h1>
            <div className="flex items-center space-x-2 text-sm opacity-90">
              <span className={`${categoryColors[conversation.event.category as keyof typeof categoryColors]} px-2 py-1 rounded-full text-xs`}>
                {categoryLabels[conversation.event.category as keyof typeof categoryLabels]}
              </span>
              <span>{conversation.event.participants?.length || 0} katılımcı</span>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="flex items-center space-x-4 text-sm bg-white bg-opacity-20 rounded-lg p-2">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{conversation.event.date} {conversation.event.time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{conversation.event.location}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2 text-sm">Mesajlar yükleniyor...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">İlk mesajı gönderin!</h3>
            <p className="text-gray-600 text-sm">Bu etkinlik grubunda henüz mesaj yok</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showDate = !prevMessage || 
                formatDate(message.timestamp!) !== formatDate(prevMessage.timestamp!);
              
              return (
                <div key={message.id} className="mb-4">
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {formatDate(message.timestamp!)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800 text-sm">Sen</span>
                        <span className="text-gray-500 text-xs">{formatTime(message.timestamp!)}</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-gray-800">{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-base"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 min-w-[60px] h-[40px] flex items-center justify-center"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}