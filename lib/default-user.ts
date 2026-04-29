import { db } from "./db"

const DEFAULT_USER_EMAIL = "owner@esusu.local"

// Returns the single default user, creating it on first call.
export async function getDefaultUser() {
  let user = await db.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } })
  if (!user) {
    user = await db.user.create({
      data: {
        email: DEFAULT_USER_EMAIL,
        name: "Owner",
        currency: "NGN",
        taxRate: 0,
      },
    })
  }
  return user
}
