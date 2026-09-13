"use client";

import { cn } from "@/lib/utils";

export type IndicatorState = "idle" | "ok" | "error" | "checking";

const DOT_COLOR: Record<IndicatorState, string> = {
  idle: "bg-muted-foreground/40",
  ok: "bg-jarvis-cyan shadow-[0_0_8px_#4CD6E8]",
  error: "bg-jarvis-red shadow-[0_0_8px_#E84C4C]",
  checking: "bg-jarvis-amber shadow-[0_0_8px_#E8A23C] animate-pulse",
};

interface StatusRowProps {
  label: string;
  state: IndicatorState;
  detail?: string;
  onTest?: () => void;
  testing?: boolean;
}

export function StatusRow({ label, state, detail, onTest, testing }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-jarvis-cyan/10 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_COLOR[state])} />
        <span className="font-mono text-[11px] tracking-wide text-foreground/70 truncate">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {detail && (
          <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
            {detail}
          </span>
        )}
        {onTest && (
          <button
            onClick={onTest}
            disabled={testing}
            className="font-mono text-[10px] tracking-wide text-jarvis-cyan/70 hover:text-jarvis-cyan border border-jarvis-cyan/30 hover:border-jarvis-cyan/60 rounded px-1.5 py-0.5 transition-colors disabled:opacity-40"
          >
            {testing ? "..." : "TEST"}
          </button>
        )}
      </div>
    </div>
  );
}
