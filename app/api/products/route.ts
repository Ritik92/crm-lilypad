import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, BackendError } from '@/lib/backend'

interface ProductV2 {
  id: string
  name: string
  brand: string | null
  category: string | null
  productImages: string | null
}

interface ProductsPage {
  content: ProductV2[]
  totalElements: number
  totalPages: number
  number: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = searchParams.get('page') ?? '0'
  const size = searchParams.get('size') ?? '60'
  const search = searchParams.get('search') ?? ''

  const qs = new URLSearchParams()
  qs.set('page', page)
  qs.set('size', size)
  if (search) qs.set('search', search)

  try {
    const data = await backendFetch<ProductsPage>(`/v2/products?${qs.toString()}`)
    return NextResponse.json(data)
  } catch (e) {
    const err = e as BackendError
    return NextResponse.json({ error: err.message }, { status: err.status || 500 })
  }
}
