export type Status = 'Paid' | 'Pending' | 'Overdue';
export interface Invoice { id: string; client: string; service: string; amount: number; status: Status; date: string; }
export const starterInvoices: Invoice[] = [
  { id:'INV-1042',client:'Northstar Studio',service:'Website development',amount:2400,status:'Paid',date:'2026-10-19' },
  { id:'INV-1043',client:'Atlas Travel',service:'API integration',amount:1250,status:'Pending',date:'2026-10-20' },
  { id:'INV-1044',client:'Harbor Systems',service:'Platform maintenance',amount:875,status:'Overdue',date:'2026-10-05' },
  { id:'INV-1045',client:'Meridian Labs',service:'Frontend implementation',amount:1800,status:'Paid',date:'2026-10-21' },
  { id:'INV-1046',client:'Summit Ventures',service:'Dashboard design',amount:950,status:'Pending',date:'2026-10-22' },
  { id:'INV-1047',client:'Bluebird Media',service:'Consulting',amount:420,status:'Paid',date:'2026-10-23' },
];
export function money(value: number): string {
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
}
export function validateInvoice(client: string, service: string, amount: string): string | null {
  if (!client.trim()) return 'Client name is required.';
  if (!service.trim()) return 'Service description is required.';
  if (!amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0) return 'Enter a valid amount greater than zero.';
  if (Math.round(Number(amount)*100) / 100 !== Number(amount)) return 'Use no more than two decimal places.';
  return null;
}
export function csvEscape(value: string | number): string { return '"' + String(value).replace(/"/g,'""') + '"'; }
export function toCSV(invoices: Invoice[]): string {
  return [['ID','Client','Service','Amount','Status','Date'].join(','),...invoices.map(i => [i.id,i.client,i.service,i.amount.toFixed(2),i.status,i.date].map(csvEscape).join(','))].join('\r\n');
}
