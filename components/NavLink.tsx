"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
  href: string
  children: React.ReactNode
  exact?: boolean
  compact?: boolean
}

export default function NavLink({ href, children, exact, compact }: Props) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 font-medium transition-all border-l-2",
        compact
          ? "px-2.5 py-1.5 text-xs rounded-sm"
          : "pl-3 pr-3 py-1.5 text-sm",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      )}
    >
      {children}
    </Link>
  )
}
