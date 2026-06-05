'use client';

import { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { Booking, PaginatedBookingResponse } from '../../../types';
import BookingModal from './BookingModal';
import './bookings.css';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedBookingResponse = await bookingService.getAllBookings(page, 10, 'createdAt,desc');
      setBookings(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) { fetchBookings(); return; }
    setLoading(true);
    try {
      const response = await bookingService.searchBookings(searchKeyword, 0, 10);
      setBookings(response.content);
      setTotalPages(response.totalPages);
      setPage(0);
    } catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await bookingService.deleteBooking(deleteId);
        setDeleteId(null);
        fetchBookings();
      } catch { console.error('Delete failed'); }
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p className="loading-text">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      {/* Header */}
      <div className="bookings-header">
        <div className="bookings-header-left">
          <h2>Bookings</h2>
          <p>Total: {totalElements} bookings</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-add-booking">
          + New Booking
        </button>
      </div>

      {/* Search */}
      <div className="search-section">
        <input type="text" placeholder="Search by customer name..." value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="search-input" />
        <button onClick={handleSearch} className="btn-search">Search</button>
        <button onClick={() => { setSearchKeyword(''); fetchBookings(); }} className="btn-clear">Clear</button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          ⚠️ {error} <button onClick={fetchBookings}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                {['Booking #', 'Customer', 'Contact', 'Car', 'Route', 'Date & Time', 'Passengers', 'Created', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-text">No bookings found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td><span className="booking-number">#{booking.bookingNumber}</span></td>
                    <td>
                      <div className="customer-name">{booking.customerName}</div>
                      {booking.customerEmail && <div className="customer-email">{booking.customerEmail}</div>}
                    </td>
                    <td>{booking.customerPhone}</td>
                    <td><span className="car-badge">{booking.carName}</span></td>
                    <td>
                      <div className="route-pickup">{booking.pickupLocation || '-'}</div>
                      <div className="route-drop"><span className="route-arrow">→</span> {booking.dropLocation || '-'}</div>
                    </td>
                    <td>
                      <div className="datetime-date">{booking.pickupDate}</div>
                      <div className="datetime-time">{booking.pickupTime}</div>
                    </td>
                    <td className="passenger-count">{booking.passengerCount}</td>
                    <td className="created-date">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => { setSelectedBooking(booking); setShowEditModal(true); }} className="btn-edit">Edit</button>
                        <button onClick={() => setDeleteId(booking.bookingId)} className="btn-delete">Delete</button>
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
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-page">← Previous</button>
          <span className="page-info">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1} className="btn-page">Next →</button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <BookingModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchBookings(); }} />}
      {showEditModal && selectedBooking && <BookingModal booking={selectedBooking} onClose={() => { setShowEditModal(false); setSelectedBooking(null); }} onSuccess={() => { setShowEditModal(false); setSelectedBooking(null); fetchBookings(); }} />}
    </div>
  );
}