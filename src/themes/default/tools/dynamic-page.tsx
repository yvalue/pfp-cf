import type { ReactNode } from 'react';

import { getThemeBlock } from '@/core/theme';
import type { ToolPage } from '@/shared/types/blocks/tools';

export default async function ToolPageComponent({
  page,
  data,
}: {
  locale?: string;
  page: ToolPage;
  data?: Record<string, any>;
}) {
  const sections = await Promise.all(
    Object.keys(page.sections ?? {}).map(async (sectionKey) => {
      const section = page.sections?.[sectionKey];

      if (!section || section.disabled === true) return null;
      if (page.show_sections && !page.show_sections.includes(sectionKey)) {
        return null;
      }

      const block = section.block || section.id || sectionKey;

      try {
        if (section.component) {
          return section.component;
        }

        const DynamicBlock = await getThemeBlock(block);
        return (
          <DynamicBlock
            key={sectionKey}
            section={section}
            {...(data || section.data || {})}
          />
        );
      } catch {
        return null;
      }
    })
  );

  return <>{sections}</>;
}
