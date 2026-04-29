import Link from "next/link"
import NavLink from "@/components/NavLink"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
              E
            </span>
            <span className="font-semibold text-sm tracking-tight">Esusu</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-6">
            <NavLink href="/dashboard" exact>Dashboard</NavLink>
            <NavLink href="/invoices">Invoices</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
