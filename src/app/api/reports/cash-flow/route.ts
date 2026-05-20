import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(new Date().getFullYear(), 0, 1)
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date()

    // Cash inflows from invoice payments
    const invoicePayments = await prisma.payment.findMany({
      where: { invoiceId: { not: null }, date: { gte: from, lte: to } },
    })

    // Cash outflows from bill payments
    const billPayments = await prisma.payment.findMany({
      where: { billId: { not: null }, date: { gte: from, lte: to } },
    })

    const totalInflows = invoicePayments.reduce((s, p) => s + p.amount, 0)
    const totalOutflows = billPayments.reduce((s, p) => s + p.amount, 0)

    // Monthly breakdown
    const monthlyMap: Record<string, { inflows: number; outflows: number }> = {}

    for (const p of invoicePayments) {
      const key = p.date.toISOString().substring(0, 7)
      if (!monthlyMap[key]) monthlyMap[key] = { inflows: 0, outflows: 0 }
      monthlyMap[key].inflows += p.amount
    }

    for (const p of billPayments) {
      const key = p.date.toISOString().substring(0, 7)
      if (!monthlyMap[key]) monthlyMap[key] = { inflows: 0, outflows: 0 }
      monthlyMap[key].outflows += p.amount
    }

    const monthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data, net: data.inflows - data.outflows }))

    return Response.json({
      period: { from: from.toISOString(), to: to.toISOString() },
      totalInflows,
      totalOutflows,
      netCashFlow: totalInflows - totalOutflows,
      monthly,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
