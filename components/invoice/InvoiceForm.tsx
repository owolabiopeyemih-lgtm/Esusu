"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import InvoicePreview from "./InvoicePreview"
import { calcInvoiceTotals } from "@/lib/invoice"
import { cn } from "@/lib/utils"
import type { InvoiceItem, InvoiceFormData, SenderInfo } from "@/types"

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"]
const PAYMENT_METHODS = ["Bank Transfer", "Cash", "Cheque", "Mobile Money", "Other"]
const EMPTY_ITEM: InvoiceItem = { description: "", quantity: 1, unitPrice: 0, amount: 0 }

interface Props {
  invoiceId?: string
  invoiceNumber?: string
  defaultValues?: Partial<InvoiceFormData>
  sender: SenderInfo & { email: string; taxRate?: number }
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card rounded-xl card-shadow overflow-hidden", className)}>
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function InvoiceForm({ invoiceId, invoiceNumber, defaultValues, sender }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form")

  const [items, setItems] = useState<InvoiceItem[]>(defaultValues?.items ?? [{ ...EMPTY_ITEM }])
  const [taxRate, setTaxRate] = useState(defaultValues?.taxRate ?? sender.taxRate ?? 0)
  const [currency, setCurrency] = useState(defaultValues?.currency ?? "NGN")
  const [paymentMethod, setPaymentMethod] = useState(defaultValues?.paymentMethod ?? "Bank Transfer")
  const [clientName, setClientName] = useState(defaultValues?.clientName ?? "")
  const [clientEmail, setClientEmail] = useState(defaultValues?.clientEmail ?? "")
  const [clientPhone, setClientPhone] = useState(defaultValues?.clientPhone ?? "")
  const [clientAddress, setClientAddress] = useState(defaultValues?.clientAddress ?? "")
  const [issueDate, setIssueDate] = useState(defaultValues?.issueDate ?? new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState(defaultValues?.dueDate ?? "")
  const [notes, setNotes] = useState(defaultValues?.notes ?? "")
  const [paymentDetails, setPaymentDetails] = useState(defaultValues?.paymentDetails ?? "")
  const [thankYouNote, setThankYouNote] = useState(defaultValues?.thankYouNote ?? "Thank you for your business!")
  const [signatureText, setSignatureText] = useState(defaultValues?.signatureText ?? sender.signatureText ?? "")

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      if (field === "quantity" || field === "unitPrice") {
        next[index].amount = next[index].quantity * next[index].unitPrice
      }
      return next
    })
  }

  const { subtotal, taxAmount, total } = calcInvoiceTotals(items, taxRate)

  const previewData = {
    number: invoiceNumber ?? "INV-XXXX",
    issueDate,
    dueDate,
    currency,
    taxRate,
    items,
    subtotal,
    taxAmount,
    total,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    notes,
    paymentMethod,
    paymentDetails,
    thankYouNote,
    sender: { ...sender, signatureText: signatureText || null },
  }

  async function save(status: "DRAFT" | "SENT") {
    setError("")

    // Strip items with no description before validating
    const validItems = items.filter((item) => item.description.trim().length > 0)
    if (validItems.length === 0) {
      setError("Add at least one line item with a description before saving.")
      return
    }

    // Basic email format check
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      setError("The client email address doesn't look valid.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(invoiceId ? `/api/invoices/${invoiceId}` : "/api/invoices", {
        method: invoiceId ? "PATCH" : "POST",
        body: JSON.stringify({
          clientName, clientEmail, clientPhone, clientAddress,
          issueDate, dueDate, currency, taxRate,
          notes, paymentMethod, paymentDetails, thankYouNote,
          signatureText: signatureText || null,
          items: validItems,
          status,
        }),
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const detail = body?.error?.formErrors?.[0] ?? body?.error ?? null
        setError(typeof detail === "string" ? detail : "Failed to save invoice. Check all fields and try again.")
        return
      }

      const data = await res.json()
      router.push(`/invoices/${data.id}`)
    } catch {
      setError("Network error — please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl lg:hidden">
        {(["form", "preview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-150",
              activeTab === tab
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "form" ? "Form" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── FORM ── */}
        <div className={cn("space-y-4", activeTab === "preview" ? "hidden lg:block" : "")}>

          {/* FROM */}
          <Section title="From">
            <div className="flex items-start gap-3">
              {sender.businessLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sender.businessLogo} alt="logo" className="h-9 w-auto object-contain rounded-lg border" />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                  {(sender.businessName ?? sender.email)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{sender.businessName || sender.email}</p>
                {sender.businessAddress && (
                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line leading-relaxed">{sender.businessAddress}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{sender.email}</p>
              </div>
            </div>
            <a href="/settings" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Edit in Settings
            </a>
          </Section>

          {/* BILL TO */}
          <Section title="Bill To">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Client / Company Name <span className="text-destructive">*</span></Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Corp" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@company.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+234 800 000 0000" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Address</Label>
                <Textarea rows={2} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder={"14 Broad Street\nLagos Island, Lagos"} className="resize-none" />
              </div>
            </div>
          </Section>

          {/* INVOICE DETAILS */}
          <Section title="Invoice Details">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Issue Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Due Date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Currency</Label>
                <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* LINE ITEMS */}
          <Section title="Line Items">
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_60px_80px_80px_20px] gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1">
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">Amount</span>
                <span />
              </div>

              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_60px_80px_80px_20px] gap-1.5 items-center">
                  <Input
                    className="h-8 text-xs"
                    placeholder="Service or product description"
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                  />
                  <Input
                    className="h-8 text-xs text-right"
                    type="number" min={0.01} step="any"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    className="h-8 text-xs text-right"
                    type="number" min={0} step="any"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-xs text-right font-mono text-muted-foreground pr-1">
                    {item.amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive transition-colors text-xs leading-none"
                    onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                    disabled={items.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setItems((p) => [...p, { ...EMPTY_ITEM }])}
                className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Add line item
              </button>
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular">{subtotal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Tax (%)</span>
                <Input
                  type="number" min={0} max={100} step="any"
                  className="w-20 h-7 text-right text-xs"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({taxRate}%)</span>
                  <span className="tabular">{taxAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-base pt-2 border-t border-border">
                <span>Total ({currency})</span>
                <span className="tabular">{total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </Section>

          {/* PAYMENT */}
          <Section title="Payment">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Payment Details</Label>
                <Textarea
                  rows={3}
                  className="resize-none text-xs"
                  placeholder={"GTBank — 0123456789\nAccount Name: Your Company Ltd"}
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                />
                {!paymentDetails && sender.bankAccount && (
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use bank details from <a href="/settings" className="text-primary underline">Settings</a>
                  </p>
                )}
              </div>
            </div>
          </Section>

          {/* ADDITIONAL */}
          <Section title="Additional">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  rows={2}
                  className="resize-none text-xs"
                  placeholder="Any additional notes or payment instructions…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Thank You Message</Label>
                <Input
                  value={thankYouNote}
                  onChange={(e) => setThankYouNote(e.target.value)}
                  placeholder="Thank you for your business!"
                  className="text-xs"
                />
              </div>
            </div>
          </Section>

          {/* AUTHORIZED SIGNATURE */}
          <Section title="Authorized Signature">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Signatory Name</Label>
                <Input
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  placeholder="Name shown as cursive signature on the invoice"
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Set a default in{" "}
                  <a href="/settings" className="text-primary underline">Settings → Signature Name</a>
                </p>
              </div>

              {/* Signature preview */}
              <div className="flex justify-center pt-1">
                {/* Authorized signature */}
                <div className="w-56 text-center">
                  <div className="h-12 flex items-end justify-center pb-1 border-b border-border">
                    {signatureText ? (
                      <span style={{ fontFamily: "cursive" }} className="text-2xl text-foreground leading-none">
                        {signatureText}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic mb-1">signature preview</span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground mt-1.5 uppercase tracking-widest">
                    Authorized Signature
                  </p>
                  {sender.businessName && (
                    <p className="text-xs text-muted-foreground mt-0.5">{sender.businessName}</p>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Save actions */}
          <div className="flex gap-3 pt-1 pb-6">
            <Button
              variant="outline"
              onClick={() => save("DRAFT")}
              disabled={loading || !clientName}
              className="gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Draft
            </Button>
            <Button
              onClick={() => save("SENT")}
              disabled={loading || !clientName}
              className="gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {loading ? "Saving…" : invoiceId ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </div>

        {/* ── PREVIEW ── */}
        <div className={cn("lg:sticky lg:top-20", activeTab === "form" ? "hidden lg:block" : "")}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Live Preview</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Updates as you type
            </span>
          </div>
          <InvoicePreview data={previewData} />
        </div>
      </div>
    </div>
  )
}
