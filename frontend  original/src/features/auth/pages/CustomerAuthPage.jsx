import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/store/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CustomerAuthPage = () => {
  const { loadUser } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'verify'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/users/register`, { name: formData.name, email: formData.email, password: formData.password });
      setMessage(res.data.message);
      setMode('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/users/verify-otp`, { email: formData.email, otp: formData.otp });
      await loadUser();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/users/login`, { email: formData.email, password: formData.password, otp: formData.otp });
      await loadUser();
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/users/login`, { email: formData.email, password: formData.password });
      
      if (res.data.requireOTP) {
        setMode('verify-admin');
        setMessage('Admin security code sent to your email.');
        setLoading(false);
        return;
      }

      await loadUser();
      navigate('/');
    } catch (err) {
      if (err.response?.data?.unverified) {
        // User is not verified, let's trigger OTP again
        try {
          await axios.post(`${API_URL}/users/register`, { email: formData.email, password: formData.password });
          setMode('verify');
          setMessage('Please verify your email. A new OTP has been sent.');
        } catch (regErr) {
          setError('Failed to send OTP for verification');
        }
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-base px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-border/50">
        <h2 className="text-3xl font-black font-heading text-heading mb-2 text-center">
          {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Verify email'}
        </h2>
        <p className="text-center text-text-muted mb-8 text-sm">
          {mode === 'login' ? 'Enter your details to sign in.' : mode === 'register' ? 'Sign up to manage your orders.' : `We sent a code to ${formData.email}`}
        </p>

        {error && <div role="alert" aria-live="assertive" className="p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}
        {message && <div role="status" aria-live="polite" className="p-3 mb-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">{message}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : mode === 'verify-admin' ? handleVerifyAdmin : handleVerify} className="space-y-4">
          {(mode === 'login' || mode === 'register') && (
            <>
              {mode === 'register' && (
                <div>
                  <label htmlFor="auth-name" className="block text-sm font-bold text-neutral/70 mb-1">Full Name</label>
                  <input 
                    id="auth-name"
                    type="text" 
                    autoComplete="name"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-base focus:border-primary focus:outline-none" 
                    required 
                  />
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="block text-sm font-bold text-neutral/70 mb-1">Email</label>
                <input 
                  id="auth-email"
                  type="email" 
                  autoComplete="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-base focus:border-primary focus:outline-none" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="block text-sm font-bold text-neutral/70 mb-1">Password</label>
                <input 
                  id="auth-password"
                  type="password" 
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-border bg-base focus:border-primary focus:outline-none" 
                  required 
                />
              </div>
            </>
          )}

          {(mode === 'verify' || mode === 'verify-admin') && (
            <div>
              <label htmlFor="auth-otp" className="block text-sm font-bold text-neutral/70 mb-1">6-Digit Code</label>
              <input 
                id="auth-otp"
                type="text" 
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={formData.otp} 
                onChange={e => setFormData({...formData, otp: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl border border-border bg-base focus:border-primary focus:outline-none text-center tracking-[1em] text-xl font-mono" 
                placeholder="000000"
                required 
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-pill font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up & Send Code' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => { setMode('register'); setError(''); setMessage(''); }} className="text-primary font-bold hover:underline">Sign up</button></p>
          ) : mode === 'register' ? (
            <p>Already have an account? <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="text-primary font-bold hover:underline">Sign in</button></p>
          ) : (
            <p>Wrong email? <button onClick={() => { setMode('login'); setFormData({...formData, otp: ''}); }} className="text-primary font-bold hover:underline">Go back</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthPage;
