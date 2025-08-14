import { Compass, PlusCircle, User, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "map", label: "Map", icon: MapPin },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "create", label: "Create", icon: PlusCircle },
  { id: "profile", label: "Profile", icon: User },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive ? "text-purple-600" : "text-gray-500"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="text-xl mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
