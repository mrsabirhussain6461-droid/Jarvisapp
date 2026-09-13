import { cleanTextForSpeech } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'text' in request body." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleaned = cleanTextForSpeech(text, 500);

    if (!cleaned) {
      return new Response(JSON.stringify({ error: "Nothing left to speak after cleaning text." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ fallback: true, reason: "ELEVENLABS_API_KEY not configured.", text: cleaned }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: cleaned,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("ElevenLabs error:", res.status, errBody);
      return new Response(
        JSON.stringify({ fallback: true, reason: `ElevenLabs request failed (${res.status}).`, text: cleaned }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await res.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("speech route error:", error);
    return new Response(
      JSON.stringify({ fallback: true, reason: "Unexpected server error." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
                    }
