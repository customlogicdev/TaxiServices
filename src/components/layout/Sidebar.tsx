// 'use client';

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// import { menuItems, currentUser } from '../../data/mockData';
// import { carTypeService } from '../../services/carTypeService';

// import {
//   LayoutDashboard,
//   CalendarCheck,
//   Car,
//   Users,
//   Image,
//   Mail,
//   FolderTree,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   LogOut,
//   ChevronDown,
//   Plus,
// } from 'lucide-react';

// interface SidebarProps {
//   collapsed: boolean;
//   onToggle: () => void;
//   mobileOpen: boolean;
//   onMobileClose: () => void;
// }

// interface CarTypeItem {
//   carTypeId: number;
//   carCategoryName: string;
//   slug: string;
//   isActive: boolean;
// }

// export default function Sidebar({
//   collapsed,
//   onToggle,
//   mobileOpen,
//   onMobileClose,
// }: SidebarProps) {

//   const pathname = usePathname();
//   const router = useRouter();

//   // =========================
//   // STATES
//   // =========================
//   const [carTypes, setCarTypes] = useState<CarTypeItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [carTypesExpanded, setCarTypesExpanded] = useState(true);

//   // =========================
//   // FETCH CAR TYPES
//   // =========================
//   useEffect(() => {
//     fetchCarTypes();
//   }, []);

//   const fetchCarTypes = async () => {

//     try {

//       setLoading(true);

//       console.log('🚀 Fetching Car Types...');

//       const response = await carTypeService.getAll();

//       console.log('✅ Full API Response:', response);

//       // Support both direct array & paginated response
//       const data = Array.isArray(response)
//         ? response
//         : response?.content || [];

//       console.log('✅ Extracted Data:', data);

//       const activeTypes = data.filter(
//         (item: CarTypeItem) => item.isActive
//       );

//       console.log('🔥 Active Car Types:', activeTypes);

//       setCarTypes(activeTypes);

//     } catch (error) {

//       console.error('❌ Failed to fetch car types:', error);

//       // Fallback Demo Data
//       setCarTypes([
//         {
//           carTypeId: 1,
//           carCategoryName: 'Sedan',
//           slug: 'sedan',
//           isActive: true,
//         },
//         {
//           carTypeId: 2,
//           carCategoryName: 'SUV',
//           slug: 'suv',
//           isActive: true,
//         },
//         {
//           carTypeId: 3,
//           carCategoryName: 'Luxury',
//           slug: 'luxury',
//           isActive: true,
//         },
//         {
//           carTypeId: 4,
//           carCategoryName: 'Van',
//           slug: 'van',
//           isActive: true,
//         },
//       ]);

//     } finally {

//       setLoading(false);

//     }
//   };

//   // =========================
//   // ICON MAPPING
//   // =========================
//   const getIcon = (iconName: string) => {

//     const iconProps = {
//       size: 20,
//     };

//     switch (iconName) {

//       case 'LayoutDashboard':
//         return <LayoutDashboard {...iconProps} />;

//       case 'CalendarCheck':
//         return <CalendarCheck {...iconProps} />;

//       case 'Car':
//         return <Car {...iconProps} />;

//       case 'FolderTree':
//         return <FolderTree {...iconProps} />;

//       case 'Users':
//         return <Users {...iconProps} />;

//       case 'Image':
//         return <Image {...iconProps} />;

//       case 'Mail':
//         return <Mail {...iconProps} />;

//       case 'Settings':
//         return <Settings {...iconProps} />;

//       default:
//         return <LayoutDashboard {...iconProps} />;
//     }
//   };

//   // =========================
//   // LOGOUT
//   // =========================
//   const handleLogout = () => {
//     router.push('/admin/login');
//   };

//   // =========================
//   // ACTIVE PATH CHECK
//   // =========================
//   const isPathActive = (path: string) => {

//     if (path === '/admin/dashboard') {
//       return pathname === '/admin/dashboard';
//     }

//     if (path === '/admin/car-types') {
//       return pathname?.startsWith('/admin/car-types');
//     }

//     return pathname?.startsWith(path);
//   };

//   return (
//     <>
//       {/* =========================
//           MOBILE OVERLAY
//       ========================== */}
//       <div
//         className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`}
//         onClick={onMobileClose}
//       />

//       {/* =========================
//           SIDEBAR
//       ========================== */}
//       <aside
//         className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           height: '100vh',
//           width: collapsed ? 72 : 250,
//           background: '#1E293B',
//           color: 'white',
//           zIndex: 50,
//           transition: 'width 0.3s ease',
//           display: 'flex',
//           flexDirection: 'column',
//           overflow: 'hidden',
//           boxShadow: mobileOpen
//             ? '0 0 30px rgba(0,0,0,0.3)'
//             : 'none'
//         }}
//       >

//         {/* =========================
//             LOGO
//         ========================== */}
//         <div
//           style={{
//             height: 68,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             padding: '0 16px',
//             borderBottom: '1px solid rgba(255,255,255,0.08)',
//             flexShrink: 0
//           }}
//         >

//           <Link
//             href="/admin/dashboard"
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 10,
//               color: 'white',
//               textDecoration: 'none',
//               overflow: 'hidden'
//             }}
//           >

//             <div
//               style={{
//                 width: 36,
//                 height: 36,
//                 background: 'linear-gradient(135deg, #F59E0B, #F97316)',
//                 borderRadius: 8,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontWeight: 700,
//                 fontSize: 16,
//                 flexShrink: 0
//               }}
//             >
//               R
//             </div>

//             {!collapsed && (
//               <span
//                 style={{
//                   fontSize: 18,
//                   fontWeight: 700,
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 RideEase
//               </span>
//             )}

//           </Link>

//           <button
//             onClick={onToggle}
//             style={{
//               width: 30,
//               height: 30,
//               border: 'none',
//               background: 'transparent',
//               color: '#94A3B8',
//               borderRadius: 6,
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//           >
//             {collapsed
//               ? <ChevronRight size={18} />
//               : <ChevronLeft size={18} />
//             }
//           </button>

//         </div>

//         {/* =========================
//             NAVIGATION
//         ========================== */}
//         <nav
//           style={{
//             flex: 1,
//             padding: '12px 8px',
//             overflowY: 'auto',
//             overflowX: 'hidden'
//           }}
//         >

//           {/* =========================
//               MAIN MENU
//           ========================== */}
//           {menuItems.map((item) => {

//             const isActive = isPathActive(item.path);

//             return (
//               <Link
//                 key={item.path}
//                 href={item.path}
//                 onClick={onMobileClose}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 12,
//                   padding: collapsed ? '11px' : '11px 14px',
//                   borderRadius: 10,
//                   color: isActive ? 'white' : '#94A3B8',
//                   fontSize: 14,
//                   fontWeight: 500,
//                   textDecoration: 'none',
//                   background: isActive
//                     ? 'linear-gradient(135deg, #F59E0B, #F97316)'
//                     : 'transparent',
//                   justifyContent: collapsed
//                     ? 'center'
//                     : 'flex-start',
//                   marginBottom: 4,
//                   transition: 'all 0.2s ease',
//                   boxShadow: isActive
//                     ? '0 4px 12px rgba(245,158,11,0.4)'
//                     : 'none'
//                 }}
//               >

//                 <span style={{ flexShrink: 0 }}>
//                   {getIcon(item.icon)}
//                 </span>

//                 {!collapsed && (
//                   <span style={{ whiteSpace: 'nowrap' }}>
//                     {item.label}
//                   </span>
//                 )}

//               </Link>
//             );
//           })}

//           {/* =========================
//               DIVIDER
//           ========================== */}
//           {!collapsed && (
//             <div
//               style={{
//                 height: 1,
//                 background: 'rgba(255,255,255,0.08)',
//                 margin: '10px 12px'
//               }}
//             />
//           )}

//           {/* =========================
//               CAR TYPES SECTION
//           ========================== */}
//           {!collapsed && (

// <div
//   style={{
//     marginTop: 12,
//     paddingTop: 8,
//     borderTop: '1px solid rgba(255,255,255,0.08)',
//   }}
// > 
// <div
//   style={{
//     color: '#F59E0B',
//     padding: '8px 14px',
//     fontSize: 12,
//     fontWeight: 700,
//   }}
// >
//   TEST FOLDER TREE
// </div>
//               {/* =========================
//                   HEADER
//               ========================== */}
//               <button
//                 onClick={() =>
//                   setCarTypesExpanded(!carTypesExpanded)
//                 }
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   width: '100%',
//                   padding: '8px 14px',
//                   border: 'none',
//                   background: 'transparent',
//                   cursor: 'pointer',
//                 }}
//               >

//                 {/* LEFT */}
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: 8,
//                   }}
//                 >

//                   {/* ICON BOX */}
//                   <div
//                     style={{
//                       width: 22,
//                       height: 22,
//                       borderRadius: 6,
//                       background: 'rgba(245,158,11,0.15)',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       border: '1px solid rgba(245,158,11,0.25)',
//                       flexShrink: 0,
//                     }}
//                   >
//                     <FolderTree
//                       size={13}
//                       color="#F59E0B"
//                     />
//                   </div>

//                   {/* TITLE */}
//                   <span
//                     style={{
//                       color: '#CBD5E1',
//                       fontSize: 12,
//                       fontWeight: 600,
//                       letterSpacing: '0.5px',
//                     }}
//                   >
//                     CAR TYPES
//                   </span>

//                 </div>

//                 {/* ARROW */}
//                 <ChevronDown
//                   size={14}
//                   color="#94A3B8"
//                   style={{
//                     transform: carTypesExpanded
//                       ? 'rotate(180deg)'
//                       : 'rotate(0deg)',
//                     transition: 'transform 0.3s'
//                   }}
//                 />

//               </button>

//               {/* =========================
//                   CAR TYPE LIST
//               ========================== */}
//               {carTypesExpanded && (

//                 <div style={{ paddingLeft: 8 }}>

//                   {/* LOADING */}
//                   {loading ? (

//                     <div
//                       style={{
//                         padding: '8px 14px',
//                         color: '#64748B',
//                         fontSize: 12
//                       }}
//                     >
//                       Loading...
//                     </div>

//                   ) : carTypes.length > 0 ? (

//                     <>
//                       {carTypes.map((type) => {

//                         const isTypeActive =
//                           pathname === `/admin/car-types/${type.slug}`;

//                         return (

//                           <Link
//                             key={type.carTypeId}
//                             href={`/admin/car-types/${type.slug}`}
//                             onClick={onMobileClose}
//                             style={{
//                               display: 'flex',
//                               alignItems: 'center',
//                               gap: 10,
//                               padding: '8px 14px',
//                               borderRadius: 8,
//                               color: isTypeActive
//                                 ? 'white'
//                                 : '#94A3B8',
//                               fontSize: 13,
//                               fontWeight: 500,
//                               textDecoration: 'none',
//                               background: isTypeActive
//                                 ? 'rgba(245,158,11,0.15)'
//                                 : 'transparent',
//                               transition: 'all 0.2s',
//                               marginBottom: 4
//                             }}
//                           >

//                             {/* ICON */}
//                             <div
//                               style={{
//                                 width: 24,
//                                 height: 24,
//                                 borderRadius: 6,
//                                 background: isTypeActive
//                                   ? 'rgba(245,158,11,0.25)'
//                                   : 'rgba(255,255,255,0.08)',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 flexShrink: 0
//                               }}
//                             >
//                               <Car
//                                 size={13}
//                                 color={
//                                   isTypeActive
//                                     ? '#F59E0B'
//                                     : '#CBD5E1'
//                                 }
//                               />
//                             </div>

//                             {/* TEXT */}
//                             <span
//                               style={{
//                                 whiteSpace: 'nowrap'
//                               }}
//                             >
//                               {type.carCategoryName}
//                             </span>

//                           </Link>
//                         );
//                       })}
//                     </>

//                   ) : (

//                     <div
//                       style={{
//                         padding: '8px 14px',
//                         color: '#64748B',
//                         fontSize: 12
//                       }}
//                     >
//                       No car types found
//                     </div>

//                   )}

//                   {/* =========================
//                       MANAGE TYPES
//                   ========================== */}
//                   <Link
//                     href="/admin/car-types"
//                     onClick={onMobileClose}
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: 10,
//                       padding: '10px 14px',
//                       borderRadius: 8,
//                       color: pathname === '/admin/car-types'
//                         ? '#F59E0B'
//                         : '#94A3B8',
//                       fontSize: 12,
//                       fontWeight: 600,
//                       textDecoration: 'none',
//                       transition: 'all 0.2s',
//                       marginTop: 6,
//                       borderTop:
//                         '1px solid rgba(255,255,255,0.06)',
//                       paddingTop: 14
//                     }}
//                   >

//                     <Plus size={14} />

//                     <span>
//                       Manage Types
//                     </span>

//                   </Link>

//                 </div>

//               )}

//             </div>

//           )}

//         </nav>

//         {/* =========================
//             USER SECTION
//         ========================== */}
//         <div
//           style={{
//             padding: '12px 14px',
//             borderTop: '1px solid rgba(255,255,255,0.08)',
//             display: 'flex',
//             alignItems: 'center',
//             gap: 10,
//             flexShrink: 0,
//           }}
//         >

//           <div
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: '50%',
//               background:
//                 'linear-gradient(135deg, #475569, #334155)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: 14,
//               fontWeight: 600,
//               flexShrink: 0
//             }}
//           >
//             {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
//           </div>

//           {!collapsed && (

//             <div style={{ flex: 1 }}>

//               <div
//                 style={{
//                   fontSize: 13,
//                   fontWeight: 500
//                 }}
//               >
//                 {currentUser?.name}
//               </div>

//               <div
//                 style={{
//                   fontSize: 11,
//                   color: '#64748B'
//                 }}
//               >
//                 {currentUser?.role}
//               </div>

//             </div>

//           )}

//           <button
//             onClick={handleLogout}
//             style={{
//               background: 'transparent',
//               border: 'none',
//               color: '#EF4444',
//               cursor: 'pointer',
//               padding: 6,
//               borderRadius: 6,
//               display: 'flex',
//               alignItems: 'center'
//             }}
//           >
//             <LogOut size={18} />
//           </button>

//         </div>

//       </aside>
//     </>
//   );
// }

// // // src/components/layout/Sidebar.tsx
// // 'use client';

// // import Link from 'next/link';
// // import { usePathname, useRouter } from 'next/navigation';
// // import { menuItems, currentUser } from '../../data/mockData';

// // export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: any) {
// //   const pathname = usePathname();
// //   const router = useRouter();

// //   const icons: any = {
// //     LayoutDashboard: '📊',
// //     CalendarCheck: '📅',
// //     Car: '🚗',
// //     Users: '👥',
// //     Image: '🖼️',
// //   };

// //   const handleLogout = () => {
// //     router.push('/login');
// //   };

// //   return (
// //     <>
// //       <div className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} onClick={onMobileClose} />
// //       <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
// //         <div className="sidebar-logo">
// //           <Link href="/dashboard">
// //             <div className="logo-icon">R</div>
// //             <span className="logo-text">RideEase</span>
// //           </Link>
// //           <button className="collapse-btn" onClick={onToggle}>
// //             {collapsed ? '→' : '←'}
// //           </button>
// //         </div>

// //         <nav className="sidebar-nav">
// //           {menuItems.map((item) => (
// //             <Link
// //               key={item.path}
// //               href={item.path}
// //               className={`nav-item ${pathname === item.path ? 'active' : ''}`}
// //               onClick={onMobileClose}
// //             >
// //               <span style={{ fontSize: '18px' }}>{icons[item.icon] || '•'}</span>
// //               <span>{item.label}</span>
// //             </Link>
// //           ))}
// //         </nav>

// //         <div className="sidebar-user">
// //           <div className="user-avatar">{currentUser.name.charAt(0)}</div>
// //           <div className="user-info">
// //             <div className="user-name">{currentUser.name}</div>
// //             <div className="user-role">{currentUser.role}</div>
// //           </div>
// //           <button 
// //             onClick={handleLogout}
// //             style={{
// //               marginLeft: 'auto',
// //               background: 'transparent',
// //               border: 'none',
// //               color: '#94A3B8',
// //               cursor: 'pointer',
// //               fontSize: '18px',
// //               padding: '4px'
// //             }}
// //             title="Logout"
// //           >
// //             🚪
// //           </button>
// //         </div>
// //       </aside>
// //     </>
// //   );
// // }