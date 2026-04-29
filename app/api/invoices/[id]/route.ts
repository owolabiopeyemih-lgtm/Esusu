import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import { calcInvoiceTotals } from "@/lib/invoice"
import { z } from "zod"

const updateSchema = z.object({
  clientName: z.string().min(1).optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentDetails: z.string().optional(),
  thankYouNote: z.string().optional(),
  signatureText: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]).optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
  })).optional(),
})

async function getOwnedInvoice(id: string, userId: string) {
  return db.invoice.findFirst({ where: { id, userId }, include: { items: true } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { id: userId } = await getDefaultUser()
  const invoice = await getOwnedInvoice(id, userId)
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { id: userId } = await getDefaultUser()
  const existing = await getOwnedInvoice(id, userId)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { items, taxRate, issueDate, dueDate, clientEmail, ...rest } = parsed.data

  const updateData: Record<string, unknown> = { ...rest }
  if (clientEmail !== undefined) updateData.clientEmail = clientEmail || null
  if (issueDate) updateData.issueDate = new Date(issueDate)
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

  if (items) {
    const itemsWithAmounts = items.map((item) => ({ ...item, amount: item.quantity * item.unitPrice }))
    const effectiveTaxRate = taxRate ?? existing.taxRate
    const { subtotal, taxAmount, total } = calcInvoiceTotals(itemsWithAmounts, effectiveTaxRate)
    Object.assign(updateData, {
      taxRate: effectiveTaxRate, subtotal, taxAmount, total,
      items: { deleteMany: {}, create: itemsWithAmounts },
    })
  } else if (taxRate !== undefined) {
    const existingItems = existing.items.map((i: { description: string; quantity: number; unitPrice: number; amount: number }) => ({
      description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, amount: i.amount,
    }))
    const { subtotal, taxAmount, total } = calcInvoiceTotals(existingItems, taxRate)
    Object.assign(updateData, { taxRate, subtotal, taxAmount, total })
  }

  const invoice = await db.invoice.update({
    where: { id },
    data: updateData,
    include: { items: true },
  })

  return NextResponse.json(invoice)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { id: userId } = await getDefaultUser()
  const existing = await getOwnedInvoice(id, userId)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await db.invoice.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
