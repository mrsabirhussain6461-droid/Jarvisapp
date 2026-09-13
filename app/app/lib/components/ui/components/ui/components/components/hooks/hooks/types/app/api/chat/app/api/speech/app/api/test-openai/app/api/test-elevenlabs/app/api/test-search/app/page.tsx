"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { HoloFace, type JarvisStatus } from "@/components/holo-face";
import { StatusRow, type IndicatorState } from "@/components/status-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";
import { Power, Mic, Square, Radio } from "lucide-react";

type TestKey = "openai" | "elevenlabs" | "search";

export default function JarvisPage() {
  const [isActive, setIsActive] = useState(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const [statusLine, setStatusLine] = useState("Systems idle. Power on to begin.");
  const [textInput, setTextInput] = useState("");

  const [testState, setTestState] = useState<Record<TestKey, IndicatorState>>({
    openai: "idle",
    elevenlabs: "idle",
    search: "idle",
  });
  const [testDetail, setTestDetail] = useState<Record<TestKey, string | undefined>>({
    openai: undefined,
    elevenlabs: undefined,
    search: undefined,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, append, isLoading, setMessages } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error(err);
      setStatusLine("Chat request failed. Check the OpenAI test above.");
    },
    onFinish: (message) => {
      setStatusLine("Ready.");
      speak(message.content);
    },
  });

  const { isSpeaking, speak, stop: stopSpeaking } = useSpeech({
    onStart: () => setStatusLine("Speaking..."),
    onEnd: () => {
      setStatusLine(isWakeWordListening ? "Listening for wake word..." : "Ready.");
      if (isActive && isWakeWordListening) {
        start("wake-word");
      }
    },
    onError: (msg) => setStatusLine(msg),
  });

  const submitCommand = useCallback(
    (command: string) => {
      if (!command.trim()) return;
      setStatusLine("Thinking...");
      append({ role: "user", content: command.trim() });
    },
    [append]
  );

  const {
    supported: recognitionSupported,
    mode: recognitionMode,
    start,
    stop: stopRecognition,
  } = useSpeechRecognition({
    wakeWords: ["jarvis"],
    onWakeWord: (commandAfter) => {
      if (commandAfter && commandAfter.length > 2) {
        stopRecognition();
        setStatusLine(`Heard: "${commandAfter}"`);
        submitCommand(commandAfter);
      } else {
        setStatusLine("Wake word detected. Listening for command...");
        start("command");
      }
    },
    onCommand: (transcript) => {
      stopRecognition();
      setStatusLine(`Heard: "${transcript}"`);
      submitCommand(transcript);
    },
    onError: (msg) => setStatusLine(msg),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handlePower = () => {
    if (isActive) {
      stopRecognition();
      stopSpeaking();
      setIsActive(false);
      setIsWakeWordListening(false);
      setStatusLine("Systems idle. Power on to begin.");
    } else {
      setIsActive(true);
      setStatusLine("Online. Enable wake word or press Voice to speak.");
    }
  };

  const handleWakeWordToggle = () => {
    if (!isActive) return;
    if (isWakeWordListening) {
      setIsWakeWordListening(false);
      stopRecognition();
      setStatusLine("Ready.");
    } else {
      setIsWakeWordListening(true);
      start("wake-word");
      setStatusLine('Listening for "Jarvis"...');
    }
  };

  const handleManualVoice = () => {
    if (!isActive) return;
    stopSpeaking();
    setStatusLine("Listening...");
    start("command");
  };

  const handleStop = () => {
    stopSpeaking();
    stopRecognition();
    setIsWakeWordListening(false);
    setStatusLine(isActive ? "Ready." : "Systems idle. Power on to begin.");
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive || !textInput.trim()) return;
    submitCommand(textInput);
    setTextInput("");
  };

  const runTest = async (key: TestKey, endpoint: string) => {
    setTestState((s) => ({ ...s, [key]: "checking" }));
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setTestState((s) => ({ ...s, [key]: data.ok ? "ok" : "error" }));
      setTestDetail((s) => ({ ...s, [key]: data.message }));
    } catch {
      setTestState((s) => ({ ...s, [key]: "error" }));
      setTestDetail((s) => ({ ...s, [key]: "Request failed." }));
    }
  };

  let status: JarvisStatus = "OFFLINE";
  if (isActive) {
    if (isSpeaking) status = "SPEAKING";
    else if (isLoading) status = "THINKING";
    else if (recognitionMode === "command" || recognitionMode === "wake-word") status = "LISTENING";
    else status = "ONLINE";
  }

  return (
    <main className="min-h-dvh hud-grid flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-jarvis-cyan/15">
        <div>
          <h1 className="font-display text-lg tracking-[0.3em] text-jarvis-cyan text-glow">
            J.A.R.V.I.S.
          </h1>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground mt-0.5">
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isActive ? "bg-jarvis-cyan shadow-[0_0_8px_#4CD6E8]" : "bg-jarvis-red shadow-[0_0_8px_#E84C4C]"
            )}
          />
          <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
            {isActive ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="mt-4">
            <HoloFace status={status} />
          </div>

          <p className="font-mono text-xs text-jarvis-cyan/70 tracking-wide text-center min-h-[1.2em]">
            {statusLine}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant={isActive ? "active" : "default"} onClick={handlePower}>
              <Power className="h-4 w-4" />
              {isActive ? "Power Off" : "Power On"}
            </Button>
            <Button
              variant={isWakeWordListening ? "active" : "outline"}
              onClick={handleWakeWordToggle}
              disabled={!isActive || !recognitionSupported}
            >
              <Radio className="h-4 w-4" />
              Wake Word
            </Button>
            <Button
              variant={recognitionMode === "command" ? "active" : "outline"}
              onClick={handleManualVoice}
              disabled={!isActive || !recognitionSupported}
            >
              <Mic className="h-4 w-4" />
              Voice
            </Button>
            <Button variant="destructive" onClick={handleStop}>
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>

          {!recognitionSupported && (
            <p className="font-mono text-[10px] text-jarvis-amber/80 text-center max-w-sm">
              Speech recognition isn&apos;t supported in this browser. Try Chrome or Edge. Text input
              and speech output will still work.
            </p>
          )}

          <Card className="w-full max-w-xl flex-1">
            <CardHeader>
              <CardTitle>TRANSCRIPT</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={scrollRef}
                className="scrollbar-thin flex flex-col gap-2 max-h-64 overflow-y-auto pr-1"
              >
                {messages.length === 0 && (
                  <p className="font-mono text-[11px] text-muted-foreground/60">
                    No conversation yet. Say &quot;Jarvis&quot; or type a command below.
                  </p>
                )}
                {messages
                  .filter((m) => m.role === "user" || m.role === "assistant")
                  .map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "font-mono text-[12px] leading-relaxed rounded px-2 py-1",
                        m.role === "user"
                          ? "text-jarvis-cyan/90 bg-jarvis-cyan/5 self-end text-right"
                          : "text-foreground/80 bg-white/[0.02] self-start"
                      )}
                    >
                      <span className="text-[9px] tracking-widest text-muted-foreground/60 block">
                        {m.role === "user" ? "YOU" : "JARVIS"}
                      </span>
                      {m.content}
                    </div>
                  ))}
                {isLoading && (
                  <span className="font-mono text-[11px] text-jarvis-amber/70 animate-pulse">
                    JARVIS is processing...
                  </span>
                )}
              </div>

              <form onSubmit={handleTextSubmit} className="flex gap-2 mt-3">
                <input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={isActive ? "Type a command..." : "Power on to begin"}
                  disabled={!isActive}
                  className="flex-1 bg-black/30 border border-jarvis-cyan/20 rounded px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-jarvis-cyan/60 disabled:opacity-40"
                />
                <Button type="submit" size="sm" disabled={!isActive || !textInput.trim()}>
                  Send
                </Button>
              </form>

              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="mt-2 font-mono text-[10px] text-muted-foreground/60 hover:text-jarvis-cyan/70"
                >
                  Clear transcript
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>SYSTEM STATUS</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusRow
                label="OPENAI GPT-4O-MINI"
                state={testState.openai}
                detail={testDetail.openai}
                onTest={() => runTest("openai", "/api/test-openai")}
                testing={testState.openai === "checking"}
              />
              <StatusRow
                label="ELEVENLABS TTS"
                state={testState.elevenlabs}
                detail={testDetail.elevenlabs}
                onTest={() => runTest("elevenlabs", "/api/test-elevenlabs")}
                testing={testState.elevenlabs === "checking"}
              />
              <StatusRow
                label="SEARCHAPI WEB SEARCH"
                state={testState.search}
                detail={testDetail.search}
                onTest={() => runTest("search", "/api/test-search")}
                testing={testState.search === "checking"}
              />
              <StatusRow
                label="BROWSER SPEECH RECOGNITION"
                state={recognitionSupported ? "ok" : "error"}
                detail={recognitionSupported ? "Available" : "Unsupported"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>VOICE PIPELINE</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Row label="Mode" value={isActive ? "ACTIVE" : "STANDBY"} />
              <Row label="Wake word" value={isWakeWordListening ? "ARMED" : "DISARMED"} />
              <Row label="Recognition" value={recognitionMode.toUpperCase()} />
              <Row label="Speaking" value={isSpeaking ? "YES" : "NO"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>USAGE</CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-[11px] text-muted-foreground/80 leading-relaxed">
              1. Power on the system.
              <br />
              2. Enable Wake Word, then say &quot;Jarvis&quot; followed by your request.
              <br />
              3. Or press Voice to speak a single command without the wake word.
              <br />
              4. Press Stop at any time to cancel listening or speech.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between font-mono text-[11px]">
      <span className="text-muted-foreground/70">{label}</span>
      <span className="text-jarvis-cyan/80">{value}</span>
    </div>
  );
    }
