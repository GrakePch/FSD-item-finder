import { useTranslation } from 'react-i18next';
import "./LanguageToggle.css";

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };
  return (
    <button onClick={toggleLang} className="LanguageToggle">
      {i18n.language === 'en' ? '中' : 'EN'}
    </button>
  );
}