import { Terminal, Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
              <Terminal className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                TroubleshootAI
                <Sparkles className="w-4 h-4 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                v1.0 • AI-Powered Diagnostics
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">System Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
