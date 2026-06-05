// 'use client';

// import { useState, useEffect } from 'react';
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
// import './admin-settings.css';

// interface AdminUser {
//   id: number;
//   username: string;
//   password?: string;
//   lastLogin?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// const API_BASE_URL = 'http://localhost:8080/api';

// export default function AdminSettings() {
//   const [admins, setAdmins] = useState<AdminUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
//   const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
//   const [usernameError, setUsernameError] = useState('');

//   // Fetch all admins
//   const fetchAdmins = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${API_BASE_URL}/admins`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setAdmins(data.content || data);
//       }
//     } catch (error) {
//       showNotification('error', 'Failed to fetch admins');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAdmins();
//   }, []);

//   // Show notification
//   const showNotification = (type: 'success' | 'error', message: string) => {
//     setNotification({ type, message });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   // Check username availability
//   const checkUsername = async (username: string) => {
//     if (!username || username.length < 3) {
//       setUsernameError('Username must be at least 3 characters');
//       return false;
//     }
    
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${API_BASE_URL}/admins/check-username?username=${username}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const exists = await response.json();
      
//       if (exists && (!editingAdmin || editingAdmin.username !== username)) {
//         setUsernameError('Username already exists');
//         return false;
//       }
      
//       setUsernameError('');
//       return true;
//     } catch (error) {
//       return true; // Allow on error
//     }
//   };

//   // Open modal for create/edit
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

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.username || formData.username.length < 3) {
//       setUsernameError('Username must be at least 3 characters');
//       return;
//     }

//     if (!editingAdmin && !formData.password) {
//       showNotification('error', 'Password is required');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('auth_token');
//       const url = editingAdmin 
//         ? `${API_BASE_URL}/admins/${editingAdmin.id}`
//         : `${API_BASE_URL}/admins`;
      
//       const method = editingAdmin ? 'PUT' : 'POST';
      
//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           username: formData.username,
//           password: formData.password || undefined
//         })
//       });

//       if (response.ok) {
//         showNotification('success', editingAdmin ? 'Admin updated successfully' : 'Admin created successfully');
//         setShowModal(false);
//         fetchAdmins();
//       } else {
//         const error = await response.text();
//         showNotification('error', error || 'Operation failed');
//       }
//     } catch (error) {
//       showNotification('error', 'Network error. Please try again.');
//     }
//   };

//   // Delete admin
//   const handleDelete = async (id: number) => {
//     try {
//       const token = localStorage.getItem('auth_token');
//       const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.ok) {
//         showNotification('success', 'Admin deleted successfully');
//         setConfirmDelete(null);
//         fetchAdmins();
//       } else {
//         showNotification('error', 'Failed to delete admin');
//       }
//     } catch (error) {
//       showNotification('error', 'Network error. Please try again.');
//     }
//   };

//   // Format date
//   const formatDate = (dateString?: string) => {
//     if (!dateString) return 'Never';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div className="admin-settings">
//       {/* Header */}
//       <div className="settings-header">
//         <div className="settings-header-left">
//           <div className="settings-icon-wrapper">
//             <Users className="settings-icon" />
//           </div>
//           <div>
//             <h2 className="settings-title">Admin Users</h2>
//             <p className="settings-subtitle">Manage admin accounts</p>
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
//             <p>Create your first admin account</p>
//           </div>
//         ) : (
//           admins.map((admin) => (
//             <div key={admin.id} className="admin-card">
//               <div className="admin-card-header">
//                 <div className="admin-avatar">
//                   {admin.username.charAt(0).toUpperCase()}
//                 </div>
//                 <div className="admin-info">
//                   <h3 className="admin-username">{admin.username}</h3>
//                   <span className="admin-id">ID: {admin.id}</span>
//                 </div>
//                 {admin.id === 1 && (
//                   <span className="badge-default">Default</span>
//                 )}
//               </div>

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
//               </div>

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
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>{editingAdmin ? 'Edit Admin' : 'Create Admin'}</h3>
//               <button onClick={() => setShowModal(false)} className="btn-close">
//                 <X size={20} />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="modal-body">
//               <div className="form-group">
//                 <label>Username</label>
//                 <div className="input-wrapper">
//                   <User size={18} className="input-icon" />
//                   <input
//                     type="text"
//                     value={formData.username}
//                     onChange={(e) => {
//                       setFormData({ ...formData, username: e.target.value });
//                       setUsernameError('');
//                     }}
//                     onBlur={() => checkUsername(formData.username)}
//                     placeholder="Enter username"
//                     className={usernameError ? 'input-error' : ''}
//                     autoFocus
//                   />
//                 </div>
//                 {usernameError && (
//                   <span className="error-text">{usernameError}</span>
//                 )}
//               </div>

//               <div className="form-group">
//                 <label>
//                   Password {editingAdmin && '(leave blank to keep current)'}
//                 </label>
//                 <div className="input-wrapper">
//                   <Key size={18} className="input-icon" />
//                   <input
//                     type="password"
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     placeholder={editingAdmin ? 'New password (optional)' : 'Enter password'}
//                   />
//                 </div>
//               </div>

//               <div className="modal-actions">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn-save">
//                   <Save size={18} />
//                   {editingAdmin ? 'Update' : 'Create'}
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
//             <p>This action cannot be undone. This admin will lose access immediately.</p>
//             <div className="modal-actions">
//               <button onClick={() => setConfirmDelete(null)} className="btn-cancel">
//                 Cancel
//               </button>
//               <button onClick={() => handleDelete(confirmDelete)} className="btn-delete-confirm">
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }