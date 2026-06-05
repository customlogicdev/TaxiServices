'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Car,
  Users,
  Clock,
  AlertCircle,
  FileText,
  ArrowUpDown,
  Plus,
  Home,
  List,
  Settings,
  Navigation
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking, PaginatedBookingResponse, BookingFilters, PaginationState } from '../../../types';
import './bookings.css';

export default function BookingsPage() {
  // ==========================================
  // State Management
  // ==========================================
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    carName: '',
    status: '',
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // ==========================================
  // Detect Mobile Device
  // ==========================================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==========================================
  // Fetch Bookings
  // ==========================================
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response: PaginatedBookingResponse;

      if (filters.search.trim()) {
        response = await bookingService.searchBookings(
          filters.search,
          pagination.page,
          pagination.size
        );
      } else if (filters.dateFrom || filters.dateTo) {
        response = await bookingService.filterBookings({
          startDate: filters.dateFrom || undefined,
          endDate: filters.dateTo || undefined,
          page: pagination.page,
          size: pagination.size,
        });
      } else {
        response = await bookingService.getAllBookings(
          pagination.page,
          pagination.size,
          'createdAt,desc'
        );
      }

      setBookings(response.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
      }));
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err?.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ==========================================
  // Handle Phone Call
  // ==========================================
  const handlePhoneCall = (phoneNumber: string, customerName: string) => {
    // Clean phone number - remove spaces, dashes, etc.
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (isMobile) {
      // Mobile: Use tel: protocol to open phone dialer
      window.location.href = `tel:${cleanNumber}`;
    } else {
      // Desktop: Show confirmation or use click-to-call app
      if (confirm(`Call ${customerName} at ${phoneNumber}?`)) {
        window.location.href = `tel:${cleanNumber}`;
      }
    }
  };

  // ==========================================
  // Handle WhatsApp Message
  // ==========================================
  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const message = encodeURIComponent('Hello, regarding your booking...');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  // ==========================================
  // Handle Email
  // ==========================================
  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // ==========================================
  // Handle Navigation to Location
  // ==========================================
  const handleNavigate = (location: string) => {
    if (!location || location === 'N/A') return;
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  // ==========================================
  // Search Handler
  // ==========================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 0 }));
    fetchBookings();
  };

  // ==========================================
  // Clear Filters
  // ==========================================
  const clearFilters = () => {
    setFilters({ search: '', dateFrom: '', dateTo: '', carName: '', status: '' });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // ==========================================
  // Pagination Handlers
  // ==========================================
  const goToPage = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================
  // View Booking Details
  // ==========================================
  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // ==========================================
  // Delete Booking
  // ==========================================
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await bookingService.deleteBooking(id);
      fetchBookings();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete booking');
    }
  };

  // ==========================================
  // Format Helpers
  // ==========================================
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeString;
    }
  };

  // ==========================================
  // Loading State
  // ==========================================
  if (loading && bookings.length === 0) {
    return (
      <div className="bookings-loading">
        <div className="loading-content">
          <RefreshCw className="spinner-icon" size={36} />
          <h3>Loading Bookings</h3>
          <p>Please wait while we fetch the data...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className="bookings-page">
      {/* Header Section */}
      <div className="bookings-page-header">
        <div className="header-left">
          <div className="header-icon-wrapper">
            <FileText size={isMobile ? 20 : 24} />
          </div>
          <div>
            <h1 className="page-title">Bookings</h1>
            <p className="page-subtitle">
              {pagination.totalElements} total bookings
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`btn-filter ${showFilters ? 'active' : ''}`}
          >
            <Filter size={18} />
            <span className="btn-text">Filters</span>
            {(filters.dateFrom || filters.dateTo || filters.search) && (
              <span className="filter-badge">!</span>
            )}
          </button>
          <button onClick={fetchBookings} className="btn-refresh">
            <RefreshCw size={18} />
            <span className="btn-text">Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className={`filters-section ${showFilters ? 'open' : ''}`}>
        <form onSubmit={handleSearch} className="filters-form">
          <div className="filter-group search-group">
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or booking #"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="filter-input"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="clear-input-btn"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="filter-input filter-date"
              />
            </div>
          </div>

          <div className="filter-group">
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="filter-input filter-date"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn-search">
              <Search size={16} />
              <span>Search</span>
            </button>
            <button type="button" onClick={clearFilters} className="btn-clear-filters">
              <X size={16} />
              <span>Clear</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={fetchBookings} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Active Filters Tags */}
      {(filters.search || filters.dateFrom || filters.dateTo) && (
        <div className="active-filters">
          <span className="active-filters-label">Filters:</span>
          {filters.search && (
            <span className="filter-tag">
              "{filters.search}"
              <button onClick={() => setFilters(prev => ({ ...prev, search: '' }))}>
                <X size={14} />
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="filter-tag">
              From: {filters.dateFrom}
              <button onClick={() => setFilters(prev => ({ ...prev, dateFrom: '' }))}>
                <X size={14} />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="filter-tag">
              To: {filters.dateTo}
              <button onClick={() => setFilters(prev => ({ ...prev, dateTo: '' }))}>
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Bookings Table / Card View */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Customer</th>
                <th className="col-contact">Contact</th>
                <th>Car</th>
                <th className="col-route">Route</th>
                <th>Date & Time</th>
                <th>Pax</th>
                <th className="col-created">Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <FileText size={48} />
                      <h3>No Bookings Found</h3>
                      <p>Try adjusting your search filters</p>
                      <button onClick={clearFilters} className="btn-clear-filters">
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.bookingId} className="booking-row">
                    {/* Booking Number */}
                    <td data-label="Booking #">
                      <span className="booking-number">#{booking.bookingNumber}</span>
                    </td>

                    {/* Customer */}
                    <td data-label="Customer">
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          <Users size={14} />
                        </div>
                        <div>
                          <div className="customer-name">{booking.customerName}</div>
                          {booking.customerEmail && (
                            <div 
                              className="customer-email clickable"
                              onClick={() => handleEmail(booking.customerEmail!)}
                            >
                              <Mail size={10} />
                              {booking.customerEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact - With Call Functionality */}
                    <td data-label="Contact">
                      <div className="contact-actions">
                        <button
                          className="contact-btn call-btn"
                          onClick={() => handlePhoneCall(booking.customerPhone, booking.customerName)}
                          title={`Call ${booking.customerName}`}
                        >
                          <PhoneCall size={14} />
                          <span className="contact-number">{booking.customerPhone}</span>
                        </button>
                        {/* {isMobile && (
                          <button
                            className="contact-btn whatsapp-btn"
                            onClick={() => handleWhatsApp(booking.customerPhone)}
                            title="WhatsApp"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        )} */}
                      </div>
                    </td>

                    {/* Car */}
                    <td data-label="Car">
                      <span className="car-badge">
                        <Car size={12} />
                        {booking.carName}
                      </span>
                    </td>

                    {/* Route - With Navigation */}
                    <td data-label="Route">
                      <div className="route-cell">
                        <div 
                          className="route-point pickup clickable"
                          onClick={() => handleNavigate(booking.pickupLocation || '')}
                        >
                          <MapPin size={12} />
                          <span>{booking.pickupLocation || 'N/A'}</span>
                          {booking.pickupLocation && booking.pickupLocation !== 'N/A' && (
                            <Navigation size={10} className="nav-icon" />
                          )}
                        </div>
                        <div 
                          className="route-point drop clickable"
                          onClick={() => handleNavigate(booking.dropLocation || '')}
                        >
                          <MapPin size={12} />
                          <span>{booking.dropLocation || 'N/A'}</span>
                          {booking.dropLocation && booking.dropLocation !== 'N/A' && (
                            <Navigation size={10} className="nav-icon" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td data-label="Date & Time">
                      <div className="datetime-cell">
                        <div className="date-row">
                          <Calendar size={12} />
                          <span>{formatDate(booking.pickupDate)}</span>
                        </div>
                        <div className="time-row">
                          <Clock size={12} />
                          <span>{formatTime(booking.pickupTime)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Passengers */}
                    <td data-label="Pax">
                      <span className="passenger-badge">
                        <Users size={12} />
                        {booking.passengerCount}
                      </span>
                    </td>

                    {/* Created */}
                    <td data-label="Created" className="col-created">
                      <span className="created-date">
                        {formatDate(booking.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td data-label="Actions">
                      <div className="action-buttons">
                        <button
                          onClick={() => viewBookingDetails(booking)}
                          className="btn-action view"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            {pagination.page * pagination.size + 1}-{Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements}
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(0)}
              disabled={pagination.page === 0}
              className="btn-page"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="btn-page"
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i;
              } else if (pagination.page < 3) {
                pageNum = i;
              } else if (pagination.page > pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 5 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`btn-page-num ${pagination.page === pageNum ? 'active' : ''}`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="btn-page"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => goToPage(pagination.totalPages - 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="btn-page"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Booking Number</span>
                  <span className="detail-value booking-highlight">#{selectedBooking.bookingNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Customer Name</span>
                  <span className="detail-value">{selectedBooking.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <div className="detail-value-with-action">
                    <span className="detail-value">{selectedBooking.customerPhone}</span>
                    <button
                      className="inline-call-btn"
                      onClick={() => handlePhoneCall(selectedBooking.customerPhone, selectedBooking.customerName)}
                    >
                      <PhoneCall size={16} />
                      Call
                    </button>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedBooking.customerEmail || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Car</span>
                  <span className="detail-value">{selectedBooking.carName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pickup Location</span>
                  <span className="detail-value">{selectedBooking.pickupLocation || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Drop Location</span>
                  <span className="detail-value">{selectedBooking.dropLocation || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pickup Date</span>
                  <span className="detail-value">{formatDate(selectedBooking.pickupDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pickup Time</span>
                  <span className="detail-value">{formatTime(selectedBooking.pickupTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Passengers</span>
                  <span className="detail-value">{selectedBooking.passengerCount}</span>
                </div>
                {/* {selectedBooking.specialNote && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Special Note</span>
                    <span className="detail-value">{selectedBooking.specialNote}</span>
                  </div>
                )} */}

                {selectedBooking.specialNote && (
  <div className="detail-item full-width special-note">
    <span className="detail-label">Special Note</span>
    <span className="detail-value">
      {selectedBooking.specialNote
        .replace(/,/g, '\n')  // ✅ Every comma → new line
      }
    </span>
  </div>
)}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDetailModal(false)} className="btn-cancel">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button - Mobile Only */}
      

      {/* Mobile Bottom Navigation */}
     
    </div>
  );
}