import { db } from "@/lib/db"
import { getDefaultUser } from "@/lib/default-user"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { formatCurrency, STATUS_COLORS, STATUS_DOT } from "@/lib/invoice"
import type { InvoiceStatus } from "@/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function StatCard({
  label,
  value,
  sub,
  accentClass,
}: {
  label: string
  value: string
  sub?: string
  accentClass: string
}) {
  return (
    <div className="bg-card rounded-sm card-shadow flex flex-col justify-between p-5 relative overflow-hidden min-h-[96px]">
      <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", accentClass)} />
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em]">{label}</p>
      <div>
        <p className="text-3xl font-display font-semibold tabular tracking-tight text-foreground leading-none mt-2">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getDefaultUser()
  const userId = user.id

  const [invoices, totalPaid, totalOutstanding, totalInvoices] = await Promise.all([
    db.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.invoice.aggregate({ where: { userId, status: "PAID" }, _sum: { total: true } }),
    db.invoice.aggregate({ where: { userId, status: { in: ["SENT", "OVERDUE"] } }, _sum: { total: true } }),
    db.invoice.count({ where: { userId } }),
  ])

  const currency = user.currency

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">
            {user.businessName ? user.businessName : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/invoices/new" className={cn(buttonVariants(), "gap-1.5 font-medium")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="animate-fade-up delay-50">
          <StatCard
            label="Total Paid"
            value={formatCurrency(totalPaid._sum.total ?? 0, currency)}
            accentClass="bg-emerald-500"
          />
        </div>
        <div className="animate-fade-up delay-100">
          <StatCard
            label="Outstanding"
            value={formatCurrency(totalOutstanding._sum.total ?? 0, currency)}
            accentClass="bg-amber-500"
          />
        </div>
        <div className="animate-fade-up delay-150">
          <StatCard
            label="Total Invoices"
            value={String(totalInvoices)}
            sub={totalInvoices === 1 ? "invoice created" : "invoices created"}
            accentClass="bg-primary"
          />
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-card rounded-sm card-shadow overflow-hidden animate-fade-up delay-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-semibold text-lg leading-none">Recent Invoices</h2>
            {invoices.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono">({invoices.length})</span>
            )}
          </div>
          {invoices.length > 0 && (
            <Link href="/invoices" className="text-xs text-primary hover:underline font-medium tracking-wide">
              View all →
            </Link>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-dashed border-border mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="font-display font-semibold text-lg">No invoices yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-5">Create your first invoice to get started</p>
            <Link href="/invoices/new" className={cn(buttonVariants({ size: "sm" }))}>
              Create invoice
            </Link>
          </div>
        ) : (
          <ul>
            {invoices.map((inv, i) => (
              <li key={inv.id} className={cn(i < invoices.length - 1 && "border-b border-border")}>
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors group"
                >
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[inv.status as InvoiceStatus])} />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{inv.clientName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{inv.number}</p>
                  </div>

                  <p className="hidden sm:block text-xs text-muted-foreground shrink-0 font-mono">
                    {inv.issueDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-mono font-semibold tabular">{formatCurrency(inv.total, inv.currency)}</span>
                    <span className={cn("hidden sm:inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium", STATUS_COLORS[inv.status as InvoiceStatus])}>
                      {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
