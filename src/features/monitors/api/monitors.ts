import { queryOptions } from "@tanstack/react-query";
import { mockResponse } from "@/lib/mock-api";
import type { Alert, Prediction } from "../types";

const alerts: Alert[] = [
  {
    id: "al1",
    metric: "Revenue · Free State",
    message: "Fell 23% below the expected band in March",
    when: "2 days ago",
    severity: "high",
    rootCause: [
      { factor: "Enrolments in Bloemfontein", contribution: "-14%", detail: "412 fewer enrolments than February" },
      { factor: "Average fee paid", contribution: "-6%", detail: "More learners on the subsidised rate" },
      { factor: "Refunds processed", contribution: "-3%", detail: "R38 400 refunded on cancelled cohorts" },
    ],
  },
  {
    id: "al2",
    metric: "Completion rate · SQL basics",
    message: "Crossed above its 70% target for the first time",
    when: "6 days ago",
    severity: "low",
    rootCause: [
      { factor: "New guided practice module", contribution: "+8%", detail: "Introduced to cohorts from February" },
      { factor: "Shorter course length", contribution: "+3%", detail: "Median days to complete fell to 27" },
    ],
  },
];

const prediction: Prediction = {
  subject: "Learner cohort · March intake",
  outcome: "Likelihood to complete within 60 days",
  score: 72,
  band: "Moderate to high",
  modelVersion: "completion-heuristic v1.4",
  factors: [
    { name: "Prior course completed", weight: 0.32, direction: "up", reading: "Learners who finished an earlier course complete again far more often." },
    { name: "Weekly session count", weight: 0.27, direction: "up", reading: "This cohort averages 3.1 sessions a week, above the 2.4 baseline." },
    { name: "Days since last activity", weight: 0.21, direction: "down", reading: "A fifth of the cohort has been inactive for over 10 days." },
    { name: "Region support coverage", weight: 0.12, direction: "up", reading: "Most learners sit in regions with on-site facilitators." },
    { name: "Fee status", weight: 0.08, direction: "down", reading: "Unpaid balances slightly reduce completion." },
  ],
};

export function fetchAlerts() {
  return mockResponse(alerts);
}

export function fetchPrediction() {
  return mockResponse(prediction);
}

export const alertsQuery = () => queryOptions({ queryKey: ["monitors", "alerts"], queryFn: fetchAlerts });

export const predictionQuery = () =>
  queryOptions({ queryKey: ["monitors", "prediction"], queryFn: fetchPrediction });
