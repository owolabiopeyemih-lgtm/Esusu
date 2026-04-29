import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/invoice"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const invoice = await db.invoice.findFirst({
    where: { OR: [{ id }, { shareToken: id }] },
    include: { items: true, user: true },
  })

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const fmt = (n: number) => formatCurrency(n, invoice.currency)
  const senderName = invoice.user.businessName ?? invoice.user.name ?? invoice.user.email
  const issueDate = invoice.issueDate.toLocaleDateString("en-NG")
  const dueDate = invoice.dueDate?.toLocaleDateString("en-NG") ?? "—"
  const sigText = invoice.signatureText ?? invoice.user.signatureText

  const rows = invoice.items
    .map((item: { description: string; quantity: number; unitPrice: number; amount: number }) => `
      <tr>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0">${item.description}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right">${item.quantity}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right">${fmt(item.unitPrice)}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:500">${fmt(item.amount)}</td>
      </tr>`)
    .join("")

  const paymentBlock = invoice.paymentMethod || invoice.paymentDetails || invoice.user.bankAccount ? `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;font-size:13px">
      <p style="font-weight:600;color:#6b7280;text-transform:uppercase;font-size:11px;letter-spacing:.05em;margin:0 0 8px">Payment Details</p>
      ${invoice.paymentMethod ? `<p style="margin:0 0 4px;font-weight:500">${invoice.paymentMethod}</p>` : ""}
      ${invoice.paymentDetails
        ? `<p style="margin:0;color:#374151;white-space:pre-line">${invoice.paymentDetails}</p>`
        : invoice.user.bankAccount
          ? `<p style="margin:0;color:#374151">${invoice.user.bankName ?? ""}<br>${invoice.user.bankAccountName ?? ""}<br><code>${invoice.user.bankAccount}</code></p>`
          : ""}
    </div>` : ""

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; padding: 48px; max-width: 720px; margin: 0 auto; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>

  <!-- ── Letterhead ── -->
  <div style="margin-bottom:36px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:32px">

      <!-- Left: company identity -->
      <div style="flex:1;min-width:0">
        ${invoice.user.businessLogo
          ? `<img src="${invoice.user.businessLogo}" alt="logo" style="height:60px;max-width:160px;object-fit:contain;margin-bottom:12px;display:block">`
          : `<div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;margin-bottom:12px">${senderName[0].toUpperCase()}</div>`}
        <p style="font-size:22px;font-weight:900;color:#111827;line-height:1.2;margin-bottom:8px">${senderName}</p>
        ${invoice.user.businessAddress
          ? `<p style="font-size:12px;color:#6b7280;white-space:pre-line;line-height:1.7;margin-bottom:4px">${invoice.user.businessAddress}</p>`
          : ""}
        <p style="font-size:12px;color:#9ca3af">${invoice.user.email}</p>
      </div>

      <!-- Right: invoice meta -->
      <div style="text-align:right;flex-shrink:0">
        <p style="font-size:30px;font-weight:900;color:#111827;line-height:1;letter-spacing:-0.5px">INVOICE</p>
        <p style="font-size:14px;color:#4f46e5;font-family:monospace;font-weight:600;margin-top:8px">${invoice.number}</p>
        <p style="font-size:12px;color:#6b7280;margin-top:10px">Issued: ${issueDate}</p>
        <p style="font-size:12px;color:#6b7280;margin-top:2px">Due: ${dueDate}</p>
        <p style="font-size:12px;font-weight:700;color:#374151;margin-top:4px;text-transform:uppercase;letter-spacing:.04em">${invoice.status}</p>
      </div>
    </div>

    <!-- Letterhead divider -->
    <div style="height:2px;background:#f3f4f6;margin-top:24px"></div>
  </div>

  <!-- ── Bill To ── -->
  <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px">
    <p style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Bill To</p>
    <p style="font-weight:600;font-size:15px">${invoice.clientName}</p>
    ${invoice.clientEmail ? `<p style="font-size:12px;color:#6b7280;margin-top:2px">${invoice.clientEmail}</p>` : ""}
    ${invoice.clientPhone ? `<p style="font-size:12px;color:#6b7280">${invoice.clientPhone}</p>` : ""}
    ${invoice.clientAddress ? `<p style="font-size:12px;color:#6b7280;white-space:pre-line;margin-top:2px">${invoice.clientAddress}</p>` : ""}
  </div>

  <!-- ── Items ── -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px">
    <thead>
      <tr style="border-bottom:2px solid #e5e7eb">
        <th style="text-align:left;padding:6px 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Description</th>
        <th style="text-align:right;padding:6px 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;width:48px">Qty</th>
        <th style="text-align:right;padding:6px 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;width:96px">Unit Price</th>
        <th style="text-align:right;padding:6px 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;width:96px">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <!-- ── Totals ── -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:24px">
    <div style="width:200px;font-size:13px">
      <div style="display:flex;justify-content:space-between;padding:4px 0;color:#6b7280">
        <span>Subtotal</span><span>${fmt(invoice.subtotal)}</span>
      </div>
      ${invoice.taxRate > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#6b7280"><span>Tax (${invoice.taxRate}%)</span><span>${fmt(invoice.taxAmount)}</span></div>` : ""}
      <div style="display:flex;justify-content:space-between;padding:8px 0 4px;border-top:2px solid #111827;font-weight:700;font-size:16px">
        <span>Total</span><span>${fmt(invoice.total)}</span>
      </div>
    </div>
  </div>

  ${paymentBlock}

  ${invoice.notes ? `<div style="font-size:12px;color:#6b7280;margin-bottom:24px"><p style="font-weight:600;color:#9ca3af;text-transform:uppercase;font-size:11px;letter-spacing:.05em;margin-bottom:4px">Notes</p><p style="white-space:pre-line">${invoice.notes}</p></div>` : ""}

  <!-- ── Signature row ── -->
  <div style="display:flex;justify-content:flex-end;margin-top:56px">

    <!-- Authorized signature -->
    <div style="text-align:center;width:200px">
      <div style="border-bottom:1px solid #d1d5db;min-height:44px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px">
        ${sigText ? `<span style="font-family:cursive;font-size:24px;color:#374151">${sigText}</span>` : ""}
      </div>
      <p style="font-size:10px;color:#9ca3af;margin-top:6px;text-transform:uppercase;letter-spacing:.06em">Authorized Signature</p>
      ${invoice.user.businessName ? `<p style="font-size:11px;color:#6b7280;font-weight:600;margin-top:2px">${invoice.user.businessName}</p>` : ""}
    </div>
  </div>

  ${invoice.thankYouNote ? `<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:28px;font-style:italic">${invoice.thankYouNote}</p>` : ""}
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="invoice-${invoice.number}.html"`,
    },
  })
}
