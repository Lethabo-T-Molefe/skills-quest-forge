import type { RoleId } from "./types";

export const roleLabels: Record<RoleId, string> = {
  analyst: "Everyday Analyst",
  practitioner: "Data Practitioner",
  steward: "Data Steward",
  executive: "Executive and Viewer",
  admin: "Administrator",
  auditor: "Auditor",
  curator: "Model Curator",
};

export const authPaths = [
  "/sign-in",
  "/register",
  "/verify",
  "/mfa",
  "/forgot-password",
  "/reset-password",
] as const;

/** Auth pages opened from an emailed link, which must work whether or not this browser is signed in. */
export const emailLinkPaths: readonly string[] = ["/verify", "/reset-password"];

/** The API's password rules, worded for the person choosing one. The API checks them again. */
export const passwordHint =
  "At least 10 characters, mixing three of: lower case, upper case, digits and symbols. Leave out your name and email.";
export const PASSWORD_MIN_LENGTH = 10;
