'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ClipboardList, 
  Car, 
  IndianRupee, 
  RefreshCw,
  TrendingUp,
  Users,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../../types';
import './dashboard.css';

interface DashboardStats {
  todayBookings: number;
  totalRevenue: number;
  activeRides: number;
  totalBookings: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    totalRevenue: 0,
    activeRides: 0,
    totalBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const [todayBookingsRes, allBookingsRes, recentBookingsData, totalCount] = await Promise.all([
        bookingService.getBookingsByDate(today),
        bookingService.getAllBookings(0, 100),
        bookingService.getRecentBookings(5),
        bookingService.getTotalCount(),
      ]);

      const todayCount = Array.isArray(todayBookingsRes) ? todayBookingsRes.length : 0;
      const allBookings = allBookingsRes?.content || [];
      const activeCount = allBookings.length;

      setStats({
        todayBookings: todayCount,
        totalRevenue: 0,
        activeRides: activeCount,
        totalBookings: totalCount || allBookings.length,
      });

      setRecentBookings(Array.isArray(recentBookingsData) ? recentBookingsData : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const statCards = [
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      icon: Calendar,
      color: '#eff6ff',
      iconColor: '#3b82f6',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: ClipboardList,
      color: '#f0fdf4',
      iconColor: '#22c55e',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Active Rides',
      value: stats.activeRides,
      icon: Car,
      color: '#faf5ff',
      iconColor: '#a855f7',
      trend: '+5%',
      trendUp: true,
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: '#fff7ed',
      iconColor: '#f97316',
      trend: '+15%',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <RefreshCw size={32} />
        </div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>
        <button 
          onClick={handleRefresh} 
          className="refresh-button"
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-card-content">
                <div className="stat-card-left">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                  <div className="stat-trend">
                    <ArrowUpRight size={14} />
                    <span>{stat.trend}</span>
                    <span className="trend-text">vs last week</span>
                  </div>
                </div>
                <div 
                  className="stat-icon-wrapper"
                  style={{ 
                    backgroundColor: stat.color,
                    color: stat.iconColor 
                  }}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings Section */}
      <div className="bookings-section">
        <div className="bookings-header">
          <div className="bookings-header-left">
            <ClipboardList size={20} className="bookings-header-icon" />
            <h2 className="bookings-title">Recent Bookings</h2>
          </div>
          <span className="bookings-count">
            {recentBookings.length} bookings
          </span>
        </div>

        {recentBookings.length === 0 ? (
          <div className="bookings-empty">
            <Calendar size={48} />
            <h3>No Recent Bookings</h3>
            <p>New bookings will appear here when customers make reservations.</p>
          </div>
        ) : (
          <div className="bookings-table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Car</th>
                  <th>Route</th>
                  <th>Date & Time</th>
                  <th>Passengers</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.bookingId} className="booking-row">
                    {/* Booking Number */}
                    <td>
                      <span className="booking-number">
                        #{booking.bookingNumber}
                      </span>
                    </td>

                    {/* Customer Name & Email */}
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">
                          <Users size={14} />
                        </div>
                        <div>
                          <div className="customer-name">{booking.customerName}</div>
                          {booking.customerEmail && (
                            <div className="customer-email">
                              <Mail size={10} />
                              {booking.customerEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td>
                      <div className="contact-info">
                        <Phone size={12} />
                        <span>{booking.customerPhone}</span>
                      </div>
                    </td>

                    {/* Car */}
                    <td>
                      <span className="car-badge">
                        <Car size={12} />
                        {booking.carName}
                      </span>
                    </td>

                    {/* Route */}
                    <td>
                      <div className="route-info">
                        <div className="route-point">
                          <MapPin size={12} />
                          <span>{booking.pickupLocation || 'N/A'}</span>
                        </div>
                        <div className="route-point">
                          <MapPin size={12} />
                          <span>{booking.dropLocation || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td>
                      <div className="datetime-info">
                        <div className="date-info">
                          <Calendar size={12} />
                          <span>{booking.pickupDate}</span>
                        </div>
                        <div className="time-info">
                          <Clock size={12} />
                          <span>{booking.pickupTime}</span>
                        </div>
                      </div>
                    </td>

                    {/* Passengers */}
                    <td>
                      <span className="passenger-count">
                        <Users size={14} />
                        {booking.passengerCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
// 'use client';
// import { useState, useEffect } from 'react';
// import { bookingService } from '../../services/bookingService';
// import { Booking } from '../../../types';

// export default function DashboardPage() {
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     todayBookings: 0,
//     totalRevenue: 0,
//     activeRides: 0,
//     totalBookings: 0,
//   });
//   const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const today = new Date().toISOString().split('T')[0];

//       // Fetch all data in parallel
//       const [todayBookingsRes, allBookingsRes, recentBookingsData, totalCount] = await Promise.all([
//         bookingService.getBookingsByDate(today),
//         bookingService.getAllBookings(0, 100),
//         bookingService.getRecentBookings(5),
//         bookingService.getTotalCount(),
//       ]);

//       // Today's bookings count
//       const todayCount = Array.isArray(todayBookingsRes) ? todayBookingsRes.length : 0;

//       // Active rides (no status field in actual API, so using all bookings)
//       const allBookings = allBookingsRes?.content || [];
//       const activeCount = allBookings.length;

//       // Total revenue (if totalFare exists, otherwise 0)
//       const revenue = allBookings.reduce((sum: number, b: Booking) => {
//         return sum + 0; // No totalFare in actual response, set to 0 or calculate later
//       }, 0);

//       setStats({
//         todayBookings: todayCount,
//         totalRevenue: revenue,
//         activeRides: activeCount,
//         totalBookings: totalCount || allBookings.length,
//       });

//       setRecentBookings(Array.isArray(recentBookingsData) ? recentBookingsData : []);
//     } catch (error) {
//       console.error('Failed to fetch dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const statCards = [
//     {
//       label: "Today's Bookings",
//       value: stats.todayBookings,
//       icon: '📅',
//       color: '#DBEAFE',
//       textColor: '#2563EB',
//     },
//     {
//       label: 'Total Bookings',
//       value: stats.totalBookings,
//       icon: '📋',
//       color: '#D1FAE5',
//       textColor: '#059669',
//     },
//     {
//       label: 'Active Rides',
//       value: stats.activeRides,
//       icon: '🚗',
//       color: '#E9D5FF',
//       textColor: '#7C3AED',
//     },
//     {
//       label: 'Revenue',
//       value: `₹${stats.totalRevenue.toLocaleString()}`,
//       icon: '💰',
//       color: '#FFEDD5',
//       textColor: '#EA580C',
//     },
//   ];

//   if (loading) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '400px',
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             width: 48,
//             height: 48,
//             border: '4px solid #E2E8F0',
//             borderTop: '4px solid #F59E0B',
//             borderRadius: '50%',
//             animation: 'spin 1s linear infinite',
//             margin: '0 auto 16px',
//           }} />
//           <p style={{ color: '#64748B', fontSize: 16 }}>Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>

//       {/* Header */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 24,
//       }}>
//         <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>Dashboard</h2>
//         <button
//           onClick={fetchDashboardData}
//           style={{
//             padding: '8px 16px',
//             background: '#F59E0B',
//             color: 'white',
//             border: 'none',
//             borderRadius: 8,
//             cursor: 'pointer',
//             fontSize: 14,
//             fontWeight: 500,
//           }}
//         >
//           🔄 Refresh
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
//         gap: 16,
//         marginBottom: 24,
//       }}>
//         {statCards.map((stat, i) => (
//           <div
//             key={i}
//             style={{
//               background: 'white',
//               borderRadius: 16,
//               padding: 24,
//               border: '1px solid #F1F5F9',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'flex-start',
//             }}
//           >
//             <div>
//               <div style={{
//                 fontSize: 13,
//                 color: '#64748B',
//                 marginBottom: 8,
//                 fontWeight: 500,
//               }}>
//                 {stat.label}
//               </div>
//               <div style={{ fontSize: 28, fontWeight: 700, color: '#1E293B' }}>
//                 {stat.value}
//               </div>
//             </div>
//             <div style={{
//               width: 48,
//               height: 48,
//               borderRadius: 12,
//               background: stat.color,
//               color: stat.textColor,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: 22,
//             }}>
//               {stat.icon}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Recent Bookings Table */}
//       <div style={{
//         background: 'white',
//         borderRadius: 16,
//         border: '1px solid #F1F5F9',
//         padding: 24,
//       }}>
//         <h3 style={{
//           fontSize: 18,
//           fontWeight: 600,
//           marginBottom: 20,
//           color: '#1E293B',
//         }}>
//           Recent Bookings
//         </h3>

//         {recentBookings.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
//             No recent bookings found
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{
//               width: '100%',
//               borderCollapse: 'collapse',
//               minWidth: 700,
//             }}>
//               <thead>
//                 <tr style={{ background: '#F8FAFC' }}>
//                   {['Booking #', 'Customer', 'Phone', 'Car', 'Route', 'Date', 'Passengers'].map((h) => (
//                     <th
//                       key={h}
//                       style={{
//                         textAlign: 'left',
//                         padding: '12px 16px',
//                         fontSize: 12,
//                         fontWeight: 600,
//                         color: '#94A3B8',
//                         textTransform: 'uppercase',
//                       }}
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentBookings.map((booking) => (
//                   <tr
//                     key={booking.bookingId}
//                     style={{
//                       borderBottom: '1px solid #F1F5F9',
//                       transition: 'background 0.2s',
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = '#F8FAFC';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = 'transparent';
//                     }}
//                   >
//                     {/* Booking Number */}
//                     <td style={{
//                       padding: '14px 16px',
//                       fontWeight: 600,
//                       color: '#F59E0B',
//                     }}>
//                       #{booking.bookingNumber}
//                     </td>

//                     {/* Customer Name */}
//                     <td style={{ padding: '14px 16px' }}>
//                       <div style={{ fontWeight: 500, color: '#1E293B' }}>
//                         {booking.customerName}
//                       </div>
//                       {booking.customerEmail && (
//                         <div style={{ fontSize: 12, color: '#64748B' }}>
//                           {booking.customerEmail}
//                         </div>
//                       )}
//                     </td>

//                     {/* Phone */}
//                     <td style={{ padding: '14px 16px', fontSize: 14 }}>
//                       {booking.customerPhone}
//                     </td>

//                     {/* Car */}
//                     <td style={{ padding: '14px 16px' }}>
//                       <span style={{
//                         padding: '2px 8px',
//                         background: '#DBEAFE',
//                         color: '#2563EB',
//                         borderRadius: 4,
//                         fontSize: 12,
//                       }}>
//                         {booking.carName}
//                       </span>
//                     </td>

//                     {/* Route */}
//                     <td style={{ padding: '14px 16px' }}>
//                       <div style={{ color: '#1E293B', fontSize: 14 }}>
//                         {booking.pickupLocation || '-'}
//                       </div>
//                       <div style={{ fontSize: 12, color: '#64748B' }}>
//                         → {booking.dropLocation || '-'}
//                       </div>
//                     </td>

//                     {/* Date */}
//                     <td style={{ padding: '14px 16px', fontSize: 13 }}>
//                       <div>{booking.pickupDate}</div>
//                       <div style={{ color: '#64748B' }}>{booking.pickupTime}</div>
//                     </td>

//                     {/* Passengers */}
//                     <td style={{
//                       padding: '14px 16px',
//                       textAlign: 'center',
//                       fontWeight: 500,
//                     }}>
//                       {booking.passengerCount}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }