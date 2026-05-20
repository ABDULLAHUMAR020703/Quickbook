import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(new Date().getFullYear(), 0, 1)
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date()

    // Income
    const invoices = await prisma.invoice.findMany({
      where: {
        date: { gte: from, lte: to },
        status: { in: ['SENT', 'PAID', 'PARTIAL'] },
      },
      include: { lines: { include: { account: true } } },
    })

    let totalRevenue = 0
    let totalTaxCollected = 0
    const revenueByAccount: Record<string, { name: string; amount: number }> = {}

    for (const inv of invoices) {
      totalRevenue += inv.subtotal
      totalTaxCollected += inv.taxAmount
      for (const line of inv.lines) {
        const acctName = line.account?.name ?? 'Unclassified'
        if (!revenueByAccount[acctName]) revenueByAccount[acctName] = { name: acctName, amount: 0 }
        revenueByAccount[acctName].amount += line.amount
      }
    }

    // COGS
    const cogsAccounts = await prisma.chartOfAccount.findMany({
      where: { accountType: 'CostOfGoodsSold', subType: { not: 'Header' } },
      include: { journalLines: { where: { journal: { date: { gte: from, lte: to }, status: 'POSTED' } } } },
    })

    let totalCOGS = 0
    for (const acc of cogsAccounts) {
      for (const line of acc.journalLines) {
        totalCOGS += line.debit - line.credit
      }
    }

    // Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: from, lte: to },
        status: { in: ['APPROVED', 'PAID'] },
      },
    })

    let totalExpenses = 0
    for (const exp of expenses) {
      totalExpenses += exp.total
    }

    // Bills (as additional expenses)
    const bills = await prisma.bill.findMany({
      where: {
        date: { gte: from, lte: to },
        status: { in: ['RECEIVED', 'PAID', 'PARTIAL'] },
      },
    })

    let totalBills = 0
    for (const bill of bills) {
      totalBills += bill.subtotal
    }

    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - totalExpenses - totalBills

    return Response.json({
      period: { from: from.toISOString(), to: to.toISOString() },
      revenue: {
        total: totalRevenue,
        taxCollected: totalTaxCollected,
        byAccount: Object.values(revenueByAccount),
      },
      cogs: { total: totalCOGS },
      grossProfit,
      expenses: { fromExpenses: totalExpenses, fromBills: totalBills, total: totalExpenses + totalBills },
      netProfit,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
