export function toIsoDateTime(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
