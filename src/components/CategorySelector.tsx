import { Monitor, Wifi, HardDrive, Code, Smartphone, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "software", icon: Code, label: "Software" },
  { id: "hardware", icon: HardDrive, label: "Hardware" },
  { id: "network", icon: Wifi, label: "Network" },
  { id: "system", icon: Monitor, label: "System" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
  { id: "server", icon: Server, label: "Server" },
];

interface CategorySelectorProps {
  selected: string | null;
  onSelect: (category: string) => void;
}

export const CategorySelector = ({ selected, onSelect }: CategorySelectorProps) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200",
              "border",
              isSelected
                ? "bg-primary/10 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};
