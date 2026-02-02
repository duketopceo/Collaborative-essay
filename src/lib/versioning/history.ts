import { prisma } from '@/lib/db/prisma';

export async function getEssayVersionHistory(essayId: string, limit = 50) {
  const versions = await prisma.version.findMany({
    where: { essayId },
    orderBy: { versionNumber: 'desc' },
    take: limit,
    include: {
      pullRequest: {
        select: { id: true, number: true, title: true },
      },
    },
  });
  return versions;
}

export async function getEssayVersion(essayId: string, versionNumber: number) {
  const version = await prisma.version.findFirst({
    where: { essayId, versionNumber },
  });
  return version;
}
