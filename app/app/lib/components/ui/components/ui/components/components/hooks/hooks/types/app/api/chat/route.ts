import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S., a highly capable AI assistant speaking directly to your principal.

Voice and manner:
- Address the user as "sir" or "ma'am" only occasionally, never every reply — it should feel natural, not scripted.
- Calm, dry, and precise. A trace of wit is welcome; never sycophantic or bubbly.
- Speak like someone who has already anticipated the question.

Response rules:
- Keep replies to 1-3 short sentences unless the user explicitly asks for detail. These responses are spoken aloud, so avoid anything that only works in writing.
- Never use markdown formatting, bullet points, headers, or emojis — plain spoken sentences only.
- Never read out URLs. If you used the web_search tool, summarize what you found in your own words instead of listing links.
- If you don't know something and search isn't relevant, say so plainly rather than guessing.
- Use the web_search tool whenever the user asks about current events, prices, weather, scores, or anything else that could have changed recently or that you would not know with confidence.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured on the server." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: JARVIS_SYSTEM_PROMPT,
      messages,
      tools: {
        web_search: tool({
          description:
            "Search the live web for current information — news, weather, prices, scores, facts that may have changed since training. Returns a short list of results with titles, snippets, and links.",
          parameters: z.object({
            query: z.string().describe("The search query."),
          }),
          execute: async ({ query }) => {
            const apiKey = process.env.SEARCHAPI_API_KEY;
            if (!apiKey) {
              return { error: "Search is not configured on the server." };
            }

            try {
              const url = new URL("https://www.searchapi.io/api/v1/search");
              url.searchParams.set("engine", "google");
              url.searchParams.set("q", query);
              url.searchParams.set("api_key", apiKey);

              const res = await fetch(url.toString());
              if (!res.ok) {
                return { error: `Search request failed with status ${res.status}.` };
              }
              const data = await res.json();

              const organic = Array.isArray(data.organic_results)
                ? data.organic_results.slice(0, 5)
                : [];

              const answerBox = data.answer_box
                ? {
                    answer:
                      data.answer_box.answer ??
                      data.answer_box.snippet ??
                      data.answer_box.result ??
                      null,
                  }
                : null;

              return {
                query,
                answerBox,
                results: organic.map((r: any) => ({
                  title: r.title,
                  snippet: r.snippet,
                  link: r.link,
                })),
              };
            } catch (err) {
              return { error: "Search request threw an exception." };
            }
          },
        }),
      },
      maxSteps: 4,
      temperature: 0.6,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("chat route error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error while processing chat request." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
