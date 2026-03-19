import { getThemeBlockStrict } from '@/core/theme';
import type { ToolPage as ToolPageType } from '@/shared/types/blocks/tools';

export default async function ToolPage({
  locale,
  page,
  data,
}: {
  locale?: string;
  page: ToolPageType;
  data?: Record<string, any>;
}) {
  const DynamicPage = await getThemeBlockStrict('tools/dynamic-page');

  return <DynamicPage locale={locale} page={page} data={data} />;
}
