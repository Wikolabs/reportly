# Reportly — Génération automatique de rapports business

> Un rapport hebdomadaire professionnel en 30 secondes. Zéro copier-coller de données.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.1_70B-FF6B35?style=flat)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)

---

## Vue d'ensemble

Reportly automatise la génération de rapports business récurrents (hebdomadaires, mensuels, trimestriels). Il se connecte aux sources de données, calcule les KPIs, génère un commentaire narratif via LLM expliquant les variations, et exporte en PDF ou Notion. Fini les heures de copier-coller pour les rapports de direction.

**Domaine :** Business Intelligence / Executive Reporting  
**Port VM :** 3013 | **Sous-domaine :** reportly.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts | Builder rapports, preview, schedule |
| Backend | FastAPI (Python 3.11), Uvicorn | API rapports, KPI engine, export |
| LLM | Groq (llama-3.1-70b-versatile) | Narration automatique des variations |
| PDF | WeasyPrint | Export PDF branded |
| Scheduler | APScheduler | Génération automatique planifiée |
| Base de données | PostgreSQL 16 | Rapports, templates, données KPIs |
| Cache | Redis 7 | Cache KPIs, rate limiting |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3013) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
groq==0.9.0
weasyprint==62.3
apscheduler==3.10.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
redis==5.0.4
pydantic==2.7.1
pandas==2.2.2
numpy==1.26.4
jinja2==3.1.4
```

---

## Architecture mono-repo

```
reportly/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx              # Liste rapports + schedule
│   │   ├── reports/new/          # Builder rapport avec sections
│   │   ├── reports/[id]/         # Preview rapport + export
│   │   └── templates/            # Templates rapports sectoriels
│   └── src/components/
│       ├── ReportBuilder.tsx     # Drag-and-drop sections
│       ├── KpiGrid.tsx           # Grille KPIs avec sparklines
│       ├── NarrativeBlock.tsx    # Commentaire LLM avec highlights
│       ├── ChartSection.tsx      # Graphique Recharts dans le rapport
│       └── ScheduleConfig.tsx    # Configuration envoi automatique
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── reports.py        # CRUD + generate
│   │   │   ├── kpis.py           # Calcul KPIs depuis sources
│   │   │   └── export.py         # PDF + Notion export
│   │   ├── services/
│   │   │   ├── kpi_engine.py     # Calcul KPIs + deltas vs période préc.
│   │   │   ├── narrator.py       # Groq LLM narration variations
│   │   │   ├── pdf_exporter.py   # WeasyPrint PDF
│   │   │   └── scheduler.py      # Génération récurrente
│   │   └── models/
│   │       ├── report.py
│   │       └── template.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#65a30d', 'primaryTextColor': '#fff', 'primaryBorderColor': '#4d7c0f', 'lineColor': '#374151', 'secondaryColor': '#f7fee7'}}}%%
flowchart TB
    subgraph VM["🖥️ VM — Docker Compose (port 3013)"]
        NEXT["Next.js 14\nReport Builder"]
        API["FastAPI"]
        SCHED["APScheduler\nReport generation schedule"]

        subgraph ENGINE["📊 Report Engine"]
            KPIS["KPI Calculator\nDeltas vs prev period"]
            NARR["Groq LLM\nNarrative generation"]
            PDF["WeasyPrint\nBranded PDF export"]
        end

        PG[("PostgreSQL\nReports + KPIs")]
        REDIS[("Redis\nKPI cache")]
    end

    SOURCES["Data Sources\nPostgreSQL / CSV"] --> KPIS
    SCHED --> ENGINE
```

### Séquence — Génération d'un rapport hebdomadaire

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#65a30d', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant SCHED as Scheduler (Mon 8h)
    participant API as FastAPI
    participant KPI as KPI Engine
    participant NARR as Groq LLM
    participant PDF as WeasyPrint
    participant EMAIL as Resend

    SCHED->>API: generate_report(template=weekly_sales, period=last_week)

    API->>KPI: compute_kpis(metrics=[revenue, new_customers, churn], period=W-1)
    KPI-->>API: {revenue: 48500, delta: +12%, new_customers: 23, delta: +8%, churn_rate: 1.2%, delta: -0.3%}

    API->>NARR: narrate(kpis, context="weekly sales report")
    Note over NARR: Analyse les variations et génère un commentaire naturel
    NARR-->>API: "Le chiffre d'affaires a progressé de 12% cette semaine, porté par une forte acquisition..."

    API->>PDF: render(template, kpis, narrative, charts)
    PDF-->>API: report.pdf (8 pages)

    API->>EMAIL: send_to_distribution_list(report.pdf)
    EMAIL-->>API: delivered to 5 recipients

    API-->>SCHED: report generated: "Weekly Sales W20 — 2024"
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#65a30d', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    REPORT {
        uuid id PK
        string title
        string period
        string status
        text narrative
        jsonb kpi_values
        string pdf_url
        timestamp generated_at
    }
    REPORT_TEMPLATE {
        uuid id PK
        string name
        string frequency
        jsonb sections
        string[] kpi_list
        string[] recipients
        string cron_expression
    }
    KPI_DEFINITION {
        uuid id PK
        string name
        string display_name
        string sql_query
        string unit
        string format
        boolean higher_is_better
    }

    REPORT }o--|| REPORT_TEMPLATE : "uses"
    REPORT_TEMPLATE }o--o{ KPI_DEFINITION : "includes"
```

---

## PRD

### Problème
Les managers passent 2-4h chaque lundi à assembler leurs rapports hebdomadaires : collecter les données de plusieurs outils, copier dans PowerPoint, commenter les variations. 80% de ce temps est mécanique et reproductible.

### Solution
Reportly connecte les sources de données, calcule les KPIs et leurs deltas automatiquement, génère un commentaire narratif en langage naturel via LLM, et envoie le rapport PDF à la liste de diffusion selon le planning. Le manager valide en 5 minutes.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| COO / Direction | Recevoir les rapports sans effort, comprendre les variations |
| Analyst / Controller | Automatiser la production des rapports récurrents |
| Team Manager | Rapport équipe hebdomadaire pour standup |

### OKRs
- Temps de production rapport : < 30 secondes (vs 3h manuel)
- 100% des rapports planifiés envoyés à l'heure
- Taux d'adoption : > 80% des managers reçoivent en auto

---

## User Stories

```
US-01 [Manager] En tant que manager commercial,
      je veux recevoir chaque lundi à 8h un rapport PDF de mon pipeline
      avec les KPIs clés et un commentaire sur les variations
      afin de démarrer la semaine avec les bons insights.

US-02 [Analyst] En tant qu'analyste,
      je veux créer un template de rapport avec des sections configurables
      (KPIs, graphiques, commentaire) 
      afin que n'importe quel manager puisse générer son propre rapport.

US-03 [COO] En tant que COO,
      je veux un rapport mensuel consolidant Sales + Marketing + Finance
      envoyé automatiquement avant le COMEX
      afin de ne pas dépendre du chef de projet pour l'assembler.

US-04 [Manager] En tant que manager,
      je veux que le LLM explique pourquoi les KPIs ont varié
      ("La baisse de 15% du taux de conversion est due à...")
      afin d'avoir un rapport compréhensible par tous.

US-05 [Admin] En tant qu'admin,
      je veux configurer la liste de diffusion par rapport
      et permettre à chacun de s'abonner/désabonner
      afin d'éviter de spammer les personnes non concernées.
```

---

## Règles métier

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Delta coloré | +% = vert, -% = rouge, conforme higher_is_better | ✅ KPI grid |
| R2 | Période précédente | Delta = (current - previous) / previous × 100 | ✅ Delta badge |
| R3 | Narrative contextuelle | LLM avec contexte business + période + deltas | ✅ Narrative preview |
| R4 | Planification cron | Cron expression configurable par template | ✅ Cron config |
| R5 | Distribution list | Envoi automatique à liste emails + WhatsApp (opt-in) | ✅ Recipients |
| R6 | Retry | Échec génération → retry 3x puis alerte admin | ✅ Retry log |
| R7 | Branding | Logo + couleurs entreprise configurables | ✅ Theme picker |
| R8 | Seuils d'alerte | KPI < seuil → surligné en rouge dans le rapport | ✅ Threshold config |
| R9 | Comparatif N-1 | Option : comparer à la même période l'année précédente | ✅ YoY toggle |
| R10 | Preview avant envoi | Aperçu du rapport avant déclenchement automatique | ✅ Preview modal |

---

## Spécification API

**Base URL :** `http://reportly.wikolabs.com/api/v1`

### POST /reports/generate
```json
{"template_id": "tpl_weekly_sales", "period": "2024-W20", "send_to": ["ceo@company.com"]}
// Response: {"report_id": "r_xyz", "status": "generating"}
```

### GET /reports/{id}
```json
// Response: {"title": "Weekly Sales W20", "kpis": {"revenue": {"value": 48500, "delta": 0.12}}, "narrative": "...", "pdf_url": "/reports/r_xyz/pdf"}
```

---

## Simulation UI

| Composant | Description |
|-----------|-------------|
| **Report Builder** | Drag-and-drop sections : KPI grid, chart, text, table |
| **KPI Grid** | Cartes KPI avec sparkline et delta coloré |
| **Narrative Block** | Texte LLM généré avec highlights sur les points clés |
| **Schedule Config** | Cron picker visuel + liste de diffusion |
| **PDF Preview** | Preview in-browser du rapport avant envoi |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: reportly, POSTGRES_USER: rp_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
  redis:
    image: redis:7-alpine
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://rp_user:${POSTGRES_PASSWORD}@postgres/reportly
      GROQ_API_KEY: "${GROQ_API_KEY}"
    depends_on: [postgres, redis]
    expose: ["8000"]
  frontend:
    build: ./frontend
    expose: ["3000"]
  nginx:
    image: nginx:alpine
    ports: ["3013:80"]
volumes:
  pg_data:
```

---

## Roadmap

### Phase 1 — MVP
- [ ] Templates KPIs configurables
- [ ] Génération narrative (Groq)
- [ ] Export PDF WeasyPrint

### Phase 2 — Automatisation
- [ ] Planification cron
- [ ] Distribution emails automatique
- [ ] Seuils d'alerte KPIs

### Phase 3 — Enterprise
- [ ] Intégration Notion / Confluence
- [ ] Connecteurs data (BigQuery, Stripe, HubSpot)
- [ ] Rapport consolidé multi-sources

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
