import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isUser = role === "user";

  const formatContent = (text: string) => {
    // Simple markdown-like formatting
    return text
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <h3 key={i} className="text-primary font-semibold mt-4 mb-2 first:mt-0">
              {line.replace(/\*\*/g, '')}
            </h3>
          );
        }
        // Bold text inline
        if (line.includes('**')) {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} className="mb-1">
              {parts.map((part, j) => 
                part.startsWith('**') && part.endsWith('**') 
                  ? <strong key={j} className="text-foreground">{part.replace(/\*\*/g, '')}</strong>
                  : part
              )}
            </p>
          );
        }
        // Numbered lists
        if (/^\d+\./.test(line)) {
          return (
            <li key={i} className="ml-4 mb-1 list-decimal">
              {line.replace(/^\d+\.\s*/, '')}
            </li>
          );
        }
        // Bullet points
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 mb-1 list-disc">
              {line.replace(/^-\s*/, '')}
            </li>
          );
        }
        // Empty lines
        if (!line.trim()) {
          return <br key={i} />;
        }
        return <p key={i} className="mb-1">{line}</p>;
      });
  };

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-xl animate-fade-in",
        isUser ? "bg-secondary/50" : "bg-card border border-border"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0 text-sm leading-relaxed text-muted-foreground">
        {formatContent(content)}
        {isStreaming && (
          <span className="inline-flex ml-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse ml-1" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse ml-1" style={{ animationDelay: '0.4s' }} />
          </span>
        )}
      </div>
    </div>
  );
};
