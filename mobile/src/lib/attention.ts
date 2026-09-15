import type { AttentionItem } from '../screens/DashboardScreen';

export interface ReminderLike {
  id: string;
  title: string;
  remindAt: string; // ISO instant
  active: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const LOOKAHEAD_DAYS = 30;
const MAX_ITEMS = 5;

/**
 * Turns active reminders into the dashboard's "needs your attention" list —
 * this app's whole reason to exist. It's a client-side stand-in for the
 * Phase 2 cascading-reminder feed (45/30/15/7/1-day chains computed
 * server-side): for now it just looks at whatever single reminders already
 * exist and buckets them by how soon they're due, so the dashboard isn't
 * empty while Phase 2 is still unbuilt.
 */
export function deriveAttentionItems(reminders: ReminderLike[], now: Date = new Date()): AttentionItem[] {
  return reminders
    .filter((r) => r.active)
    .map((r) => ({ reminder: r, daysUntil: (new Date(r.remindAt).getTime() - now.getTime()) / DAY_MS }))
    .filter(({ daysUntil }) => daysUntil <= LOOKAHEAD_DAYS)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, MAX_ITEMS)
    .map(({ reminder, daysUntil }) => ({
      id: reminder.id,
      title: reminder.title,
      subtitle: subtitleFor(daysUntil),
      urgency: urgencyFor(daysUntil),
    }));
}

function urgencyFor(daysUntil: number): AttentionItem['urgency'] {
  if (daysUntil <= 2) return 'urgent';
  if (daysUntil <= 7) return 'soon';
  return 'fine';
}

function subtitleFor(daysUntil: number): string {
  if (daysUntil < 0) return 'Overdue';
  if (daysUntil < 1) return 'Due today';
  if (daysUntil < 2) return 'Due tomorrow';
  return `Due in ${Math.ceil(daysUntil)} days`;
}
