import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { formatCurrency, STATUS_COLORS, STATUS_DOT } from "@/lib/invoice"
import type { InvoiceStatus, InvoiceItem } from "@/types"
import InvoiceStatusActions from "@/components/invoice/InvoiceStatusActions"
import InvoicePreview from "@/components/invoice/InvoicePreview"
import { calcInvoiceTotals } from "@/lib/invoice"
import { cn } from "@/lib/utils"

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getDefaultUser()

  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
    include: { items: true, user: true },
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

  const sender = {
    businessName: user.businessName,
    businessLogo: user.businessLogo,
    businessAddress: user.businessAddress,
    email: user.email,
    bankName: user.bankName,
    bankAccountName: user.bankAccountName,
    bankAccount: user.bankAccount,
    signatureText: invoice.signatureText ?? user.signatureText,
  }

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
    sender,
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/invoices" className="text-muted-foreground hover:text-foreground transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[invoice.status as InvoiceStatus])} />
              <h1 className="font-bold text-xl font-mono">{invoice.number}</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{invoice.clientName}</p>
          </div>
          <span className={cn("hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[invoice.status as InvoiceStatus])}>
            {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/invoices/${id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Edit
          </Link>
          <a
            href={`/api/invoices/${id}/pdf`}
            download
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </a>
          <Link
            href={`/invoice/${invoice.shareToken}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Share
          </Link>
        </div>
      </div>

      {/* Status advance */}
      <InvoiceStatusActions invoiceId={id} currentStatus={invoice.status as InvoiceStatus} />

      {/* Invoice preview */}
      <InvoicePreview data={previewData} />

      {/* Meta footer */}
      <p className="text-xs text-center text-muted-foreground pb-4">
        Created {invoice.createdAt.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
        {invoice.updatedAt > invoice.createdAt && ` · Updated ${invoice.updatedAt.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}`}
      </p>
    </div>
  )
}
