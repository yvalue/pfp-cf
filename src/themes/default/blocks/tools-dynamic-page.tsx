import { getThemeBlockStrict } from '@/core/theme';
import type { ToolPage as ToolPageType } from '@/shared/types/blocks/tools';

export async function DynamicPage({
  locale,
  page,
  data,
}: {
  locale?: string;
  page: ToolPageType;
  data?: Record<string, any>;
}) {
  return (
    <>
      {page.title && !page.sections?.hero && (
        <h1 className="sr-only">{page.title}</h1>
      )}
      {page.sections &&
        Object.keys(page.sections).map(async (sectionKey: string) => {
          const section = page.sections?.[sectionKey];
          if (!section || section.disabled === true) {
            return null;
          }

          if (page.show_sections && !page.show_sections.includes(sectionKey)) {
            return null;
          }

          const block = section.block || section.id || sectionKey;

          if (section.component) {
            return section.component;
          }

          const DynamicBlock = await getThemeBlockStrict(block);
          return (
            <DynamicBlock
              key={sectionKey}
              section={section}
              {...(data || section.data || {})}
            />
          );
        })}
    </>
  );
}
