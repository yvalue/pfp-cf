import type { ComponentProps, ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';

type ToolDashboardSectionProps = ComponentProps<'section'> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  headerClassName?: string;
  contentClassName?: string;
};

type ToolDashboardIntroProps = ToolDashboardSectionProps & {
  highlights?: ReactNode;
};

type ToolDashboardFaqItem = {
  value?: string;
  question: ReactNode;
  answer: ReactNode;
};

type ToolDashboardFaqProps = Omit<ToolDashboardSectionProps, 'children'> & {
  items: ToolDashboardFaqItem[];
  tip?: ReactNode;
  accordionClassName?: string;
  itemClassName?: string;
  answerClassName?: string;
  children?: ReactNode;
};

export function ToolDashboardSection({
  eyebrow,
  title,
  description,
  actions,
  className,
  headerClassName,
  contentClassName,
  children,
  ...props
}: ToolDashboardSectionProps) {
  const hasHeader = eyebrow || title || description || actions;

  return (
    <section
      data-slot="tool-dashboard-section"
      className={cn(
        'border-border bg-card rounded-3xl border p-6 shadow-sm lg:p-8',
        className
      )}
      {...props}
    >
      <div className={cn('flex flex-col gap-4', contentClassName)}>
        {hasHeader ? (
          <div
            className={cn(
              'border-border flex flex-col gap-4 border-b pb-4',
              headerClassName
            )}
          >
            {eyebrow ? (
              <div className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
                {eyebrow}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {title ? (
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {title}
                  </h2>
                ) : null}

                {description ? (
                  <div className="text-muted-foreground max-w-3xl text-sm leading-6 md:text-base">
                    {description}
                  </div>
                ) : null}
              </div>

              {actions ? (
                <div className="flex shrink-0 items-center gap-3">
                  {actions}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}

export function ToolDashboardIntro({
  highlights,
  children,
  contentClassName,
  ...props
}: ToolDashboardIntroProps) {
  return (
    <ToolDashboardSection {...props} contentClassName={contentClassName}>
      {highlights ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="min-w-0">{children}</div>
          <div className="min-w-0">{highlights}</div>
        </div>
      ) : (
        children
      )}
    </ToolDashboardSection>
  );
}

export function ToolDashboardFaq({
  items,
  tip,
  accordionClassName,
  itemClassName,
  answerClassName,
  children,
  ...props
}: ToolDashboardFaqProps) {
  return (
    <ToolDashboardSection {...props}>
      <div className="flex flex-col gap-4">
        <Accordion
          type="single"
          collapsible
          className={cn(
            'border-border bg-background rounded-3xl border p-3 shadow-sm',
            accordionClassName
          )}
        >
          {items.map((item, index) => (
            <AccordionItem
              key={item.value ?? `faq-${index}`}
              value={item.value ?? `faq-${index}`}
              className={cn(
                'border-border rounded-2xl border-b px-5',
                itemClassName
              )}
            >
              <AccordionTrigger className="cursor-pointer py-5 text-base font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent
                className={cn(
                  'text-muted-foreground leading-6',
                  answerClassName
                )}
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {tip ? (
          <div className="text-muted-foreground px-2 text-sm leading-6">
            {tip}
          </div>
        ) : null}

        {children}
      </div>
    </ToolDashboardSection>
  );
}
