import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PATIENT_ROUTES, DOCTOR_ROUTES, NURSE_ROUTES, ADMIN_ROUTES, SHARED_ROUTES } from '../constants/routes';

/* Layout Shells */
import { PatientLayout } from '../layouts/PatientLayout';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { NurseLayout } from '../layouts/NurseLayout';
import { AdminLayout } from '../layouts/AdminLayout';

/* Patient Pages */
import { PatientWelcomePage } from '../pages/patient/PatientWelcomePage';
import { PatientLanguagePage } from '../pages/patient/PatientLanguagePage';
import { PatientAccessibilityPage } from '../pages/patient/PatientAccessibilityPage';
import { PatientConsentPage } from '../pages/patient/PatientConsentPage';
import { PatientIdentityPage } from '../pages/patient/PatientIdentityPage';
import { PatientIntakePage } from '../pages/patient/PatientIntakePage';
import { PatientConversationPage } from '../pages/patient/PatientConversationPage';
import { PatientDocumentsPage } from '../pages/patient/PatientDocumentsPage';
import { PatientDocumentProcessingPage } from '../pages/patient/PatientDocumentProcessingPage';
import { PatientStoryPage } from '../pages/patient/PatientStoryPage';
import { PatientReviewPage } from '../pages/patient/PatientReviewPage';
import { PatientCompletePage } from '../pages/patient/PatientCompletePage';

/* Doctor Pages */
import { DoctorLoginPage } from '../pages/doctor/DoctorLoginPage';
import { DoctorDashboardPage } from '../pages/doctor/DoctorDashboardPage';
import { DoctorQueuePage } from '../pages/doctor/DoctorQueuePage';
import { DoctorPatientWorkspacePage } from '../pages/doctor/DoctorPatientWorkspacePage';
import { DoctorConsultationPage } from '../pages/doctor/DoctorConsultationPage';

/* Nurse Pages */
import {
  NurseDashboardPage,
  NurseQueuePage,
  NurseTriagePage,
  NurseAlertsPage,
  NurseLoginPage,
} from '../pages/nurse/NursePages';

/* Admin Pages */
import {
  AdminDashboardPage,
  AdminPatientsPage,
  AdminDoctorsPage,
  AdminDepartmentsPage,
  AdminAnalyticsPage,
  AdminLanguagesPage,
  AdminIntegrationsPage,
  AdminSecurityPage,
  AdminAuditLogsPage,
  AdminLoginPage,
} from '../pages/admin/AdminPages';

/* Shared Pages */
import { NotificationsPage, SettingsPage, ProfilePage, HelpPage } from '../pages/shared/SharedPages';

import { LandingPage } from '../pages/LandingPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Patient Kiosk Layout & 12 Routes */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route path="welcome" element={<PatientWelcomePage />} />
        <Route path="language" element={<PatientLanguagePage />} />
        <Route path="accessibility" element={<PatientAccessibilityPage />} />
        <Route path="consent" element={<PatientConsentPage />} />
        <Route path="identity" element={<PatientIdentityPage />} />
        <Route path="intake" element={<PatientIntakePage />} />
        <Route path="conversation" element={<PatientConversationPage />} />
        <Route path="documents" element={<PatientDocumentsPage />} />
        <Route path="document-processing" element={<PatientDocumentProcessingPage />} />
        <Route path="patient-story" element={<PatientStoryPage />} />
        <Route path="review" element={<PatientReviewPage />} />
        <Route path="complete" element={<PatientCompletePage />} />
        <Route index element={<Navigate to="welcome" replace />} />
      </Route>

      {/* Doctor Workspace Routes */}
      <Route path="/doctor/login" element={<DoctorLoginPage />} />
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route path="dashboard" element={<DoctorDashboardPage />} />
        <Route path="queue" element={<DoctorQueuePage />} />
        <Route path="patient/:patientId" element={<DoctorPatientWorkspacePage />} />
        <Route path="patient/:patientId/*" element={<DoctorPatientWorkspacePage />} />
        <Route path="consultation" element={<DoctorConsultationPage />} />

        {/* Shared Doctor Links */}
        <Route path={SHARED_ROUTES.NOTIFICATIONS.replace('/', '')} element={<NotificationsPage />} />
        <Route path={SHARED_ROUTES.SETTINGS.replace('/', '')} element={<SettingsPage />} />
        <Route path={SHARED_ROUTES.PROFILE.replace('/', '')} element={<ProfilePage />} />
        <Route path={SHARED_ROUTES.HELP.replace('/', '')} element={<HelpPage />} />

        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Nurse Triage Routes */}
      <Route path="/nurse/login" element={<NurseLoginPage />} />
      <Route path="/nurse" element={<NurseLayout />}>
        <Route path="dashboard" element={<NurseDashboardPage />} />
        <Route path="queue" element={<NurseQueuePage />} />
        <Route path="triage" element={<NurseTriagePage />} />
        <Route path="alerts" element={<NurseAlertsPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin Management Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="doctors" element={<AdminDoctorsPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="languages" element={<AdminLanguagesPage />} />
        <Route path="integrations" element={<AdminIntegrationsPage />} />
        <Route path="security" element={<AdminSecurityPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to={PATIENT_ROUTES.WELCOME} replace />} />
    </Routes>
  );
};
