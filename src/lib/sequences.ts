import 'server-only'
import { prisma } from './prisma'

export async function getNextSequence(type: string, prefix: string): Promise<string> {
  let seq = await prisma.sequence.findUnique({ where: { type } })
  if (!seq) {
    seq = await prisma.sequence.create({ data: { type, prefix, nextNo: 1 } })
  }

  const no = seq.nextNo
  await prisma.sequence.update({ where: { type }, data: { nextNo: no + 1 } })
  return `${prefix}${String(no).padStart(5, '0')}`
}
