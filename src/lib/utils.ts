import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determine urgency level based on fill percentage
 */
export function getFillUrgency(fillPct: number): "critical" | "warning" | "normal" {
  if (fillPct >= 90) return "critical";
  if (fillPct >= 70) return "warning";
  return "normal";
}

/**
 * Return CSS color classes for fill urgency
 */
export function getUrgencyColor(urgency: "critical" | "warning" | "normal") {
  switch (urgency) {
    case "critical":
      return {
        bg: "bg-red-500",
        text: "text-red-400",
        border: "border-red-500/40",
        badge: "bg-red-950/80 text-red-400 border-red-700/50",
      };
    case "warning":
      return {
        bg: "bg-amber-500",
        text: "text-amber-400",
        border: "border-amber-500/40",
        badge: "bg-amber-950/80 text-amber-400 border-amber-700/50",
      };
    case "normal":
    default:
      return {
        bg: "bg-emerald-500",
        text: "text-emerald-400",
        border: "border-emerald-500/40",
        badge: "bg-emerald-950/80 text-emerald-400 border-emerald-700/50",
      };
  }
}

/**
 * Format timestamp to a relative time string
 */
export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
