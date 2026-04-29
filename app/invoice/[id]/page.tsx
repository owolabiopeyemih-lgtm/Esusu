import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { calcInvoiceTotals } from "@/lib/invoice"
import InvoicePreview from "@/components/invoice/InvoicePreview"
import type { InvoiceStatus } from "@/types"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const invoice = await db.invoice.findFirst({
    where: { OR: [{ shareToken: id }, { id }] },
    include: {
      items: true,
      user: {
        select: {
          name: true, email: true,
          businessName: true, businessLogo: true, businessAddress: true,
          bankName: true, bankAccountName: true, bankAccount: true,
          signatureText: true,
        },
      },
    },
  })

  if (!invoice) notFound()

  const items = invoice.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.amount,
  }))

  const { subtotal, taxAmount, total } = calcInvoiceTotals(items, invoice.taxRate)

  const previewData = {
    number: invoice.number,
    status: invoice.status as InvoiceStatus,
    issueDate: invoice.issueDate.toLocaleDateString("en-NG"),
    dueDate: invoice.dueDate?.toLocaleDateString("en-NG") ?? "",
    currency: invoice.currency,
    taxRate: invoice.taxRate,
    items,
    subtotal,
    taxAmount,
    total,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail ?? "",
    clientPhone: invoice.clientPhone ?? "",
    clientAddress: invoice.clientAddress ?? "",
    notes: invoice.notes ?? "",
    paymentMethod: invoice.paymentMethod ?? "",
    paymentDetails: invoice.paymentDetails ?? "",
    thankYouNote: invoice.thankYouNote ?? "",
    sender: {
      ...invoice.user,
      email: invoice.user.email,
    },
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-end">
          <a
            href={`/api/invoices/${invoice.shareToken}/pdf`}
            download
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Download PDF
          </a>
        </div>
        <InvoicePreview data={previewData} />
      </div>
    </div>
  )
}
