const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type Task = {
  id: number;
  sprint: string;
  title: string;
  status: string;
  due: string;
  assignee: string;
};

export type Contribution = {
  id: number;
  student: string;
  task: string;
  hours: number;
  pr_number: string;
  reviewed_by: string;
  status: string;
  sprint: string;
};

export type LogContributionInput = {
  student: string;
  task: string;
  hours: number;
  pr_number: string;
  reviewed_by: string;
  status: string;
  sprint: string;
};

export type TaskFilters = {
  sprint?: string;
  assignee?: string;
};

export async function getTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  const res = await fetch(`${API_BASE_URL}/workspace/tasks${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`GET /workspace/tasks failed: ${res.status}`);
  return res.json();
}

export async function updateTaskStatus(id: number, status: string): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/workspace/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`PATCH /workspace/tasks/${id} failed: ${res.status}`);
  return res.json();
}

export async function getContributions(student?: string): Promise<Contribution[]> {
  const qs = student ? `?student=${encodeURIComponent(student)}` : "";
  const res = await fetch(`${API_BASE_URL}/workspace/contributions${qs}`);
  if (!res.ok) throw new Error(`GET /workspace/contributions failed: ${res.status}`);
  return res.json();
}

export async function logContribution(input: LogContributionInput): Promise<Contribution> {
  const res = await fetch(`${API_BASE_URL}/workspace/contributions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`POST /workspace/contributions failed: ${res.status}`);
  return res.json();
}
