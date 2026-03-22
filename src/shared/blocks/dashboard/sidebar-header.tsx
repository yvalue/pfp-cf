import { Link } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import {
  SidebarHeader as SidebarHeaderComponent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { cn } from '@/shared/lib/utils';
import { SidebarHeader as SidebarHeaderType } from '@/shared/types/blocks/dashboard';

export function SidebarHeader({ header }: { header: SidebarHeaderType }) {
  const { open } = useSidebar();
  return (
    <SidebarHeaderComponent className="mb-0 pt-3">
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center justify-between">
          {(open || !header.show_trigger) && (
            <SidebarMenuButton
              asChild
              className="bg-transparent hover:bg-transparent hover:text-inherit active:bg-transparent active:text-inherit data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {header.brand && (
                <Link
                  href={header.brand.url || ''}
                  className="flex items-center gap-3"
                >
                  {header.brand.logo && (
                    <img
                      src={header.brand.logo.src}
                      alt={header.brand.logo.alt || ''}
                      className={cn(
                        'h-auto w-8 shrink-0',
                        open ? 'rounded-md' : 'rounded-full'
                      )}
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-base leading-none font-semibold">
                      {header.brand.title}
                    </span>
                    {header.version && (
                      <Badge variant="secondary" className="px-1 py-0">
                        v{header.version}
                      </Badge>
                    )}
                  </div>
                </Link>
              )}
            </SidebarMenuButton>
          )}
          <div className="flex-1"></div>
          {header.show_trigger && <SidebarTrigger />}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeaderComponent>
  );
}
