import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequence } from '@/lib/sequences'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? ''

    const bills = await prisma.bill.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { billNo: { contains: search } },
              { vendor: { name: { contains: search } } },
            ],
          } : {},
          status ? { status } : {},
        ],
      },
      include: { vendor: { select: { name: true } }, lines: true },
      orderBy: { date: 'desc' },
    })

    return Response.json(bills)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { vendorId, date, dueDate, lines, notes, reference } = body

    if (!vendorId || !date || !dueDate || !lines?.length) {
      return Response.json({ error: 'vendorId, date, dueDate, lines are required' }, { status: 400 })
    }

    let subtotal = 0
    let taxAmount = 0
    const processedLines = lines.map((l: {
      description: string; quantity: number; unitPrice: number; taxRate: number
      accountId?: string; costCenterId?: string
    }) => {
      const lineAmount = l.quantity * l.unitPrice
      const lineTax = lineAmount * (l.taxRate / 100)
      subtotal += lineAmount
      taxAmount += lineTax
      return { ...l, amount: lineAmount }
    })

    const total = subtotal + taxAmount
    const billNo = await getNextSequence('BILL', 'BILL-')

    const bill = await prisma.bill.create({
      data: {
        billNo,
        vendorId,
        date: new Date(date),
        dueDate: new Date(dueDate),
        subtotal,
        taxAmount,
        total,
        balance: total,
        notes,
        reference,
        status: 'RECEIVED',
        createdById: user.id,
        lines: {
          create: processedLines.map((l: {
            description: string; quantity: number; unitPrice: number
            taxRate: number; amount: number; accountId?: string; costCenterId?: string
          }) => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
            amount: l.amount,
            accountId: l.accountId || null,
            costCenterId: l.costCenterId || null,
          })),
        },
      },
      include: { vendor: { select: { name: true } }, lines: true },
    })

    return Response.json(bill, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
