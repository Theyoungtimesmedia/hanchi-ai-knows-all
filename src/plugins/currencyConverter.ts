import { Plugin } from "@/utils/pluginSystem";

export const currencyConverterPlugin: Plugin = {
  id: 'currency-converter',
  name: 'Currency Converter',
  description: 'Convert between Naira, USD, GBP, and other currencies',
  icon: '💱',
  category: 'finance',
  enabled: true,
  execute: async (params: { amount: number; from: string; to: string }) => {
    // Mock exchange rates - in production, use real API
    const rates: Record<string, number> = {
      'NGN-USD': 0.0013,
      'USD-NGN': 770,
      'NGN-GBP': 0.0010,
      'GBP-NGN': 980,
      'USD-GBP': 0.79,
      'GBP-USD': 1.27,
    };

    const { amount, from, to } = params;
    const rateKey = `${from}-${to}`;
    const rate = rates[rateKey];

    if (!rate) {
      throw new Error(`Conversion rate not available for ${from} to ${to}`);
    }

    const convertedAmount = amount * rate;

    return {
      success: true,
      data: {
        originalAmount: amount,
        originalCurrency: from,
        convertedAmount: convertedAmount.toFixed(2),
        convertedCurrency: to,
        rate,
      },
      message: `${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`,
    };
  },
};
