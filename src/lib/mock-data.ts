// Mock data for CHIETA Data Lab
export const PROVINCES = [
  "Gauteng", "KwaZulu-Natal", "Western Cape", "Eastern Cape",
  "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape",
];

export const PROGRAMMES = ["Learnerships", "Skills Programmes", "Internships", "Bursaries", "Apprenticeships"];

export const homeKpis = [
  { label: "Total Learners Enrolled", value: 84230, suffix: "", trend: 6.4, spark: [40,42,45,48,50,55,60,62,68,72,78,84] },
  { label: "Overall Completion Rate", value: 67.4, suffix: "%", trend: 2.1, spark: [55,57,60,61,63,62,64,65,66,67,67,67] },
  { label: "Active Grants", value: 1248, suffix: "", trend: -1.2, spark: [1300,1290,1280,1270,1265,1260,1255,1252,1250,1249,1248,1248] },
  { label: "Grant Utilisation", value: 81.6, suffix: "%", trend: 4.8, spark: [70,72,73,75,76,77,78,79,80,80,81,81] },
  { label: "Active Smart Skills Centres", value: 47, suffix: "", trend: 11.9, spark: [38,40,41,42,43,44,45,45,46,46,47,47] },
  { label: "APP Achievement Rate", value: 89.2, suffix: "%", trend: 3.4, spark: [80,82,83,84,85,86,87,87,88,88,89,89] },
];

export const enrolmentTrend = Array.from({ length: 24 }).map((_, i) => {
  const m = i + 1;
  return {
    month: `M${m}`,
    Enrolled: Math.round(4000 + Math.sin(i/3)*800 + i*120),
    Completed: Math.round(2500 + Math.sin(i/3)*600 + i*90),
  };
});

export const grantByProvince = PROVINCES.map((p, i) => ({
  province: p,
  spend: Math.round(80 + i*22 + Math.random()*40),
  utilisation: Math.round(60 + Math.random()*35),
}));

export const riskAlerts = [
  { severity: "High", title: "Limpopo: Completion rate dropped 12% this quarter", detail: "Q3 vs Q2 trend reversal across 3 providers" },
  { severity: "High", title: "Grant ID 4421: 0 drawdown in 90 days", detail: "Provider not responding to compliance queries" },
  { severity: "Medium", title: "KZN ETQA backlog: 1,240 assessments outstanding", detail: "Capacity recommendation pending" },
  { severity: "Medium", title: "Northern Cape: 3 centres below 40% utilisation", detail: "Demand forecast suggests consolidation" },
  { severity: "Low", title: "Bursary fund Q4: 7% surplus forecast", detail: "Reallocation opportunity to apprenticeships" },
];

export const recentActivity = [
  { who: "T. Mokoena", what: "uploaded Q3_Grants_Master.csv", when: "2 min ago" },
  { who: "S. Naidoo", what: "approved dataset Learner_Records_2026", when: "18 min ago" },
  { who: "K. Botha", what: "published dashboard ETQA Performance v4", when: "1 hr ago" },
  { who: "Admin", what: "added new user M. Dlamini (Data Analyst)", when: "3 hr ago" },
  { who: "L. Patel", what: "ran ML experiment Completion-Predictor-v12", when: "Today, 09:14" },
];

export const aiRecommendations = [
  { title: "Increase DG allocation to KwaZulu-Natal", rationale: "Province is 23% below target with 14% YoY enrolment growth.", impact: "+4,200 learners", priority: "High" },
  { title: "Consolidate underused centres in Northern Cape", rationale: "3 centres operating below 40% utilisation for 9 months.", impact: "R 8.4M saving", priority: "Medium" },
  { title: "Fast-track apprenticeship rollout in Gauteng", rationale: "Labour market signals 18% skills shortage in trades.", impact: "+1,900 jobs", priority: "Critical" },
];

export const datasets = [
  { name: "Learner_Records_2026", owner: "Learner Records", classification: "RESTRICTED–Personal", quality: "Validated", rows: 84230, cols: 42, date: "14 Jun 2026", score: 94 },
  { name: "Grants_Master_Q3", owner: "Grants", classification: "INTERNAL–Confidential", quality: "Validated", rows: 1248, cols: 28, date: "12 Jun 2026", score: 88 },
  { name: "ETQA_Assessments_2026", owner: "ETQA", classification: "INTERNAL–Confidential", quality: "Pending", rows: 22115, cols: 18, date: "10 Jun 2026", score: 76 },
  { name: "Smart_Centres_Utilisation", owner: "Skills Centres", classification: "INTERNAL–General", quality: "Validated", rows: 47, cols: 22, date: "08 Jun 2026", score: 91 },
  { name: "Labour_Market_Signals_2026", owner: "Labour Market", classification: "INTERNAL–General", quality: "Failed", rows: 8920, cols: 36, date: "05 Jun 2026", score: 42 },
  { name: "Provider_Accreditation_Master", owner: "ETQA", classification: "INTERNAL–Confidential", quality: "Validated", rows: 318, cols: 14, date: "03 Jun 2026", score: 96 },
  { name: "Bursary_Awards_2026", owner: "Grants", classification: "RESTRICTED–Personal", quality: "Validated", rows: 4112, cols: 19, date: "01 Jun 2026", score: 89 },
  { name: "Internship_Pipeline_Q3", owner: "Learner Records", classification: "INTERNAL–Confidential", quality: "Pending", rows: 2210, cols: 21, date: "30 May 2026", score: 71 },
];

export const grantRecords = Array.from({ length: 24 }).map((_, i) => ({
  id: `DG-2026-${1000 + i}`,
  provider: ["Skills Co.", "TechAcademy SA", "TradesFirst", "FutureWorks", "Workforce Now"][i % 5],
  province: PROVINCES[i % PROVINCES.length],
  programme: PROGRAMMES[i % PROGRAMMES.length],
  allocated: 500000 + (i * 75000),
  spent: Math.round((500000 + (i * 75000)) * (0.4 + Math.random() * 0.55)),
  risk: ["Low", "Medium", "High"][i % 3],
  status: ["Active", "Active", "Under review", "Active", "Closed"][i % 5],
}));

export const learnerCohorts = Array.from({ length: 12 }).map((_, i) => ({
  cohort: `C-2026-${100 + i}`,
  programme: PROGRAMMES[i % PROGRAMMES.length],
  province: PROVINCES[i % PROVINCES.length],
  enrolled: 200 + i * 40,
  predicted: Math.round((200 + i * 40) * (0.45 + Math.random() * 0.4)),
  risk: ["Low", "Medium", "High"][i % 3],
  confidence: 70 + (i * 2) % 25,
}));

export const auditLog = Array.from({ length: 30 }).map((_, i) => ({
  ts: `2026-06-${(18 - (i % 18)).toString().padStart(2,"0")} ${(9 + (i%9)).toString().padStart(2,"0")}:${(i*7%60).toString().padStart(2,"0")}`,
  user: ["t.mokoena", "s.naidoo", "admin", "k.botha", "l.patel"][i % 5],
  action: ["LOGIN", "UPLOAD", "VIEW", "DOWNLOAD", "DELETE", "ROLE_CHANGE", "EXPORT"][i % 7],
  obj: ["Dataset", "Dashboard", "Report", "User"][i % 4],
  name: ["Learner_Records_2026", "Executive Cockpit", "Q3 Grants Report", "m.dlamini"][i % 4],
  ip: `196.${i%255}.${(i*7)%255}.${(i*3)%255}`,
  status: i % 9 === 0 ? "Failed" : "Success",
}));

export const tasks = [
  { sprint: "Sprint 12 — Data Cleaning", title: "Validate Bursary_Awards_2026 nulls", status: "In Progress", due: "20 Jun 2026", by: "S. Naidoo" },
  { sprint: "Sprint 12 — Data Cleaning", title: "Write profiling notebook for ETQA dataset", status: "To Do", due: "22 Jun 2026", by: "S. Naidoo" },
  { sprint: "Sprint 12 — Data Cleaning", title: "Document lineage for Grants pipeline", status: "Done", due: "14 Jun 2026", by: "K. Botha" },
  { sprint: "Sprint 13 — ML Prep", title: "Feature engineering for Completion model", status: "To Do", due: "28 Jun 2026", by: "L. Patel" },
];
