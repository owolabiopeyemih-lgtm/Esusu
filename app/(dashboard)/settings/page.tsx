import { getDefaultUser } from "@/lib/default-user"
import SettingsForm from "@/components/SettingsForm"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const user = await getDefaultUser()

  return (
    <div className="max-w-xl">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl font-display font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Set up your business details once — they&apos;ll be pre-filled on every invoice you create.
        </p>
      </div>
      <div className="animate-fade-up delay-50">
        <SettingsForm user={{
          name: user.name,
          email: user.email,
          businessName: user.businessName,
          businessLogo: user.businessLogo,
          businessAddress: user.businessAddress,
          bankName: user.bankName,
          bankAccountName: user.bankAccountName,
          bankAccount: user.bankAccount,
          signatureText: user.signatureText,
          currency: user.currency,
          taxRate: user.taxRate,
        }} />
      </div>
    </div>
  )
}
