export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { ok: false, message: "ELEVENLABS_API_KEY is not set. Browser speech fallback will be used." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": apiKey },
    });

    if (!res.ok) {
      return Response.json(
        { ok: false, message: `ElevenLabs responded with status ${res.status}.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const charsUsed = data?.subscription?.character_count;
    const charsLimit = data?.subscription?.character_limit;

    return Response.json({
      ok: true,
      message:
        typeof charsUsed === "number" && typeof charsLimit === "number"
          ? `ElevenLabs key is valid. Usage: ${charsUsed}/${charsLimit} characters.`
          : "ElevenLabs API key is valid and reachable.",
    });
  } catch (error) {
    return Response.json(
      { ok: false, message: "Could not reach ElevenLabs." },
      { status: 502 }
    );
  }
}
