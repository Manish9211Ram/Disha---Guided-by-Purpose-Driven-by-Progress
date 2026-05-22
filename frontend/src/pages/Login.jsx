import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, user, setError } = useAuth();
  const navigate = useNavigate();

  // Clear errors on page load
  useEffect(() => {
    setError('');
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card glass-panel glass-card-glow">
        <div className="auth-header">
          <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Shield size={32} className="text-primary" style={{ stroke: 'url(#primary-glow-grad)' }} />
            <span>Disha</span>
          </div>
          <svg width="0" height="0">
            <linearGradient id="primary-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </svg>
          <p>Guided by Purpose, Driven by Progress</p>
        </div>

        {error && (
          <div className="alert alert-danger animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                id="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                id="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account? </span>
          <Link to="/register">Create one here</Link>
        </div>

        <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.8rem', color: '#64748b' }}>
          <div style={{ fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>Demo Credentials:</div>
          <div>Admin: <strong style={{ color: '#818cf8' }}>admin@example.com</strong> / admin123</div>
          <div>User: <strong style={{ color: '#818cf8' }}>user@example.com</strong> / user123</div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
