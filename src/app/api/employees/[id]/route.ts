import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { payrollEntries: { orderBy: { periodStart: 'desc' }, take: 5 } },
    })
    if (!employee) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(employee)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        department: body.department,
        position: body.position,
        joiningDate: body.joiningDate ? new Date(body.joiningDate) : undefined,
        salary: body.salary,
        salaryType: body.salaryType,
        bankAccount: body.bankAccount,
        isActive: body.isActive,
      },
    })
    return Response.json(employee)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    await prisma.employee.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
