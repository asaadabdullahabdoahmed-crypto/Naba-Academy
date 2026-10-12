import React from 'react';
import { ApplicationStatusPage } from './ApplicationStatusPage';
import { Locale } from '../../i18n/dictionaries';

interface NationalSsoPageProps {
  locale: Locale;
}

export const NationalSsoPage: React.FC<NationalSsoPageProps> = ({ locale }) => {
  return <ApplicationStatusPage locale={locale} />;
};
