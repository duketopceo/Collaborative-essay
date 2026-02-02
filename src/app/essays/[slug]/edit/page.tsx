import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { EssayEditForm } from './essay-edit-form';

async function getEssay(slug: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const essay = await prisma.essay.findFirst({
    where: { slug, authorId: session.user.id },
  });
  return essay;
}

export default async function EssayEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  const essay = await getEssay(slug);
  if (!essay) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Edit essay</h1>
      <EssayEditForm essay={essay} />
    </div>
  );
}
