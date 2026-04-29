import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import { calcInvoiceTotals, generateInvoiceNumber } from "@/lib/invoice"
import { z } from "zod"

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
})

const invoiceSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string().optional(),
  currency: z.string().default("NGN"),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentDetails: z.string().optional(),
  thankYouNote: z.string().optional(),
  signatureText: z.string().optional(),
  items: z.array(itemSchema).min(1),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]).default("DRAFT"),
})

export async function GET() {
  const { id: userId } = await getDefaultUser()
  const invoices = await db.invoice.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const { id: userId } = await getDefaultUser()

  const body = await req.json()
  const parsed = invoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { items, taxRate, issueDate, dueDate, clientEmail, ...rest } = parsed.data

  const itemsWithAmounts = items.map((item) => ({
    ...item,
    amount: item.quantity * item.unitPrice,
  }))

  const { subtotal, taxAmount, total } = calcInvoiceTotals(itemsWithAmounts, taxRate)
  const count = await db.invoice.count({ where: { userId } })
  const number = generateInvoiceNumber(count)

  const invoice = await db.invoice.create({
    data: {
      ...rest,
      clientEmail: clientEmail || null,
      number,
      userId,
      issueDate: new Date(issueDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      taxRate,
      subtotal,
      taxAmount,
      total,
      items: { create: itemsWithAmounts },
    },
    include: { items: true },
  })

  return NextResponse.json(invoice, { status: 201 })
}
