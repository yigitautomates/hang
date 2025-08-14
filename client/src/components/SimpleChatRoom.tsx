import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, Conversation, Message } from "@shared/schema";

interface SimpleChatRoomProps {
  conversation: Conversation & { event: Event };
  onBack: () => void;
}

export function SimpleChatRoom({ conversation, onBack }: SimpleChatRoomProps) {
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
    refetchInterval: 3000,
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
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (messageText.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(to right, #9333ea, #7c3aed)', 
        color: 'white', 
        padding: '1rem',
        paddingTop: '3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '0.5rem',
              padding: '0.5rem',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <img 
            src={conversation.event.image || "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
            alt={conversation.event.title}
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>{conversation.event.title}</h1>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>{conversation.event.location}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        padding: '1rem', 
        overflowY: 'auto',
        background: '#f9fafb'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>Send the first message!</h3>
<p>No messages in this event group yet</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    background: 'linear-gradient(to right, #a855f7, #9333ea)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    A
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>You</span>
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{formatTime(message.timestamp!)}</span>
                    </div>
                    <div style={{ 
                      background: 'white', 
                      borderRadius: '0.5rem', 
                      padding: '0.75rem',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                      <p style={{ margin: 0 }}>{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div style={{ 
        background: 'white', 
        borderTop: '1px solid #e5e7eb', 
        padding: '1rem',
        paddingBottom: '6rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: '1rem',
              outline: 'none'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#9333ea';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            style={{
              background: messageText.trim() && !sendMessageMutation.isPending ? '#9333ea' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              cursor: messageText.trim() && !sendMessageMutation.isPending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sendMessageMutation.isPending ? (
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}