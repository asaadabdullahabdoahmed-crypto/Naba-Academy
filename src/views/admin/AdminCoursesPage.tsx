import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AcademicReferenceBrowser } from '../../components/academic/AcademicReferenceBrowser';
import { AcademicCourseReference } from '../../components/academic/AcademicCourseReference';
import { PortalWorkflowUnavailablePage } from '../shared/PortalWorkflowUnavailablePage';
import { Locale } from '../../i18n/dictionaries';

export const AdminCoursesPage: React.FC<{ locale: Locale }> = ({ locale }) => {
  const { pathname } = useLocation();
  const { courseId } = useParams<{ courseId: string }>();
  if (pathname.includes('/admin/library')) return <PortalWorkflowUnavailablePage locale={locale} portalKey="admin" />;
  if (courseId) return <AcademicCourseReference key={courseId} locale={locale} portal="admin" courseId={courseId} />;
  const kind = pathname.includes('/admin/terms') ? 'terms' : 'courses';
  return <AcademicReferenceBrowser key={kind} locale={locale} portal="admin" kind={kind} />;
};
