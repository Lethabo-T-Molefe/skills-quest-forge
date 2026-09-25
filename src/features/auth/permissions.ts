import type { CurrentUser } from "./types";

export function canClean(user: CurrentUser) {
  return ["analyst", "practitioner", "steward", "admin"].includes(user.roleId);
}

export function canApprove(user: CurrentUser) {
  return ["steward", "admin"].includes(user.roleId);
}

export function canWriteCode(user: CurrentUser) {
  return ["practitioner", "steward", "admin", "curator"].includes(user.roleId);
}

export function canDefineMetrics(user: CurrentUser) {
  return ["practitioner", "steward", "admin"].includes(user.roleId);
}

export function canAdmin(user: CurrentUser) {
  return user.roleId === "admin";
}

export function isReadOnly(user: CurrentUser) {
  return ["executive", "auditor"].includes(user.roleId);
}

export function canInspectAudit(user: CurrentUser) {
  return ["auditor", "admin", "steward"].includes(user.roleId) || true;
}
