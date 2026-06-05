// // src/components/layout/Header.tsx
// 'use client';

// import { usePathname, useRouter } from 'next/navigation';
// import { menuItems } from '../../data/mockData';

// export default function Header({ collapsed, onMenuToggle }: any) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const currentPage = menuItems.find(item => item.path === pathname);

//   return (
//     <header className={`admin-header ${collapsed ? 'collapsed' : ''}`}>
//       <div className="header-left">
//         <button className="menu-toggle" onClick={onMenuToggle}>
//           ☰
//         </button>
//         <h1 className="header-title">{currentPage?.label || 'Dashboard'}</h1>
//       </div>
//       <div className="header-right">
//         <a href="/" target="_blank" className="website-link">
//           🔗 <span>View Website</span>
//         </a>
//         <button className="logout-btn" onClick={() => router.push('/login')}>
//           🚪 <span>Logout</span>
//         </button>
//       </div>
//     </header>
//   );
// }