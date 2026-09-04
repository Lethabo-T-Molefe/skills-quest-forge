# CHIETA Data Lab — Client Presentation Walkthrough

> **STATUS UPDATE (2026-09-04):** this script was originally written when the system
> was a front-end-only prototype on mock data, before the backend existed. **That is no
> longer true and this document had not been corrected until now.** A real FastAPI +
> PostgreSQL backend has since been built, with real bcrypt+JWT authentication actually
> wired to the sign-in screen (not a client-side role picker), real role-based access
> control enforced on every backend endpoint (not just a nav-menu filter), real PII
> masking applied at upload time, real dataset versioning/search/lineage, real PDF/
> Excel/PNG report export, and a real APScheduler-backed job for Scheduled Reports. See
> `CHIETA_DATA_LAB_COMPLETION_GAP_ANALYSIS.md` at the repo root for the full,
> line-by-line evidence behind every claim in this update, and its progress addendum for
> what has changed since that report was first written. The step-by-step tour below
> (which screens to show, in what order) is still broadly usable, but do **not** use the
> "mock data / next phase" framing in the original opening line, the D4/D6/D7 rows in
> the closing table (§10), or the "Is this connected to real data?" FAQ answer (§11) —
> those specific claims are now wrong and are corrected inline below. What is still
> genuinely true: the Prototype's predictions remain heuristic arithmetic, not trained
> ML (§8 below is accurate as written), and D7 (formal testing report) / D8 (training
> materials) are still in progress, not complete.

A presenter's script for walking CHIETA stakeholders through the system. Each section
names what to click and what to say, and ties it back to the specific Scope of Work /
Handbook language so the client sees this isn't generic software — it's a direct
response to their own brief.

**Say this up front, plainly:** this is a working system with a real FastAPI +
PostgreSQL backend behind it — sign-in performs a real login, role-based access is
enforced by the backend (not just hidden in the UI), and most of what you click through
below moves real data, not fixtures. A few areas are still honest exceptions worth
naming precisely rather than glossing over: the Prototype's "predictions" are
transparently-labelled heuristic formulas, not trained ML (§8); a handful of secondary
dashboard charts are still illustrative placeholders (ask before presenting a page if
unsure — the code comments say so explicitly where this applies); and formal D7/D8
sign-off documentation is still being assembled. Naming these precisely is what makes
the rest of the demo credible.

---

## 0. Opening framing (1–2 min)

Say: *"Everything you'll see today maps directly to Section 3 of the Scope of Work —
'What Needs to Be Built' — and to the nine deliverables, D1 through D9. We'll walk it
in the order a real user would hit it: sign in, land on a role-specific dashboard, then
tour data management, analysis, governance, and finally the prototype — which your own
scope document calls **'the single most important outcome of this project.'**"*

---

## 1. Homepage (`/`) — show you understood their business first

Before touching the platform, show the marketing homepage.

- Point out the real CHIETA stats pulled from chieta.org.za (74,742 learners, 630
  SMMEs, 211 cooperatives, 3,720 ETQA certificates) and the quoted Vision/Mission.
- Land on the **"Why the Data Lab"** section and read the mission quote aloud: *"CHIETA's
  own mission commits to reimagining skills development and training using the
  combined power of data and digital."*
- **Talking point:** "We didn't invent a justification for this project — we're quoting
  CHIETA's own mission statement back. The Data Lab is how that line becomes software."

---

## 2. Sign-in (`/signin`) — role-based access, live

- Click through the **"Sign in as"** grid — point out the 8 roles: System Admin, Data
  Steward, Data Engineer, Data Analyst, Data Scientist, Student Dev, Viewer/Exec,
  Auditor. Selecting a role fills in that identity's email and the shared demo
  password.
- Submit the form. **This is a real login** — it calls the backend, checks a bcrypt
  password hash, and issues a signed JWT that every subsequent screen and API call
  actually depends on (not a cosmetic step). Worth saying out loud: *"If I typed the
  wrong password here, this would reject me — try it."*
- **Tie to scope:** Section 3.6 — *"Role-based access: different user types (admin,
  analyst, viewer) see different things."* The Handbook's User Roles and Permissions
  table (§7.2/§3.3) names exactly these roles — this isn't a generic RBAC demo, it's
  built from their own permission matrix, and it's enforced by the backend on every
  request, not just hidden in the nav.
- Sign in as **System Admin** to start the walkthrough.

---

## 3. Role-specific dashboards — the part that proves "different things"

This is the strongest differentiator in the demo. Don't just show one dashboard —
prove the *same login screen* produces a materially different app per role.

1. **System Admin** dashboard: platform health, pending dataset approvals, risk
   alerts, recent activity, full sidebar.
2. Sign out (topbar, top-right — shows the real signed-in identity, not a role
   picker) and sign back in as **Auditor**, live, in front of them: nav collapses to
   Audit Logs, Governance, Ethics & Bias, Lineage, Dashboards, Reports — no Upload, no
   SQL Lab, no Admin. Say: *"Nothing was hidden with CSS — this is a different login,
   and the backend itself refuses Upload/Admin requests for this role even if you typed
   the URL directly."* (There is no in-app role switcher any more, by design — role is
   now a property of who you signed in as, the same as it would be for a real user.)
3. Sign out, sign back in as **Student Dev**: show the sprint task board, badges,
   onboarding/mentorship checklist. **Tie to scope:** Section 5 — *"Students are not
   observers — they are contributors"* and the D1 requirement for a *"Student
   Onboarding & Mentorship Plan."*
4. Sign out, sign back in as **Viewer / Exec**: show how sparse and consumption-only
   it is — KPIs, risk alerts, AI recommendations, a single CTA into the prototype. No
   admin tools, no data management. This is the leadership-safe view.

---

## 4. Data management tour (Scope §3.2 — "Data Access and Management & Governance")

Sign in as **Data Engineer** or **Data Steward** for this section.

- **Dataset Catalogue** (`/app/datasets`) — search/filter, classification badges
  (RESTRICTED–Personal, INTERNAL–Confidential), quality scores per dataset.
- **Upload Dataset** (`/app/upload`) — CSV/Excel upload flow, classification step.
  **Tie to scope:** *"Upload datasets in common formats (e.g. Excel, CSV)."*
- **Data Quality** (`/app/quality`) — completeness/validity/consistency/uniqueness/
  timeliness scoring per dataset, failed validation rules list.
- **Data Lineage** (`/app/lineage`) — Raw → Cleaned → Analytics Mart flow for the
  Grants and Learner pipelines. **Tie to D4:** *"Cleaned, validated, anonymised...
  with data lineage & quality report."*

---

## 5. Analysis tools (Scope §3.3 — "Data Analysis and Exploration")

- **SQL Lab** (`/app/sql`) — real syntax-highlighted SQL editor (CodeMirror), schema
  browser, results grid. **Tie to scope:** *"Support for ... technical users (e.g.
  scripts/queries, SQL/Python notebooks, query editors)."*
- **Notebooks** (`/app/notebooks`) — Jupyter-style Python cells, also syntax
  highlighted, with output cells. Same scope line, the other half of it.
- **Data Explorer** (`/app/explorer`) — point-and-click table browsing for
  non-technical users — the explicit counterpart the scope calls out: *"non-technical
  users (e.g. point-and-click tools, drag-and-drop, guided workflows)."*

---

## 6. Governance & Ethics — the parts most vendors skip (Scope §3.2, §3.5)

This section is worth lingering on — it directly answers the two "MANDATORY" clauses
in the scope that are easy to leave undemonstrated.

- **Data Governance & POPIA** (`/app/governance`) — POPIA compliance scorecard
  (encryption, RBAC, audit logging, masking — pass/watch/fail), the PII Field
  Classification Register (which fields get masked/hashed and how), dataset approval
  queue. **Tie to scope:** *"A Data Governance Addendum must be submitted with D2"* and
  *"All data must be encrypted at rest and in transit... Sensitive fields must be
  masked/pseudonymised."*
- **Ethics & Bias Review** (`/app/ethics`) — fairness metrics (demographic parity,
  equalised odds) per protected attribute, disparate impact chart, explainability
  summary, sign-off checklist. **Read this scope line aloud — it's the one nobody
  expects you to have built:** *"Any model development must include a documented
  fairness/bias assessment and explainability summary"* — *"non-negotiable."*

---

## 7. Dashboards (Scope §3.4 — "Visualisation", D5 requires ≥2; we have 5)

Quick tour, one per minute:

- **Executive Cockpit** — national heat map, completion trends, risk summary.
- **Grants Intelligence** — DG/MG utilisation, budget vs actual, risk distribution.
- **Learner Intelligence** — enrolment/completion trend, dropout by programme, ML risk
  model table.
- **ETQA Performance** — APP target gauges, certification trend, provider
  accreditation status.
- **Smart Skills Centres** — utilisation heat map, demand forecast.
- Point out the small **"i" info icons** on every KPI and chart — click one. **Tie to
  scope:** *"All analytical processes must be auditable and reproducible"* — every
  number states its calculation and source table, not just its value.

---

## 8. The Prototype (`/app/prototype`) — save the most time for this

Your own scope document states: *"The single most important outcome of this project
is the working prototype."* The Handbook's own §7.13 **Leadership Demonstration
Script** describes almost exactly this flow — follow it:

1. **Executive View tab** — open on the national view, KPIs and heat map.
2. Say *"Which provinces have low completion?"* — point at the heat map, the answer is
   already on screen.
3. **Prediction Engine tab** — run the Learner Completion Predictor (pick a province/
   programme/provider), show the predicted completion probability **and the SHAP
   factor breakdown** underneath it. Then show the Grant Risk Scorer and Skills Centre
   Demand Forecast panels.
4. **Scenario Simulator tab** — pick "Increase Funding," move the slider, run it. Show
   the before/after bar chart and the plain-language impact summary.
5. **Recommendations tab** — show the AI-generated recommendation cards with priority
   badges and "Accept & Log" / "Dismiss" actions.
6. **Export tab** — show the report section checklist and PDF/Excel/PNG format
   options.
7. Close with the **Minimum Viability Requirements checklist** (Scope §3.6) and tick
   each one off in front of them:
   - ✅ Solves a defined operational question
   - ✅ ≥3 interactive visualisations (you've shown at least 6)
   - ✅ ≥2 user roles (you've shown 8)
   - ✅ Testable, documented, presentable — which is literally what's happening right now

---

## 9. Reports & Admin (D5, D7) — brief, don't over-invest time here

- **Generate Report / Scheduled Reports / Report History** — export workflow exists
  end-to-end (format selection, date range, scheduling).
- Sign back in as **System Admin** to show **User Management**, **Role Management**
  (the permission matrix table — this is the literal source the role-based nav was
  built from), **Audit Logs**, **System Health**.

---

## 10. Closing — deliverable mapping (have this table ready, on screen or printed)

| Deliverable | What's shown today | Status |
|---|---|---|
| D1 — Requirements Spec | Role matrix, prototype topic alignment, student plan all reflected in the build | Demonstrated in UX |
| D2 — System Design | Architecture implied by the role/nav model; Data Governance Addendum content live | Demonstrated in UX |
| D3 — Functional Data Lab | Every Section 3 capability has a working screen, most backed by a real endpoint | Demonstrated, real backend |
| D4 — Integrated Datasets | Upload writes real lineage and PII-masking records per dataset; quality scoring works for any uploaded table | Demonstrated, real backend |
| D5 — Dashboards & Reports | 5 dashboards (vs. 2 required), real PDF/Excel/PNG export | Demonstrated in UX |
| D6 — Working Prototype | Skills Intelligence Platform, all 5 tabs, real network calls | Demonstrated — predictions are heuristic, not trained ML (§8) |
| D7 — Testing & Validation | Real automated test suite exists (see repo `tests/`) | Formal sign-off report still in progress |
| D8 — Training & User Guides | Role-based UX itself is the training scaffold | Formal guides still in progress |
| D9 — Source Code & Docs | This repository, backend + frontend READMEs | Ready to hand over today |

**Closing line:** *"The interface, the access model, real authentication, and the
governance story are built, backend-connected, and validated with you, today. What's
left is the formal D7/D8 sign-off paperwork and, if a hard requirement, replacing the
Prototype's heuristic formulas with trained ML models."*

---

## Anticipated questions

- **"Is this connected to real data?"** Mostly yes — sign-in, RBAC, dataset upload/
  search/versioning, PII masking, lineage, report export, and most dashboards' headline
  numbers hit a real FastAPI + PostgreSQL backend. A few secondary chart series on
  dashboard pages are still explicitly-labelled illustrative placeholders (see the
  page's own code comments), and the Home landing page is still a static mock — name
  these precisely rather than letting the "yes" stand unqualified.
- **"Why these 8 roles specifically?"** Pulled directly from the Handbook's
  Role-Permission Matrix (§7.2/§3.3), not invented.
- **"Can students really only do what I just saw?"** Yes — Student Dev's nav and
  dashboard are deliberately the most restricted alongside Viewer/Exec, matching the
  "least privilege" principle in §7.1 of the Handbook.
- **"What happens if we want a 9th role or a different permission?"** It's one entry in
  a central role-permission table (`nav.ts`) — not a rebuild.
- **"Is the bias/fairness review actually required, or did you add it for show?"**
  Quote it back: Scope §3.5, *"non-negotiable... applies to all models regardless of
  intended use."* It's in the brief; most teams miss it.
