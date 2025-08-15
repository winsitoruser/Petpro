import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import i18n, { setLanguage, getCurrentLanguage, getAvailableLanguages, initializeLanguage } from '../i18n/i18n';

interface LanguageContextProps {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (scope: string, options?: object) => string;
  availableLanguages: { code: string; name: string }[];
  isLanguageLoaded: boolean;
}

export const LanguageContext = createContext<LanguageContextProps>({
  currentLanguage: 'en',
  changeLanguage: async () => {},
  t: () => '',
  availableLanguages: [],
  isLanguageLoaded: false,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(getCurrentLanguage());
  const [isLanguageLoaded, setIsLanguageLoaded] = useState<boolean>(false);
  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    const loadLanguage = async () => {
      await initializeLanguage();
      setCurrentLanguage(getCurrentLanguage());
      setIsLanguageLoaded(true);
    };

    loadLanguage();
  }, []);

  const changeLanguage = async (lang: string) => {
    await setLanguage(lang);
    setCurrentLanguage(lang);
  };

  const t = (scope: string, options?: object): string => {
    return i18n.t(scope, options);
  };

  const contextValue: LanguageContextProps = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages,
    isLanguageLoaded,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageProvider;
