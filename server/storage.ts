import { users, events, swipes, messages, conversations, type User, type InsertUser, type Event, type InsertEvent, type Swipe, type InsertSwipe, type Message, type InsertMessage, type Conversation, type InsertConversation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getEvents(): Promise<Event[]>;
  getEventsByCategory(category: string): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent & { creatorId: number }): Promise<Event>;
  
  getUserSwipes(userId: number): Promise<Swipe[]>;
  createSwipe(swipe: InsertSwipe & { userId: number }): Promise<Swipe>;
  joinEvent(eventId: number, userId: number): Promise<Event>;
  
  // Mesajlaşma sistemi
  getConversation(eventId: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getMessages(eventId: number): Promise<Message[]>;
  createMessage(message: InsertMessage & { senderId: number }): Promise<Message>;
  getUserConversations(userId: number): Promise<(Conversation & { event: Event })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private swipes: Map<number, Swipe>;
  private messages: Map<number, Message>;
  private conversations: Map<number, Conversation>;
  private currentUserId: number;
  private currentEventId: number;
  private currentSwipeId: number;
  private currentMessageId: number;
  private currentConversationId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.swipes = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentSwipeId = 1;
    this.currentMessageId = 1;
    this.currentConversationId = 1;

    // Create a default user
    this.createUser({
      username: "demo_user",
      password: "password",
      name: "Ahmet Kaya",
      bio: "Yeni insanlarla tanışmayı seven, kahve tutkunu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
    });

    // Add sample events for map demonstration
    this.initializeSampleEvents();
  }

  private initializeSampleEvents() {
    const sampleEvents = [
      {
        title: "Kahve & Sohbet",
        description: "Rahat bir atmosferde yeni insanlarla tanışma fırsatı",
        category: "dating" as const,
        location: "Çankaya",
        date: "2024-12-05",
        time: "19:00",
        image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Romantik Akşam Yemeği",
        description: "Güzel manzaralı restoranda özel bir akşam",
        category: "dating" as const,
        location: "Çankaya",
        date: "2024-12-05",
        time: "20:30",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Speed Dating",
        description: "Kısa sürede birçok kişiyle tanışma fırsatı",
        category: "dating" as const,
        location: "Kızılay",
        date: "2024-12-06",
        time: "19:30",
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Wine Tasting",
        description: "Şarap tadımı eşliğinde keyifli sohbetler",
        category: "dating" as const,
        location: "Bahçelievler",
        date: "2024-12-07",
        time: "18:00",
        image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Salsa Dans Dersi",
        description: "Partner ile dans etmeyi öğrenin, yakınlaşın",
        category: "dating" as const,
        location: "Bilkent",
        date: "2024-12-08",
        time: "20:00",
        image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Sanat Galerisi Turu",
        description: "Çağdaş sanat sergisinde kültürel buluşma",
        category: "dating" as const,
        location: "Ulus",
        date: "2024-12-09",
        time: "15:00",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Çift Yoga Seansı",
        description: "Partner yogası ile ruhsal bağ kurun",
        category: "dating" as const,
        location: "Beşevler",
        date: "2024-12-10",
        time: "10:00",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Açık Hava Sinema",
        description: "Yıldızlar altında romantik film keyfi",
        category: "dating" as const,
        location: "Ostim",
        date: "2024-12-11",
        time: "21:00",
        image: "https://images.unsplash.com/photo-1489185078471-9440f87861b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Yemek Pişirme Atölyesi",
        description: "Birlikte yemek yapın, beraber tadın",
        category: "dating" as const,
        location: "Çankaya",
        date: "2024-12-12",
        time: "17:30",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Kahvaltı Buluşması",
        description: "Hafta sonu rahat kahvaltısında tanışma",
        category: "dating" as const,
        location: "Kızılay",
        date: "2024-12-13",
        time: "11:00",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Yürüyüş Grubu",
        description: "Doğada keyifli bir yürüyüş ve piknik",
        category: "friendship" as const,
        location: "Bilkent",
        date: "2024-12-06",
        time: "14:00",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Müze Gezisi",
        description: "Anadolu Medeniyetleri Müzesi'nde sanat ve tarih",
        category: "event" as const,
        location: "Ulus",
        date: "2024-12-07",
        time: "11:00",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Kitap Kulübü",
        description: "Bu ayın kitabını tartışıyoruz, okuma severler davetli",
        category: "friendship" as const,
        location: "Kızılay",
        date: "2024-12-08",
        time: "15:30",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Spor Aktivitesi",
        description: "Voleybol oynayıp eğlenelim, her seviyeye uygun",
        category: "friendship" as const,
        location: "Beşevler",
        date: "2024-12-10",
        time: "17:00",
        image: "https://images.unsplash.com/photo-1547919307-1ecb10702e6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Fotoğrafçılık Turu",
        description: "Ankara'nın güzel yerlerini fotoğraflayalım",
        category: "friendship" as const,
        location: "Ulus",
        date: "2024-12-14",
        time: "13:00",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Oyun Gecesi",
        description: "Masa oyunları ve eğlenceli aktiviteler",
        category: "friendship" as const,
        location: "Bahçelievler",
        date: "2024-12-15",
        time: "19:00",
        image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Konser Gecesi",
        description: "Canlı müzik performansı ve dans",
        category: "event" as const,
        location: "Çankaya",
        date: "2024-12-16",
        time: "21:30",
        image: "https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Teknoloji Meetup",
        description: "Geliştiriciler ve teknik konuların tartışıldığı etkinlik",
        category: "event" as const,
        location: "Bilkent",
        date: "2024-12-17",
        time: "18:30",
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      }
    ];

    sampleEvents.forEach(eventData => {
      this.createEvent({ ...eventData, creatorId: 1 });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    if (category === "all") {
      return this.getEvents();
    }
    return Array.from(this.events.values()).filter(event => event.category === category);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(eventData: InsertEvent & { creatorId: number }): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...eventData,
      id,
      participants: [],
    };
    this.events.set(id, event);
    return event;
  }

  async getUserSwipes(userId: number): Promise<Swipe[]> {
    return Array.from(this.swipes.values()).filter(swipe => swipe.userId === userId);
  }

  async createSwipe(swipeData: InsertSwipe & { userId: number }): Promise<Swipe> {
    const id = this.currentSwipeId++;
    const swipe: Swipe = { ...swipeData, id };
    this.swipes.set(id, swipe);
    return swipe;
  }

  async joinEvent(eventId: number, userId: number): Promise<Event> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const updatedParticipants = [...(event.participants || []), userId.toString()];
    const updatedEvent: Event = {
      ...event,
      participants: updatedParticipants,
    };
    
    this.events.set(eventId, updatedEvent);

    // Etkinlik için conversation oluştur veya güncelle
    let conversation = await this.getConversation(eventId);
    if (!conversation) {
      await this.createConversation({ eventId });
    }

    return updatedEvent;
  }

  // Mesajlaşma sistemi metodları
  async getConversation(eventId: number): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values()).find(conv => conv.eventId === eventId);
  }

  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      ...conversationData,
      id,
      lastMessageId: null,
      lastActivity: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getMessages(eventId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.eventId === eventId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createMessage(messageData: InsertMessage & { senderId: number }): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...messageData,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);

    // Conversation'ı güncelle
    const conversation = await this.getConversation(messageData.eventId);
    if (conversation) {
      const updatedConversation: Conversation = {
        ...conversation,
        lastMessageId: id,
        lastActivity: new Date(),
      };
      this.conversations.set(conversation.id, updatedConversation);
    }

    return message;
  }

  async getUserConversations(userId: number): Promise<(Conversation & { event: Event })[]> {
    const userSwipes = await this.getUserSwipes(userId);
    const likedEventIds = userSwipes
      .filter(swipe => swipe.action === "like")
      .map(swipe => swipe.eventId);

    // Beğenilen etkinlikler için conversation yoksa oluştur
    for (const eventId of likedEventIds) {
      const existingConv = Array.from(this.conversations.values())
        .find(conv => conv.eventId === eventId);
      
      if (!existingConv) {
        await this.createConversation({ eventId });
      }
    }

    const conversations = Array.from(this.conversations.values())
      .filter(conv => likedEventIds.includes(conv.eventId))
      .map(conv => {
        const event = this.events.get(conv.eventId);
        return { ...conv, event: event! };
      })
      .filter(conv => conv.event) // Event'i bulunan conversation'ları filtrele
      .sort((a, b) => new Date(b.lastActivity || new Date()).getTime() - new Date(a.lastActivity || new Date()).getTime());

    return conversations;
  }
}

export const storage = new MemStorage();
