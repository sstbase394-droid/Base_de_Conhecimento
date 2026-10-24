import { FAQ_DATA } from '@/features/articles/catalog';
import { ModalWrapper } from './ModalWrapper';
import { requireSession } from '@/features/auth/session';

export async function generateStaticParams() {
  return FAQ_DATA.map((article) => ({
    id: article.id,
  }));
}

export default async function ModalArticlePage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);

  await requireSession(`/artigo/${id}`, undefined);

  return <ModalWrapper id={id} />;
}
