import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAuth()

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Total Revenue (posted invoices)
    const revenueAgg = await prisma.invoice.aggregate({
      where: { status: { in: ['SENT', 'PAID', 'PARTIAL'] } },
      _sum: { total: true },
    })

    // Total Expenses
    const expensesAgg = await prisma.expense.aggregate({
      where: { status: { in: ['APPROVED', 'PAID'] } },
      _sum: { total: true },
    })

    // Accounts Receivable
    const receivablesAgg = await prisma.invoice.aggregate({
      where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      _sum: { balance: true },
    })

    // Accounts Payable
    const payablesAgg = await prisma.bill.aggregate({
      where: { status: { in: ['RECEIVED', 'PARTIAL', 'OVERDUE'] } },
      _sum: { balance: true },
    })

    // Monthly revenue for chart (last 6 months)
    const monthlyData: { month: string; revenue: number; expenses: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthLabel = monthStart.toLocaleString('en', { month: 'short', year: '2-digit' })

      const monthRev = await prisma.invoice.aggregate({
        where: {
          date: { gte: monthStart, lte: monthEnd },
          status: { in: ['SENT', 'PAID', 'PARTIAL'] },
        },
        _sum: { subtotal: true },
      })

      const monthExp = await prisma.expense.aggregate({
        where: {
          date: { gte: monthStart, lte: monthEnd },
          status: { in: ['APPROVED', 'PAID'] },
        },
        _sum: { total: true },
      })

      monthlyData.push({
        month: monthLabel,
        revenue: monthRev._sum.subtotal ?? 0,
        expenses: monthExp._sum.total ?? 0,
      })
    }

    // Recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    })

    // Recent bills
    const recentBills = await prisma.bill.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { vendor: { select: { name: true } } },
    })

    // AR Aging
    const overdueInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] }, balance: { gt: 0 } },
      select: { balance: true, dueDate: true },
    })

    const aging = { current: 0, days30: 0, days60: 0, days90plus: 0 }
    for (const inv of overdueInvoices) {
      const days = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      if (days <= 0) aging.current += inv.balance
      else if (days <= 30) aging.days30 += inv.balance
      else if (days <= 60) aging.days60 += inv.balance
      else aging.days90plus += inv.balance
    }

    return Response.json({
      kpis: {
        totalRevenue: revenueAgg._sum.total ?? 0,
        totalExpenses: expensesAgg._sum.total ?? 0,
        accountsReceivable: receivablesAgg._sum.balance ?? 0,
        accountsPayable: payablesAgg._sum.balance ?? 0,
      },
      monthlyData,
      aging,
      recentInvoices,
      recentBills,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Dashboard error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
