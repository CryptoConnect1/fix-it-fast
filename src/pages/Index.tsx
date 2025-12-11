import { useState, useRef, useEffect } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { QuickFixCard } from "@/components/QuickFixCard";
import { CategorySelector } from "@/components/CategorySelector";
import { DiagnosisPanel } from "@/components/DiagnosisPanel";
import { Button } from "@/components/ui/button";
import { useTroubleshoot } from "@/hooks/useTroubleshoot";

const quickFixes = [
  {
    title: "Clear Cache & Cookies",
    description: "Resolve browser issues by clearing stored data",
  },
  {
    title: "Restart Services",
    description: "Fix common software issues with a service restart",
  },
  {
    title: "Check Connectivity",
    description: "Diagnose network problems and connection issues",
  },
  {
    title: "Update Drivers",
    description: "Fix hardware issues by updating system drivers",
  },
];

const Index = () => {
  const [category, setCategory] = useState<string | null>(null);
  const { messages, isLoading, sendMessage, clearMessages } = useTroubleshoot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickFix = (title: string) => {
    sendMessage(`Help me with: ${title}`);
  };

  const handleCategorySelect = (cat: string) => {
    setCategory(cat === category ? null : cat);
  };

  const issueCount = messages.filter((m) => m.role === "assistant").length;
  const status = isLoading ? "analyzing" : messages.length > 0 ? "complete" : "idle";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <div className="animate-slide-up">
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Issue Category
              </h3>
              <CategorySelector selected={category} onSelect={handleCategorySelect} />
            </div>

            {/* Chat Messages */}
            <div className="rounded-xl border border-border bg-card/30 min-h-[400px] max-h-[500px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 animate-pulse-glow">
                    <span className="text-3xl">🔧</span>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    What's the issue?
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Describe your technical problem and I'll help you diagnose and fix it.
                    Be as specific as possible for better results.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="space-y-3">
              <ChatInput
                onSend={sendMessage}
                isLoading={isLoading}
                placeholder={category ? `Describe your ${category} issue...` : "Describe your issue..."}
              />
              {messages.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearMessages} disabled={isLoading}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Chat
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendMessage("Continue troubleshooting")} disabled={isLoading}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Continue
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Diagnosis Panel */}
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Diagnosis Status
              </h3>
              <DiagnosisPanel
                status={status}
                issueCount={issueCount}
                fixesApplied={0}
              />
            </div>

            {/* Quick Fixes */}
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">
                Quick Fixes
              </h3>
              <div className="space-y-3">
                {quickFixes.map((fix) => (
                  <QuickFixCard
                    key={fix.title}
                    title={fix.title}
                    description={fix.description}
                    onClick={() => handleQuickFix(fix.title)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
