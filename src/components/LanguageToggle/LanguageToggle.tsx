import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import "./LanguageToggle.css";

const supportedLanguages = new Set(["en", "zh"]);

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const langQuery = searchParams.get("lang");

  useEffect(() => {
    if (!langQuery || !supportedLanguages.has(langQuery)) return;
    if (i18n.language !== langQuery) {
      i18n.changeLanguage(langQuery);
    }
  }, [i18n, langQuery]);

  const toggleLang = () => {
    const nextLanguage = i18n.language === 'en' ? 'zh' : 'en';
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("lang", nextLanguage);
    setSearchParams(nextParams, { replace: true });
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <button onClick={toggleLang} className="LanguageToggle">
      {i18n.language === 'en' ? '中' : 'EN'}
    </button>
  );
}
