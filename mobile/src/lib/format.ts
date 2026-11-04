const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatBRL(cents: number): string {
  return currency.format(cents / 100);
}

export function formatDate(value: string | Date): string {
  return date.format(new Date(value));
}
