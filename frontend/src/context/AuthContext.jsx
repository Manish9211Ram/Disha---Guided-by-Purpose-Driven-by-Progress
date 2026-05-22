import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  // Configure authentication headers and carry out fetch requests
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    
    // Attach authorization token if present
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // If status is 403 (Inactive user or Forbidden), log the user out
        if (response.status === 403 && data.message && data.message.includes('deactivated')) {
          logout();
          alert(data.message);
          throw new Error(data.message);
        }
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (err) {
      console.error(`API Call failed [${endpoint}]:`, err);
      throw err;
    }
  };

  // Verify profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Fetch current user details using profile endpoint
          const userData = await apiCall('/auth/profile');
          setUser(userData);
        } catch (err) {
          console.error('Failed to load user with stored token:', err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        status: data.status
      });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to login');
      setLoading(false);
      return false;
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        status: data.status
      });
      return true;
    } catch (err) {
      setError(err.message || 'Failed to register');
      setLoading(false);
      return false;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setError('');
    setLoading(false);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    apiCall,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
