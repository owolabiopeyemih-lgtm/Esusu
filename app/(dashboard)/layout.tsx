import Link from "next/link"
import NavLink from "@/components/NavLink"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border">
        <div className="px-4 h-13 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-primary/40 text-primary text-xs font-mono font-bold">
              Q
            </span>
            <span className="font-display italic text-base text-foreground">Quick Invoice</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/dashboard" exact compact>Home</NavLink>
            <NavLink href="/invoices" compact>Invoices</NavLink>
            <NavLink href="/settings" compact>Settings</NavLink>
          </nav>
        </div>
      </header>

      <div className="lg:flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-54 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">

          {/* Logo */}
          <div className="h-[60px] flex items-center px-5 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-primary/40 text-primary text-xs font-mono font-bold group-hover:border-primary transition-colors">
                Q
              </span>
              <span className="font-display italic text-[1.05rem] text-foreground">Quick Invoice</span>
            </Link>
          </div>

          {/* New Invoice CTA */}
          <div className="px-4 pt-5 pb-3">
            <Link
              href="/invoices/new"
              className={cn(buttonVariants({ size: "sm" }), "w-full justify-center gap-1.5 font-medium tracking-wide")}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Invoice
            </Link>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-border" />

          {/* Nav */}
          <nav className="flex-1 px-4 py-3 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] px-3 py-1.5">Menu</p>
            <NavLink href="/dashboard" exact>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
              Dashboard
            </NavLink>
            <NavLink href="/invoices">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Invoices
            </NavLink>
            <NavLink href="/settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </NavLink>
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground/40 font-mono tracking-widest uppercase">v1.0</p>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
