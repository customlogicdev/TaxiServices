'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { GalleryImage } from '../../../types';
import apiClient from '../../services/apiClient';
import API_ENDPOINTS from '../../../config/apiEndpoints';
import { 
  Upload, Trash2, X, FolderOpen, Image as ImageIcon,
  ChevronLeft, ChevronRight, Search, AlertCircle, Loader, 
  FileImage, Download, Eye
} from 'lucide-react';
import Toast from '../../../components/Toast';
import './gallery.css';

interface PaginationData {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');
  const [form, setForm] = useState({ imagePath: '', caption: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    pageNumber: 0,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: false,
    numberOfElements: 0
  });
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // ✅ Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const API_BASE_URL = 'https://customlogicinnovation.com/rudrabannataxiservices';

  useEffect(() => {
    fetchImages(0);
  }, [activeFilter]);

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '/placeholder.png';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    if (imagePath.startsWith('gallery/') || imagePath.startsWith('cars/')) {
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    if (imagePath.startsWith('/gallery/') || imagePath.startsWith('/cars/')) {
      return `${API_BASE_URL}/uploads${imagePath}`;
    }
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  const fetchImages = async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = API_ENDPOINTS.GALLERY.BASE;
      let params: any = { page: page, size: 12, sort: 'createdAt,desc' };

      if (activeFilter === 'active') {
        endpoint = API_ENDPOINTS.GALLERY.ACTIVE;
        params = {};
      } else if (activeFilter === 'inactive') {
        endpoint = API_ENDPOINTS.GALLERY.INACTIVE;
        params = {};
      }

      const res = await apiClient.get(endpoint, { params });
      
      if (activeFilter === 'all') {
        setImages(res.data.content || []);
        setPagination({
          pageNumber: res.data.pageable?.pageNumber || 0,
          pageSize: res.data.pageable?.pageSize || 12,
          totalPages: res.data.totalPages || 1,
          totalElements: res.data.totalElements || 0,
          first: res.data.first !== undefined ? res.data.first : true,
          last: res.data.last !== undefined ? res.data.last : true,
          numberOfElements: res.data.numberOfElements || 0
        });
      } else {
        setImages(res.data || []);
        setPagination(prev => ({
          ...prev,
          totalElements: (res.data || []).length,
          totalPages: 1
        }));
      }
    } catch (err: any) {
      console.error('Error fetching images:', err);
      setError('Failed to load gallery images.');
      showToast('Failed to load gallery images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchImages(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(API_ENDPOINTS.GALLERY.SEARCH, {
        params: { keyword: searchKeyword }
      });
      setImages(res.data || []);
      setPagination(prev => ({ 
        ...prev, 
        totalElements: (res.data || []).length,
        totalPages: 1 
      }));
      showToast(`Found ${(res.data || []).length} image(s)`, 'info');
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed');
      showToast('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateFiles = (files: File[]): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 20 * 1024 * 1024;
    
    if (files.length === 0) {
      setFileError('Please select at least one file');
      return false;
    }
    if (files.length > 5) {
      setFileError('Maximum 5 files allowed');
      return false;
    }
    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        setFileError(`File "${file.name}" is not a supported image format`);
        return false;
      }
      if (file.size > maxSize) {
        setFileError(`File "${file.name}" is too large (max 20MB)`);
        return false;
      }
    }
    setFileError(null);
    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    validateFiles(files);
  };

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateFiles(selectedFiles)) return;
    setSaving(true);
    try {
      const formData = new FormData();
      if (uploadMode === 'single') {
        formData.append('file', selectedFiles[0]);
        if (form.caption) formData.append('caption', form.caption);
        await apiClient.post(API_ENDPOINTS.GALLERY.UPLOAD, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Image uploaded successfully!', 'success');
      } else {
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        if (form.caption) formData.append('caption', form.caption);
        await apiClient.post(API_ENDPOINTS.GALLERY.UPLOAD_MULTIPLE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast(`${selectedFiles.length} images uploaded successfully!`, 'success');
      }
      setShowModal(false);
      setSelectedFiles([]);
      setForm({ imagePath: '', caption: '' });
      setFileError(null);
      fetchImages(pagination.pageNumber);
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast(err?.response?.data?.message || 'Failed to upload images', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(API_ENDPOINTS.GALLERY.BY_ID(deleteId));
      showToast('Image deleted successfully!', 'success');
      setDeleteId(null);
      fetchImages(pagination.pageNumber);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast('Failed to delete image', 'error');
      setDeleteId(null);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      await apiClient.patch(API_ENDPOINTS.GALLERY.TOGGLE_STATUS(id));
      showToast('Status updated successfully!', 'success');
      fetchImages(pagination.pageNumber);
    } catch (err) {
      console.error('Toggle error:', err);
      showToast('Failed to toggle status', 'error');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchImages(newPage);
    }
  };

  const openPreview = (image: GalleryImage) => {
    setSelectedImage(image);
    setShowPreview(true);
  };

  const downloadImage = (imagePath: string) => {
    window.open(getImageUrl(imagePath), '_blank');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#f0f0f0">
        <rect width="400" height="300" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="16">No Image</text>
      </svg>
    `);
    target.onerror = null;
  };

  if (loading && images.length === 0) {
    return (
      <div className="gallery-loading">
        <div className="spinner">
          <Loader size={48} className="animate-spin" />
        </div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (error && images.length === 0) {
    return (
      <div className="gallery-error">
        <AlertCircle size={48} />
        <h3>Error Loading Gallery</h3>
        <p>{error}</p>
        <button onClick={() => fetchImages(0)} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="gallery-container">
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
      <div className="gallery-header">
        <div>
          <h2>Gallery Management</h2>
          <p>{pagination.totalElements} images total</p>
        </div>
        <div className="gallery-header-actions">
          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button onClick={() => setActiveFilter('all')} className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}>All</button>
            <button onClick={() => setActiveFilter('active')} className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}>Active</button>
            <button onClick={() => setActiveFilter('inactive')} className={`filter-tab ${activeFilter === 'inactive' ? 'active' : ''}`}>Inactive</button>
          </div>

          {/* Search Box */}
          <div className="search-box">
            <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="Search by caption..." onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} className="btn-search"><Search size={16} /></button>
          </div>
          
          {/* Upload Buttons */}
          <button onClick={() => { setUploadMode('single'); setShowModal(true); }} className="btn-primary"><Upload size={16} /> Upload Single</button>
          <button onClick={() => { setUploadMode('multiple'); setShowModal(true); }} className="btn-primary"><FolderOpen size={16} /> Upload Multiple</button>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="gallery-section">
          <div className="image-grid">
            {images.map((img) => (
              <div key={img.id} className="image-card">
                <div className="image-wrapper" onClick={() => openPreview(img)}>
                  <img
                    src={getImageUrl(img.imagePath)}
                    alt={img.caption || 'Gallery image'}
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
                
                <div className="image-info">
                  {img.caption && <p className="image-caption">{img.caption}</p>}
                  <div className="image-meta">
                    <span className={`status-badge ${img.isActive ? 'active' : 'inactive'}`}>
                      {img.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="date">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="image-actions">
                  <button onClick={() => toggleActive(img.id)} className="btn-toggle">
                    {img.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => openPreview(img)} className="btn-view">
                    <Eye size={14} /> View
                  </button>
                  <button onClick={() => setDeleteId(img.id)} className="btn-delete-icon">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !loading && (
        <div className="empty-state">
          <ImageIcon size={64} />
          <h3>No Images Found</h3>
          <p>Start by uploading your first gallery image</p>
          <div className="empty-actions">
            <button onClick={() => { setUploadMode('single'); setShowModal(true); }} className="btn-primary">
              <Upload size={16} /> Upload Single
            </button>
            <button onClick={() => { setUploadMode('multiple'); setShowModal(true); }} className="btn-primary">
              <FolderOpen size={16} /> Upload Multiple
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {activeFilter === 'all' && pagination.totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.first} className="btn-page">
            <ChevronLeft size={20} /> Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button key={i} onClick={() => handlePageChange(i)} className={`btn-page-number ${i === pagination.pageNumber ? 'active' : ''}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.last} className="btn-page">
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedFiles([]); setFileError(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{uploadMode === 'single' ? 'Upload Image' : 'Upload Multiple Images'}</h3>
              <button onClick={() => { setShowModal(false); setSelectedFiles([]); setFileError(null); }} className="btn-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleFileUpload} className="modal-body">
              <div className="form-group">
                <label>{uploadMode === 'single' ? 'Select Image *' : 'Select Images (Max 5) *'}</label>
                <div className="file-input-wrapper">
                  <input type="file" onChange={handleFileChange} accept="image/*" multiple={uploadMode === 'multiple'} className="file-input" />
                  <div className="file-input-ui">
                    <FileImage size={24} />
                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to choose files'}</span>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="file-list">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <ImageIcon size={16} />
                        <span>{file.name}</span>
                        <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ))}
                  </div>
                )}
                {fileError && (
                  <div className="error-message"><AlertCircle size={16} /><span>{fileError}</span></div>
                )}
              </div>
              <div className="form-group">
                <label>Caption (Optional)</label>
                <input type="text" value={form.caption} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, caption: e.target.value })} placeholder="Enter caption for image(s)" />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); setSelectedFiles([]); setFileError(null); }} className="btn-cancel">Cancel</button>
                <button type="submit" disabled={saving || selectedFiles.length === 0} className="btn-submit">
                  {saving ? <><Loader size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && selectedImage && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>{selectedImage.caption || 'Image Preview'}</h3>
              <button onClick={() => setShowPreview(false)} className="btn-close"><X size={20} /></button>
            </div>
            <div className="preview-body">
              <img src={getImageUrl(selectedImage.imagePath)} alt={selectedImage.caption || 'Preview'} onError={handleImageError} />
            </div>
            <div className="preview-footer">
              <span className={`status-badge ${selectedImage.isActive ? 'active' : 'inactive'}`}>
                {selectedImage.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="preview-actions">
                <button onClick={() => downloadImage(selectedImage.imagePath)} className="btn-secondary"><Download size={16} /> Download</button>
                <button onClick={() => toggleActive(selectedImage.id)} className="btn-toggle">
                  {selectedImage.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Image?</h3>
              <button onClick={() => setDeleteId(null)} className="btn-close"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="warning-message">
                <AlertCircle size={24} />
                <p>This action cannot be undone. The image will be permanently deleted.</p>
              </div>
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
// 'use client';

// import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
// import { GalleryImage } from '../../../types';
// import apiClient from '../../services/apiClient';
// import API_ENDPOINTS from '../../../config/apiEndpoints';
// import { 
//   Upload, Trash2, X, FolderOpen, Image as ImageIcon,
//   ChevronLeft, ChevronRight, Search, AlertCircle, Loader, 
//   FileImage, Download, Eye
// } from 'lucide-react';
// import './gallery.css';

// interface PaginationData {
//   pageNumber: number;
//   pageSize: number;
//   totalPages: number;
//   totalElements: number;
//   first: boolean;
//   last: boolean;
//   numberOfElements: number;
// }

// export default function GalleryPage() {
//   const [images, setImages] = useState<GalleryImage[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');
//   const [form, setForm] = useState({ imagePath: '', caption: '' });
//   const [saving, setSaving] = useState(false);
//   const [deleteId, setDeleteId] = useState<number | null>(null);
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [fileError, setFileError] = useState<string | null>(null);
//   const [searchKeyword, setSearchKeyword] = useState('');
//   const [pagination, setPagination] = useState<PaginationData>({
//     pageNumber: 0,
//     pageSize: 12,
//     totalPages: 0,
//     totalElements: 0,
//     first: true,
//     last: false,
//     numberOfElements: 0
//   });
//   const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

//   const API_BASE_URL = 'http://localhost:8080';

//   useEffect(() => {
//     fetchImages(0);
//   }, [activeFilter]);

//   const getImageUrl = (imagePath: string): string => {
//     if (!imagePath) return '/placeholder.png';
//     if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//       return imagePath;
//     }
//     if (imagePath.startsWith('/uploads/')) {
//       return `${API_BASE_URL}${imagePath}`;
//     }
//     if (imagePath.startsWith('gallery/') || imagePath.startsWith('cars/')) {
//       return `${API_BASE_URL}/uploads/${imagePath}`;
//     }
//     if (imagePath.startsWith('/gallery/') || imagePath.startsWith('/cars/')) {
//       return `${API_BASE_URL}/uploads${imagePath}`;
//     }
//     return `${API_BASE_URL}/uploads/${imagePath}`;
//   };

//   const fetchImages = async (page: number = 0) => {
//     setLoading(true);
//     setError(null);
//     try {
//       let endpoint = API_ENDPOINTS.GALLERY.BASE;
//       let params: any = { page: page, size: 12, sort: 'createdAt,desc' };

//       if (activeFilter === 'active') {
//         endpoint = API_ENDPOINTS.GALLERY.ACTIVE;
//         params = {};
//       } else if (activeFilter === 'inactive') {
//         endpoint = API_ENDPOINTS.GALLERY.INACTIVE;
//         params = {};
//       }

//       const res = await apiClient.get(endpoint, { params });
      
//       if (activeFilter === 'all') {
//         setImages(res.data.content || []);
//         setPagination({
//           pageNumber: res.data.pageable?.pageNumber || 0,
//           pageSize: res.data.pageable?.pageSize || 12,
//           totalPages: res.data.totalPages || 1,
//           totalElements: res.data.totalElements || 0,
//           first: res.data.first !== undefined ? res.data.first : true,
//           last: res.data.last !== undefined ? res.data.last : true,
//           numberOfElements: res.data.numberOfElements || 0
//         });
//       } else {
//         setImages(res.data || []);
//         setPagination(prev => ({
//           ...prev,
//           totalElements: (res.data || []).length,
//           totalPages: 1
//         }));
//       }
//     } catch (err: any) {
//       console.error('Error fetching images:', err);
//       setError('Failed to load gallery images.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchKeyword.trim()) {
//       fetchImages(0);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await apiClient.get(API_ENDPOINTS.GALLERY.SEARCH, {
//         params: { keyword: searchKeyword }
//       });
//       setImages(res.data || []);
//       setPagination(prev => ({ 
//         ...prev, 
//         totalElements: (res.data || []).length,
//         totalPages: 1 
//       }));
//     } catch (err) {
//       console.error('Search error:', err);
//       setError('Search failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateFiles = (files: File[]): boolean => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//     const maxSize = 20 * 1024 * 1024;
    
//     if (files.length === 0) {
//       setFileError('Please select at least one file');
//       return false;
//     }
//     if (files.length > 5) {
//       setFileError('Maximum 5 files allowed');
//       return false;
//     }
//     for (let file of files) {
//       if (!allowedTypes.includes(file.type)) {
//         setFileError(`File "${file.name}" is not a supported image format`);
//         return false;
//       }
//       if (file.size > maxSize) {
//         setFileError(`File "${file.name}" is too large (max 20MB)`);
//         return false;
//       }
//     }
//     setFileError(null);
//     return true;
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     setSelectedFiles(files);
//     validateFiles(files);
//   };

//   const handleFileUpload = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!validateFiles(selectedFiles)) return;
//     setSaving(true);
//     try {
//       const formData = new FormData();
//       if (uploadMode === 'single') {
//         formData.append('file', selectedFiles[0]);
//         if (form.caption) formData.append('caption', form.caption);
//         await apiClient.post(API_ENDPOINTS.GALLERY.UPLOAD, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         });
//       } else {
//         selectedFiles.forEach(file => {
//           formData.append('files', file);
//         });
//         if (form.caption) formData.append('caption', form.caption);
//         await apiClient.post(API_ENDPOINTS.GALLERY.UPLOAD_MULTIPLE, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         });
//       }
//       setShowModal(false);
//       setSelectedFiles([]);
//       setForm({ imagePath: '', caption: '' });
//       setFileError(null);
//       fetchImages(pagination.pageNumber);
//     } catch (err: any) {
//       console.error('Upload error:', err);
//       alert('Failed to upload images. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Manual individual delete
//   const handleDelete = async () => {
//     if (deleteId) {
//       try {
//         await apiClient.delete(API_ENDPOINTS.GALLERY.BY_ID(deleteId));
//         setDeleteId(null);
//         fetchImages(pagination.pageNumber);
//       } catch (err) {
//         console.error('Delete error:', err);
//         alert('Delete failed');
//       }
//     }
//   };

//   const toggleActive = async (id: number) => {
//     try {
//       await apiClient.patch(API_ENDPOINTS.GALLERY.TOGGLE_STATUS(id));
//       fetchImages(pagination.pageNumber);
//     } catch (err) {
//       console.error('Toggle error:', err);
//       alert('Toggle failed');
//     }
//   };

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 0 && newPage < pagination.totalPages) {
//       fetchImages(newPage);
//     }
//   };

//   const openPreview = (image: GalleryImage) => {
//     setSelectedImage(image);
//     setShowPreview(true);
//   };

//   const downloadImage = (imagePath: string) => {
//     window.open(getImageUrl(imagePath), '_blank');
//   };

//   const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
//     const target = e.target as HTMLImageElement;
//     target.src = 'data:image/svg+xml;base64,' + btoa(`
//       <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#f0f0f0">
//         <rect width="400" height="300" fill="#f0f0f0"/>
//         <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-size="16">No Image</text>
//       </svg>
//     `);
//     target.onerror = null;
//   };

//   if (loading) {
//     return (
//       <div className="gallery-loading">
//         <div className="spinner">
//           <Loader size={48} className="animate-spin" />
//         </div>
//         <p>Loading gallery...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="gallery-error">
//         <AlertCircle size={48} />
//         <h3>Error Loading Gallery</h3>
//         <p>{error}</p>
//         <button onClick={() => fetchImages(0)} className="btn-primary">
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="gallery-container">
//       {/* Header */}
//       <div className="gallery-header">
//         <div>
//           <h2>Gallery Management</h2>
//           <p>{pagination.totalElements} images total</p>
//         </div>
//         <div className="gallery-header-actions">
//           {/* Filter Tabs */}
//           <div className="filter-tabs">
//             <button onClick={() => setActiveFilter('all')} className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}>All</button>
//             <button onClick={() => setActiveFilter('active')} className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}>Active</button>
//             <button onClick={() => setActiveFilter('inactive')} className={`filter-tab ${activeFilter === 'inactive' ? 'active' : ''}`}>Inactive</button>
//           </div>

//           {/* Search Box */}
//           <div className="search-box">
//             <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="Search by caption..." onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
//             <button onClick={handleSearch} className="btn-search"><Search size={16} /></button>
//           </div>
          
//           {/* Upload Buttons */}
//           <button onClick={() => { setUploadMode('single'); setShowModal(true); }} className="btn-primary"><Upload size={16} /> Upload Single</button>
//           <button onClick={() => { setUploadMode('multiple'); setShowModal(true); }} className="btn-primary"><FolderOpen size={16} /> Upload Multiple</button>
//         </div>
//       </div>

//       {/* Image Grid */}
//       {images.length > 0 && (
//         <div className="gallery-section">
//           <div className="image-grid">
//             {images.map((img) => (
//               <div key={img.id} className="image-card">
//                 <div className="image-wrapper" onClick={() => openPreview(img)}>
//                   <img
//                     src={getImageUrl(img.imagePath)}
//                     alt={img.caption || 'Gallery image'}
//                     onError={handleImageError}
//                     loading="lazy"
//                   />
//                 </div>
                
//                 <div className="image-info">
//                   {img.caption && <p className="image-caption">{img.caption}</p>}
//                   <div className="image-meta">
//                     <span className={`status-badge ${img.isActive ? 'active' : 'inactive'}`}>
//                       {img.isActive ? 'Active' : 'Inactive'}
//                     </span>
//                     <span className="date">
//                       {new Date(img.createdAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className="image-actions">
//                   <button onClick={() => toggleActive(img.id)} className="btn-toggle">
//                     {img.isActive ? 'Deactivate' : 'Activate'}
//                   </button>
//                   <button onClick={() => openPreview(img)} className="btn-view">
//                     <Eye size={14} /> View
//                   </button>
//                   <button onClick={() => setDeleteId(img.id)} className="btn-delete-icon">
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Empty State */}
//       {images.length === 0 && !loading && (
//         <div className="empty-state">
//           <ImageIcon size={64} />
//           <h3>No Images Found</h3>
//           <p>Start by uploading your first gallery image</p>
//           <div className="empty-actions">
//             <button onClick={() => { setUploadMode('single'); setShowModal(true); }} className="btn-primary">
//               <Upload size={16} /> Upload Single
//             </button>
//             <button onClick={() => { setUploadMode('multiple'); setShowModal(true); }} className="btn-primary">
//               <FolderOpen size={16} /> Upload Multiple
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Pagination */}
//       {activeFilter === 'all' && pagination.totalPages > 1 && (
//         <div className="pagination">
//           <button onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.first} className="btn-page">
//             <ChevronLeft size={20} /> Previous
//           </button>
//           <div className="page-numbers">
//             {Array.from({ length: pagination.totalPages }, (_, i) => (
//               <button key={i} onClick={() => handlePageChange(i)} className={`btn-page-number ${i === pagination.pageNumber ? 'active' : ''}`}>
//                 {i + 1}
//               </button>
//             ))}
//           </div>
//           <button onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.last} className="btn-page">
//             Next <ChevronRight size={20} />
//           </button>
//         </div>
//       )}

//       {/* Upload Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => { setShowModal(false); setSelectedFiles([]); setFileError(null); }}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>{uploadMode === 'single' ? 'Upload Image' : 'Upload Multiple Images'}</h3>
//               <button onClick={() => { setShowModal(false); setSelectedFiles([]); setFileError(null); }} className="btn-close"><X size={20} /></button>
//             </div>
//             <form onSubmit={handleFileUpload} className="modal-body">
//               <div className="form-group">
//                 <label>{uploadMode === 'single' ? 'Select Image *' : 'Select Images (Max 5) *'}</label>
//                 <div className="file-input-wrapper">
//                   <input type="file" onChange={handleFileChange} accept="image/*" multiple={uploadMode === 'multiple'} className="file-input" />
//                   <div className="file-input-ui">
//                     <FileImage size={24} />
//                     <span>{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to choose files'}</span>
//                   </div>
//                 </div>
//                 {selectedFiles.length > 0 && (
//                   <div className="file-list">
//                     {selectedFiles.map((file, index) => (
//                       <div key={index} className="file-item">
//                         <ImageIcon size={16} />
//                         <span>{file.name}</span>
//                         <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 {fileError && (
//                   <div className="error-message"><AlertCircle size={16} /><span>{fileError}</span></div>
//                 )}
//               </div>
//               <div className="form-group">
//                 <label>Caption (Optional)</label>
//                 <input type="text" value={form.caption} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, caption: e.target.value })} placeholder="Enter caption for image(s)" />
//               </div>
//               <div className="modal-actions">
//                 <button type="button" onClick={() => { setShowModal(false); setSelectedFiles([]); setFileError(null); }} className="btn-cancel">Cancel</button>
//                 <button type="submit" disabled={saving || selectedFiles.length === 0} className="btn-submit">
//                   {saving ? <><Loader size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}</>}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Image Preview Modal */}
//       {showPreview && selectedImage && (
//         <div className="modal-overlay" onClick={() => setShowPreview(false)}>
//           <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="preview-header">
//               <h3>{selectedImage.caption || 'Image Preview'}</h3>
//               <button onClick={() => setShowPreview(false)} className="btn-close"><X size={20} /></button>
//             </div>
//             <div className="preview-body">
//               <img src={getImageUrl(selectedImage.imagePath)} alt={selectedImage.caption || 'Preview'} onError={handleImageError} />
//             </div>
//             <div className="preview-footer">
//               <span className={`status-badge ${selectedImage.isActive ? 'active' : 'inactive'}`}>
//                 {selectedImage.isActive ? 'Active' : 'Inactive'}
//               </span>
//               <div className="preview-actions">
//                 <button onClick={() => downloadImage(selectedImage.imagePath)} className="btn-secondary"><Download size={16} /> Download</button>
//                 <button onClick={() => toggleActive(selectedImage.id)} className="btn-toggle">
//                   {selectedImage.isActive ? 'Deactivate' : 'Activate'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deleteId && (
//         <div className="modal-overlay" onClick={() => setDeleteId(null)}>
//           <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Delete Image?</h3>
//               <button onClick={() => setDeleteId(null)} className="btn-close"><X size={20} /></button>
//             </div>
//             <div className="modal-body">
//               <div className="warning-message">
//                 <AlertCircle size={24} />
//                 <p>This action cannot be undone. The image will be permanently deleted.</p>
//               </div>
//               <div className="modal-actions">
//                 <button onClick={() => setDeleteId(null)} className="btn-cancel">Cancel</button>
//                 <button onClick={handleDelete} className="btn-danger"><Trash2 size={16} /> Delete</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }