import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAuth()
    let settings = await prisma.companySettings.findFirst()
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'NETKOM COMPANY FOR COMMUNICATION',
          country: 'Saudi Arabia',
          currency: 'SAR',
        },
      })
    }
    return Response.json(settings)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()

    let settings = await prisma.companySettings.findFirst()
    if (!settings) {
      settings = await prisma.companySettings.create({ data: body })
    } else {
      settings = await prisma.companySettings.update({
        where: { id: settings.id },
        data: {
          companyName: body.companyName,
          legalName: body.legalName,
          taxId: body.taxId,
          address: body.address,
          city: body.city,
          country: body.country,
          phone: body.phone,
          email: body.email,
          currency: body.currency,
          fiscalYearStart: body.fiscalYearStart,
          zatcaEnabled: body.zatcaEnabled,
        },
      })
    }

    return Response.json(settings)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
