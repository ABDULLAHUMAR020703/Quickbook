import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') ?? ''
    const type = searchParams.get('type') ?? ''

    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search } },
              { accountNo: { contains: search } },
              { fullName: { contains: search } },
            ],
          } : {},
          type ? { accountType: type } : {},
        ],
      },
      orderBy: { accountNo: 'asc' },
    })

    return Response.json(accounts)
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
    const { accountNo, name, fullName, parentNo, accountType, subType, description } = body

    if (!accountNo || !name || !accountType || !subType) {
      return Response.json({ error: 'accountNo, name, accountType, subType are required' }, { status: 400 })
    }

    const account = await prisma.chartOfAccount.create({
      data: { accountNo, name, fullName: fullName || name, parentNo, accountType, subType, description },
    })

    return Response.json(account, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
