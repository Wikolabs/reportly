"""Reportly demo backend — production-ready POC.

In production: this service would also pull metrics from BI tools, schedule reports,
and push briefings to Notion or email.
For the demo: it only invokes the LLM and returns the executive report.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm import chat, is_configured

app = FastAPI(
    title="Reportly Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es Reportly, un agent IA de generation de rapports executifs. Tu recois des KPIs bruts (chiffres, evolutions, segments) et tu produis un rapport hebdo executif pour le COMEX, dans le ton d'un Chief of Staff senior.

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

Tu DOIS inventer une interpretation realiste meme si les donnees sont partielles ou ambigues (pas de "je n'ai pas assez de contexte"). Tu joues le role d'un Chief of Staff senior. Sois sobre, oriente decision. Maximum 380 mots."""

SYSTEM_PROMPT_EN = """You are Reportly, an AI executive report generation agent. You receive raw KPIs (numbers, trends, segments) and produce a weekly executive report for the leadership team, in the tone of a senior Chief of Staff.

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

You MUST invent a realistic interpretation even if data is partial or ambiguous (no "I lack context"). You're playing the role of a senior Chief of Staff. Stay sober, decision-oriented. Maximum 380 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    raw_kpi_data: str = Field(..., min_length=1, max_length=4000)
    audience: str = Field("", max_length=100)
    period: str = Field("", max_length=100)
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "reportly-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    kpis = req.raw_kpi_data.strip()
    audience = req.audience.strip()
    period = req.period.strip()
    if not kpis:
        raise HTTPException(status_code=400, detail="empty_kpis")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Audience : {audience or 'COMEX'}\nPeriode : {period or 'semaine en cours'}\n\nKPIs bruts :\n{kpis}\n\nProduis le rapport executif."
        if req.lang == "fr"
        else f"Audience: {audience or 'Leadership team'}\nPeriod: {period or 'current week'}\n\nRaw KPIs:\n{kpis}\n\nProduce the executive report."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(audience, period, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=900,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(audience, period, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured)
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(audience: str, period: str, lang: str) -> str:
    a = audience or ("COMEX" if lang == "fr" else "Leadership team")
    p = period or ("S47 — 18 au 24 nov." if lang == "fr" else "W47 — Nov 18-24")
    if lang == "en":
        return (
            f"**📈 Executive summary**\n"
            f"- Audience: {a}. Period: {p}. Quarter on track despite a DACH MQL slowdown. Strong week on pipeline conversion offsets the MRR delta from last week. One CRO decision pending: hold or re-allocate the DACH budget.\n\n"
            f"**🔢 Key metrics**\n"
            f"- Net MRR: 412k EUR (+3.2% WoW). Within plan, driven by 4 enterprise upsells.\n"
            f"- New logos: 11 (+10% WoW). Strong week. Mid-market focus is paying off.\n"
            f"- Churn rate: 1.4% (+0.3 pp WoW). Still under threshold but trending up — to monitor.\n"
            f"- DACH MQL: 87 (-22% WoW). Significant drop, see anomaly section.\n"
            f"- Pipeline conversion: 28% (+4 pp WoW). Best week of the quarter.\n"
            f"- CAC payback: 11.2 months (-0.8 vs Q3 avg). Improving.\n\n"
            f"**🚨 Anomalies and alerts**\n"
            f"- DACH MQL down 22% WoW — hypothesis: paid campaign paused for creative refresh + Black Friday cannibalization. Verify with growth team.\n"
            f"- Churn climbing 0.3 pp two weeks in a row — small but worth a CS deep dive on Mid-market segment.\n\n"
            f"**💡 Recommendations**\n"
            f"- Approve or reject 50k EUR DACH paid budget refresh, decision needed Tuesday [CRO]\n"
            f"- Launch a Mid-market churn root-cause review, target 1 page in 10 days [CCO]\n"
            f"- Lock the pipeline conversion playbook used this week and share with EMEA team [CRO]\n\n"
            f"**📅 Watch next week**\n"
            f"- DACH MQL recovery post-campaign refresh\n"
            f"- Mid-market churn cohort analysis output"
        )
    return (
        f"**📈 Resume executif**\n"
        f"- Audience : {a}. Periode : {p}. Trimestre tenu malgre un ralentissement MQL DACH. Forte semaine sur la conversion pipeline, qui compense le delta MRR de la semaine derniere. Une decision CRO en attente : maintenir ou reallouer le budget DACH.\n\n"
        f"**🔢 Metriques cles**\n"
        f"- MRR net : 412k EUR (+3.2% S/S). Dans le plan, porte par 4 upsells enterprise.\n"
        f"- Nouveaux logos : 11 (+10% S/S). Forte semaine. Le focus mid-market paye.\n"
        f"- Taux de churn : 1.4% (+0.3 pp S/S). Sous seuil mais en hausse — a surveiller.\n"
        f"- MQL DACH : 87 (-22% S/S). Baisse significative, voir section anomalies.\n"
        f"- Conversion pipeline : 28% (+4 pp S/S). Meilleure semaine du trimestre.\n"
        f"- CAC payback : 11.2 mois (-0.8 vs moyenne Q3). Amelioration.\n\n"
        f"**🚨 Anomalies et alertes**\n"
        f"- MQL DACH en baisse de 22% S/S — hypothese : campagne paid en pause pour refresh creatif + cannibalisation Black Friday. A verifier avec growth.\n"
        f"- Churn en hausse de 0.3 pp deux semaines de suite — faible mais merite un deep dive CS sur le segment mid-market.\n\n"
        f"**💡 Recommandations**\n"
        f"- Valider ou refuser le refresh budget 50k EUR DACH, decision attendue mardi [CRO]\n"
        f"- Lancer une analyse root-cause du churn mid-market, livrable 1 page sous 10 jours [CCO]\n"
        f"- Documenter le playbook de conversion utilise cette semaine et le partager avec l'equipe EMEA [CRO]\n\n"
        f"**📅 A suivre la semaine prochaine**\n"
        f"- Reprise MQL DACH post-refresh campagne\n"
        f"- Sortie de l'analyse cohorte churn mid-market"
    )
