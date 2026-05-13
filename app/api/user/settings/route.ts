import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import { z } from "zod"

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  businessName: z.string().optional(),
  businessLogo: z.string().optional(),
  businessAddress: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccount: z.string().optional(),
  signatureText: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
})

export async function PATCH(req: NextRequest) {
  const { id } = await getDefaultUser()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  // Convert empty strings to null for nullable fields
  const d = parsed.data
  const data = {
    ...d,
    name:             d.name             || null,
    businessName:     d.businessName     || null,
    businessLogo:     d.businessLogo     || null,
    businessAddress:  d.businessAddress  || null,
    bankName:         d.bankName         || null,
    bankAccountName:  d.bankAccountName  || null,
    bankAccount:      d.bankAccount      || null,
    signatureText:    d.signatureText    || null,
  }

  const user = await db.user.update({ where: { id }, data })
  return NextResponse.json(user)
}
