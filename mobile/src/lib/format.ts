const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const amount = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatBRL(cents: number): string {
  return currency.format(cents / 100);
}

export function formatZipCode(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

// Digits fill the value from the cents up, so "4990" reads as "49,90" and no decimal separator is ever typed
export function formatCentsInput(value: string): string {
  const digits = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9);

  return digits ? amount.format(Number(digits) / 100) : '';
}

export function parseCentsInput(value: string): number | null {
  const digits = value.replace(/\D/g, '');

  return digits ? Number(digits) : null;
}

export function formatDate(value: string | Date): string {
  return date.format(new Date(value));
}
