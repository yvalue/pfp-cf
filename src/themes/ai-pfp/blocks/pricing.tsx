'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SmartIcon } from '@/shared/blocks/common';
import { PaymentModal } from '@/shared/blocks/payment/payment-modal';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAppContext } from '@/shared/contexts/app';
import { getCookie } from '@/shared/lib/cookie';
import { cn } from '@/shared/lib/utils';
import { Subscription } from '@/shared/models/subscription';
import {
  PricingCurrency,
  PricingFreeCard,
  PricingItem,
  Pricing as PricingType,
} from '@/shared/types/blocks/pricing';

// Helper function to get all available currencies from a pricing item
function getCurrenciesFromItem(item: PricingItem | null): PricingCurrency[] {
  if (!item) return [];

  // Always include the default currency first
  const defaultCurrency: PricingCurrency = {
    currency: item.currency,
    amount: item.amount,
    price: item.price || '',
    original_price: item.original_price || '',
  };

  // Add additional currencies if available
  if (item.currencies && item.currencies.length > 0) {
    return [defaultCurrency, ...item.currencies];
  }

  return [defaultCurrency];
}

// Helper function to select initial currency based on locale
function getInitialCurrency(
  currencies: PricingCurrency[],
  locale: string,
  defaultCurrency: string
): string {
  if (currencies.length === 0) return defaultCurrency;

  // If locale is 'zh', prefer CNY
  if (locale === 'zh') {
    const cnyCurrency = currencies.find(
      (c) => c.currency.toLowerCase() === 'cny'
    );
    if (cnyCurrency) {
      return cnyCurrency.currency;
    }
  }

  // Otherwise return default currency
  return defaultCurrency;
}

function getPricingGridClassName(itemCount: number): string {
  if (itemCount <= 1) {
    return 'max-w-xl grid-cols-1';
  }

  if (itemCount === 2) {
    return 'max-w-4xl grid-cols-1 md:grid-cols-2';
  }

  if (itemCount === 3) {
    return 'max-w-5xl grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  }

  return 'max-w-7xl grid-cols-1 md:grid-cols-2 xl:grid-cols-4';
}

export function Pricing({
  section,
  className,
  currentSubscription,
}: {
  section: PricingType;
  className?: string;
  currentSubscription?: Subscription;
}) {
  const locale = useLocale();
  const t = useTranslations('pages.pricing.messages');

  const { user, setIsShowSignModal, setIsShowPaymentModal, configs } =
    useAppContext();

  const [group, setGroup] = useState(() => {
    // find current pricing item
    const currentItem = section.items?.find(
      (i) => i.product_id === currentSubscription?.productId
    );

    // First look for a group with is_featured set to true
    const featuredGroup = section.groups?.find((g) => g.is_featured);
    // If no featured group exists, fall back to the first group
    return (
      currentItem?.group || featuredGroup?.name || section.groups?.[0]?.name
    );
  });

  // current pricing item
  const [pricingItem, setPricingItem] = useState<PricingItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  // Currency state management for each item
  // Store selected currency and displayed item for each product_id
  const [itemCurrencies, setItemCurrencies] = useState<
    Record<string, { selectedCurrency: string; displayedItem: PricingItem }>
  >({});

  // Initialize currency states for all items
  useEffect(() => {
    if (section.items && section.items.length > 0) {
      const initialCurrencyStates: Record<
        string,
        { selectedCurrency: string; displayedItem: PricingItem }
      > = {};

      section.items.forEach((item) => {
        const currencies = getCurrenciesFromItem(item);
        const selectedCurrency = getInitialCurrency(
          currencies,
          locale,
          item.currency
        );

        // Create displayed item with selected currency
        const currencyData = currencies.find(
          (c) => c.currency.toLowerCase() === selectedCurrency.toLowerCase()
        );

        const displayedItem = currencyData
          ? {
              ...item,
              currency: currencyData.currency,
              amount: currencyData.amount,
              price: currencyData.price,
              original_price: currencyData.original_price,
              // Override with currency-specific payment settings if available
              payment_product_id:
                currencyData.payment_product_id || item.payment_product_id,
              payment_providers:
                currencyData.payment_providers || item.payment_providers,
            }
          : item;

        initialCurrencyStates[item.product_id] = {
          selectedCurrency,
          displayedItem,
        };
      });

      setItemCurrencies(initialCurrencyStates);
    }
  }, [section.items, locale]);

  // Handler for currency change
  const handleCurrencyChange = (productId: string, currency: string) => {
    const item = section.items?.find((i) => i.product_id === productId);
    if (!item) return;

    const currencies = getCurrenciesFromItem(item);
    const currencyData = currencies.find(
      (c) => c.currency.toLowerCase() === currency.toLowerCase()
    );

    if (currencyData) {
      const displayedItem = {
        ...item,
        currency: currencyData.currency,
        amount: currencyData.amount,
        price: currencyData.price,
        original_price: currencyData.original_price,
        // Override with currency-specific payment settings if available
        payment_product_id:
          currencyData.payment_product_id || item.payment_product_id,
        payment_providers:
          currencyData.payment_providers || item.payment_providers,
      };

      setItemCurrencies((prev) => ({
        ...prev,
        [productId]: {
          selectedCurrency: currency,
          displayedItem,
        },
      }));
    }
  };

  const handlePayment = async (item: PricingItem) => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    // Use displayed item with selected currency
    const displayedItem =
      itemCurrencies[item.product_id]?.displayedItem || item;

    if (configs.select_payment_enabled === 'true') {
      setPricingItem(displayedItem);
      setIsShowPaymentModal(true);
    } else {
      handleCheckout(displayedItem, configs.default_payment_provider);
    }
  };

  const getAffiliateMetadata = ({
    paymentProvider,
  }: {
    paymentProvider: string;
  }) => {
    const affiliateMetadata: Record<string, string> = {};

    // get Affonso referral
    if (
      configs.affonso_enabled === 'true' &&
      ['stripe', 'creem'].includes(paymentProvider)
    ) {
      const affonsoReferral = getCookie('affonso_referral') || '';
      affiliateMetadata.affonso_referral = affonsoReferral;
    }

    // get PromoteKit referral
    if (
      configs.promotekit_enabled === 'true' &&
      ['stripe'].includes(paymentProvider)
    ) {
      const promotekitReferral =
        typeof window !== 'undefined' && (window as any).promotekit_referral
          ? (window as any).promotekit_referral
          : getCookie('promotekit_referral') || '';
      affiliateMetadata.promotekit_referral = promotekitReferral;
    }

    return affiliateMetadata;
  };

  const handleCheckout = async (
    item: PricingItem,
    paymentProvider?: string
  ) => {
    try {
      if (!user) {
        setIsShowSignModal(true);
        return;
      }

      const affiliateMetadata = getAffiliateMetadata({
        paymentProvider: paymentProvider || '',
      });

      const params = {
        product_id: item.product_id,
        currency: item.currency,
        locale: locale || 'en',
        payment_provider: paymentProvider || '',
        metadata: affiliateMetadata,
      };

      setIsLoading(true);
      setProductId(item.product_id);

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);
        setPricingItem(null);
        setIsShowSignModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`request failed with status ${response.status}`);
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        throw new Error(message);
      }

      const { checkoutUrl } = data;
      if (!checkoutUrl) {
        throw new Error('checkout url not found');
      }

      window.location.href = checkoutUrl;
    } catch (e: any) {
      console.log('checkout failed: ', e);
      toast.error('checkout failed: ' + e.message);

      setIsLoading(false);
      setProductId(null);
    }
  };

  useEffect(() => {
    if (section.items) {
      const featuredItem = section.items.find((i) => i.is_featured);
      setProductId(featuredItem?.product_id || section.items[0]?.product_id);
      setIsLoading(false);
    }
  }, [section.items]);

  const visibleItems =
    section.items?.filter((item) => !item.group || item.group === group) ?? [];
  const activeGroup = group || section.groups?.[0]?.name || '';
  const freeCard: PricingFreeCard | undefined = activeGroup
    ? section.free_cards?.[activeGroup]
    : undefined;
  const pricingGridClassName = getPricingGridClassName(visibleItems.length);

  return (
    <section
      id={section.id}
      className={cn(
        'bg-muted/20 relative overflow-hidden py-20 md:py-28',
        section.className,
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bg-primary/5 absolute top-12 left-1/2 h-72 w-full max-w-4xl -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative container">
        <div className="mx-auto mb-8 max-w-4xl px-4 text-center md:mb-10">
          {section.sr_only_title && (
            <h1 className="sr-only">{section.sr_only_title}</h1>
          )}
          <h2 className="text-foreground mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
            {section.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-4xl text-base text-pretty whitespace-pre-line md:text-lg">
            {section.description}
          </p>
        </div>

        {section.groups && section.groups.length > 0 && (
          <div className="mx-auto mb-4 flex w-full justify-center md:mb-6">
            <Tabs value={group} onValueChange={setGroup}>
              <TabsList className="border-border/70 bg-background rounded-full border p-1 shadow-sm shadow-zinc-950/5">
                {section.groups.map((item, i) => {
                  return (
                    <TabsTrigger
                      key={i}
                      value={item.name || ''}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground/70 rounded-full px-5 py-2 text-sm font-medium data-[state=active]:shadow-sm"
                    >
                      {item.title}
                      {item.label && (
                        <Badge className="ml-2 rounded-full border-0 bg-white/10 px-2 py-0 text-xs font-semibold tracking-wide text-current uppercase shadow-none">
                          {item.label}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div
          className={cn(
            'mx-auto grid w-full gap-4 lg:gap-5',
            pricingGridClassName
          )}
        >
          {visibleItems.map((item: PricingItem, idx) => {
            let isCurrentPlan = false;
            if (
              currentSubscription &&
              currentSubscription.productId === item.product_id
            ) {
              isCurrentPlan = true;
            }

            // Get currency state for this item
            const currencyState = itemCurrencies[item.product_id];
            const displayedItem = currencyState?.displayedItem || item;
            const selectedCurrency =
              currencyState?.selectedCurrency || item.currency;
            const currencies = getCurrenciesFromItem(item);
            const isFeatured = Boolean(item.is_featured);

            return (
              <Card
                key={idx}
                className={cn(
                  'relative flex h-full flex-col rounded-3xl border px-6 py-6 shadow-sm shadow-zinc-950/5 transition-colors duration-200 lg:px-7 lg:py-7',
                  'border-border/60 bg-background',
                  isFeatured &&
                    'border-primary/20 bg-primary/5 shadow-primary/10'
                )}
              >
                <CardHeader className="p-0">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="min-w-0 flex-1 font-medium">
                      <h3 className="text-foreground text-3xl leading-none font-semibold tracking-tight">
                        {item.title}
                      </h3>
                    </CardTitle>
                    {item.label && (
                      <span className="border-primary/10 bg-primary/10 text-primary inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-xs font-semibold tracking-widest">
                        {item.label}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-muted-foreground mt-2 min-h-10 text-sm leading-6">
                    {item.description}
                  </CardDescription>

                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <div className="text-foreground text-4xl leading-none font-bold tracking-tight">
                        {displayedItem.price}
                      </div>
                      {(displayedItem.original_price || displayedItem.unit) && (
                        <div className="flex items-baseline gap-1.5 leading-none">
                          {displayedItem.original_price && (
                            <span className="text-muted-foreground text-xl line-through">
                              {displayedItem.original_price}
                            </span>
                          )}
                          {displayedItem.unit ? (
                            <span className="text-muted-foreground text-sm font-medium">
                              {displayedItem.unit}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {currencies.length > 1 && (
                      <Select
                        value={selectedCurrency}
                        onValueChange={(currency) =>
                          handleCurrencyChange(item.product_id, currency)
                        }
                      >
                        <SelectTrigger
                          size="sm"
                          className="border-border/80 bg-background ml-auto h-9 min-w-24 rounded-full px-3 text-xs font-semibold tracking-widest uppercase shadow-none"
                        >
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem
                              key={currency.currency}
                              value={currency.currency}
                              className="text-xs font-medium uppercase"
                            >
                              {currency.currency.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {item.tip && (
                    <p className="text-muted-foreground/80 mt-2.5 text-sm leading-6">
                      {item.tip}
                    </p>
                  )}
                </CardHeader>

                <div className="mt-2">
                  {isCurrentPlan ? (
                    <Button
                      variant="outline"
                      className="border-border/80 bg-background h-11 w-full rounded-full px-6 text-sm font-medium shadow-sm"
                      disabled
                    >
                      <span>{t('current_plan')}</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePayment(item)}
                      disabled={isLoading}
                      className={cn(
                        'focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                        isFeatured
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/10 border border-white/20 shadow-md'
                          : 'border-border/80 bg-background text-foreground hover:bg-muted/50 border shadow-sm shadow-black/5'
                      )}
                    >
                      {isLoading && item.product_id === productId ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span className="block">{t('processing')}</span>
                        </>
                      ) : (
                        <>
                          {item.button?.icon && (
                            <SmartIcon
                              name={item.button?.icon as string}
                              className="size-4"
                            />
                          )}
                          <span className="block">{item.button?.title}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <CardContent className="border-border/60 mt-2 flex flex-1 flex-col border-t p-0 pt-2">
                  {item.features_title && (
                    <p className="text-muted-foreground mb-4 text-sm font-medium">
                      {item.features_title}
                    </p>
                  )}

                  <ul className="space-y-3 text-sm">
                    {item.features?.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="text-primary mt-1 size-4 shrink-0" />
                        <span className="text-muted-foreground leading-normal">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {freeCard && (
          <div
            className={cn(
              'mx-auto mt-6 grid w-full gap-4 md:mt-8 lg:gap-5',
              pricingGridClassName
            )}
          >
            <div
              className={cn(
                'w-full',
                visibleItems.length === 2 &&
                  'md:col-span-2 md:mx-auto md:max-w-sm',
                visibleItems.length >= 3 && 'xl:col-start-2'
              )}
            >
              <Card className="border-border/60 bg-background relative flex h-full flex-col rounded-3xl border px-6 py-6 shadow-sm shadow-zinc-950/5 transition-colors duration-200 lg:px-7 lg:py-7">
                <CardHeader className="p-0">
                  <CardTitle className="font-medium">
                    <h3 className="text-foreground text-3xl leading-none font-semibold tracking-tight">
                      {freeCard.title}
                    </h3>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-2 text-sm leading-6">
                    {freeCard.description}
                  </CardDescription>

                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <div className="text-foreground text-4xl leading-none font-bold tracking-tight">
                        {freeCard.price}
                      </div>
                      {(freeCard.original_price || freeCard.unit) && (
                        <div className="flex items-baseline gap-1.5 leading-none">
                          {freeCard.original_price && (
                            <span className="text-muted-foreground text-xl line-through">
                              {freeCard.original_price}
                            </span>
                          )}
                          {freeCard.unit ? (
                            <span className="text-muted-foreground text-sm font-medium">
                              {freeCard.unit}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <div className="mt-2">
                  <Button
                    variant="outline"
                    disabled
                    className="border-border/80 bg-background text-foreground h-11 w-full rounded-full border px-6 text-sm font-medium shadow-sm shadow-black/5"
                  >
                    {freeCard.button?.icon && (
                      <SmartIcon
                        name={freeCard.button.icon as string}
                        className="size-4"
                      />
                    )}
                    <span>{freeCard.button?.title}</span>
                  </Button>
                </div>

                <CardContent className="border-border/60 mt-2 flex flex-1 flex-col border-t p-0 pt-2">
                  {freeCard.features_title && (
                    <p className="text-muted-foreground mb-4 text-sm font-medium">
                      {freeCard.features_title}
                    </p>
                  )}

                  <ul className="space-y-3 text-sm">
                    {freeCard.features?.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="text-primary mt-1 size-4 shrink-0" />
                        <span className="text-muted-foreground leading-normal">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isLoading={isLoading}
        pricingItem={pricingItem}
        onCheckout={(item, paymentProvider) =>
          handleCheckout(item, paymentProvider)
        }
      />
    </section>
  );
}
