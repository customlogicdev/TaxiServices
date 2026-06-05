
'use client';

import { useState, useEffect, useCallback } from 'react';
import { carTypeService } from '../../../services/carTypeService';
import { CarType, PaginatedCarTypeResponse } from '../../../types';
import { 
  Plus, Edit, Check, X, RefreshCw, 
  Tag, AlertCircle, ChevronLeft, ChevronRight,
  ToggleLeft, ToggleRight, Trash2
} from 'lucide-react';
import Toast from '../../../components/Toast';
import './car-types.css';

export default function CarTypesPage() {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarType, setEditingCarType] = useState<CarType | null>(null);
  const [formData, setFormData] = useState({ carCategoryName: '', slug: '', isActive: true });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // ✅ Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  useEffect(() => { fetchCarTypes(); }, [page]);

  const fetchCarTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedCarTypeResponse = await carTypeService.getAll(page, 10);
      setCarTypes(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch {
      setError('Failed to load car types');
      showToast('Failed to load car types', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingCarType(null);
    setFormData({ carCategoryName: '', slug: '', isActive: true });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (carType: CarType) => {
    setEditingCarType(carType);
    setFormData({
      carCategoryName: carType.carCategoryName,
      slug: carType.slug || '',
      isActive: carType.isActive
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Create & Update Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingCarType) {
        await carTypeService.update(editingCarType.carTypeId, formData);
        showToast('Car type updated successfully!', 'success');
      } else {
        await carTypeService.create(formData);
        showToast('Car type created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchCarTypes();
    } catch (err: any) {
      const errorMsg = err?.response?.data || 'Something went wrong';
      setFormError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: number) => {
    try {
      await carTypeService.toggleStatus(id);
      showToast('Status updated successfully!', 'success');
      fetchCarTypes();
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  // Delete Operation
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await carTypeService.delete(deleteId);
      showToast('Car type deleted successfully!', 'success');
      setDeleteId(null);
      fetchCarTypes();
    } catch (err: any) {
      showToast(err?.response?.data || 'Delete failed', 'error');
      setDeleteId(null);
    }
  };

  if (loading && carTypes.length === 0) {
    return (
      <div className="car-types-loading">
        <RefreshCw className="spinner-icon" size={32} />
        <p>Loading car types...</p>
      </div>
    );
  }

  return (
    <div className="car-types-container">
      {/* ✅ Toast Notification */}
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="car-types-header">
        <div className="header-left">
          <div className="header-icon">
            <Tag size={22} />
          </div>
          <div>
            <h2>Car Types</h2>
            <p className="subtitle">{totalElements} categories total</p>
          </div>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-add">
          <Plus size={18} />
          <span>Add Car Type</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={fetchCarTypes} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <div className="table-scroll">
          <table className="car-types-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                {/* <th>Slug</th> */}
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {carTypes.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Tag size={40} />
                      <p>No car types found</p>
                      <button onClick={handleOpenCreateModal} className="btn-add">Add First Car Type</button>
                    </div>
                  </td>
                </tr>
              ) : (
                carTypes.map((ct) => (
                  <tr key={ct.carTypeId}>
                    <td className="col-id">#{ct.carTypeId}</td>
                    <td className="col-name">{ct.carCategoryName}</td>
                    {/* <td>
                      <code className="slug-code">{ct.slug}</code>
                    </td> */}
                    <td>
                      <button
                        onClick={() => handleToggleStatus(ct.carTypeId)}
                        className={`status-toggle ${ct.isActive ? 'active' : 'inactive'}`}
                        title={ct.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {ct.isActive ? (
                          <><ToggleRight size={14} /> Active</>
                        ) : (
                          <><ToggleLeft size={14} /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="col-date">
                      {ct.createdAt ? new Date(ct.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          onClick={() => handleOpenEditModal(ct)}
                          className="btn-action edit"
                          title="Edit"
                        >
                          <Edit size={14} />
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
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-page"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`btn-page-num ${page === i ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
            className="btn-page"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCarType ? 'Edit Car Type' : 'Add New Car Type'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="form-error">
                <AlertCircle size={14} />
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="modal-body">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.carCategoryName}
                  onChange={(e) => setFormData({ ...formData, carCategoryName: e.target.value })}
                  placeholder="e.g., Sedan, SUV, Hatchback"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., sedan, luxury-suv"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-save"
                >
                  <Check size={16} />
                  {formSubmitting ? 'Saving...' : editingCarType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-wrap">
              <Trash2 size={28} />
            </div>
            <h3>Delete Car Type?</h3>
            <p>This action cannot be undone. Cars linked to this type may be affected.</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteId(null)} className="btn-cancel">Cancel</button>
              <button onClick={handleDelete} className="btn-delete">Delete</button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}