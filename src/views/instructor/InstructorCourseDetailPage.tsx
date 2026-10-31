import React from 'react';
import { useParams } from 'react-router-dom';
import { AcademicCourseReference } from '../../components/academic/AcademicCourseReference';
import { Locale } from '../../i18n/dictionaries';

export const InstructorCourseDetailPage: React.FC<{ locale: Locale }> = ({ locale }) => {
  const { courseId = '' } = useParams<{ courseId: string }>();
  return <AcademicCourseReference key={courseId} locale={locale} portal="instructor" courseId={courseId} />;
};
