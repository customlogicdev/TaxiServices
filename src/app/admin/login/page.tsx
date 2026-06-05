'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Info,
  LogIn,
  CheckCircle
} from 'lucide-react';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import './login.css';

// ✅ STATIC DEFAULT CREDENTIALS (Fallback if API is not available)
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ==========================================
      // Step 1: Try API Login First
      // ==========================================
      const response = await fetch(API_ENDPOINTS.ADMIN.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      // ==========================================
      // Step 2: If API Login Successful
      // ==========================================
      if (response.ok) {
        const data = await response.json();
        
        // Save auth data from API response
        localStorage.setItem('auth_token', data.sessionToken || 'api-admin-token');
        localStorage.setItem('admin_user', JSON.stringify({
          id: data.id,
          username: data.username,
          lastLogin: data.lastLogin,
        }));

        setSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.replace('/admin/dashboard');
        }, 500);
        return;
      }

      // ==========================================
      // Step 3: If API Fails, Try Default Credentials
      // ==========================================
      if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        // Save static auth data
        localStorage.setItem('auth_token', 'static-admin-token-12345');
        localStorage.setItem('admin_user', JSON.stringify({
          id: 1,
          username: DEFAULT_USERNAME,
          role: 'admin'
        }));

        setSuccess('Login successful with default credentials! Redirecting...');
        
        setTimeout(() => {
          router.replace('/admin/dashboard');
        }, 500);
        return;
      }

      // ==========================================
      // Step 4: Both API and Default Failed
      // ==========================================
      const errorText = await response.text();
      setError(errorText || 'Invalid username or password');

    } catch (error) {
      // ==========================================
      // Step 5: Network Error - Try Default
      // ==========================================
      console.log('API not available, trying default credentials...');
      
      if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        localStorage.setItem('auth_token', 'static-admin-token-12345');
        localStorage.setItem('admin_user', JSON.stringify({
          id: 1,
          username: DEFAULT_USERNAME,
          role: 'admin'
        }));

        setSuccess('Logged in with default credentials (API offline)');
        
        setTimeout(() => {
          router.replace('/admin/dashboard');
        }, 500);
      } else {
        setError('Unable to connect to server. Use default credentials: admin / admin123');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page"> 
      {/* Background decorative elements */}
      <div className="login-bg-shapes">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div> 



      

      <div className="login-container">
        {/* Login Card */}
        <div className="login-card">
          {/* Logo Section */}
          <div className="login-logo-section">
            <div className="login-logo-icon">
              <Car size={28} />
            </div>
            <h1 className="login-title">Rudra Taxi Services</h1>
            {/* <p className="login-subtitle">Admin Dashboard</p> */}
          </div>

          {/* Welcome Text */}
          <div className="login-welcome">
            <h2 className="welcome-title">Welcome Back</h2>
            <p className="welcome-text">Sign in with your admin credentials</p>
          </div>

          {/* Default Credentials Info */}
      

          {/* Error Message */}
          {error && (
            <div className="login-error-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="login-success-box">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Username Field */}
            <div className="form-field">
              <label className="field-label" htmlFor="username">Username</label>
              <div className="field-input-wrapper">
                <User size={18} className="field-icon" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Enter your username"
                  className="field-input"
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-input-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Enter your password"
                  className="field-input"
                  disabled={loading}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleLogin(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
         
          {/* Footer */}
          <div className="login-footer">
            <p>© {new Date().getFullYear()} Rudrabannataxiservices. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}