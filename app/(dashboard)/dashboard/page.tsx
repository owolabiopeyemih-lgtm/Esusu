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
  icon,
  iconBg,
}: {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <div className="bg-card rounded-xl p-5 card-shadow flex items-start gap-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold tabular truncate">{value}</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.businessName ? `Welcome, ${user.businessName}` : "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s happening with your invoices</p>
        </div>
        <Link href="/invoices/new" className={cn(buttonVariants(), "gap-1.5")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Paid"
          value={formatCurrency(totalPaid._sum.total ?? 0, currency)}
          iconBg="bg-emerald-100"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totalOutstanding._sum.total ?? 0, currency)}
          iconBg="bg-amber-100"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          }
        />
        <StatCard
          label="Total Invoices"
          value={String(totalInvoices)}
          iconBg="bg-blue-100"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          }
        />
      </div>

      {/* Recent invoices */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Recent Invoices</h2>
          {invoices.length > 0 && (
            <Link href="/invoices" className="text-xs text-primary hover:underline font-medium">
              View all →
            </Link>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="font-medium text-sm">No invoices yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first invoice to get started</p>
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
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-accent/60 transition-colors"
                >
                  {/* Status dot */}
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[inv.status as InvoiceStatus])} />

                  {/* Client + number */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{inv.clientName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{inv.number}</p>
                  </div>

                  {/* Date */}
                  <p className="hidden sm:block text-xs text-muted-foreground shrink-0">
                    {inv.issueDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>

                  {/* Amount + status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold tabular">{formatCurrency(inv.total, inv.currency)}</span>
                    <span className={cn("hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLORS[inv.status as InvoiceStatus])}>
                      {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground shrink-0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
