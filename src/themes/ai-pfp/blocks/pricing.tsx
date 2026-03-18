'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  aiPfpSegmentedTabsListClassName,
  aiPfpSegmentedTabsTriggerClassName,
  SmartIcon,
} from '@/shared/blocks/common';
import { PaymentModal } from '@/shared/blocks/payment/payment-modal';
import { TextHighlight } from '@/shared/components/text-highlight';
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

type SelectedCurrencies = Record<string, string>;

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

function getDisplayedPricingItem(
  item: PricingItem,
  selectedCurrency: string
): PricingItem {
  const currencies = getCurrenciesFromItem(item);
  const currencyData = currencies.find(
    (currency) =>
      currency.currency.toLowerCase() === selectedCurrency.toLowerCase()
  );

  if (!currencyData) {
    return item;
  }

  return {
    ...item,
    currency: currencyData.currency,
    amount: currencyData.amount,
    price: currencyData.price,
    original_price: currencyData.original_price,
    payment_product_id:
      currencyData.payment_product_id || item.payment_product_id,
    payment_providers: currencyData.payment_providers || item.payment_providers,
  };
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

function getTabsGridClassName(groupCount: number): string {
  if (groupCount <= 1) {
    return 'grid-cols-1';
  }

  if (groupCount === 2) {
    return 'grid-cols-2';
  }

  if (groupCount === 3) {
    return 'grid-cols-3';
  }

  if (groupCount === 4) {
    return 'grid-cols-4';
  }

  return 'grid-cols-5';
}

function getDefaultFreeCard(
  freeCards: PricingType['free_cards']
): PricingFreeCard | undefined {
  if (!freeCards) return undefined;

  return (
    freeCards.default ||
    freeCards.yearly ||
    freeCards.monthly ||
    freeCards['one-time']
  );
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

    const preferredGroup = section.groups?.find((g) => g.name === 'yearly');
    // First look for a group with is_featured set to true
    const featuredGroup = section.groups?.find((g) => g.is_featured);
    // Prefer yearly for the initial view, then featured, then the first group
    return (
      currentItem?.group ||
      preferredGroup?.name ||
      featuredGroup?.name ||
      section.groups?.[0]?.name
    );
  });

  // current pricing item
  const [pricingItem, setPricingItem] = useState<PricingItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  // Store the selected currency for each product_id.
  const [selectedCurrencies, setSelectedCurrencies] =
    useState<SelectedCurrencies>({});

  // Initialize selected currency for all items.
  useEffect(() => {
    if (section.items && section.items.length > 0) {
      const initialSelectedCurrencies: SelectedCurrencies = {};

      section.items.forEach((item) => {
        const currencies = getCurrenciesFromItem(item);
        initialSelectedCurrencies[item.product_id] = getInitialCurrency(
          currencies,
          locale,
          item.currency
        );
      });

      setSelectedCurrencies(initialSelectedCurrencies);
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
      setSelectedCurrencies((prev) => ({
        ...prev,
        [productId]: currency,
      }));
    }
  };

  const handlePayment = async (item: PricingItem) => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    // Use displayed item with selected currency
    const selectedCurrency =
      selectedCurrencies[item.product_id] || item.currency;
    const displayedItem = getDisplayedPricingItem(item, selectedCurrency);

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
      setLoadingProductId(item.product_id);

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setLoadingProductId(null);
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
    } catch (error) {
      console.error('checkout failed:', error);
      const message =
        error instanceof Error ? error.message : 'unknown checkout error';
      toast.error(`checkout failed: ${message}`);

      setIsLoading(false);
      setLoadingProductId(null);
    }
  };

  const visibleItems =
    section.items?.filter((item) => !item.group || item.group === group) ?? [];
  const pricingGridClassName = getPricingGridClassName(visibleItems.length);
  const groupCount = section.groups?.length ?? 0;
  const tabsGridClassName = getTabsGridClassName(groupCount);
  const baseFreeCard = getDefaultFreeCard(section.free_cards);
  const activeFreeCard = group ? section.free_cards?.[group] : undefined;
  const displayedFreeCard = baseFreeCard
    ? {
        ...baseFreeCard,
        ...activeFreeCard,
        button: {
          ...baseFreeCard.button,
          ...activeFreeCard?.button,
        },
      }
    : undefined;
  const renderFreeCard = (cardClassName?: string) => {
    if (!displayedFreeCard) return null;

    return (
      <Card
        className={cn(
          'border-border bg-background relative flex h-full flex-col rounded-3xl border p-6 shadow-none transition-[box-shadow,colors] duration-200 hover:shadow-md',
          cardClassName
        )}
      >
        <CardHeader className="p-0">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="min-w-0 flex-1 font-medium">
              <h3 className="text-foreground text-lg font-semibold md:text-xl">
                {displayedFreeCard.title}
              </h3>
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground mt-2 min-h-10 text-sm leading-6">
            {displayedFreeCard.description}
          </CardDescription>

          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <div className="text-foreground text-4xl leading-none font-bold tracking-tight">
                {displayedFreeCard.price}
              </div>
              {(displayedFreeCard.original_price || displayedFreeCard.unit) && (
                <div className="flex items-baseline gap-1.5 leading-none">
                  {displayedFreeCard.original_price ? (
                    <span className="text-muted-foreground text-xl font-bold line-through">
                      {displayedFreeCard.original_price}
                    </span>
                  ) : null}
                  {displayedFreeCard.unit ? (
                    <span className="text-muted-foreground text-sm font-medium">
                      {displayedFreeCard.unit}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <div className="mt-2">
          <Button
            aria-disabled="true"
            className="border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary h-10 w-full cursor-not-allowed rounded-xl border px-6 text-sm font-medium transition-colors duration-200"
          >
            <span>{displayedFreeCard.button?.title}</span>
          </Button>
        </div>

        <CardContent className="border-border mt-2 flex flex-1 flex-col border-t p-0 pt-2">
          {displayedFreeCard.features_title && (
            <p className="text-muted-foreground mb-4 text-sm leading-6 font-medium">
              {displayedFreeCard.features_title}
            </p>
          )}

          <ul className="grid gap-3 text-sm leading-6">
            {displayedFreeCard.features?.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {displayedFreeCard.crossed_features?.includes(feature) ? (
                  <X className="mt-1 size-4 shrink-0 text-red-500" />
                ) : (
                  <Check className="text-primary mt-1 size-4 shrink-0" />
                )}
                <span className="text-muted-foreground text-sm leading-6">
                  <TextHighlight text={feature} />
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <section
      id={section.id}
      className={cn(
        'bg-background relative overflow-hidden py-20 md:py-28',
        section.className,
        className
      )}
    >
      <div className="relative container">
        <div className="mx-auto mb-8 max-w-4xl px-4 text-center md:mb-10">
          {section.sr_only_title && (
            <h1 className="sr-only">{section.sr_only_title}</h1>
          )}
          <h2 className="text-foreground mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            {section.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-4xl text-base leading-7 text-pretty whitespace-pre-line md:text-lg md:leading-8">
            {section.description}
          </p>
        </div>

        {section.groups && section.groups.length > 0 && (
          <div className="mx-auto mb-4 flex w-full justify-center overflow-x-auto px-4 md:mb-6">
            <Tabs value={group} onValueChange={setGroup} className="max-w-full">
              <TabsList
                className={cn(
                  aiPfpSegmentedTabsListClassName,
                  'w-max min-w-max',
                  tabsGridClassName
                )}
              >
                {section.groups.map((item, i) => {
                  return (
                    <TabsTrigger
                      key={item.name ?? `group-${i}`}
                      value={item.name || ''}
                      className={cn(
                        aiPfpSegmentedTabsTriggerClassName,
                        'min-w-28 shrink-0 px-3 md:min-w-32 md:px-4'
                      )}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <span>{item.title}</span>
                        {item.label && (
                          <span className="text-xs leading-5 font-semibold">
                            {item.label}
                          </span>
                        )}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div
          className={cn(
            'mx-auto grid w-full gap-4',
            pricingGridClassName
          )}
        >
          {visibleItems.map((item: PricingItem) => {
            let isCurrentPlan = false;
            if (
              currentSubscription &&
              currentSubscription.productId === item.product_id
            ) {
              isCurrentPlan = true;
            }

            // Get currency state for this item
            const selectedCurrency =
              selectedCurrencies[item.product_id] || item.currency;
            const currencies = getCurrenciesFromItem(item);
            const displayedItem = getDisplayedPricingItem(
              item,
              selectedCurrency
            );
            const isFeatured = Boolean(item.is_featured);

            return (
              <Card
                key={item.product_id}
                className={cn(
                  'relative flex h-full flex-col rounded-3xl border p-6 shadow-none transition-[box-shadow,colors] duration-200 hover:shadow-md',
                  isFeatured
                    ? 'border-primary/40 bg-accent'
                    : 'border-border bg-background'
                )}
              >
                <CardHeader className="p-0">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="min-w-0 flex-1 font-medium">
                      <h3 className="text-foreground text-lg font-semibold md:text-xl">
                        {item.title}
                      </h3>
                    </CardTitle>
                    {item.label && (
                      <span className="border-primary bg-accent text-primary inline-flex h-7 shrink-0 items-center rounded-xl border px-3 text-xs leading-5 font-semibold tracking-widest">
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
                            <span className="text-muted-foreground text-xl font-bold line-through">
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
                          className="border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary ml-auto h-10 min-w-24 rounded-xl px-4 text-xs leading-5 font-semibold tracking-widest uppercase shadow-none transition-colors duration-200"
                        >
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem
                              key={currency.currency}
                              value={currency.currency}
                              className="text-xs leading-5 font-medium uppercase"
                            >
                              {currency.currency.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {item.tip && (
                    <p className="text-muted-foreground mt-2.5 text-sm leading-6">
                      {item.tip}
                    </p>
                  )}
                </CardHeader>

                <div className="mt-2">
                  {isCurrentPlan ? (
                    <Button
                      variant="outline"
                      aria-disabled="true"
                      className="border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary h-10 w-full cursor-not-allowed rounded-xl px-6 text-sm leading-6 font-medium shadow-none transition-colors duration-200"
                    >
                      <span>{t('current_plan')}</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePayment(item)}
                      disabled={isLoading}
                      className={cn(
                        'focus-visible:ring-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm leading-6 font-medium whitespace-nowrap transition-colors duration-200 focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none',
                        isFeatured
                          ? 'border-border bg-primary text-primary-foreground hover:border-primary hover:bg-primary/90 border'
                          : 'border-border bg-background text-foreground hover:border-primary hover:bg-accent hover:text-primary border'
                      )}
                    >
                      {isLoading && item.product_id === loadingProductId ? (
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

                <CardContent className="border-border mt-2 flex flex-1 flex-col border-t p-0 pt-2">
                  {item.features_title && (
                    <p className="text-muted-foreground mb-4 text-sm leading-6 font-medium">
                      {item.features_title}
                    </p>
                  )}

                  <ul className="grid gap-3 text-sm leading-6">
                    {item.features?.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        {item.crossed_features?.includes(feature) ? (
                          <X className="mt-1 size-4 shrink-0 text-red-500" />
                        ) : (
                          <Check className="text-primary mt-1 size-4 shrink-0" />
                        )}
                        <span className="text-muted-foreground text-sm leading-6">
                          <TextHighlight text={feature} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
          {renderFreeCard('xl:col-start-2')}
        </div>
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
