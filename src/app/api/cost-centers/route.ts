import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequence } from '@/lib/sequences'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''

    const centers = await prisma.costCenter.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
      } : {},
      orderBy: { code: 'asc' },
    })

    return Response.json(centers)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const autoCode = await getNextSequence('CC', 'CC-')

    const center = await prisma.costCenter.create({
      data: {
        code: body.code || autoCode,
        name: body.name,
        type: body.type || 'PROJECT',
        description: body.description,
      },
    })

    return Response.json(center, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
