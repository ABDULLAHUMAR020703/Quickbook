import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { lines: { include: { account: true } }, receipt: true },
    })
    if (!expense) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(expense)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()

    let total = 0
    let taxAmount = 0
    const processedLines = (body.lines || []).map((l: { description: string; amount: number; taxRate: number; accountId?: string }) => {
      const lineTax = l.amount * (l.taxRate / 100)
      total += l.amount
      taxAmount += lineTax
      return l
    })

    await prisma.expenseLine.deleteMany({ where: { expenseId: id } })

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(body.date),
        description: body.description,
        category: body.category,
        total,
        taxAmount,
        status: body.status,
        lines: {
          create: processedLines.map((l: { description: string; amount: number; taxRate: number; accountId?: string }) => ({
            description: l.description,
            amount: l.amount,
            taxRate: l.taxRate || 0,
            accountId: l.accountId || null,
          })),
        },
      },
      include: { lines: true },
    })

    return Response.json(expense)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    await prisma.expense.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
