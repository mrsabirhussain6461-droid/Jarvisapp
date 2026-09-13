export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.SEARCHAPI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { ok: false, message: "SEARCHAPI_API_KEY is not set." },
      { status: 500 }
    );
  }

  try {
    const url = new URL("https://www.searchapi.io/api/v1/search");
    url.searchParams.set("engine", "google");
    url.searchParams.set("q", "test");
    url.searchParams.set("api_key", apiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
      return Response.json(
        { ok: false, message: `SearchAPI responded with status ${res.status}.` },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, message: "SearchAPI key is valid and reachable." });
  } catch (error) {
    return Response.json(
      { ok: false, message: "Could not reach SearchAPI." },
      { status: 502 }
    );
  }
}
