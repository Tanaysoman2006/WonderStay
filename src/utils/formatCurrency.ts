/**
 * Formats numbers in Indian Rupee (INR) currency format with ₹ symbol.
 * Uses 'en-IN' locale for standard Indian number grouping (lakhs & crores).
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatINRRaw(amount: number): string {
  if (isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('en-IN');
}
