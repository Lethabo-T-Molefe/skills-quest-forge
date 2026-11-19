import type { CurrentUser } from "./types";

/**
 * What a member may do, read from the permissions the API grants their role. The API enforces every one of
 * these; the checks here only decide which controls to show.
 */
export function hasPermission(user: CurrentUser, permission: string) {
  return user.permissions.includes(permission);
}

export function canClean(user: CurrentUser) {
  return hasPermission(user, "clean");
}

export function canApprove(user: CurrentUser) {
  return hasPermission(user, "approve");
}

export function canWriteCode(user: CurrentUser) {
  return hasPermission(user, "write_code");
}

export function canRunSql(user: CurrentUser) {
  return hasPermission(user, "run_sql");
}

export function canDefineMetrics(user: CurrentUser) {
  return hasPermission(user, "define_metrics");
}

export function canPublishMetrics(user: CurrentUser) {
  return hasPermission(user, "publish_metrics");
}

export function canAdmin(user: CurrentUser) {
  return hasPermission(user, "admin_users");
}

/** Model Curators train models and submit them for review. */
export function canCurateModels(user: CurrentUser) {
  return hasPermission(user, "curate_models");
}

/** Approving a model is a second person's decision: stewards and administrators, or another curator. */
export function canReviewModels(user: CurrentUser) {
  return hasPermission(user, "approve_models") || hasPermission(user, "curate_models");
}

export function isReadOnly(user: CurrentUser) {
  return ["executive", "auditor"].includes(user.roleId);
}

/** Everyone sees their own trail; stewards, auditors and administrators see everyone's. */
export function canInspectAudit(user: CurrentUser) {
  return hasPermission(user, "view_all_audit");
}
