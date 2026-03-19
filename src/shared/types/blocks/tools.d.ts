import { UserNav } from './common';
import { Section } from './landing';

export interface ToolNavItem {
  url: string;
  title: string;
  icon?: string;
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
  show_theme?: boolean;
  show_locale?: boolean;
  show_sign?: boolean;
  user_nav?: UserNav;
}

export interface ToolPage {
  title?: string;
  description?: string;
  sections?: Record<string, Section>;
  show_sections?: string[];
}
