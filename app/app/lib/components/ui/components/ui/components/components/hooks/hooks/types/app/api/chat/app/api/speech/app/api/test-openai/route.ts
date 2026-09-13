export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { ok: false, message: "OPENAI_API_KEY is not set." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/models/gpt-4o-mini", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return Response.json(
        { ok: false, message: `OpenAI responded with status ${res.status}.` },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, message: "OpenAI API key is valid and reachable." });
  } catch (error) {
    return Response.json(
      { ok: false, message: "Could not reach OpenAI." },
      { status: 502 }
    );
  }
}
