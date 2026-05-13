import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { formatCurrency, STATUS_COLORS, STATUS_DOT } from "@/lib/invoice"
import type { InvoiceStatus } from "@/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function InvoicesPage() {
  const { id: userId, currency } = await getDefaultUser()
  const invoices = await db.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">
            {invoices.length === 0
              ? "No invoices yet"
              : `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href="/invoices/new" className={cn(buttonVariants(), "gap-1.5 font-medium")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-card rounded-sm card-shadow flex flex-col items-center justify-center py-20 text-center px-6 animate-fade-up delay-50">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-dashed border-border mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            </svg>
          </div>
          <p className="font-display font-semibold text-lg">No invoices yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Get paid faster by sending professional invoices</p>
          <Link href="/invoices/new" className={cn(buttonVariants({ size: "sm" }))}>
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-sm card-shadow overflow-hidden animate-fade-up delay-50">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-4 items-center px-5 py-2.5 border-b border-border bg-muted/40">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">Invoice</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">Client</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">Issued</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">Due</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] text-right">Amount</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">Status</span>
          </div>

          <ul>
            {invoices.map((inv, i) => (
              <li key={inv.id} className={cn(i < invoices.length - 1 && "border-b border-border")}>
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex sm:grid sm:grid-cols-[1fr_1.2fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 hover:bg-accent/50 transition-colors group"
                >
                  {/* Invoice number */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[inv.status as InvoiceStatus])} />
                    <span className="font-mono text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {inv.number}
                    </span>
                  </div>

                  <span className="text-sm truncate hidden sm:block">{inv.clientName}</span>

                  <span className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap font-mono">
                    {inv.issueDate.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </span>

                  <span className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap font-mono">
                    {inv.dueDate
                      ? inv.dueDate.toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                      : "—"}
                  </span>

                  <span className="text-sm font-mono font-semibold tabular text-right whitespace-nowrap ml-auto sm:ml-0">
                    {formatCurrency(inv.total, inv.currency ?? currency)}
                  </span>

                  <span className={cn("hidden sm:inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_COLORS[inv.status as InvoiceStatus])}>
                    {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
