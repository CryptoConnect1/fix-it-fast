import { useState, useRef, useEffect, useCallback } from "react";
import { RefreshCw, Trash2, Menu, X } from "lucide-react";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { QuickFixCard } from "@/components/QuickFixCard";
import { CategorySelector } from "@/components/CategorySelector";
import { DiagnosisPanel } from "@/components/DiagnosisPanel";
import { ChatHistory } from "@/components/ChatHistory";
import { Button } from "@/components/ui/button";
import { useConversations } from "@/hooks/useConversations";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/troubleshoot`;

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
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversation,
    messages,
    setMessages,
    isLoadingConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
    updateMessage,
    selectConversation,
    startNewChat,
  } = useConversations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    
    // Create conversation if needed
    let convId = activeConversation?.id;
    if (!convId) {
      const newConv = await createConversation(
        userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
        category
      );
      if (!newConv) {
        setIsLoading(false);
        return;
      }
      convId = newConv.id;
    }

    // Add user message
    const userMsg = { role: "user" as const, content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    await addMessage(convId, "user", userMessage);

    // Update title if it's the first message
    if (messages.length === 0 && activeConversation) {
      const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
      updateConversationTitle(activeConversation.id, title);
    }

    let assistantContent = "";
    let assistantMsgId: string | null = null;

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const allMessages = [...messages, userMsg];
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save assistant message to database
      if (assistantContent && convId) {
        const saved = await addMessage(convId, "assistant", assistantContent);
        if (saved) assistantMsgId = saved.id;
      }
    } catch (error) {
      console.error("Troubleshoot error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation, messages, category, createConversation, addMessage, setMessages, updateConversationTitle]);

  const handleQuickFix = (title: string) => {
    sendMessage(`Help me with: ${title}`);
  };

  const handleCategorySelect = (cat: string) => {
    setCategory(cat === category ? null : cat);
  };

  const handleClearChat = () => {
    startNewChat();
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      selectConversation(conv);
      setShowHistory(false);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    setShowHistory(false);
  };

  const issueCount = messages.filter((m) => m.role === "assistant").length;
  const status = isLoading ? "analyzing" : messages.length > 0 ? "complete" : "idle";

  return (
    <div className="min-h-screen bg-background flex">
      {/* History Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 border-r border-border bg-card/50 flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Chat History
          </h2>
        </div>
        <ChatHistory
          conversations={conversations}
          activeId={activeConversation?.id || null}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={deleteConversation}
          isLoading={isLoadingConversations}
        />
      </aside>

      {/* Mobile History Overlay */}
      {showHistory && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Chat History
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ChatHistory
              conversations={conversations}
              activeId={activeConversation?.id || null}
              onSelect={handleSelectConversation}
              onNew={handleNewChat}
              onDelete={deleteConversation}
              isLoading={isLoadingConversations}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowHistory(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </Header>

        <main className="flex-1 container mx-auto px-4 py-8">
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
                    <Button variant="outline" size="sm" onClick={handleClearChat} disabled={isLoading}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      New Chat
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
    </div>
  );
};

export default Index;
