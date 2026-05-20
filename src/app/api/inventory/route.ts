import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequence } from '@/lib/sequences'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''

    const items = await prisma.inventoryItem.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { itemCode: { contains: search } },
          { category: { contains: search } },
        ],
      } : {},
      orderBy: { name: 'asc' },
    })

    return Response.json(items)
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
    const itemCode = await getNextSequence('ITEM', 'ITEM-')

    const item = await prisma.inventoryItem.create({
      data: {
        itemCode: body.itemCode || itemCode,
        name: body.name,
        description: body.description,
        category: body.category,
        unit: body.unit || 'PCS',
        costPrice: body.costPrice || 0,
        salePrice: body.salePrice || 0,
        quantity: body.quantity || 0,
        minQuantity: body.minQuantity || 0,
      },
    })

    return Response.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
