import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import InvoiceForm from "@/components/invoice/InvoiceForm"

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getDefaultUser()

  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  })

  if (!invoice) notFound()

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

  const defaultValues = {
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail ?? "",
    clientPhone: invoice.clientPhone ?? "",
    clientAddress: invoice.clientAddress ?? "",
    issueDate: invoice.issueDate.toISOString().split("T")[0],
    dueDate: invoice.dueDate?.toISOString().split("T")[0] ?? "",
    currency: invoice.currency,
    taxRate: invoice.taxRate,
    notes: invoice.notes ?? "",
    paymentMethod: invoice.paymentMethod ?? "Bank Transfer",
    paymentDetails: invoice.paymentDetails ?? "",
    thankYouNote: invoice.thankYouNote ?? "Thank you for your business!",
    signatureText: invoice.signatureText ?? user.signatureText ?? "",
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })),
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit {invoice.number}</h1>
      <InvoiceForm invoiceId={id} invoiceNumber={invoice.number} defaultValues={defaultValues} sender={sender} />
    </div>
  )
}
