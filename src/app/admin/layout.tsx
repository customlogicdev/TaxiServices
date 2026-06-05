'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Car, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { menuItems } from '../../data/mockData'; 
import './admin-layout.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token && pathname !== '/admin/login') {
      router.replace('/admin/login');
    } else {
      setIsAuthenticated(!!token);
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <div className="admin-spinner"></div>
          <p className="admin-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user');
    router.replace('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-content">
            <div className="sidebar-logo-icon">
              <Car />
            </div>
            <div className="sidebar-logo-text">
              <div className="sidebar-logo-title">Rudra Taxi Services</div>
              <div className="sidebar-logo-subtitle">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon; // ✅ Get the actual icon component
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="menu-item-icon">
                  <Icon /> {/* ✅ Render the icon component directly */}
                </span>
                <span className="menu-item-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="logout-button"
            aria-label="Logout from admin panel"
          >
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-header-content">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-button"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>
            
            <div className="mobile-header-brand">
              <div className="mobile-logo-icon">
                <Car />
              </div>
              <span className="mobile-header-title">RideEase Admin</span>
            </div>
            
            <div className="mobile-header-spacer"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';
// import { 
//   LayoutDashboard, 
//   Car, 
//   Tags, 
//   ClipboardList, 
//   Users, 
//   Image, 
//   LogOut,
//   Menu,
//   X
// } from 'lucide-react';
// import './admin-layout.css'; // Import the CSS file

// const menuItems = [
//   { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
//   { name: 'Fleet Management', path: '/admin/fleet', icon: Car },
//   { name: 'Car Types', path: '/admin/car-types', icon: Tags },
//   { name: 'Bookings', path: '/admin/bookings', icon: ClipboardList },
//   { name: 'Customers', path: '/admin/customers', icon: Users },
//   { name: 'Gallery', path: '/admin/gallery', icon: Image },
// ];

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('auth_token');
//     if (!token && pathname !== '/admin/login') {
//       router.replace('/admin/login');
//     } else {
//       setIsAuthenticated(!!token);
//       setLoading(false);
//     }
//   }, [pathname, router]);

//   // Close sidebar on route change (mobile)
//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [pathname]);

//   // Close sidebar on window resize (if desktop)
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) {
//         setSidebarOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Prevent body scroll when mobile sidebar is open
//   useEffect(() => {
//     if (sidebarOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [sidebarOpen]);

//   if (pathname === '/admin/login') {
//     return <>{children}</>;
//   }

//   if (loading) {
//     return (
//       <div className="admin-loading">
//         <div className="admin-loading-content">
//           <div className="admin-spinner"></div>
//           <p className="admin-loading-text">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('admin_user');
//     router.replace('/admin/login');
//   };

//   return (
//     <div className="admin-layout">
//       {/* Sidebar Overlay (Mobile) */}
//       {sidebarOpen && (
//         <div 
//           className="sidebar-overlay"
//           onClick={() => setSidebarOpen(false)}
//           aria-hidden="true"
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
//         {/* Logo Section */}
//         <div className="sidebar-logo">
//           <div className="sidebar-logo-content">
//             <div className="sidebar-logo-icon">
//               <Car />
//             </div>
//             <div className="sidebar-logo-text">
//               <div className="sidebar-logo-title">RideEase</div>
//               <div className="sidebar-logo-subtitle">Admin Panel</div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Menu */}
//         <nav className="sidebar-nav">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
//             return (
//               <Link
//                 key={item.path}
//                 href={item.path}
//                 className={`menu-item ${isActive ? 'active' : ''}`}
//                 aria-current={isActive ? 'page' : undefined}
//               >
//                 <span className="menu-item-icon">
//                   <Icon />
//                 </span>
//                 <span className="menu-item-label">{item.name}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Logout Button */}
//         <div className="sidebar-footer">
//           <button
//             onClick={handleLogout}
//             className="logout-button"
//             aria-label="Logout from admin panel"
//           >
//             <LogOut />
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <div className="admin-main-wrapper">
//         {/* Mobile Header */}
//         <header className="mobile-header">
//           <div className="mobile-header-content">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="mobile-menu-button"
//               aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
//               aria-expanded={sidebarOpen}
//             >
//               {sidebarOpen ? <X /> : <Menu />}
//             </button>
            
//             <div className="mobile-header-brand">
//               <div className="mobile-logo-icon">
//                 <Car />
//               </div>
//               <span className="mobile-header-title">RideEase Admin</span>
//             </div>
            
//             <div className="mobile-header-spacer"></div>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="admin-main-content">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';

// import { 
//   LayoutDashboard, 
//   Car, 
//   Tags, 
//   ClipboardList, 
//   Users, 
//   Image, 
//   LogOut,
//   Menu,
//   X,
//   ChevronLeft
// } from 'lucide-react';

// const menuItems = [
//   { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
//   { name: 'Fleet Management', path: '/admin/fleet', icon: Car },
//   { name: 'Car Types', path: '/admin/car-types', icon: Tags },
//   { name: 'Bookings', path: '/admin/bookings', icon: ClipboardList },
//   { name: 'Customers', path: '/admin/customers', icon: Users },
//   { name: 'Gallery', path: '/admin/gallery', icon: Image },
// ];

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('auth_token');
//     if (!token && pathname !== '/admin/login') {
//       router.replace('/admin/login');
//     } else {
//       setIsAuthenticated(!!token);
//       setLoading(false);
//     }
//   }, [pathname, router]);

//   // Close sidebar on route change (mobile)
//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [pathname]);

//   if (pathname === '/admin/login') {
//     return <>{children}</>;
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-slate-50">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-slate-600 font-medium">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('admin_user');
//     router.replace('/admin/login');
//   };

//   // Overlay for mobile sidebar
//   const sidebarOverlay = sidebarOpen && (
//     <div 
//       className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//       onClick={() => setSidebarOpen(false)}
//     />
//   );

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       {/* Sidebar Overlay (Mobile) */}
//       {sidebarOverlay}

//       {/* Sidebar */}
//       <aside className={`
//         fixed top-0 left-0 bottom-0 z-50
//         w-64 bg-white border-r border-slate-200
//         flex flex-col
//         transform transition-transform duration-300 ease-in-out
//         lg:translate-x-0 lg:static lg:z-auto
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//         {/* Logo */}
//         <div className="p-6 border-b border-slate-200">
//           <div className="flex items-center gap-3 mb-1">
//             <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
//               <Car className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="font-bold text-slate-800 text-base leading-tight">RideEase</h1>
//               <p className="text-xs text-slate-400">Admin Panel</p>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-3 overflow-y-auto">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
//             return (
//               <Link
//                 key={item.path}
//                 href={item.path}
//                 className={`
//                   flex items-center gap-3 px-4 py-3 rounded-xl mb-1
//                   text-sm font-medium
//                   transition-all duration-200
//                   ${isActive 
//                     ? 'bg-amber-50 text-amber-600' 
//                     : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
//                   }
//                 `}
//               >
//                 <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
//                 {item.name}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Logout */}
//         <div className="p-4 border-t border-slate-200">
//           <button
//             onClick={handleLogout}
//             className="
//               w-full flex items-center justify-center gap-2
//               px-4 py-3 rounded-xl
//               bg-red-50 text-red-600
//               border border-red-100
//               text-sm font-semibold
//               hover:bg-red-100 hover:border-red-200
//               transition-all duration-200
//             "
//           >
//             <LogOut className="w-4 h-4" />
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Mobile Header */}
//         <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
//           <div className="flex items-center justify-between">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
//             >
//               {sidebarOpen ? (
//                 <X className="w-6 h-6 text-slate-600" />
//               ) : (
//                 <Menu className="w-6 h-6 text-slate-600" />
//               )}
//             </button>
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
//                 <Car className="w-4 h-4 text-white" />
//               </div>
//               <span className="font-bold text-slate-800 text-sm">RideEase Admin</span>
//             </div>
//             <div className="w-10"></div> {/* Spacer for centering */}
//           </div>
//         </header>

//         {/* Content Area */}
//         <main className="flex-1 p-4 sm:p-6 lg:p-8">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }