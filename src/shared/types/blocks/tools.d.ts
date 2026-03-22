import { Section } from './landing';

export interface ToolPage {
  title?: string;
  description?: string;
  sections?: Record<string, Section>;
  show_sections?: string[];
}
