import { getDefaultUser } from "@/lib/default-user"
import InvoiceForm from "@/components/invoice/InvoiceForm"

export default async function NewInvoicePage() {
  const user = await getDefaultUser()

  const sender = {
    businessName: user.businessName,
    businessLogo: user.businessLogo,
    businessAddress: user.businessAddress,
    email: user.email,
    bankName: user.bankName,
    bankAccountName: user.bankAccountName,
    bankAccount: user.bankAccount,
    signatureText: user.signatureText,
    taxRate: user.taxRate,
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Invoice</h1>
      <InvoiceForm sender={sender} />
    </div>
  )
}
