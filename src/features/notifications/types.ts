export type NotificationKind = "alert" | "approval" | "decision" | "share" | "refresh";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** A path in this app to open, when the notification is about something specific. */
  link: string | null;
  read: boolean;
  at: string;
  when: string;
}

export interface NotificationList {
  items: Notification[];
  unread: number;
}
