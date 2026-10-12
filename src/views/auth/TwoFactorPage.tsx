import React from 'react';
import { VerifyOtpPage } from './VerifyOtpPage';
import { Locale } from '../../i18n/dictionaries';

interface TwoFactorPageProps {
  locale: Locale;
}

export const TwoFactorPage: React.FC<TwoFactorPageProps> = ({ locale }) => {
  return <VerifyOtpPage locale={locale} />;
};
