import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth()
    const { id } = await params
    const entry = await prisma.journalEntry.findUnique({ where: { id } })
    if (!entry) return Response.json({ error: 'Not found' }, { status: 404 })
    if (entry.status === 'POSTED') return Response.json({ error: 'Already posted' }, { status: 400 })

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: { status: 'POSTED' },
    })

    return Response.json(updated)
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
