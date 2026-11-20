import React from 'react';
import { useLocation } from 'react-router-dom';
import { AcademicReferenceBrowser } from '../../components/academic/AcademicReferenceBrowser';
import { Locale } from '../../i18n/dictionaries';

export const InstructorCoursesPage: React.FC<{ locale: Locale }> = ({ locale }) => {
  const { pathname } = useLocation();
  const kind = pathname.includes('/instructor/terms') ? 'terms' : 'courses';
  return <AcademicReferenceBrowser key={kind} locale={locale} portal="instructor" kind={kind} />;
};
