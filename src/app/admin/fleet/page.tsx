'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Car, CarFormData, CarTypeData, PaginatedCarResponse } from '../../../types';
import { carService, getCarImageUrl } from '../../../services/carService';
import {
  Plus, Edit, Trash2, X, Save, Search, Car as CarIcon,
  Users, Briefcase, Star, RefreshCw,
  AlertCircle, ChevronLeft, ChevronRight, Upload,
  Power, ToggleLeft, ToggleRight
} from 'lucide-react';
import Toast from '../../../components/Toast';
import './fleet.css';

const defaultForm: CarFormData = {
  name: '', slug: '', carTypeId: 1,
  seatingCapacity: 4, luggageCapacity: 2, perKmRate: 12,
  description: '', isFeatured: false,
};

export default function FleetManagementPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [carTypes, setCarTypes] = useState<CarTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filterType, setFilterType] = useState<string>('');
  const [filterFeatured, setFilterFeatured] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [form, setForm] = useState<CarFormData>({ ...defaultForm });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchCarTypes();
    fetchCars();
  }, [page, filterType, filterFeatured]);

  const fetchCarTypes = async () => {
    try {
      const types = await carService.getCarTypes();
      setCarTypes(types);
    } catch (err) {
      console.error('Failed to load car types:', err);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      let res: PaginatedCarResponse;
      if (filterType || filterFeatured) {
        res = await carService.filter({
          carTypeId: filterType ? Number(filterType) : undefined,
          isFeatured: filterFeatured === 'true' ? true : filterFeatured === 'false' ? false : undefined,
        }, page, 12);
      } else {
        res = await carService.getAll(page, 12);
      }
      setCars(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err) {
      setError('Failed to load cars');
      showToast('Failed to load fleet data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) { fetchCars(); return; }
    setLoading(true);
    try {
      const res = await carService.search(searchKeyword);
      setCars(res);
      setTotalPages(1);
      setTotalElements(res.length);
      showToast(`Found ${res.length} car(s)`, 'info');
    } catch {
      setError('Search failed');
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openCreate = () => {
    setEditCar(null);
    setForm({ ...defaultForm });
    setImageFile(null);
    setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (car: Car) => {
    setEditCar(car);
    setForm({
      name: car.name,
      slug: car.slug,
      carTypeId: car.carTypeId,
      seatingCapacity: car.seatingCapacity,
      luggageCapacity: car.luggageCapacity,
      perKmRate: car.perKmRate,
      description: car.description || '',
      isFeatured: car.isFeatured,
    });
    setImageFile(null);
    setImagePreview(car.imagePath ? getCarImageUrl(car.imagePath) : '');
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      showToast('Name and Slug are required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editCar) {
        if (imageFile) {
          await carService.updateWithImage(editCar.carId, form, imageFile);
        } else {
          await carService.update(editCar.carId, form);
        }
        showToast('Car updated successfully!', 'success');
      } else {
        if (imageFile) {
          await carService.createWithImage(form, imageFile);
        } else {
          await carService.create(form);
        }
        showToast('Car added successfully!', 'success');
      }
      setShowForm(false);
      fetchCars();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Save failed';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await carService.delete(deleteId);
      showToast('Car deleted successfully!', 'success');
      setDeleteId(null);
      fetchCars();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Delete failed', 'error');
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (carId: number, currentStatus: string) => {
    setStatusUpdating(carId);
    try {
      await carService.toggleStatus(carId);
      const newStatus = currentStatus === 'active' ? 'deactive' : 'active';
      showToast(`Car status changed to ${newStatus}`, 'success');
      fetchCars();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Status toggle failed', 'error');
    } finally {
      setStatusUpdating(null);
    }
  };

  if (loading && cars.length === 0) {
    return (
      <div className="fleet-loading">
        <div className="spinner" />
        <p>Loading fleet...</p>
      </div>
    );
  }

  if (error && cars.length === 0) {
    return (
      <div className="fleet-error">
        <AlertCircle size={48} />
        <h3>Error Loading Fleet</h3>
        <p>{error}</p>
        <button onClick={fetchCars} className="btn-primary"><RefreshCw size={16} /> Retry</button>
      </div>
    );
  }

  return (
    <div className="fleet-container">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="fleet-header">
        <div className="header-left">
          <h2>Fleet Management</h2>
          <p className="subtitle">{totalElements} vehicles in fleet</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchCars} className="btn-icon" title="Refresh"><RefreshCw size={18} /></button>
          <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add New Car</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card"><CarIcon size={24} /><div><span className="stat-value">{totalElements}</span><span className="stat-label">Total Cars</span></div></div>
        <div className="stat-card"><Star size={24} /><div><span className="stat-value">{cars.filter(c => c.isFeatured).length}</span><span className="stat-label">Featured</span></div></div>
        <div className="stat-card"><Power size={24} /><div><span className="stat-value">{cars.filter(c => c.status === 'active').length}</span><span className="stat-label">Active</span></div></div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="filter-group">
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0); }}>
            <option value="">All Categories</option>
            {carTypes.filter(ct => ct.isActive).map(ct => (
              <option key={ct.carTypeId} value={ct.carTypeId}>{ct.carCategoryName}</option>
            ))}
          </select>
        </div>
        <div className="search-group">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search cars..." value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <button onClick={handleSearch} className="btn-search">Search</button>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="cars-grid">
        {cars.length === 0 ? (
          <div className="empty-state">
            <CarIcon size={64} />
            <h3>No Cars Found</h3>
            <p>Start by adding your first vehicle</p>
            <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Car</button>
          </div>
        ) : (
          cars.map((car) => (
            <div key={car.carId} className={`car-card ${car.status === 'deactive' ? 'car-deactive' : ''}`}>
              <div className="car-image-container">
                <img src={getCarImageUrl(car.imagePath)} alt={car.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-car.png'; }} />
                {car.isFeatured && <span className="featured-badge"><Star size={12} /> Featured</span>}
                <span className="category-badge">{car.carTypeName}</span>
                {car.status === 'deactive' && <span className="inactive-overlay">Inactive</span>}
              </div>
              <div className="car-details">
                <div className="car-title-row">
                  <h3>{car.name}</h3>
                  <span className="rate">₹{car.perKmRate}<small>/km</small></span>
                </div>
                <p className="car-slug">/{car.slug}</p>
                <div className="car-specs">
                  <span><Users size={14} /> {car.seatingCapacity} Seats</span>
                  <span><Briefcase size={14} /> {car.luggageCapacity} Bags</span>
                </div>
                {car.description && <p className="car-desc">{car.description.substring(0, 80)}{car.description.length > 80 ? '...' : ''}</p>}

                {/* ✅ Actions Row with Status Toggle Icon */}
                <div className="car-actions-row">
                  <span className="date-badge">{new Date(car.updatedAt || car.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <div className="action-btns">
                    {/* Status Toggle Icon Button */}
                    <button
                      onClick={() => handleToggleStatus(car.carId, car.status)}
                      className={`btn-action status-toggle ${car.status === 'active' ? 'active' : 'deactive'}`}
                      title={car.status === 'active' ? 'Deactivate Car' : 'Activate Car'}
                      disabled={statusUpdating === car.carId}
                    >
                      {statusUpdating === car.carId ? (
                        <RefreshCw size={14} className="spinning" />
                      ) : car.status === 'active' ? (
                        <ToggleRight size={16} />
                      ) : (
                        <ToggleLeft size={16} />
                      )}
                    </button>
                    <button onClick={() => openEdit(car)} className="btn-action edit" title="Edit"><Edit size={16} /></button>
                    <button onClick={() => setDeleteId(car.carId)} className="btn-action delete" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft size={18} /> Prev</button>
          <div className="page-indicators">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`page-dot ${page === i ? 'active' : ''}`}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next <ChevronRight size={18} /></button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCar ? 'Edit Car' : 'Add New Car'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Car Image</label>
                <div className="image-upload-area" onClick={() => document.getElementById('carImageInput')?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder"><Upload size={32} /><span>Click to upload image</span></div>
                  )}
                  <input id="carImageInput" type="file" accept="image/*" onChange={handleImageChange} hidden />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Car Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label>Slug *</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.carTypeId} onChange={(e) => setForm({ ...form, carTypeId: Number(e.target.value) })}>
                    {carTypes.filter((ct) => ct.isActive).map((ct) => (
                      <option key={ct.carTypeId} value={ct.carTypeId}>{ct.carCategoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group"><label>Rate (₹/km) *</label><input type="number" value={form.perKmRate} onChange={(e) => setForm({ ...form, perKmRate: Number(e.target.value) })} min="1" step="0.5" required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Seats</label><input type="number" value={form.seatingCapacity} onChange={(e) => setForm({ ...form, seatingCapacity: Number(e.target.value) })} min="1" /></div>
                <div className="form-group"><label>Luggage</label><input type="number" value={form.luggageCapacity} onChange={(e) => setForm({ ...form, luggageCapacity: Number(e.target.value) })} min="0" /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /><span>Featured on Homepage</span></label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><Save size={16} /> {editCar ? 'Update Car' : 'Add Car'}</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Delete Car?</h3><button onClick={() => setDeleteId(null)} className="btn-close"><X size={20} /></button></div>
            <div className="modal-body">
              <div className="warning-box"><AlertCircle size={24} /><p>This action cannot be undone.</p></div>
              <div className="modal-actions">
                <button onClick={() => setDeleteId(null)} className="btn-cancel">Cancel</button>
                <button onClick={handleDelete} className="btn-danger"><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}