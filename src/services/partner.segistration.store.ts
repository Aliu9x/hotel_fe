export function generateRegistrationCode(): string {
  const num = Math.floor(100000000 + Math.random() * 900000000); // 9 digits
  return String(num);
}
