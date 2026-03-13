import { Button } from '@/types/blocks/base/button';

export interface PricingGroup {
  name?: string;
  title?: string;
  description?: string;
  label?: string;
  is_featured?: boolean;
}

export interface PricingCurrency {
  currency: string; // currency code
  amount: number; // price amount
  price: string; // price text
  original_price: string; // original price text
  payment_product_id?: string;
  payment_providers?: string[];
}

export interface PricingItem {
  title?: string;
  description?: string;
  label?: string;

  currency: string; // default currency
  amount: number; // default price amount
  price?: string; // default price text
  original_price?: string; // default original price text
  currencies?: PricingCurrency[]; // alternative currencies with different prices

  unit?: string;
  features_title?: string;
  features?: string[];
  crossed_features?: string[];
  button?: Button;
  tip?: string;
  is_featured?: boolean;
  interval: 'one-time' | 'day' | 'week' | 'month' | 'year';
  product_id: string;
  payment_product_id?: string;
  payment_providers?: string[];
  product_name?: string;
  plan_name?: string;

  credits?: number;
  valid_days?: number;
  group?: string;
}

export interface PricingFreeCard {
  title?: string;
  description?: string;
  price?: string;
  original_price?: string;
  unit?: string;
  features_title?: string;
  features?: string[];
  crossed_features?: string[];
  button?: Button;
}

export interface Pricing {
  id?: string;
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  items?: PricingItem[];
  groups?: PricingGroup[];
  free_cards?: Record<string, PricingFreeCard>;
  className?: string;
  sr_only_title?: string;
}
