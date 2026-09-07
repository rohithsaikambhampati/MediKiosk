import { LucideIcon } from 'lucide-react';
import { UserRole } from './clinical';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badgeCount?: number;
  badgeVariant?: 'default' | 'urgent' | 'warning';
  roles: UserRole[];
}

export interface RouteConfig {
  path: string;
  label: string;
  role: UserRole;
  category?: string;
}
