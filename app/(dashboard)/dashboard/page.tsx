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

const STEPS = [
  {
    number: "01",
    title: "Set up your business profile",
    description: "Add your name, logo, address, and bank details. These pre-fill on every invoice.",
    href: "/settings",
    cta: "Go to Settings →",
    checkField: "businessName" as const,
  },
  {
    number: "02",
    title: "Create your first invoice",
    description: "Fill in client details, add line items, and send or save as draft.",
    href: "/invoices/new",
    cta: "New Invoice →",
    checkField: null,
  },
  {
    number: "03",
    title: "Share the link and get paid",
    description: "Every invoice gets a public shareable link. Send it to your client — no login required to view.",
    href: null,
    cta: null,
    checkField: null,
  },
]

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
  const profileComplete = !!user.businessName
  const hasInvoices = invoices.length > 0
  const showOnboarding = !hasInvoices

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
          <StatCard label="Total Paid" value={formatCurrency(totalPaid._sum.total ?? 0, currency)} accentClass="bg-emerald-500" />
        </div>
        <div className="animate-fade-up delay-100">
          <StatCard label="Outstanding" value={formatCurrency(totalOutstanding._sum.total ?? 0, currency)} accentClass="bg-amber-500" />
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

      {/* Onboarding guide — shown until first invoice is created */}
      {showOnboarding && (
        <div className="bg-card rounded-sm card-shadow overflow-hidden animate-fade-up delay-200">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Get started</p>
            <p className="text-xs text-muted-foreground mt-0.5">Follow these steps to send your first invoice</p>
          </div>
          <div className="divide-y divide-border">
            {STEPS.map((step, i) => {
              const done = (i === 0 && profileComplete) || (i === 1 && hasInvoices)
              return (
                <div key={step.number}>
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-accent/40 transition-colors group"
                    >
                      <StepContent step={step} done={done} />
                    </Link>
                  ) : (
                    <div className="flex items-start gap-4 px-5 py-4 opacity-60">
                      <StepContent step={step} done={done} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent invoices */}
      {hasInvoices && (
        <div className="bg-card rounded-sm card-shadow overflow-hidden animate-fade-up delay-200">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-semibold text-lg leading-none">Recent Invoices</h2>
              <span className="text-xs text-muted-foreground font-mono">({invoices.length})</span>
            </div>
            <Link href="/invoices" className="text-xs text-primary hover:underline font-medium tracking-wide">
              View all →
            </Link>
          </div>
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
        </div>
      )}

      {/* Profile setup nudge — shown even after first invoice if profile is empty */}
      {!profileComplete && hasInvoices && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10 px-5 py-4 flex items-start gap-4 animate-fade-up delay-250">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber-600 shrink-0 mt-0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Your business profile is incomplete</p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5">
              Add your business name, address, and bank details so they appear on your invoices.
            </p>
          </div>
          <Link href="/settings" className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline shrink-0">
            Set up →
          </Link>
        </div>
      )}
    </div>
  )
}

function StepContent({ step, done }: { step: typeof STEPS[number]; done: boolean }) {
  return (
    <>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 font-mono font-bold text-sm transition-colors",
        done
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-primary text-primary"
      )}>
        {done
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          : step.number
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm", done && "line-through text-muted-foreground")}>{step.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
        {step.cta && !done && (
          <p className="text-xs text-primary font-medium mt-1.5">{step.cta}</p>
        )}
      </div>
    </>
  )
}
