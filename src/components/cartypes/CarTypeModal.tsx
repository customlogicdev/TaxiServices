// src/components/cartypes/CarTypeModal.tsx
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { CarType, CarTypeFormData } from '../../types';
import { carTypeService } from '../../services/carTypeService';
import { X, Save, Car } from 'lucide-react';
import CarTypeDeleteConfirm from './CarTypeDeleteConfirm';

interface CarTypeModalProps {
  carType?: CarType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CarTypeModal({ carType, onClose, onSuccess }: CarTypeModalProps) {
  const isEdit = !!carType;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CarTypeFormData>({
    carCategoryName: '',
    slug: '',
    isActive: true,
  });

  // Populate form when editing
  useEffect(() => {
    if (carType) {
      setFormData({
        carCategoryName: carType.carCategoryName,
        slug: carType.slug,
        isActive: carType.isActive,
      });
    }
  }, [carType]);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Handle name change with auto slug generation
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      carCategoryName: name,
      slug: isEdit ? prev.slug : generateSlug(name),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isEdit && carType) {
        await carTypeService.update(carType.carTypeId, formData);
      } else {
        await carTypeService.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to save car type';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            {isEdit ? 'Edit Car Type' : 'Add New Car Type'}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              border: 'none',
              background: 'transparent',
              borderRadius: 6,
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 22 }}>
            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 16,
                color: '#DC2626',
                fontSize: 13
              }}>
                {error}
              </div>
            )}

            {/* Category Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#1E293B',
                marginBottom: 6
              }}>
                Category Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.carCategoryName}
                onChange={handleNameChange}
                required
                placeholder="e.g., SUV, Sedan, Hatchback"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            {/* Slug */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#1E293B',
                marginBottom: 6
              }}>
                Slug <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setFormData(prev => ({ ...prev, slug: e.target.value }))
                }
                required
                placeholder="e.g., suv, sedan"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                URL-friendly name (auto-generated from category name)
              </p>
            </div>

            {/* Active Status Toggle */}
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#1E293B',
                marginBottom: 8
              }}>
                Status
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 20,
                  cursor: 'pointer',
                  background: formData.isActive ? '#D1FAE5' : '#FEE2E2',
                  color: formData.isActive ? '#059669' : '#DC2626',
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: formData.isActive ? '#059669' : '#DC2626',
                  transition: 'all 0.2s'
                }} />
                {formData.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            padding: '16px 22px',
            borderTop: '1px solid #F1F5F9',
            background: '#F8FAFC',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            borderRadius: '0 0 20px 20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                background: 'white',
                color: '#64748B',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              Cancel
            </button> 
      
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 18px',
                border: 'none',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                color: 'white',
                fontSize: 13,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// 'use client';

// import { useState, useEffect } from 'react';
// import { CarType, CarTypeFormData } from '../../types';
// import { carTypeService } from '../../../src/services/carTypeService';
// import './CarTypeModal.css';

// interface CarTypeModalProps {
//   carType?: CarType | null;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function CarTypeModal({ carType, onClose, onSuccess }: CarTypeModalProps) {
//   const isEdit = !!carType;
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [formData, setFormData] = useState<CarTypeFormData>({
//     carCategoryName: '',
//     slug: '',
//     isActive: true,
//   });

//   useEffect(() => {
//     if (carType) {
//       setFormData({
//         carCategoryName: carType.carCategoryName,
//         slug: carType.slug,
//         isActive: carType.isActive,
//       });
//     }
//   }, [carType]);

//   const generateSlug = (name: string) => {
//     return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
//   };

//   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const name = e.target.value;
//     setFormData(prev => ({
//       ...prev,
//       carCategoryName: name,
//       slug: isEdit ? prev.slug : generateSlug(name),
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       if (isEdit && carType) {
//         await carTypeService.update(carType.carTypeId, formData);
//       } else {
//         await carTypeService.create(formData);
//       }
//       onSuccess();
//     } catch (err: any) {
//       setError(err?.response?.data?.message || 'Failed to save');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-container" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h3>{isEdit ? 'Edit Car Type' : 'Add Car Type'}</h3>
//           <button onClick={onClose} className="btn-close">✕</button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="modal-body">
//             {error && <div className="form-error">{error}</div>}

//             <div className="form-group">
//               <label className="form-label required">Category Name</label>
//               <input
//                 type="text"
//                 value={formData.carCategoryName}
//                 onChange={handleNameChange}
//                 required
//                 className="form-input"
//                 placeholder="e.g., SUV, Sedan, Hatchback"
//               />
//             </div>

//             <div className="form-group">
//               <label className="form-label required">Slug</label>
//               <input
//                 type="text"
//                 value={formData.slug}
//                 onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
//                 required
//                 className="form-input"
//                 placeholder="e.g., suv, sedan"
//               />
//               <p className="form-hint">URL-friendly name (auto-generated from name)</p>
//             </div>

//             <div className="form-group">
//               <label className="form-label">Status</label>
//               <div className="toggle-wrapper">
//                 <button
//                   type="button"
//                   onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
//                   className={`toggle-btn ${formData.isActive ? 'active' : 'inactive'}`}
//                 >
//                   <span className="toggle-dot" />
//                   <span className="toggle-label">{formData.isActive ? 'Active' : 'Inactive'}</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="modal-footer">
//             <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
//             <button type="submit" disabled={loading} className="btn-submit">
//               {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }