import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: { vendor: true, lines: { include: { account: true } }, payments: true },
    })
    if (!bill) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(bill)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const existing = await prisma.bill.findUnique({ where: { id } })
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

    let subtotal = 0
    let taxAmount = 0
    const processedLines = (body.lines || []).map((l: {
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
    const balance = total - existing.amountPaid

    await prisma.billLine.deleteMany({ where: { billId: id } })

    const bill = await prisma.bill.update({
      where: { id },
      data: {
        vendorId: body.vendorId,
        date: new Date(body.date),
        dueDate: new Date(body.dueDate),
        subtotal,
        taxAmount,
        total,
        balance,
        notes: body.notes,
        reference: body.reference,
        status: body.status || existing.status,
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

    return Response.json(bill)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    await prisma.bill.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
