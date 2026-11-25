export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-NG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getUpcomingDates(daysCount = 14): { iso: string; weekday: string; dayNum: string; month: string }[] {
  const result: { iso: string; weekday: string; dayNum: string; month: string }[] = [];
  const today = new Date();
  for (let i = 0; i < daysCount; i++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() + i);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    result.push({
      iso: `${yyyy}-${mm}-${dd}`,
      weekday: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: dd,
      month: dt.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return result;
}
