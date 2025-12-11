import { Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickFixCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export const QuickFixCard = ({ title, description, onClick }: QuickFixCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full p-4 rounded-xl text-left transition-all duration-300",
        "bg-card border border-border hover:border-primary/50",
        "hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-warning/20 text-warning flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
      </div>
    </button>
  );
};
