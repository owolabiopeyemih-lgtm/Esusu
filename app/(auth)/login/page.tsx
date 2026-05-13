"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const FEATURES = [
  "Professional invoices in seconds",
  "PDF download & shareable links",
  "Track payments & overdue status",
  "Multi-currency support",
]

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError("Invalid email or password")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Editorial branding panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#18150F" }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Right edge separator */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-white/8" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/20 text-white/80 text-sm font-mono font-bold">
            Q
          </span>
          <span className="font-display italic text-white/80 text-base">Quick Invoice</span>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-mono mb-5">
              Invoice Management
            </p>
            <h1 className="text-[3.25rem] font-display font-light italic text-white leading-[1.05] tracking-tight">
              Invoice smarter.
              <br />
              <span style={{ color: "#D4922B" }}>Get paid faster.</span>
            </h1>
            <p className="mt-4 text-white/45 text-sm leading-relaxed max-w-xs">
              Professional invoicing for small businesses and freelancers. Send, track, and get paid — all in one place.
            </p>
          </div>

          <div className="h-px bg-white/10" />

          <ul className="space-y-3.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/50 text-sm">
                <span className="h-px w-5 shrink-0" style={{ backgroundColor: "#D4922B" }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <p className="text-white/20 text-xs font-mono">© {new Date().getFullYear()} Quick Invoice</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-7 animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-primary/40 text-primary text-xs font-mono font-bold">Q</span>
            <span className="font-display italic text-base">Quick Invoice</span>
          </div>

          <div>
            <h2 className="text-3xl font-display font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide">Email address</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="font-mono text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="font-mono text-sm" />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/8 px-3 py-2 rounded-sm border border-destructive/15">{error}</p>
            )}
            <Button type="submit" className="w-full font-medium tracking-wide" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
