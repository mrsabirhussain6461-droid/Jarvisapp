"use client";

import { useCallback, useRef, useState } from "react";
import { cleanTextForSpeech } from "@/lib/utils";

interface UseSpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export function useSpeech({ onStart, onEnd, onError }: UseSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakWithBrowser = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onError?.("Speech synthesis is not supported in this browser.");
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 0.85;
      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onError?.("Browser speech synthesis failed.");
        onEnd?.();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [onStart, onEnd, onError]
  );

  const speak = useCallback(
    async (rawText: string) => {
      const cleaned = cleanTextForSpeech(rawText, 500);
      if (!cleaned) return;

      try {
        const res = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleaned }),
        });

        const contentType = res.headers.get("Content-Type") || "";

        if (contentType.includes("audio/mpeg")) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onplay = () => {
            setIsSpeaking(true);
            onStart?.();
          };
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(url);
            onEnd?.();
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(url);
            onError?.("Audio playback failed. Falling back to browser speech.");
            speakWithBrowser(cleaned);
          };

          await audio.play();
          return;
        }

        const data = await res.json().catch(() => ({}));
        speakWithBrowser(data.text || cleaned);
      } catch (err) {
        onError?.("Could not reach the speech service. Using browser speech instead.");
        speakWithBrowser(cleaned);
      }
    },
    [onStart, onEnd, onError, speakWithBrowser]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
    }
