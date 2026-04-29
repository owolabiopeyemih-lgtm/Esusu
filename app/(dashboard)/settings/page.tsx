import { getDefaultUser } from "@/lib/default-user"
import SettingsForm from "@/components/SettingsForm"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const user = await getDefaultUser()

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
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
  )
}
