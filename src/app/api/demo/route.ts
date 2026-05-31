import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es Reportly, un agent IA de generation de rapports executifs. Tu recois des KPIs bruts (chiffres, evolutions, segments) et tu produis un rapport hebdo executif pour le COMEX, dans le ton d'un Chief of Staff senior.

Format de sortie exact en MARKDOWN :
**📈 Resume executif**
- [2-3 lignes synthetisant la semaine : direction generale, signal le plus important, decision attendue]

**🔢 Metriques cles**
- [4-6 puces : metrique + valeur + evolution semaine (+/-X%) + 1 ligne d'interpretation business]

**🚨 Anomalies et alertes**
- [1-3 puces : metriques qui sortent de la zone verte ou qui meritent une enquete, avec hypothese de cause]

**💡 Recommandations**
- [2-3 puces : actions concretes a discuter en COMEX, owner suggere (CEO, CRO, CPO, CFO, COO)]

**📅 A suivre la semaine prochaine**
- [1-2 puces : ce qui sera regarde de pres au prochain rapport]

Tu DOIS inventer une interpretation realiste meme si les donnees sont partielles ou ambigues (pas de "je n'ai pas assez de contexte"). Tu joues le role d'un Chief of Staff senior. Sois sobre, oriente decision. Maximum 380 mots.`;

const SYSTEM_PROMPT_EN = `You are Reportly, an AI executive report generation agent. You receive raw KPIs (numbers, trends, segments) and produce a weekly executive report for the leadership team, in the tone of a senior Chief of Staff.

Exact MARKDOWN output format:
**📈 Executive summary**
- [2-3 lines summarizing the week: overall direction, most important signal, decision expected]

**🔢 Key metrics**
- [4-6 bullets: metric + value + week-over-week trend (+/-X%) + 1 line of business interpretation]

**🚨 Anomalies and alerts**
- [1-3 bullets: metrics outside the green zone or worth investigating, with hypothesis on cause]

**💡 Recommendations**
- [2-3 bullets: concrete actions to discuss at leadership review, suggested owner (CEO, CRO, CPO, CFO, COO)]

**📅 Watch next week**
- [1-2 bullets: what will be tracked closely in the next report]

You MUST invent a realistic interpretation even if data is partial or ambiguous (no "I lack context"). You're playing the role of a senior Chief of Staff. Stay sober, decision-oriented. Maximum 380 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const kpis: string = typeof body.kpis === "string" ? body.kpis.slice(0, 4000) : "";
    const audience: string = typeof body.audience === "string" ? body.audience.slice(0, 100) : "";
    const period: string = typeof body.period === "string" ? body.period.slice(0, 100) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!kpis.trim()) {
      return NextResponse.json(
        { error: lang === "fr" ? "Collez vos KPIs bruts." : "Paste your raw KPIs." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(audience, period, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Audience : ${audience || "COMEX"}\nPeriode : ${period || "semaine en cours"}\n\nKPIs bruts :\n${kpis}\n\nProduis le rapport executif.`
      : `Audience: ${audience || "Leadership team"}\nPeriod: ${period || "current week"}\n\nRaw KPIs:\n${kpis}\n\nProduce the executive report.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      1100
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(audience: string, period: string, lang: "fr" | "en"): string {
  const a = audience || (lang === "fr" ? "COMEX" : "Leadership team");
  const p = period || (lang === "fr" ? "S47 — 18 au 24 nov." : "W47 — Nov 18-24");
  if (lang === "en") {
    return `**📈 Executive summary**\n- Audience: ${a}. Period: ${p}. Quarter on track despite a DACH MQL slowdown. Strong week on pipeline conversion offsets the MRR delta from last week. One CRO decision pending: hold or re-allocate the DACH budget.\n\n**🔢 Key metrics**\n- Net MRR: 412k EUR (+3.2% WoW). Within plan, driven by 4 enterprise upsells.\n- New logos: 11 (+10% WoW). Strong week. Mid-market focus is paying off.\n- Churn rate: 1.4% (+0.3 pp WoW). Still under threshold but trending up — to monitor.\n- DACH MQL: 87 (-22% WoW). Significant drop, see anomaly section.\n- Pipeline conversion: 28% (+4 pp WoW). Best week of the quarter.\n- CAC payback: 11.2 months (-0.8 vs Q3 avg). Improving.\n\n**🚨 Anomalies and alerts**\n- DACH MQL down 22% WoW — hypothesis: paid campaign paused for creative refresh + Black Friday cannibalization. Verify with growth team.\n- Churn climbing 0.3 pp two weeks in a row — small but worth a CS deep dive on Mid-market segment.\n\n**💡 Recommendations**\n- Approve or reject 50k EUR DACH paid budget refresh, decision needed Tuesday [CRO]\n- Launch a Mid-market churn root-cause review, target 1 page in 10 days [CCO]\n- Lock the pipeline conversion playbook used this week and share with EMEA team [CRO]\n\n**📅 Watch next week**\n- DACH MQL recovery post-campaign refresh\n- Mid-market churn cohort analysis output`;
  }
  return `**📈 Resume executif**\n- Audience : ${a}. Periode : ${p}. Trimestre tenu malgre un ralentissement MQL DACH. Forte semaine sur la conversion pipeline, qui compense le delta MRR de la semaine derniere. Une decision CRO en attente : maintenir ou reallouer le budget DACH.\n\n**🔢 Metriques cles**\n- MRR net : 412k EUR (+3.2% S/S). Dans le plan, porte par 4 upsells enterprise.\n- Nouveaux logos : 11 (+10% S/S). Forte semaine. Le focus mid-market paye.\n- Taux de churn : 1.4% (+0.3 pp S/S). Sous seuil mais en hausse — a surveiller.\n- MQL DACH : 87 (-22% S/S). Baisse significative, voir section anomalies.\n- Conversion pipeline : 28% (+4 pp S/S). Meilleure semaine du trimestre.\n- CAC payback : 11.2 mois (-0.8 vs moyenne Q3). Amelioration.\n\n**🚨 Anomalies et alertes**\n- MQL DACH en baisse de 22% S/S — hypothese : campagne paid en pause pour refresh creatif + cannibalisation Black Friday. A verifier avec growth.\n- Churn en hausse de 0.3 pp deux semaines de suite — faible mais merite un deep dive CS sur le segment mid-market.\n\n**💡 Recommandations**\n- Valider ou refuser le refresh budget 50k EUR DACH, decision attendue mardi [CRO]\n- Lancer une analyse root-cause du churn mid-market, livrable 1 page sous 10 jours [CCO]\n- Documenter le playbook de conversion utilise cette semaine et le partager avec l'equipe EMEA [CRO]\n\n**📅 A suivre la semaine prochaine**\n- Reprise MQL DACH post-refresh campagne\n- Sortie de l'analyse cohorte churn mid-market`;
}
