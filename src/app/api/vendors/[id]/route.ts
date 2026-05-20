import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { bills: { orderBy: { date: 'desc' }, take: 10 } },
    })
    if (!vendor) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(vendor)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        taxId: body.taxId,
        paymentTerms: body.paymentTerms,
        isActive: body.isActive,
      },
    })
    return Response.json(vendor)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    await prisma.vendor.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
