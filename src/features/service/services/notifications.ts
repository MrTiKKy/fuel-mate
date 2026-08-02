/**
 * Notification service abstraction.
 * Push notifications are not implemented yet — this prepares the interface.
 */

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
};

export type NotificationService = {
  isSupported: () => boolean;
  requestPermission: () => Promise<"granted" | "denied" | "default" | "unsupported">;
  notify: (notification: Omit<AppNotification, "id" | "createdAt">) => Promise<void>;
};

export const localNotificationService: NotificationService = {
  isSupported: () =>
    typeof window !== "undefined" && "Notification" in window,

  async requestPermission() {
    if (!this.isSupported()) return "unsupported";
    // Intentionally not requesting yet — placeholder for future push/local alerts
    return "default";
  },

  async notify() {
    // No-op until notification delivery is implemented
  },
};

export function createReminderNotification(input: {
  title: string;
  daysRemaining: number | null;
  kmRemaining: number | null;
  href: string;
}): Omit<AppNotification, "id" | "createdAt"> {
  const parts: string[] = [];
  if (input.daysRemaining !== null) {
    parts.push(
      input.daysRemaining < 0
        ? `${Math.abs(input.daysRemaining)} days overdue`
        : `${input.daysRemaining} days left`,
    );
  }
  if (input.kmRemaining !== null) {
    parts.push(
      input.kmRemaining < 0
        ? `${Math.abs(input.kmRemaining)} km overdue`
        : `${input.kmRemaining} km left`,
    );
  }

  return {
    title: input.title,
    body: parts.join(" · ") || "Service reminder",
    href: input.href,
  };
}
