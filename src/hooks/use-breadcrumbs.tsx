'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/analytics/overview': [{ title: 'Dashboard', link: '/dashboard/analytics/overview' }],
  '/dashboard/analytics/nps': [
    { title: 'Dashboard', link: '/dashboard/analytics/overview' },
    { title: 'NPS', link: '/dashboard/analytics/nps' }
  ],
  '/dashboard/analytics/csat': [
    { title: 'Dashboard', link: '/dashboard/analytics/overview' },
    { title: 'CSAT', link: '/dashboard/analytics/csat' }
  ],
  '/dashboard/analytics/ces': [
    { title: 'Dashboard', link: '/dashboard/analytics/overview' },
    { title: 'CES', link: '/dashboard/analytics/ces' }
  ],
  '/dashboard/analytics/csi': [
    { title: 'Dashboard', link: '/dashboard/analytics/overview' },
    { title: 'CSI', link: '/dashboard/analytics/csi' }
  ],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' }
  ]
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
