import { db } from "./db"

export async function getDefaultUser() {
  let user = await db.user.findFirst({ orderBy: { createdAt: "asc" } })
  if (!user) {
    user = await db.user.create({
      data: {
        email: "owner@quickinvoice.local",
        name: "Owner",
        currency: "NGN",
        taxRate: 0,
      },
    })
  }
  return user
}
