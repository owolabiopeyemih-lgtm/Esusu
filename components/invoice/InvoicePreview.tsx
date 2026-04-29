import { formatCurrency, STATUS_COLORS } from "@/lib/invoice"
import type { InvoiceItem, InvoiceStatus, SenderInfo } from "@/types"
import { cn } from "@/lib/utils"

interface PreviewData {
  number: string
  status?: InvoiceStatus
  issueDate: string
  dueDate: string
  currency: string
  taxRate: number
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  notes: string
  paymentMethod: string
  paymentDetails: string
  thankYouNote: string
  sender: SenderInfo & { email: string }
}

export default function InvoicePreview({ data }: { data: PreviewData }) {
  const fmt = (n: number) => formatCurrency(n, data.currency)
  const hasPayment = data.paymentMethod || data.paymentDetails || data.sender.bankAccount
  const initial = (data.sender.businessName ?? data.sender.email)[0].toUpperCase()

  return (
    <div className="bg-white rounded-2xl invoice-paper overflow-hidden text-gray-900 text-sm">
      {/* Coloured top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600" />

      <div className="p-8">

        {/* ── Letterhead ── */}
        <div className="mb-7">
          <div className="flex justify-between items-start gap-6">

            {/* Left: company identity */}
            <div className="flex-1 min-w-0">
              {/* Logo */}
              {data.sender.businessLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.sender.businessLogo}
                  alt="Logo"
                  className="h-16 w-auto max-w-[160px] object-contain mb-3"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl mb-3">
                  {initial}
                </div>
              )}

              {/* Company name — large and prominent */}
              <p className="font-black text-xl leading-tight tracking-tight text-gray-900">
                {data.sender.businessName || data.sender.email}
              </p>

              {/* Full address */}
              {data.sender.businessAddress && (
                <p className="text-xs text-gray-500 mt-2 whitespace-pre-line leading-relaxed">
                  {data.sender.businessAddress}
                </p>
              )}

              {/* Email */}
              <p className="text-xs text-gray-400 mt-1.5">{data.sender.email}</p>
            </div>

            {/* Right: invoice meta */}
            <div className="text-right shrink-0">
              <p className="text-3xl font-black tracking-tight text-gray-900 leading-none">INVOICE</p>
              <p className="font-mono text-indigo-600 font-semibold text-sm mt-1.5">{data.number || "INV-XXXX"}</p>
              {data.status && (
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-2", STATUS_COLORS[data.status])}>
                  {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
                </span>
              )}
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-gray-400">Issued</span>
                  <span className="font-medium text-gray-700">{data.issueDate || "—"}</span>
                </div>
                {data.dueDate && (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-gray-400">Due</span>
                    <span className="font-medium text-gray-700">{data.dueDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Letterhead divider */}
          <div className="mt-6 border-t-2 border-gray-100" />
        </div>

        {/* ── Bill To ── */}
        <div className="bg-gray-50 rounded-xl p-4 mb-7">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
          {data.clientName
            ? <p className="font-semibold text-gray-900">{data.clientName}</p>
            : <p className="text-gray-300 italic text-xs">Client name will appear here</p>}
          {data.clientEmail && <p className="text-xs text-gray-500 mt-0.5">{data.clientEmail}</p>}
          {data.clientPhone && <p className="text-xs text-gray-500">{data.clientPhone}</p>}
          {data.clientAddress && (
            <p className="text-xs text-gray-500 whitespace-pre-line mt-1">{data.clientAddress}</p>
          )}
        </div>

        {/* ── Items table ── */}
        <table className="w-full text-xs mb-1">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="text-left pb-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
              <th className="text-right pb-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10">Qty</th>
              <th className="text-right pb-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-24">Unit Price</th>
              <th className="text-right pb-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-300 italic text-xs">Line items will appear here</td>
              </tr>
            ) : (
              data.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2.5 pr-4 text-gray-700">{item.description || <span className="text-gray-300">—</span>}</td>
                  <td className="py-2.5 text-right text-gray-500">{item.quantity}</td>
                  <td className="py-2.5 text-right text-gray-500 font-mono">{fmt(item.unitPrice)}</td>
                  <td className="py-2.5 text-right font-semibold font-mono text-gray-800">{fmt(item.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Totals ── */}
        <div className="flex justify-end mt-3 mb-7">
          <div className="w-56 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-mono">{fmt(data.subtotal)}</span>
            </div>
            {data.taxRate > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Tax ({data.taxRate}%)</span>
                <span className="font-mono">{fmt(data.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-gray-900">
              <span className="font-bold text-sm text-gray-900">Total</span>
              <span className="font-black text-base text-gray-900 font-mono">{fmt(data.total)}</span>
            </div>
          </div>
        </div>

        {/* ── Payment details ── */}
        {hasPayment && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 mb-6 text-xs">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details</p>
            {data.paymentMethod && <p className="font-semibold text-gray-800">{data.paymentMethod}</p>}
            {data.paymentDetails ? (
              <p className="text-gray-600 whitespace-pre-line mt-1 leading-relaxed">{data.paymentDetails}</p>
            ) : data.sender.bankAccount ? (
              <div className="text-gray-600 space-y-0.5 mt-1">
                {data.sender.bankName && <p>{data.sender.bankName}</p>}
                {data.sender.bankAccountName && <p>{data.sender.bankAccountName}</p>}
                <p className="font-mono font-medium tracking-wide text-gray-800">{data.sender.bankAccount}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* ── Notes ── */}
        {data.notes && (
          <div className="text-xs text-gray-500 mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Notes</p>
            <p className="whitespace-pre-line leading-relaxed">{data.notes}</p>
          </div>
        )}

        {/* ── Signature row ── */}
        <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
          {/* Authorized signature */}
          <div className="text-center w-48">
            <div className="h-12 flex items-end justify-center pb-1 border-b border-gray-300">
              {data.sender.signatureText && (
                <span style={{ fontFamily: "cursive" }} className="text-2xl text-gray-700 leading-none">
                  {data.sender.signatureText}
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-gray-400 mt-1.5 uppercase tracking-widest">
              Authorized Signature
            </p>
            {data.sender.businessName && (
              <p className="text-xs text-gray-600 font-medium mt-0.5">{data.sender.businessName}</p>
            )}
          </div>
        </div>

        {/* ── Thank you ── */}
        {data.thankYouNote && (
          <p className="text-center text-xs text-gray-400 mt-6 italic">{data.thankYouNote}</p>
        )}
      </div>
    </div>
  )
}
