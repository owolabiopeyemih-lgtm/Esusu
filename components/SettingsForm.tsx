"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function SettingsForm({ user }: Props) {
  const [currency, setCurrency] = useState(user.currency)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    await fetch("/api/user/settings", {
      method: "PATCH",
      body: JSON.stringify({
        name: form.get("name"),
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
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Profile */}
      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" name="name" defaultValue={user.name ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Company */}
      <Card>
        <CardHeader><CardTitle className="text-base">Company / Business</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="businessName">Company Name</Label>
            <Input id="businessName" name="businessName" defaultValue={user.businessName ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="businessLogo">Logo URL</Label>
            <Input
              id="businessLogo"
              name="businessLogo"
              type="url"
              placeholder="https://your-domain.com/logo.png"
              defaultValue={user.businessLogo ?? ""}
            />
            {user.businessLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.businessLogo} alt="logo preview" className="h-10 mt-1 object-contain rounded border" />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="businessAddress">Company Address</Label>
            <Textarea
              id="businessAddress"
              name="businessAddress"
              rows={3}
              placeholder={"123 Lagos Street\nLagos, Nigeria"}
              defaultValue={user.businessAddress ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="signatureText">Signature Name</Label>
            <Input
              id="signatureText"
              name="signatureText"
              placeholder="Your name as it appears on invoices"
              defaultValue={user.signatureText ?? ""}
            />
            <p className="text-xs text-muted-foreground">Shown in cursive as the authorized signature</p>
          </div>
        </CardContent>
      </Card>

      {/* Bank / Payment */}
      <Card>
        <CardHeader><CardTitle className="text-base">Bank Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" name="bankName" placeholder="e.g. GTBank" defaultValue={user.bankName ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bankAccountName">Account Name</Label>
            <Input id="bankAccountName" name="bankAccountName" defaultValue={user.bankAccountName ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bankAccount">Account Number</Label>
            <Input id="bankAccount" name="bankAccount" placeholder="0123456789" defaultValue={user.bankAccount ?? ""} />
          </div>
        </CardContent>
      </Card>

      {/* Invoice defaults */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invoice Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Default Currency</Label>
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
            <Input id="taxRate" name="taxRate" type="number" min={0} max={100} defaultValue={user.taxRate} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {saved ? "Saved!" : loading ? "Saving…" : "Save settings"}
      </Button>
    </form>
  )
}
