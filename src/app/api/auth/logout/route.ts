import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (token) {
      await prisma.appSession.deleteMany({ where: { token } })
    }

    const response = Response.json({ success: true })
    const headers = new Headers(response.headers)
    headers.set('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')

    return new Response(response.body, { status: 200, headers })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
