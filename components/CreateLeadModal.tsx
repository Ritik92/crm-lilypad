'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Lead } from '@/lib/types'

interface Product {
  id: string
  name: string
  brand: string | null
  category: string | null
  productImages: string | null
}

interface ProductsPage {
  content: Product[]
  totalElements: number
  totalPages: number
  number: number
}

interface Props {
  onClose: () => void
  onCreated: (lead: Lead) => void
}

function firstImage(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed)
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr[0]
    } catch {
      // fall through
    }
  }
  return trimmed.split(',')[0].trim() || null
}

export default function CreateLeadModal({ onClose, onCreated }: Props) {
  const [fullName, setFullName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [productId, setProductId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingProducts(true)
    setProductsError(null)

    fetch('/api/products?size=200')
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}: ${await r.text().catch(() => r.statusText)}`)
        return r.json() as Promise<ProductsPage>
      })
      .then((data) => {
        if (cancelled) return
        setProducts(data.content ?? [])
        setLoadingProducts(false)
      })
      .catch((e) => {
        if (cancelled) return
        setProductsError(e instanceof Error ? e.message : String(e))
        setLoadingProducts(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const hay = `${p.name ?? ''} ${p.brand ?? ''} ${p.category ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [products, productSearch])

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  )

  const mobileValid = /^[6-9]\d{9}$/.test(mobileNumber)
  const canSubmit = fullName.trim().length > 0 && mobileValid && !!productId && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobileNumber,
          productId,
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Failed (${res.status})`)
      }
      const created = (await res.json()) as Lead
      onCreated(created)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">Add lead</h2>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                Capture a customer who reached out directly. They&apos;ll land in the Lead column.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Customer name"
                className="w-full border border-slate-200 hover:border-slate-300 rounded-lg px-3 h-10 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] mb-1.5">
                Mobile number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit, starts with 6-9"
                className="w-full border border-slate-200 hover:border-slate-300 rounded-lg px-3 h-10 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-colors"
              />
              {mobileNumber.length > 0 && !mobileValid && (
                <p className="text-red-500 text-[11px] mt-1">Enter a valid 10-digit Indian mobile number.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em]">
              Interested product
            </label>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products"
              className="border border-slate-200 hover:border-slate-300 rounded-md px-2.5 h-7 text-[12px] w-56 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>

          {loadingProducts ? (
            <p className="text-slate-400 text-[12px] py-10 text-center">Loading products…</p>
          ) : productsError ? (
            <p className="text-red-500 text-[12px] py-10 text-center">{productsError}</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-slate-400 text-[12px] py-10 text-center">No products match.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredProducts.map((p) => {
                const img = firstImage(p.productImages)
                const selected = p.id === productId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProductId(p.id)}
                    className={
                      'text-left rounded-lg border p-2.5 transition-all ' +
                      (selected
                        ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white')
                    }
                  >
                    <div className="aspect-square w-full rounded-md bg-slate-100 overflow-hidden mb-2 flex items-center justify-center">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-300 text-[11px]">No image</span>
                      )}
                    </div>
                    <p className="text-[12px] font-medium text-slate-900 leading-tight line-clamp-2">{p.name}</p>
                    {p.brand && <p className="text-[11px] text-slate-500 mt-0.5">{p.brand}</p>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <div className="text-[12px] text-slate-500 mr-auto truncate">
            {selectedProduct ? (
              <>
                Selected: <span className="text-slate-800 font-medium">{selectedProduct.name}</span>
              </>
            ) : (
              <>Pick a product to continue.</>
            )}
          </div>
          {error && <p className="text-red-500 text-[12px] mr-3">{error}</p>}
          <button
            onClick={onClose}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg h-9 px-4 text-[13px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg h-9 px-4 text-[13px] font-medium transition-colors shadow-sm"
          >
            {submitting ? 'Adding…' : 'Add lead'}
          </button>
        </div>
      </div>
    </div>
  )
}
