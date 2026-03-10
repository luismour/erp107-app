export function sanitizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}