import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips markdown syntax and URLs from text so it reads cleanly when
 * spoken aloud by TTS or the browser's SpeechSynthesis fallback.
 */
export function cleanTextForSpeech(raw: string, maxLength = 500): string {
  let text = raw;

  // Remove code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove markdown links but keep the label: [label](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

  // Strip raw URLs
  text = text.replace(/https?:\/\/\S+/g, "");

  // Strip markdown emphasis/headers/lists
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  text = text.replace(/>\s?/g, "");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (text.length > maxLength) {
    text = text.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
  }

  return text;
}

/** Extracts the command portion of an utterance following a wake word. */
export function extractCommandAfterWakeWord(
  transcript: string,
  wakeWords: string[] = ["jarvis"]
): string | null {
  const lower = transcript.toLowerCase().trim();
  for (const word of wakeWords) {
    const idx = lower.indexOf(word.toLowerCase());
    if (idx !== -1) {
      const after = transcript.slice(idx + word.length).trim();
      return after.replace(/^[,:\-\s]+/, "").trim();
    }
  }
  return null;
}
