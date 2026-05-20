import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const payroll = await prisma.payrollEntry.update({
      where: { id },
      data: { status: 'APPROVED' },
    })
    return Response.json(payroll)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
