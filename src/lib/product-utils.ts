import { Product } from '@polar-sh/sdk/models/components/product';

export const getFormattedPrice = (product: Product): string => {
  const firstPrice = product.prices[0];
  if (!firstPrice) return 'N/A';

  switch (firstPrice.amountType) {
    case 'fixed':
      return `$${firstPrice.priceAmount / 100}`;
    case 'free':
      return 'Free';
    default:
      return 'Pay what you want';
  }
};

export const getPriceValue = (product: Product): number => {
  const firstPrice = product.prices[0];
  if (!firstPrice) return 0;

  switch (firstPrice.amountType) {
    case 'fixed':
      return firstPrice.priceAmount || 0;
    case 'free':
      return 0;
    default:
      return Number.MAX_SAFE_INTEGER;
  }
};

export const getInterval = (product: Product): string | null => {
  if (!product.recurringInterval) return null;
  return product.recurringInterval === 'year' ? '/year' : '/month';
};

export const calculateAnnualSavings = (yearlyPrice: number, monthlyPrice: number): number => {
  const yearlyTotal = yearlyPrice / 100;
  const monthlyTotal = (monthlyPrice * 12) / 100;
  return Math.round(monthlyTotal - yearlyTotal);
};

export const calculateSavingsPercentage = (yearlyPrice: number, monthlyPrice: number): number => {
  const yearlyTotal = yearlyPrice / 100;
  const monthlyTotal = (monthlyPrice * 12) / 100;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
};

export const getMonthlyPriceFromYearly = (yearlyProduct: Product): string => {
  const yearlyPrice = getPriceValue(yearlyProduct);
  if (yearlyPrice === 0) return 'Free';
  if (yearlyPrice === Number.MAX_SAFE_INTEGER) return 'Pay what you want';
  return `$${(yearlyPrice / 12 / 100).toFixed(2)}`;
};
