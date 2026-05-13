"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"]

interface Props {
  user: {
    name: string | null
    email: string
    businessName: string | null
    businessLogo: string | null
    businessAddress: string | null
    bankName: string | null
    bankAccountName: string | null
    bankAccount: string | null
    signatureText: string | null
    currency: string
    taxRate: number
  }
}

function Section({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("bg-card rounded-sm card-shadow overflow-hidden", className)}>
      <div className="px-5 py-3.5 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/80 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>}
    </div>
  )
}

export default function SettingsForm({ user }: Props) {
  const router = useRouter()
  const [currency, setCurrency] = useState(user.currency)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [logoUrl, setLogoUrl] = useState(user.businessLogo ?? "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("saving")
    setErrorMsg("")

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          businessName: form.get("businessName"),
          businessLogo: form.get("businessLogo"),
          businessAddress: form.get("businessAddress"),
          bankName: form.get("bankName"),
          bankAccountName: form.get("bankAccountName"),
          bankAccount: form.get("bankAccount"),
          signatureText: form.get("signatureText"),
          currency,
          taxRate: parseFloat(form.get("taxRate") as string) || 0,
        }),
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setErrorMsg(data?.error ?? "Failed to save settings. Please try again.")
        setStatus("error")
        return
      }

      setStatus("saved")
      router.refresh()
      setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setErrorMsg("Network error — check your connection and try again.")
      setStatus("error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Business Profile */}
      <Section
        title="Business Profile"
        description="Appears in the 'From' section on every invoice you create."
      >
        <div className="space-y-4">
          <Field label="Business / Company Name" hint="Shown as the sender name on all invoices.">
            <Input
              name="businessName"
              placeholder="Acme Ltd"
              defaultValue={user.businessName ?? ""}
              className="text-sm"
            />
          </Field>

          <Field label="Logo URL" hint="A direct link to your logo image. Appears at the top of every invoice.">
            <Input
              name="businessLogo"
              placeholder="https://your-domain.com/logo.png"
              defaultValue={user.businessLogo ?? ""}
              className="text-sm font-mono"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo preview"
                className="h-10 mt-2 object-contain rounded-sm border border-border"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </Field>

          <Field label="Business Address" hint="Shown below your business name on invoices.">
            <Textarea
              name="businessAddress"
              rows={3}
              className="text-sm resize-none"
              placeholder={"14 Broad Street\nLagos Island, Lagos\nNigeria"}
              defaultValue={user.businessAddress ?? ""}
            />
          </Field>

          <Field
            label="Authorized Signature Name"
            hint="Rendered in cursive at the bottom of each invoice as your authorized signature."
          >
            <Input
              name="signatureText"
              placeholder="e.g. John Adewale"
              defaultValue={user.signatureText ?? ""}
              className="text-sm"
            />
            {user.signatureText && (
              <p style={{ fontFamily: "cursive" }} className="text-xl text-muted-foreground mt-1 pl-1">
                {user.signatureText}
              </p>
            )}
          </Field>
        </div>
      </Section>

      {/* Bank Details */}
      <Section
        title="Bank Details"
        description="Pre-filled in the Payment section of every new invoice. Your clients send money here."
      >
        <div className="space-y-4">
          <Field label="Bank Name">
            <Input
              name="bankName"
              placeholder="e.g. GTBank"
              defaultValue={user.bankName ?? ""}
              className="text-sm"
            />
          </Field>
          <Field label="Account Name">
            <Input
              name="bankAccountName"
              placeholder="e.g. Acme Ltd"
              defaultValue={user.bankAccountName ?? ""}
              className="text-sm"
            />
          </Field>
          <Field label="Account Number">
            <Input
              name="bankAccount"
              placeholder="0123456789"
              defaultValue={user.bankAccount ?? ""}
              className="text-sm font-mono"
            />
          </Field>
        </div>
      </Section>

      {/* Invoice Defaults */}
      <Section
        title="Invoice Defaults"
        description="These values are pre-selected when you create a new invoice. You can always override them per invoice."
      >
        <div className="space-y-4">
          <Field label="Default Currency">
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default Tax Rate (%)" hint="Applied to invoice totals. Set to 0 if you don't charge tax.">
            <Input
              name="taxRate"
              type="number"
              min={0}
              max={100}
              step="any"
              defaultValue={user.taxRate}
              className="text-sm w-32"
            />
          </Field>
        </div>
      </Section>

      {/* Account */}
      <Section
        title="Account"
        description="Your login credentials."
      >
        <div className="space-y-4">
          <Field label="Full Name">
            <Input name="name" defaultValue={user.name ?? ""} className="text-sm" />
          </Field>
          <Field label="Email Address" hint="Used to log in to your account.">
            <Input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              className="text-sm font-mono"
            />
          </Field>
        </div>
      </Section>

      {/* Error / success feedback */}
      {status === "error" && (
        <div className="rounded-sm border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3 pt-1 pb-6">
        <Button
          type="submit"
          disabled={status === "saving"}
          className={cn("font-medium tracking-wide", status === "saved" && "bg-emerald-600 hover:bg-emerald-600")}
        >
          {status === "saving" && "Saving…"}
          {status === "saved" && (
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Saved
            </span>
          )}
          {(status === "idle" || status === "error") && "Save settings"}
        </Button>
        {status === "saved" && (
          <p className="text-xs text-muted-foreground">Changes will appear on all new invoices.</p>
        )}
      </div>
    </form>
  )
}
