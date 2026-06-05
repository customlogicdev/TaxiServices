'use client';

import { useState, useEffect, ChangeEvent, useCallback, useRef } from 'react';
import { ContactSubmission, ContactFilter, PaginatedResponse } from '../../../types';
import apiClient from '../../services/apiClient';
import API_ENDPOINTS from '../../../config/apiEndpoints';
import {
  Search, X, Mail, Phone, Calendar, MessageSquare,
  Download, Eye, Trash2, Filter, RefreshCw, Users,
  Clock, AlertCircle, ChevronDown, ChevronUp, CheckCircle,
  Loader, ArrowLeft, ChevronLeft, ChevronRight,
  Inbox
} from 'lucide-react';
import './contacts.css';

// Toast Interface
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Toast Component
const ToastNotification = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <MessageSquare size={18} />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default function ContactsManagementPage() {
  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // State Management
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [allContacts, setAllContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter State
  const [filters, setFilters] = useState<ContactFilter>({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    keyword: ''
  });
  
  // Search State - Live Debounced Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Stats State
  const [totalCount, setTotalCount] = useState(0);
  const [recentContacts, setRecentContacts] = useState<ContactSubmission[]>([]);
  
  // Sort State (Client-side sorting)
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // ✅ Helper: Convert date string to ISO DateTime format required by backend
  const formatDateForApi = (dateString: string, isEndDate: boolean = false): string | undefined => {
    if (!dateString) return undefined;
    
    // If it's already in ISO format with time, return as is
    if (dateString.includes('T')) return dateString;
    
    // For start date: 2026-05-21 → 2026-05-21T00:00:00
    // For end date: 2026-05-21 → 2026-05-21T23:59:59
    if (isEndDate) {
      return `${dateString}T23:59:59`;
    }
    return `${dateString}T00:00:00`;
  };

  // ✅ Fetch Contacts with proper date formatting
  const fetchContacts = useCallback(async (keywordOverride?: string) => {
    setLoading(true);
    setError(null);
    
    const searchTerm = keywordOverride !== undefined ? keywordOverride : searchKeyword;
    
    try {
      let response;
      const hasFilters = hasActiveFilters();
      
      if (hasFilters) {
        // ✅ Build filter params with proper date formatting
        const filterParams: any = {
          page: currentPage,
          size: pageSize
        };
        
        // Only add non-empty filter values
        if (filters.name?.trim()) filterParams.name = filters.name.trim();
        if (filters.email?.trim()) filterParams.email = filters.email.trim();
        if (filters.phone?.trim()) filterParams.phone = filters.phone.trim();
        if (filters.keyword?.trim()) filterParams.keyword = filters.keyword.trim();
        
        // ✅ Format dates properly for backend
        if (filters.startDate) {
          filterParams.startDate = formatDateForApi(filters.startDate, false);
        }
        if (filters.endDate) {
          filterParams.endDate = formatDateForApi(filters.endDate, true);
        }
        
        console.log('🔍 Filter params sent to backend:', filterParams);
        
        response = await apiClient.get<PaginatedResponse<ContactSubmission>>(
          API_ENDPOINTS.CONTACTS.FILTER,
          { params: filterParams }
        );
        
      } else if (searchTerm.trim()) {
        // Keyword search
        response = await apiClient.get<PaginatedResponse<ContactSubmission>>(
          API_ENDPOINTS.CONTACTS.SEARCH,
          {
            params: {
              keyword: searchTerm.trim(),
              page: currentPage,
              size: pageSize
            }
          }
        );
      } else {
        // Get all contacts
        response = await apiClient.get<PaginatedResponse<ContactSubmission>>(
          API_ENDPOINTS.CONTACTS.BASE,
          {
            params: {
              page: currentPage,
              size: pageSize
            }
          }
        );
      }
      
      const rawData = response.data.content || [];
      setAllContacts(rawData);
      
      // Apply client-side sorting
      const sortedData = sortContactsClientSide(rawData, sortField, sortDirection);
      setContacts(sortedData);
      
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      
    } catch (err: any) {
      console.error('❌ Error fetching contacts:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
      
      setError('Failed to load contacts. Please try again.');
      addToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchKeyword, filters, currentPage, pageSize, sortField, sortDirection, addToast]);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Only debounce keyword search, not filter search
    if (!hasActiveFilters()) {
      debounceRef.current = setTimeout(() => {
        setCurrentPage(0);
        fetchContacts();
      }, 500);
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchKeyword]);

  // Fetch when page changes
  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Client-side sorting effect
  useEffect(() => {
    if (allContacts.length > 0) {
      const sorted = sortContactsClientSide(allContacts, sortField, sortDirection);
      setContacts(sorted);
    }
  }, [allContacts, sortField, sortDirection]);

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const [countRes, recentRes] = await Promise.allSettled([
        apiClient.get(API_ENDPOINTS.CONTACTS.COUNT),
        apiClient.get(API_ENDPOINTS.CONTACTS.RECENT(), { params: { limit: 5 } })
      ]);
      
      if (countRes.status === 'fulfilled') {
        setTotalCount(countRes.value.data || 0);
      }
      
      if (recentRes.status === 'fulfilled') {
        setRecentContacts(recentRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Client-side sort function
  const sortContactsClientSide = (
    data: ContactSubmission[], 
    field: string, 
    direction: 'asc' | 'desc'
  ): ContactSubmission[] => {
    return [...data].sort((a: any, b: any) => {
      let aVal = a[field];
      let bVal = b[field];

      if (field === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useCallback((): boolean => {
    return !!(
      filters.name?.trim() ||
      filters.email?.trim() ||
      filters.phone?.trim() ||
      filters.startDate ||
      filters.endDate ||
      filters.keyword?.trim()
    );
  }, [filters]);

  // Handle Filter Change
  const handleFilterChange = (field: keyof ContactFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Apply Filters with proper date formatting
  const applyFilters = useCallback(() => {
    setCurrentPage(0);
    setSearchKeyword(''); // Clear keyword search when using filters
    fetchContacts();
    addToast('Filters applied', 'success');
  }, [fetchContacts, addToast]);

  // Clear Filters
  const clearFilters = useCallback(() => {
    setFilters({
      name: '',
      email: '',
      phone: '',
      startDate: '',
      endDate: '',
      keyword: ''
    });
    setSearchKeyword('');
    setCurrentPage(0);
    setTimeout(() => fetchContacts(''), 100);
    addToast('Filters cleared', 'info');
  }, [fetchContacts, addToast]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContacts();
    fetchStats();
    addToast('Data refreshed', 'success');
  }, [fetchContacts, addToast]);

  // Delete Contact
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await apiClient.delete(API_ENDPOINTS.CONTACTS.BY_ID(deleteId));
      setDeleteId(null);
      fetchContacts();
      fetchStats();
      addToast('Contact deleted successfully', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      addToast('Failed to delete contact', 'error');
    }
  };

  // Export to CSV
  const handleExport = useCallback(() => {
    if (contacts.length === 0) {
      addToast('No contacts to export', 'error');
      return;
    }
    
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Message', 'Date'];
    const rows = contacts.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.email || ''}"`,
      `"${c.phone}"`,
      `"${c.message.replace(/"/g, '""')}"`,
      new Date(c.createdAt).toLocaleString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Contacts exported', 'success');
  }, [contacts, addToast]);

  // Handle Sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // View Contact Details
  const viewContact = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  // Format Date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateString;
    }
  };

  // Loading State
  if (loading && contacts.length === 0 && !refreshing) {
    return (
      <div className="contacts-loading">
        <div className="spinner"></div>
        <p>Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="contacts-app">
      <ToastNotification toasts={toasts} removeToast={removeToast} />
      
      {/* App-like Header */}
      <div className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Inbox size={20} />
            </div>
            <div>
              <h2>Messages</h2>
              <p className="header-subtitle">{totalCount} total messages</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleRefresh} className="icon-btn" title="Refresh">
              <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            </button>
            <button onClick={handleExport} className="export-btn">
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card-mini total">
          <Users size={20} />
          <div>
            <span className="stat-num">{totalCount}</span>
            <span className="stat-lbl">Total</span>
          </div>
        </div>
        <div className="stat-card-mini recent">
          <Clock size={20} />
          <div>
            <span className="stat-num">{recentContacts.length}</span>
            <span className="stat-lbl">Recent</span>
          </div>
        </div>
        <div className="stat-card-mini page">
          <MessageSquare size={20} />
          <div>
            <span className="stat-num">{totalElements}</span>
            <span className="stat-lbl">This Page</span>
          </div>
        </div>
      </div>

      {/* Search Bar with Live Typing */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            placeholder="Search by name, email, phone or message..."
            value={searchKeyword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchKeyword(e.target.value);
              // Clear filters when typing in search
              if (hasActiveFilters()) {
                clearFilters();
              }
            }}
            className="search-field"
          />
          {searchKeyword && (
            <button 
              onClick={() => {
                setSearchKeyword('');
                setCurrentPage(0);
              }} 
              className="clear-search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className={`filter-toggle ${showFilters ? 'active' : ''} ${hasActiveFilters() ? 'has-filters' : ''}`}
        >
          <Filter size={18} />
          {hasActiveFilters() && <span className="filter-dot" />}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid-2col">
            <div className="filter-field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Filter by name"
                value={filters.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('name', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label>Email</label>
              <input
                type="text"
                placeholder="Filter by email"
                value={filters.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('email', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label>Phone</label>
              <input
                type="text"
                placeholder="Filter by phone"
                value={filters.phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('phone', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label>Keyword in Message</label>
              <input
                type="text"
                placeholder="Search in messages"
                value={filters.keyword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('keyword', e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label>📅 Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('startDate', e.target.value)}
                className="date-input"
              />
            </div>
            <div className="filter-field">
              <label>📅 End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('endDate', e.target.value)}
                className="date-input"
              />
            </div>
          </div>
          <div className="filter-buttons">
            <button onClick={applyFilters} className="apply-btn">
              <Filter size={14} /> Apply Filters
            </button>
            <button onClick={clearFilters} className="clear-btn">
              <X size={14} /> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters() && (
        <div className="active-filters">
          {filters.startDate && (
            <span className="filter-tag">
              📅 From: {filters.startDate}
              <X size={12} onClick={() => {
                handleFilterChange('startDate', '');
              }} />
            </span>
          )}
          {filters.endDate && (
            <span className="filter-tag">
              📅 To: {filters.endDate}
              <X size={12} onClick={() => {
                handleFilterChange('endDate', '');
              }} />
            </span>
          )}
          {filters.name && (
            <span className="filter-tag">
              Name: {filters.name}
              <X size={12} onClick={() => {
                handleFilterChange('name', '');
              }} />
            </span>
          )}
          <button onClick={applyFilters} className="filter-tag apply-tag">
            Apply Now →
          </button>
        </div>
      )}

      {/* Contacts List - Mobile App Style */}
      <div className="contacts-list">
        {loading && refreshing && (
          <div className="list-loader">
            <Loader size={20} className="spinning" /> Loading...
          </div>
        )}
        
        {error && contacts.length === 0 ? (
          <div className="error-state">
            <AlertCircle size={40} />
            <h3>Error Loading Messages</h3>
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-btn">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : contacts.length > 0 ? (
          <>
            {/* Sort Controls */}
            <div className="sort-controls">
              <span className="result-info">{totalElements} messages</span>
              <div className="sort-buttons">
                <button 
                  onClick={() => handleSort('createdAt')} 
                  className={`sort-btn ${sortField === 'createdAt' ? 'active' : ''}`}
                >
                  Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  onClick={() => handleSort('name')} 
                  className={`sort-btn ${sortField === 'name' ? 'active' : ''}`}
                >
                  Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            {/* Contact Cards */}
            {contacts.map((contact) => (
              <div key={contact.id} className="contact-card" onClick={() => viewContact(contact)}>
                <div className="card-avatar">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="card-content">
                  <div className="card-top">
                    <h4 className="card-name">{contact.name}</h4>
                    <span className="card-date">{formatDate(contact.createdAt)}</span>
                  </div>
                  <p className="card-message">
                    {contact.message.length > 80 
                      ? contact.message.substring(0, 80) + '...' 
                      : contact.message}
                  </p>
                  <div className="card-meta">
                    {contact.phone && (
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="meta-item phone-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={13} /> {contact.phone}
                      </a>
                    )}
                    {contact.email && (
                      <span className="meta-item">
                        <Mail size={13} /> {contact.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => viewContact(contact)} 
                    className="card-action-btn view"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => setDeleteId(contact.id)} 
                    className="card-action-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>No Messages Found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="page-nav"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="page-indicators">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`page-dot ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            className="page-nav"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-top">
              <button onClick={() => setShowModal(false)} className="modal-back">
                <ArrowLeft size={20} />
              </button>
              <h3>Message Details</h3>
              <div className="modal-spacer" />
            </div>
            
            <div className="modal-body-content">
              <div className="detail-profile">
                <div className="detail-avatar">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <h4>{selectedContact.name}</h4>
                <span className="detail-id">#{selectedContact.id}</span>
              </div>

              <div className="detail-items">
                {selectedContact.phone && (
                  <a href={`tel:${selectedContact.phone}`} className="detail-row clickable">
                    <Phone size={18} />
                    <div>
                      <label>Phone</label>
                      <p>{selectedContact.phone}</p>
                    </div>
                  </a>
                )}
                {selectedContact.email && (
                  <div className="detail-row">
                    <Mail size={18} />
                    <div>
                      <label>Email</label>
                      <p>{selectedContact.email}</p>
                    </div>
                  </div>
                )}
                <div className="detail-row">
                  <Calendar size={18} />
                  <div>
                    <label>Received</label>
                    <p>{new Date(selectedContact.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="message-block">
                <label>Message</label>
                <p>{selectedContact.message}</p>
              </div>
            </div>

            <div className="modal-bottom">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(selectedContact.id);
                }} 
                className="delete-action"
              >
                <Trash2 size={16} /> Delete Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertCircle size={32} />
            </div>
            <h4>Delete Message?</h4>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button onClick={() => setDeleteId(null)} className="cancel-btn">Cancel</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 