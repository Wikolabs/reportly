"use client";
import { useState } from "react";

const PRODUCT = "Reportly";

const PAL = {
  bg: "#F7FEE7",
  bg2: "#ECFCCB",
  surface: "rgba(0,0,0,0.035)",
  surfaceHover: "rgba(0,0,0,0.06)",
  border: "rgba(0,0,0,0.08)",
  txt1: "#161F0A",
  txt2: "#4D5A3C",
  txt3: "#8A977A",
  accent: "#4D7C0F",
  accentSoft: "rgba(77,124,15,0.10)",
  accentBorder: "rgba(77,124,15,0.30)",
  accentGlow: "rgba(77,124,15,0.15)",
  navBg: "rgba(247,254,231,0.85)",
};

const EXAMPLE_FR = `Periode : Semaine 47 (18-24 novembre 2026)

MRR net : 412k EUR (vs 399k S-1)
Nouveaux logos : 11 (vs 10 S-1)
Churn rate : 1.4% (vs 1.1% S-1)
ARR au 24/11 : 4.94M EUR (objectif Q4 5.2M)
MQL total : 627 (vs 692 S-1)
MQL DACH : 87 (vs 112 S-1)
MQL FR : 240 (vs 235 S-1)
Conversion MQL > SQL : 18% (vs 16% S-1)
Conversion SQL > closed-won : 28% (vs 24% S-1)
Pipeline coverage Q4 : 2.4x (vs 2.2x S-1)
CAC : 8.6k EUR (vs 8.9k S-1)
CAC payback : 11.2 mois (vs 12.0 moyenne Q3)
NPS : 47 (vs 44 mois precedent)`;

const EXAMPLE_EN = `Period: Week 47 (Nov 18-24, 2026)

Net MRR: 412k EUR (vs 399k W-1)
New logos: 11 (vs 10 W-1)
Churn rate: 1.4% (vs 1.1% W-1)
ARR as of Nov 24: 4.94M EUR (Q4 target 5.2M)
Total MQLs: 627 (vs 692 W-1)
DACH MQLs: 87 (vs 112 W-1)
FR MQLs: 240 (vs 235 W-1)
MQL > SQL conversion: 18% (vs 16% W-1)
SQL > closed-won: 28% (vs 24% W-1)
Q4 pipeline coverage: 2.4x (vs 2.2x W-1)
CAC: 8.6k EUR (vs 8.9k W-1)
CAC payback: 11.2 months (vs 12.0 Q3 avg)
NPS: 47 (vs 44 previous month)`;

export default function DemoPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [audience, setAudience] = useState("");
  const [period, setPeriod] = useState("");
  const [kpis, setKpis] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [staticMode, setStaticMode] = useState(false);

  const t = lang === "fr" ? {
    back: "Retour", title: "Demo", sub: PRODUCT + " — rapport executif automatise",
    desc: "Collez vos KPIs bruts (chiffres + comparaisons). L'agent IA produit un rapport executif au format COMEX : resume, metriques cles, anomalies, recommandations. Aucune source de donnees reelle interrogee — c'est un POC qui montre la logique de production.",
    inputLabel: "KPIs bruts",
    audiencePh: "Audience (ex: COMEX, Board)",
    periodPh: "Periode (ex: S47 — 18-24 nov.)",
    kpisPh: "Collez vos KPIs bruts (un par ligne, avec comparaisons)...",
    loadExample: "Charger un exemple",
    generate: "Generer le rapport", generating: "Generation en cours...",
    briefTitle: "Rapport executif", emptyHint: "Le rapport s'affiche ici une fois genere.",
    sendEmail: "Envoyer par email", postSlack: "Publier dans Slack #leadership",
    exportPdf: "Exporter en PDF",
    emailMock: "Rapport envoye aux destinataires du COMEX (mode demo, pas d'envoi reel d'email)",
    slackMock: "Rapport publie dans #leadership avec mention COMEX (mode demo, pas de connexion reelle Slack)",
    pdfMock: "PDF genere et stocke dans Google Drive (mode demo, pas de generation reelle)",
    fallback: "Mode statique : la cle LLM sera ajoutee au prochain deploiement.",
    poweredBy: "Modele :",
    note: "DEMO POC — aucune connexion reelle a Salesforce, Stripe, HubSpot, Mixpanel, Slack ou Google Drive. L'IA redige le rapport pour la demonstration.",
  } : {
    back: "Back", title: "Demo", sub: PRODUCT + " — automated executive report",
    desc: "Paste your raw KPIs (numbers + comparisons). The AI agent produces an executive report in leadership format: summary, key metrics, anomalies, recommendations. No real data source queried — this is a POC showing the production logic.",
    inputLabel: "Raw KPIs",
    audiencePh: "Audience (e.g. Leadership, Board)",
    periodPh: "Period (e.g. W47 — Nov 18-24)",
    kpisPh: "Paste your raw KPIs (one per line, with comparisons)...",
    loadExample: "Load example",
    generate: "Generate report", generating: "Generating...",
    briefTitle: "Executive report", emptyHint: "The report will appear here once generated.",
    sendEmail: "Send by email", postSlack: "Post to Slack #leadership",
    exportPdf: "Export PDF",
    emailMock: "Report sent to leadership recipients (demo mode, no real email send)",
    slackMock: "Report posted in #leadership with leadership mention (demo mode, no real Slack connection)",
    pdfMock: "PDF generated and stored in Google Drive (demo mode, no real generation)",
    fallback: "Static mode: LLM key will be added at next deploy.",
    poweredBy: "Model:",
    note: "DEMO POC — no real connection to Salesforce, Stripe, HubSpot, Mixpanel, Slack or Google Drive. The AI writes the report for demonstration.",
  };

  async function generate() {
    setError(""); setBrief(""); setModel(""); setStaticMode(false);
    if (!kpis.trim()) {
      setError(lang === "fr" ? "Collez vos KPIs." : "Paste your KPIs.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/offers/reportly/demo/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kpis, audience, period, lang }),
      });
      const j = await r.json();
      if (j.error === "llm_not_configured") {
        setBrief(j.mockBrief || "");
        setStaticMode(true);
      } else if (j.error) {
        setError(j.message || j.error);
      } else {
        setBrief(j.brief || "");
        setModel(j.model || "");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  return (
    <div style={{ minHeight: "100vh", background: PAL.bg, color: PAL.txt1, display: "flex", flexDirection: "column" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .wk-input { width: 100%; padding: 12px 14px; border-radius: 10px; background: ${PAL.surface}; border: 1px solid ${PAL.border}; color: ${PAL.txt1}; font-family: inherit; font-size: 14px; transition: border-color .2s, background .2s; }
        .wk-input:focus { outline: none; border-color: ${PAL.accent}; background: ${PAL.surfaceHover}; }
        .wk-textarea { width: 100%; padding: 12px 14px; border-radius: 10px; background: ${PAL.surface}; border: 1px solid ${PAL.border}; color: ${PAL.txt1}; font-family: monospace; font-size: 12px; resize: vertical; min-height: 220px; line-height: 1.55; }
        .wk-textarea:focus { outline: none; border-color: ${PAL.accent}; background: ${PAL.surfaceHover}; }
        .wk-btn-primary { background: ${PAL.accent}; color: #FFFFFF; border: none; border-radius: 10px; padding: 13px 22px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; transition: opacity .2s, transform .2s; display: inline-flex; align-items: center; gap: 8px; }
        .wk-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .wk-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .wk-btn-ghost { background: ${PAL.surface}; color: ${PAL.txt1}; border: 1px solid ${PAL.border}; border-radius: 10px; padding: 9px 14px; font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; transition: background .2s, border-color .2s; display: inline-flex; align-items: center; gap: 6px; }
        .wk-btn-ghost:hover { background: ${PAL.surfaceHover}; border-color: ${PAL.accentBorder}; }
        .wk-md p, .wk-md ul { margin: 0 0 10px; }
        .wk-md ul { padding-left: 18px; }
        .wk-md li { margin-bottom: 4px; line-height: 1.65; }
        .wk-md strong { color: ${PAL.accent}; font-weight: 700; display: block; margin-top: 10px; margin-bottom: 4px; font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; }
        @media (max-width: 768px) { .demo-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <nav style={{ padding: "16px 32px", borderBottom: `1px solid ${PAL.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: PAL.navBg, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ color: PAL.accent, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          ← {t.back} {PRODUCT}<span style={{ color: PAL.accent }}>.</span>
        </a>
        <div style={{ display: "inline-flex", border: `1px solid ${PAL.border}`, borderRadius: 100, padding: 2, background: PAL.surface }}>
          <button onClick={() => setLang("fr")} style={{ background: lang === "fr" ? PAL.accent : "transparent", color: lang === "fr" ? "#FFFFFF" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>FR</button>
          <button onClick={() => setLang("en")} style={{ background: lang === "en" ? PAL.accent : "transparent", color: lang === "en" ? "#FFFFFF" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>EN</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 700, margin: "0 0 6px" }}>
          {t.title} · <em style={{ fontStyle: "italic", color: PAL.accent }}>{PRODUCT}</em>
        </h1>
        <p style={{ color: PAL.txt2, fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 720, margin: "0 0 6px" }}>{t.sub}</p>
        <p style={{ color: PAL.txt3, fontSize: "0.78rem", lineHeight: 1.55, maxWidth: 720, margin: "0 0 28px" }}>{t.desc}</p>

        <div className="demo-grid" style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 24 }}>
          <section style={{ background: PAL.surface, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: "0 0 14px" }}>{t.inputLabel}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input className="wk-input" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t.audiencePh} />
              <input className="wk-input" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder={t.periodPh} />
              <textarea className="wk-textarea" value={kpis} onChange={(e) => setKpis(e.target.value)} placeholder={t.kpisPh} />
              <button type="button" onClick={() => setKpis(lang === "fr" ? EXAMPLE_FR : EXAMPLE_EN)} style={{ background: "transparent", border: "none", color: PAL.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" }}>↳ {t.loadExample}</button>
            </div>
            <button className="wk-btn-primary" disabled={loading} onClick={generate} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? `⏳ ${t.generating}` : `📊 ${t.generate}`}
            </button>
            {error && <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13, padding: "8px 12px", background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.3)", borderRadius: 8 }}>{error}</div>}
            <p style={{ color: PAL.txt3, fontSize: 11, lineHeight: 1.5, marginTop: 18, marginBottom: 0, paddingTop: 14, borderTop: `1px solid ${PAL.border}` }}>{t.note}</p>
          </section>

          <section style={{ background: PAL.bg2, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22, minHeight: 420, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: brief ? "#15803D" : PAL.txt3 }} />
                {t.briefTitle}
              </h2>
              {model && <span style={{ fontSize: 10, color: PAL.txt3, fontFamily: "monospace" }}>{t.poweredBy} {model}</span>}
            </div>

            {!brief ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: PAL.txt3, fontSize: 14, textAlign: "center", padding: 30 }}>{t.emptyHint}</div>
            ) : (
              <div className="wk-md" style={{ color: PAL.txt1, fontSize: 14, lineHeight: 1.7, flex: 1 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(brief) }} />
            )}

            {brief && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18, paddingTop: 18, borderTop: `1px solid ${PAL.border}` }}>
                <button className="wk-btn-ghost" onClick={() => showToast(t.emailMock)}>📧 {t.sendEmail}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.slackMock)}>💬 {t.postSlack}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.pdfMock)}>📄 {t.exportPdf}</button>
              </div>
            )}
            {staticMode && <div style={{ marginTop: 14, color: PAL.txt3, fontSize: 12, fontStyle: "italic" }}>{t.fallback}</div>}
          </section>
        </div>
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: PAL.bg2, border: `1px solid ${PAL.accentBorder}`, borderRadius: 12, padding: "12px 20px", color: PAL.txt1, fontSize: 13, fontWeight: 600, zIndex: 50, backdropFilter: "blur(20px)", boxShadow: "0 8px 28px rgba(0,0,0,0.2)" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const blocks: string[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length) {
      blocks.push("<ul>" + listBuf.map((l) => `<li>${l}</li>`).join("") + "</ul>");
      listBuf = [];
    }
  };
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith("- ")) {
      listBuf.push(esc(line.slice(2)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"));
    } else if (line.startsWith("**") && line.endsWith("**")) {
      flushList();
      blocks.push(`<strong>${esc(line.slice(2, -2))}</strong>`);
    } else {
      flushList();
      blocks.push(`<p>${esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
    }
  }
  flushList();
  return blocks.join("");
}
