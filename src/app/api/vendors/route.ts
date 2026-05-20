import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequence } from '@/lib/sequences'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''

    const vendors = await prisma.vendor.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { vendorNo: { contains: search } },
        ],
      } : {},
      include: {
        bills: { select: { balance: true, status: true } },
      },
      orderBy: { name: 'asc' },
    })

    const result = vendors.map((v) => ({
      ...v,
      outstandingBalance: v.bills
        .filter((b) => ['RECEIVED', 'PARTIAL', 'OVERDUE'].includes(b.status))
        .reduce((s, b) => s + b.balance, 0),
    }))

    return Response.json(result)
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
    const vendorNo = await getNextSequence('VENDOR', 'VEND-')
    const vendor = await prisma.vendor.create({
      data: {
        vendorNo,
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        taxId: body.taxId,
        paymentTerms: body.paymentTerms || 30,
      },
    })
    return Response.json(vendor, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
