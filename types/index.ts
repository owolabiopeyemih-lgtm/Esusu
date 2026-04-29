export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE"

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface SenderInfo {
  businessName: string | null
  businessLogo: string | null
  businessAddress: string | null
  email: string
  bankName: string | null
  bankAccountName: string | null
  bankAccount: string | null
  signatureText: string | null
}

export interface InvoiceFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  issueDate: string
  dueDate: string
  currency: string
  taxRate: number
  notes: string
  items: InvoiceItem[]
  paymentMethod: string
  paymentDetails: string
  thankYouNote: string
  signatureText?: string
}

export interface Invoice {
  id: string
  number: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  clientAddress: string | null
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  status: InvoiceStatus
  dueDate: Date | null
  issueDate: Date
  notes: string | null
  paymentMethod: string | null
  paymentDetails: string | null
  thankYouNote: string | null
  shareToken: string
  createdAt: Date
  updatedAt: Date
  user: SenderInfo & { email: string }
}
