import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In docker-compose: BACKEND_URL=http://reportly-backend:8000
// In local dev (next dev outside compose): falls back to localhost
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  let body: { kpis?: string; audience?: string; period?: string; lang?: "fr" | "en" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const kpis = typeof body.kpis === "string" ? body.kpis.slice(0, 4000) : "";
  const audience = typeof body.audience === "string" ? body.audience.slice(0, 100) : "";
  const period = typeof body.period === "string" ? body.period.slice(0, 100) : "";
  const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

  if (!kpis.trim()) {
    return NextResponse.json(
      { error: lang === "fr" ? "Collez vos KPIs bruts." : "Paste your raw KPIs." },
      { status: 400 }
    );
  }

  try {
    const r = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_kpi_data: kpis, audience, period, lang }),
      cache: "no-store",
    });
    const j = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: j.detail || "backend_error" }, { status: r.status });
    }
    return NextResponse.json({
      brief: j.brief,
      model: j.model,
      generatedAt: j.generated_at,
      staticMode: Boolean(j.static_mode),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ error: `backend_unreachable: ${msg}` }, { status: 502 });
  }
}
