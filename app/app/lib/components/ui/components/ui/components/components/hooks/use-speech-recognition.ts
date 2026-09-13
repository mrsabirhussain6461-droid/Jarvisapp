"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionMode = "off" | "wake-word" | "command";

interface UseSpeechRecognitionOptions {
  wakeWords?: string[];
  onWakeWord: (commandAfterWakeWord: string | null) => void;
  onCommand: (transcript: string) => void;
  onError?: (message: string) => void;
}

export function useSpeechRecognition({
  wakeWords = ["jarvis"],
  onWakeWord,
  onCommand,
  onError,
}: UseSpeechRecognitionOptions) {
  const [supported, setSupported] = useState(true);
  const [mode, setMode] = useState<RecognitionMode>("off");
  const recognitionRef = useRef<any>(null);
  const modeRef = useRef<RecognitionMode>("off");
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setModeBoth = (m: RecognitionMode) => {
    modeRef.current = m;
    setMode(m);
  };

  useEffect(() => {
    const SpeechRecognition =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (!finalTranscript) return;

      if (modeRef.current === "wake-word") {
        const lower = finalTranscript.toLowerCase();
        const heard = wakeWords.find((w) => lower.includes(w.toLowerCase()));
        if (heard) {
          const idx = lower.indexOf(heard.toLowerCase());
          const after = finalTranscript.slice(idx + heard.length).trim().replace(/^[,:\-\s]+/, "");
          onWakeWord(after.length > 0 ? after : null);
        }
      } else if (modeRef.current === "command") {
        onCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      onError?.(`Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (modeRef.current !== "off") {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Already running — ignore.
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      try {
        recognition.onend = null;
        recognition.stop();
      } catch {
        // no-op
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback((newMode: RecognitionMode) => {
    if (!recognitionRef.current) return;
    setModeBoth(newMode);
    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 200);
      } catch {
        // no-op
      }
    }
  }, []);

  const stop = useCallback(() => {
    setModeBoth("off");
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    try {
      recognitionRef.current?.stop();
    } catch {
      // no-op
    }
  }, []);

  return { supported, mode, start, stop };
            }
