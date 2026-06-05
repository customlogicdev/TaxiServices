'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Key, 
  User,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Shield
} from 'lucide-react';
import { AdminUser, AdminFormData, Notification, PaginatedResponse } from '../../../types';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
// import './admin-settings.css';
import Toast from '../../../components/Toast';
import './admin-settings.css';

export default function AdminSettingPage() {
  // ==========================================
  // State Management
  // ==========================================
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<AdminFormData>({ username: '', password: '' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [usernameError, setUsernameError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ✅ Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // ==========================================
  // Helper: Get Auth Headers
  // ==========================================
  const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // ==========================================
  // Fetch Admins
  // ==========================================
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.ADMIN.BASE, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to load admins`);
      }

      const data: PaginatedResponse<AdminUser> = await response.json();
      setAdmins(data.content || []);
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch admins', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // ==========================================
  // Check Username Availability
  // ==========================================
  const checkUsername = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.CHECK_USERNAME(username), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        setUsernameError('');
        return true;
      }

      const exists: boolean = await response.json();
      
      if (exists && (!editingAdmin || editingAdmin.username !== username)) {
        setUsernameError('Username already exists');
        return false;
      }
      
      setUsernameError('');
      return true;
    } catch (error) {
      setUsernameError('');
      return true;
    }
  };

  // ==========================================
  // Modal Handlers
  // ==========================================
  const handleOpenModal = (admin?: AdminUser) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({ username: admin.username, password: '' });
    } else {
      setEditingAdmin(null);
      setFormData({ username: '', password: '' });
    }
    setUsernameError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
    setUsernameError('');
  };

  // ==========================================
  // Create / Update Admin
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || formData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (!editingAdmin && !formData.password) {
      showToast('Password is required', 'error');
      return;
    }

    if (formData.password && formData.password.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        username: formData.username,
        ...(formData.password && { password: formData.password }),
      };

      const url = editingAdmin 
        ? API_ENDPOINTS.ADMIN.BY_ID(editingAdmin.id)
        : API_ENDPOINTS.ADMIN.BASE;

      const method = editingAdmin ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Operation failed');
      }

      showToast(
        editingAdmin ? 'Admin updated successfully!' : 'Admin created successfully!',
        'success'
      );
      handleCloseModal();
      fetchAdmins();
    } catch (error: any) {
      showToast(error.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // Delete Admin
  // ==========================================
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.BY_ID(id), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete admin');
      }

      showToast('Admin deleted successfully!', 'success');
      setConfirmDelete(null);
      fetchAdmins();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete admin', 'error');
      setConfirmDelete(null);
    }
  };

  // ==========================================
  // Format Date Helper
  // ==========================================
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className="admin-settings">
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

      {/* Header Section */}
      <div className="settings-header">
        <div className="settings-header-left">
          <div className="settings-icon-wrapper">
            <Shield className="settings-icon" />
          </div>
          <div>
            <h2 className="settings-title">Admin Users</h2>
            <p className="settings-subtitle">
              {loading ? 'Loading...' : `${admins.length} admin${admins.length !== 1 ? 's' : ''} registered`}
            </p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-add-admin">
          <Plus size={18} />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Admin Cards Grid */}
      <div className="admin-grid">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinner" size={32} />
            <p>Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <h3>No Admin Users</h3>
            <p>Create your first admin account to get started</p>
            <button onClick={() => handleOpenModal()} className="btn-add-admin" style={{ marginTop: '16px' }}>
              <Plus size={18} />
              <span>Add Admin</span>
            </button>
          </div>
        ) : (
          admins.map((admin) => (
            <div key={admin.id} className="admin-card">
              {/* Card Header */}
              <div className="admin-card-header">
                <div className="admin-avatar">
                  {admin.username.charAt(0).toUpperCase()}
                </div>
                <div className="admin-info">
                  <h3 className="admin-username">{admin.username}</h3>
                  <span className="admin-id">ID: #{admin.id}</span>
                </div>
                {admin.id === 1 && (
                  <span className="badge-default">Default</span>
                )}
              </div>

              {/* Card Body */}
              <div className="admin-card-body">
                <div className="info-row">
                  <Key size={14} />
                  <span>Password: ••••••••</span>
                </div>
                {admin.lastLogin && (
                  <div className="info-row">
                    <span className="info-label">Last Login:</span>
                    <span className="info-value">{formatDate(admin.lastLogin)}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Created:</span>
                  <span className="info-value">{formatDate(admin.createdAt)}</span>
                </div>
                {admin.updatedAt && (
                  <div className="info-row">
                    <span className="info-label">Updated:</span>
                    <span className="info-value">{formatDate(admin.updatedAt)}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="admin-card-actions">
                <button 
                  onClick={() => handleOpenModal(admin)}
                  className="btn-edit"
                  title="Edit Admin"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                {admin.id !== 1 && (
                  <button 
                    onClick={() => setConfirmDelete(admin.id)}
                    className="btn-delete"
                    title="Delete Admin"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAdmin ? 'Edit Admin' : 'Create New Admin'}</h3>
              <button onClick={handleCloseModal} className="btn-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      setUsernameError('');
                    }}
                    onBlur={(e) => checkUsername(e.target.value)}
                    placeholder="Enter username (min 3 characters)"
                    className={usernameError ? 'input-error' : ''}
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>
                {usernameError && (
                  <span className="error-text">{usernameError}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">
                  Password {editingAdmin && <span className="optional-text">(leave blank to keep current)</span>}
                </label>
                <div className="input-wrapper">
                  <Key size={18} className="input-icon" />
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingAdmin ? 'New password (optional)' : 'Enter password (min 4 characters)'}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={isSubmitting}
                >
                  <Save size={18} />
                  {isSubmitting ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-wrapper">
              <Trash2 size={32} />
            </div>
            <h3>Delete Admin?</h3>
            <p>
              This action cannot be undone. This admin user will lose access immediately.
            </p>
            <div className="modal-actions">
              <button onClick={() => setConfirmDelete(null)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="btn-delete-confirm">
                Yes, Delete Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { 
//   Users, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   X, 
//   Save, 
//   Key, 
//   User,
//   AlertCircle,
//   CheckCircle,
//   RefreshCw
// } from 'lucide-react';
// import { AdminUser, AdminFormData, Notification, PaginatedResponse } from '../../../types';
// import { API_ENDPOINTS } from '../../../config/apiEndpoints';
// import './admin-settings.css';

// export default function AdminSettingPage() {
//   // ==========================================
//   // State Management
//   // ==========================================
//   const [admins, setAdmins] = useState<AdminUser[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [showModal, setShowModal] = useState<boolean>(false);
//   const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
//   const [formData, setFormData] = useState<AdminFormData>({ username: '', password: '' });
//   const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
//   const [notification, setNotification] = useState<Notification | null>(null);
//   const [usernameError, setUsernameError] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

//   // ==========================================
//   // Helper: Get Auth Headers
//   // ==========================================
//   const getAuthHeaders = (): HeadersInit => {
//     const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
//     return {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` }),
//     };
//   };

//   // ==========================================
//   // Fetch Admins
//   // ==========================================
//   const fetchAdmins = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(API_ENDPOINTS.ADMIN.BASE, {
//         headers: getAuthHeaders(),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${await response.text()}`);
//       }

//       const data: PaginatedResponse<AdminUser> = await response.json();
//       setAdmins(data.content || []);
//     } catch (error: any) {
//       showNotification('error', error.message || 'Failed to fetch admins');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAdmins();
//   }, [fetchAdmins]);

//   // ==========================================
//   // Notification Helper
//   // ==========================================
//   const showNotification = (type: 'success' | 'error', message: string) => {
//     setNotification({ type, message });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   // ==========================================
//   // Check Username Availability
//   // ==========================================
//   const checkUsername = async (username: string): Promise<boolean> => {
//     if (!username || username.length < 3) {
//       setUsernameError('Username must be at least 3 characters');
//       return false;
//     }
    
//     try {
//       const response = await fetch(API_ENDPOINTS.ADMIN.CHECK_USERNAME(username), {
//         headers: getAuthHeaders(),
//       });

//       if (!response.ok) {
//         setUsernameError('');
//         return true;
//       }

//       const exists: boolean = await response.json();
      
//       if (exists && (!editingAdmin || editingAdmin.username !== username)) {
//         setUsernameError('Username already exists');
//         return false;
//       }
      
//       setUsernameError('');
//       return true;
//     } catch (error) {
//       setUsernameError('');
//       return true;
//     }
//   };

//   // ==========================================
//   // Modal Handlers
//   // ==========================================
//   const handleOpenModal = (admin?: AdminUser) => {
//     if (admin) {
//       setEditingAdmin(admin);
//       setFormData({ username: admin.username, password: '' });
//     } else {
//       setEditingAdmin(null);
//       setFormData({ username: '', password: '' });
//     }
//     setUsernameError('');
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingAdmin(null);
//     setUsernameError('');
//   };

//   // ==========================================
//   // Create / Update Admin
//   // ==========================================
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.username || formData.username.length < 3) {
//       setUsernameError('Username must be at least 3 characters');
//       return;
//     }

//     if (!editingAdmin && !formData.password) {
//       showNotification('error', 'Password is required');
//       return;
//     }

//     if (formData.password && formData.password.length < 4) {
//       showNotification('error', 'Password must be at least 4 characters');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const payload = {
//         username: formData.username,
//         ...(formData.password && { password: formData.password }),
//       };

//       const url = editingAdmin 
//         ? API_ENDPOINTS.ADMIN.BY_ID(editingAdmin.id)
//         : API_ENDPOINTS.ADMIN.BASE;

//       const method = editingAdmin ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: getAuthHeaders(),
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'Operation failed');
//       }

//       showNotification('success', editingAdmin ? 'Admin updated successfully' : 'Admin created successfully');
//       handleCloseModal();
//       fetchAdmins();
//     } catch (error: any) {
//       showNotification('error', error.message || 'Operation failed');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ==========================================
//   // Delete Admin
//   // ==========================================
//   const handleDelete = async (id: number) => {
//     try {
//       const response = await fetch(API_ENDPOINTS.ADMIN.BY_ID(id), {
//         method: 'DELETE',
//         headers: getAuthHeaders(),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || 'Failed to delete admin');
//       }

//       showNotification('success', 'Admin deleted successfully');
//       setConfirmDelete(null);
//       fetchAdmins();
//     } catch (error: any) {
//       showNotification('error', error.message || 'Failed to delete admin');
//       setConfirmDelete(null);
//     }
//   };

//   // ==========================================
//   // Format Date Helper
//   // ==========================================
//   const formatDate = (dateString?: string): string => {
//     if (!dateString) return 'Never';
//     try {
//       return new Date(dateString).toLocaleDateString('en-IN', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//     } catch {
//       return 'Invalid date';
//     }
//   };

//   // ==========================================
//   // Render
//   // ==========================================
//   return (
//     <div className="admin-settings">
//       {/* Header Section */}
//       <div className="settings-header">
//         <div className="settings-header-left">
//           <div className="settings-icon-wrapper">
//             <Users className="settings-icon" />
//           </div>
//           <div>
//             <h2 className="settings-title">Admin Users</h2>
//             <p className="settings-subtitle">
//               {admins.length} admin{admins.length !== 1 ? 's' : ''} registered
//             </p>
//           </div>
//         </div>
//         <button onClick={() => handleOpenModal()} className="btn-add-admin">
//           <Plus size={18} />
//           <span>Add Admin</span>
//         </button>
//       </div>

//       {/* Notification */}
//       {notification && (
//         <div className={`notification ${notification.type}`}>
//           {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
//           <span>{notification.message}</span>
//         </div>
//       )}

//       {/* Admin Cards Grid */}
//       <div className="admin-grid">
//         {loading ? (
//           <div className="loading-state">
//             <RefreshCw className="spinner" size={32} />
//             <p>Loading admins...</p>
//           </div>
//         ) : admins.length === 0 ? (
//           <div className="empty-state">
//             <User size={48} />
//             <h3>No Admin Users</h3>
//             <p>Create your first admin account to get started</p>
//             <button onClick={() => handleOpenModal()} className="btn-add-admin" style={{ marginTop: '16px' }}>
//               <Plus size={18} />
//               <span>Add Admin</span>
//             </button>
//           </div>
//         ) : (
//           admins.map((admin) => (
//             <div key={admin.id} className="admin-card">
//               {/* Card Header */}
//               <div className="admin-card-header">
//                 <div className="admin-avatar">
//                   {admin.username.charAt(0).toUpperCase()}
//                 </div>
//                 <div className="admin-info">
//                   <h3 className="admin-username">{admin.username}</h3>
//                   <span className="admin-id">ID: #{admin.id}</span>
//                 </div>
//                 {admin.id === 1 && (
//                   <span className="badge-default">Default</span>
//                 )}
//               </div>

//               {/* Card Body */}
//               <div className="admin-card-body">
//                 <div className="info-row">
//                   <Key size={14} />
//                   <span>Password: ••••••••</span>
//                 </div>
//                 {admin.lastLogin && (
//                   <div className="info-row">
//                     <span className="info-label">Last Login:</span>
//                     <span className="info-value">{formatDate(admin.lastLogin)}</span>
//                   </div>
//                 )}
//                 <div className="info-row">
//                   <span className="info-label">Created:</span>
//                   <span className="info-value">{formatDate(admin.createdAt)}</span>
//                 </div>
//                 {admin.updatedAt && (
//                   <div className="info-row">
//                     <span className="info-label">Updated:</span>
//                     <span className="info-value">{formatDate(admin.updatedAt)}</span>
//                   </div>
//                 )}
//               </div>

//               {/* Card Actions */}
//               <div className="admin-card-actions">
//                 <button 
//                   onClick={() => handleOpenModal(admin)}
//                   className="btn-edit"
//                   title="Edit Admin"
//                 >
//                   <Edit size={16} />
//                   <span>Edit</span>
//                 </button>
//                 {admin.id !== 1 && (
//                   <button 
//                     onClick={() => setConfirmDelete(admin.id)}
//                     className="btn-delete"
//                     title="Delete Admin"
//                   >
//                     <Trash2 size={16} />
//                     <span>Delete</span>
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Create/Edit Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>{editingAdmin ? 'Edit Admin' : 'Create New Admin'}</h3>
//               <button onClick={handleCloseModal} className="btn-close">
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="modal-body">
//               {/* Username Field */}
//               <div className="form-group">
//                 <label htmlFor="username">Username</label>
//                 <div className="input-wrapper">
//                   <User size={18} className="input-icon" />
//                   <input
//                     id="username"
//                     type="text"
//                     value={formData.username}
//                     onChange={(e) => {
//                       setFormData({ ...formData, username: e.target.value });
//                       setUsernameError('');
//                     }}
//                     onBlur={(e) => checkUsername(e.target.value)}
//                     placeholder="Enter username (min 3 characters)"
//                     className={usernameError ? 'input-error' : ''}
//                     autoFocus
//                     disabled={isSubmitting}
//                   />
//                 </div>
//                 {usernameError && (
//                   <span className="error-text">{usernameError}</span>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div className="form-group">
//                 <label htmlFor="password">
//                   Password {editingAdmin && <span className="optional-text">(leave blank to keep current)</span>}
//                 </label>
//                 <div className="input-wrapper">
//                   <Key size={18} className="input-icon" />
//                   <input
//                     id="password"
//                     type="password"
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     placeholder={editingAdmin ? 'New password (optional)' : 'Enter password (min 4 characters)'}
//                     disabled={isSubmitting}
//                   />
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="modal-actions">
//                 <button 
//                   type="button" 
//                   onClick={handleCloseModal} 
//                   className="btn-cancel"
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="submit" 
//                   className="btn-save"
//                   disabled={isSubmitting}
//                 >
//                   <Save size={18} />
//                   {isSubmitting ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {confirmDelete && (
//         <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
//           <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="delete-icon-wrapper">
//               <Trash2 size={32} />
//             </div>
//             <h3>Delete Admin?</h3>
//             <p>
//               This action cannot be undone. This admin user will lose access immediately 
//               and all associated data will remain but be unassigned.
//             </p>
//             <div className="modal-actions">
//               <button onClick={() => setConfirmDelete(null)} className="btn-cancel">
//                 Cancel
//               </button>
//               <button onClick={() => handleDelete(confirmDelete)} className="btn-delete-confirm">
//                 Yes, Delete Admin
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }