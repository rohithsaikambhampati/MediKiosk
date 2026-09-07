import React from 'react';
import { PageContainer } from '../../components/common/containers/LayoutContainers';
import { Card } from '../../components/common/Card';

export const NotificationsPage: React.FC = () => (
  <PageContainer title="System Notifications" subtitle="Alerts, clinical queue updates, and system broadcasts.">
    <Card variant="default" padding="lg">No unread notifications.</Card>
  </PageContainer>
);

export const SettingsPage: React.FC = () => (
  <PageContainer title="System & User Preferences" subtitle="Theme settings, notification preferences, and accessibility defaults.">
    <Card variant="default" padding="lg">Preferences Console</Card>
  </PageContainer>
);

export const ProfilePage: React.FC = () => (
  <PageContainer title="User Profile" subtitle="Clinical staff credential and hospital department assignment.">
    <Card variant="default" padding="lg">Clinical Profile</Card>
  </PageContainer>
);

export const HelpPage: React.FC = () => (
  <PageContainer title="Help & Clinical Support" subtitle="MediKiosk documentation and nurse assistance contacts.">
    <Card variant="default" padding="lg">Support Resources</Card>
  </PageContainer>
);
