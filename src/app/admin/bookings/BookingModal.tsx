'use client';

import { useState, useEffect } from 'react';
import { Booking, BookingFormData } from '../../../types';
import { bookingService } from '../../services/bookingService';
import './BookingModal.css';

interface BookingModalProps {
  booking?: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({ booking, onClose, onSuccess }: BookingModalProps) {
  const isEdit = !!booking;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    carId: 1,
    pickupLocation: '',
    dropLocation: '',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00',
    passengerCount: 1,
    specialNote: '',
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerEmail: booking.customerEmail || '',
        carId: booking.carId,
        pickupLocation: booking.pickupLocation || '',
        dropLocation: booking.dropLocation || '',
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        passengerCount: booking.passengerCount,
        specialNote: booking.specialNote || '',
      });
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && booking) {
        await bookingService.updateBooking(booking.bookingId, formData);
      } else {
        await bookingService.createBooking(formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed:', err);
      alert('Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'carId' || name === 'passengerCount' ? Number(value) : value,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Booking' : 'New Booking'}</h3>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">Customer Name</label>
              <input type="text" name="customerName" value={formData.customerName}
                onChange={handleChange} required className="form-input" placeholder="Full name" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Phone</label>
                <input type="text" name="customerPhone" value={formData.customerPhone}
                  onChange={handleChange} required className="form-input" placeholder="Phone" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="customerEmail" value={formData.customerEmail}
                  onChange={handleChange} className="form-input" placeholder="Email" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Car</label>
              <select name="carId" value={formData.carId} onChange={handleChange} required className="form-select">
                <option value={1}>Toyota Innova Crysta</option>
                <option value={2}>Honda City</option>
                <option value={3}>Maruti Swift Dzire</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pickup</label>
                <input type="text" name="pickupLocation" value={formData.pickupLocation}
                  onChange={handleChange} className="form-input" placeholder="Pickup location" />
              </div>
              <div className="form-group">
                <label className="form-label">Drop</label>
                <input type="text" name="dropLocation" value={formData.dropLocation}
                  onChange={handleChange} className="form-input" placeholder="Drop location" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Date</label>
                <input type="date" name="pickupDate" value={formData.pickupDate}
                  onChange={handleChange} required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label required">Time</label>
                <input type="time" name="pickupTime" value={formData.pickupTime}
                  onChange={handleChange} required className="form-input" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Passengers</label>
                <input type="number" name="passengerCount" value={formData.passengerCount}
                  onChange={handleChange} min={1} max={10} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Note</label>
                <input type="text" name="specialNote" value={formData.specialNote}
                  onChange={handleChange} className="form-input" placeholder="Special instructions" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}