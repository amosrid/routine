export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function sumDurationsByLabel(items: { label: string; durationMinutes: number }[]) {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.label, (totals.get(item.label) ?? 0) + item.durationMinutes);
  }
  return Array.from(totals.entries()).map(([label, durationMinutes]) => ({
    label,
    durationMinutes
  }));
}
