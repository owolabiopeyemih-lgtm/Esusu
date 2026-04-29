import { type InvoiceItem } from "@/types"

export function calcInvoiceTotals(items: InvoiceItem[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  return { subtotal, taxAmount, total }
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amount)
}

export function generateInvoiceNumber(count: number) {
  return `INV-${String(count + 1).padStart(4, "0")}`
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:   "bg-zinc-100 text-zinc-600 border border-zinc-200",
  SENT:    "bg-blue-50  text-blue-700  border border-blue-200",
  PAID:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  OVERDUE: "bg-red-50   text-red-600   border border-red-200",
}

export const STATUS_DOT: Record<string, string> = {
  DRAFT:   "bg-zinc-400",
  SENT:    "bg-blue-500",
  PAID:    "bg-emerald-500",
  OVERDUE: "bg-red-500",
}
