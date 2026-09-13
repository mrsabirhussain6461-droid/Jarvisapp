"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type JarvisStatus = "ONLINE" | "OFFLINE" | "LISTENING" | "SPEAKING" | "THINKING";

const STATUS_COLOR: Record<JarvisStatus, string> = {
  ONLINE: "#4CD6E8",
  OFFLINE: "#5A6B7A",
  LISTENING: "#4CD6E8",
  SPEAKING: "#2E8FE8",
  THINKING: "#E8A23C",
};

interface HoloFaceProps {
  status: JarvisStatus;
}

export function HoloFace({ status }: HoloFaceProps) {
  const color = STATUS_COLOR[status];
  const isOffline = status === "OFFLINE";
  const isSpeaking = status === "SPEAKING";
  const isListening = status === "LISTENING";
  const isThinking = status === "THINKING";

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        angle: (i / 14) * 360,
        radius: 130 + Math.random() * 40,
        px: (Math.random() - 0.5) * 60,
        py: (Math.random() - 0.5) * 60,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 2,
        size: 1.5 + Math.random() * 2,
      })),
    []
  );

  return (
    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
      {/* Particles */}
      {!isOffline &&
        particles.map((p) => {
          const x = 170 + p.radius * Math.cos((p.angle * Math.PI) / 180);
          const y = 170 + p.radius * Math.sin((p.angle * Math.PI) / 180);
          return (
            <span
              key={p.id}
              className="absolute rounded-full animate-float-particle"
              style={
                {
                  left: x,
                  top: y,
                  width: p.size,
                  height: p.size,
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                  "--px": `${p.px}px`,
                  "--py": `${p.py}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                } as React.CSSProperties
              }
            />
          );
        })}

      {/* Outer ring */}
      <svg
        viewBox="0 0 340 340"
        className={cn("absolute inset-0", !isOffline && "animate-spin-slower")}
        style={{ opacity: isOffline ? 0.25 : 1 }}
      >
        <circle
          cx="170"
          cy="170"
          r="160"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="2 8"
          opacity="0.5"
        />
        {Array.from({ length: 4 }).map((_, i) => (
          <rect
            key={i}
            x={166}
            y={4}
            width="8"
            height="16"
            fill={color}
            transform={`rotate(${i * 90} 170 170)`}
            opacity="0.8"
          />
        ))}
      </svg>

      {/* Middle ring */}
      <svg
        viewBox="0 0 340 340"
        className={cn("absolute inset-0", !isOffline && "animate-spin-reverse")}
        style={{ opacity: isOffline ? 0.2 : 0.85 }}
      >
        <circle
          cx="170"
          cy="170"
          r="128"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="40 6 4 6"
        />
      </svg>

      {/* Inner pulse ring */}
      <div
        className={cn(
          "absolute rounded-full border",
          !isOffline && "animate-pulse-ring"
        )}
        style={{
          width: 210,
          height: 210,
          borderColor: color,
          opacity: isOffline ? 0.15 : 0.4,
        }}
      />

      {/* Scanning line */}
      {!isOffline && (
        <div
          className="absolute overflow-hidden rounded-full"
          style={{ width: 190, height: 190 }}
        >
          <div
            className="absolute inset-x-0 h-1/3 animate-scan"
            style={{
              background: `linear-gradient(to bottom, transparent, ${color}33, transparent)`,
            }}
          />
        </div>
      )}

      {/* Core face panel */}
      <div
        className="relative flex flex-col items-center justify-center rounded-full border-2 backdrop-blur-sm transition-colors duration-500"
        style={{
          width: 176,
          height: 176,
          borderColor: color,
          background: "radial-gradient(circle at 50% 40%, rgba(13,27,46,0.9), rgba(4,7,12,0.95))",
          boxShadow: isOffline ? "none" : `0 0 40px ${color}55, inset 0 0 30px ${color}22`,
        }}
      >
        {/* Eyes */}
        <div className="flex gap-9 mb-4">
          {[0, 1].map((eye) => (
            <div
              key={eye}
              className={cn(
                "relative rounded-full border origin-center",
                !isOffline && "animate-blink"
              )}
              style={{
                width: 26,
                height: 26,
                borderColor: color,
                background: `radial-gradient(circle, ${color}22, transparent 70%)`,
              }}
            >
              <div
                className={cn(
                  "absolute inset-0",
                  !isOffline && (isThinking ? "animate-spin-slow" : "animate-spin-reverse")
                )}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    top: 2,
                    left: "50%",
                    marginLeft: -2.5,
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
              </div>
              <div
                className="absolute rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  top: "50%",
                  left: "50%",
                  marginTop: -3,
                  marginLeft: -3,
                  background: color,
                  boxShadow: isOffline ? "none" : `0 0 8px ${color}`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Mouth */}
        <div className="flex items-end gap-[3px]" style={{ height: 16 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full"
              style={{
                background: color,
                height: isSpeaking
                  ? undefined
                  : isListening
                  ? 6 + Math.abs(3 - i) * 1.5
                  : 3,
                opacity: isOffline ? 0.3 : 0.9,
                animation: isSpeaking
                  ? `talk-wave ${0.5 + (i % 3) * 0.15}s ease-in-out infinite alternate`
                  : undefined,
                animationDelay: isSpeaking ? `${i * 0.05}s` : undefined,
                transition: "height 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Status label */}
        <span
          className="mt-4 font-mono text-[9px] tracking-[0.3em]"
          style={{ color, opacity: isOffline ? 0.5 : 0.9 }}
        >
          {status}
        </span>
      </div>
    </div>
  );
      }
