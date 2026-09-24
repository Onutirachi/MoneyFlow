import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { MonthSelector } from '@/components/layout/MonthSelector';

/** Tela provisória usada até a etapa correspondente ser implementada. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} actions={<MonthSelector />} />
      <EmptyState icon={Construction} title="Em construção" />
    </>
  );
}
