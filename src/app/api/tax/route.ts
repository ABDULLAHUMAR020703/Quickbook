import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAuth()
    const taxRates = await prisma.taxRate.findMany({ orderBy: { rate: 'desc' } })
    return Response.json(taxRates)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const taxRate = await prisma.taxRate.create({
      data: {
        name: body.name,
        rate: body.rate,
        type: body.type || 'VAT',
        isDefault: body.isDefault || false,
      },
    })
    return Response.json(taxRate, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
