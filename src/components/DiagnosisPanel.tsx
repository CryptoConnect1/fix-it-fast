import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosisPanelProps {
  status: "idle" | "analyzing" | "complete";
  issueCount?: number;
  fixesApplied?: number;
}

export const DiagnosisPanel = ({ status, issueCount = 0, fixesApplied = 0 }: DiagnosisPanelProps) => {
  const stats = [
    {
      icon: AlertCircle,
      label: "Issues Found",
      value: issueCount,
      color: issueCount > 0 ? "text-warning" : "text-muted-foreground",
    },
    {
      icon: CheckCircle2,
      label: "Fixes Applied",
      value: fixesApplied,
      color: fixesApplied > 0 ? "text-accent" : "text-muted-foreground",
    },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            status === "idle" && "bg-muted-foreground",
            status === "analyzing" && "bg-primary animate-pulse",
            status === "complete" && "bg-accent"
          )}
        />
        <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
          {status === "idle" && "Ready"}
          {status === "analyzing" && "Analyzing..."}
          {status === "complete" && "Analysis Complete"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
            >
              <Icon className={cn("w-5 h-5", stat.color)} />
              <div>
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {status === "analyzing" && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Processing your request...</span>
        </div>
      )}
    </div>
  );
};
