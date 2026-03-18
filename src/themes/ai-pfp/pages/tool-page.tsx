import { getThemeBlock } from '@/core/theme';
import type { ToolDashboardPage } from '@/shared/types/blocks/tool-dashboard';
import { ToolPageLayout } from '@/themes/ai-pfp/blocks/tool-layout';

export default async function ToolPageComponent({
  page,
  data,
}: {
  locale?: string;
  page: ToolDashboardPage;
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

      switch (block) {
        default:
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
      }
    })
  );

  return (
    <ToolPageLayout layout={page.layout ?? {}}>
      {sections}
    </ToolPageLayout>
  );
}
