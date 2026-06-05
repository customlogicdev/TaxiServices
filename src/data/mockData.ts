import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  FolderTree,
  Users,
  Image,
  Mail,
  Shield
} from 'lucide-react';

export interface MenuItem {
  icon: any; // Lucide icon component
  label: string;
  path: string;
}

export const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
  { icon: Car, label: 'Fleet', path: '/admin/fleet' },
  { icon: FolderTree, label: 'Car Types', path: '/admin/car-types' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Image, label: 'Gallery', path: '/admin/gallery' },
  { icon: Shield, label: 'Admin Users', path: '/admin/adminSetting' }, // ✅ Must match folder name
];