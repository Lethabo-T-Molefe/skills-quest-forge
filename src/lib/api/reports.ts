const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type Report = {
  id: number;
  title: string;
  sections: string[];
  format: string;
  date_range: string;
  generated_by: string;
  generated_at: string;
  storage_key: string;
};

export type ScheduledReport = {
  id: number;
  name: string;
  frequency: string;
  next_run: string;
  recipients: string[];
  format: string;
  enabled: boolean;
};

export type GenerateReportInput = {
  title: string;
  sections: string[];
  format: string;
  date_range: string;
};

export type ScheduleReportInput = {
  name: string;
  frequency: string;
  recipients: string[];
  format: string;
};

export async function generateReport(input: GenerateReportInput): Promise<Report> {
  const res = await fetch(`${API_BASE_URL}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`POST /reports/generate failed: ${res.status}`);
  return res.json();
}

export async function getReportHistory(): Promise<Report[]> {
  const res = await fetch(`${API_BASE_URL}/reports/history`);
  if (!res.ok) throw new Error(`GET /reports/history failed: ${res.status}`);
  return res.json();
}

export async function getScheduledReports(): Promise<ScheduledReport[]> {
  const res = await fetch(`${API_BASE_URL}/reports/scheduled`);
  if (!res.ok) throw new Error(`GET /reports/scheduled failed: ${res.status}`);
  return res.json();
}

export async function createScheduledReport(input: ScheduleReportInput): Promise<ScheduledReport> {
  const res = await fetch(`${API_BASE_URL}/reports/scheduled`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`POST /reports/scheduled failed: ${res.status}`);
  return res.json();
}

export async function toggleScheduledReport(id: number, enabled: boolean): Promise<ScheduledReport> {
  const res = await fetch(`${API_BASE_URL}/reports/scheduled/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error(`PATCH /reports/scheduled/${id} failed: ${res.status}`);
  return res.json();
}
