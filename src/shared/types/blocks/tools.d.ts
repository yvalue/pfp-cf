import { UserNav } from './common';

export interface ToolNavItem {
  url: string;
  title: string;
  icon?: string;
  active?: boolean;
}

export interface ToolSidebarConfig {
  nav?: {
    items: ToolNavItem[];
  };
  primary_action?: {
    title: string;
    url?: string;
  };
}

export interface ToolTopbarConfig {
  breadcrumb_home?: string;
  current_label?: string;
  show_theme?: boolean;
  show_locale?: boolean;
  show_sign?: boolean;
  user_nav?: UserNav;
}

export interface ToolLayoutConfig {
  sidebar?: ToolSidebarConfig;
  topbar?: ToolTopbarConfig;
}

export interface ToolPage {
  title?: string;
  description?: string;
  layout?: ToolLayoutConfig;
  sections?: Record<string, any>;
  show_sections?: string[];
}
