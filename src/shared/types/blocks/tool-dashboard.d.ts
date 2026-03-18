import { UserNav } from './common';

export interface ToolDashboardNavItem {
  url: string;
  title: string;
  icon?: string;
  active?: boolean;
}

export interface ToolDashboardSidebarConfig {
  nav?: {
    items: ToolDashboardNavItem[];
  };
  primary_action?: {
    title: string;
    url?: string;
  };
}

export interface ToolDashboardTopbarConfig {
  breadcrumb_home?: string;
  current_label?: string;
  show_theme?: boolean;
  show_locale?: boolean;
  show_sign?: boolean;
  user_nav?: UserNav;
}

export interface ToolDashboardLayoutConfig {
  sidebar?: ToolDashboardSidebarConfig;
  topbar?: ToolDashboardTopbarConfig;
}

export interface ToolDashboardPage {
  title?: string;
  description?: string;
  layout?: ToolDashboardLayoutConfig;
  sections?: Record<string, any>;
  show_sections?: string[];
}
