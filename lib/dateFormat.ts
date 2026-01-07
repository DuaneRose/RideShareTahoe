export function formatDateLabel(value?: string | null) {
  if (!value) return null;
  const [datePart] = value.split('T');
  if (!datePart) return null;
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeLabel(value?: string | null) {
  if (!value) return null;
  const [hoursPart, minutesPart] = value.split(':');
  const parsedHours = Number(hoursPart);
  if (Number.isNaN(parsedHours)) return null;
  const minutes = minutesPart ? minutesPart.slice(0, 2) : '00';
  const normalizedMinutes = minutes.padEnd(2, '0');
  const hourIn12 = parsedHours % 12 === 0 ? 12 : parsedHours % 12;
  const period = parsedHours >= 12 ? 'PM' : 'AM';
  return `${hourIn12}:${normalizedMinutes} ${period}`;
}
