import { Language } from "@/stores/useUIStore";
import { useLanguage } from "../components/LanguageProvider";
import { translations, SupportedLanguage } from "../translations";
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil, formatNumber as formatNumberUtil } from "../utils/formatters";

export type TranslationKey = string;

export const useTranslation = () => {
  const { language, setLanguage } = useLanguage();

  /**
   * Translates a key with graceful fallback to English, then to defaultValue/key.
   * Supports interpolation: t("welcome.user", { name: "Alice" })
   */
  const t = (
    key: TranslationKey,
    params?: Record<string, string | number>,
    defaultValue?: string
  ): string => {
    const currentDict = translations[language] || translations.en;
    const enDict = translations.en;

    let text = currentDict[key] || enDict[key] || defaultValue || key;

    // String interpolation for variables like {name} or {{name}}
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text
          .replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"), String(val))
          .replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(val));
      });
    }

    return text;
  };

  const formatCurrency = (amount: number, currency: string = "INR") =>
    formatCurrencyUtil(amount, language as Language, currency);

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
    formatNumberUtil(value, language as Language, options);

  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
    formatDateUtil(date, language as Language, options);

  return {
    t,
    language,
    setLanguage,
    formatCurrency,
    formatNumber,
    formatDate,
  };
};

