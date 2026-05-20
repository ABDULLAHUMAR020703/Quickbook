import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequence } from '@/lib/sequences'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''

    const customers = await prisma.customer.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { customerNo: { contains: search } },
        ],
      } : {},
      include: {
        invoices: { select: { balance: true, status: true } },
      },
      orderBy: { name: 'asc' },
    })

    const result = customers.map((c) => ({
      ...c,
      outstandingBalance: c.invoices
        .filter((i) => ['SENT', 'PARTIAL', 'OVERDUE'].includes(i.status))
        .reduce((s, i) => s + i.balance, 0),
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
    const customerNo = await getNextSequence('CUSTOMER', 'CUST-')
    const customer = await prisma.customer.create({
      data: {
        customerNo,
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        taxId: body.taxId,
        creditLimit: body.creditLimit || 0,
        paymentTerms: body.paymentTerms || 30,
      },
    })
    return Response.json(customer, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
