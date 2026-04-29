"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { InvoiceStatus } from "@/types"

const NEXT_STATUSES: Partial<Record<InvoiceStatus, InvoiceStatus>> = {
  DRAFT: "SENT",
  SENT: "PAID",
}

interface Props {
  invoiceId: string
  currentStatus: InvoiceStatus
}

export default function InvoiceStatusActions({ invoiceId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const nextStatus = NEXT_STATUSES[currentStatus]

  if (!nextStatus) return null

  async function advance() {
    setLoading(true)
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
      headers: { "Content-Type": "application/json" },
    })
    setLoading(false)
    router.refresh()
  }

  const labels: Record<string, string> = {
    SENT: "Mark as Sent",
    PAID: "Mark as Paid",
  }

  return (
    <Button variant="secondary" onClick={advance} disabled={loading}>
      {loading ? "Updating…" : labels[nextStatus]}
    </Button>
  )
}
