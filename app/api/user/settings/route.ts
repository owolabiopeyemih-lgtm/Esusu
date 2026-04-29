import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import { z } from "zod"

const schema = z.object({
  name: z.string().optional(),
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

  const user = await db.user.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(user)
}
