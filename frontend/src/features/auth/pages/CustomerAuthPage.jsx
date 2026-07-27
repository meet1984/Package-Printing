import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/store/useAuth';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CustomerAuthPage = () => {
  const { loadUser } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login', 'register', 'verify', 'verify-admin'
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
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[420px] bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-black/5 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 mb-2 tracking-tight">
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Verify email'}
          </h2>
          <p className="text-gray-500 text-sm">
            {mode === 'login' ? 'Enter your details to sign in.' 
              : mode === 'register' ? 'Sign up to manage your orders.' 
              : `We sent a code to ${formData.email}`}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div role="alert" aria-live="assertive" className="p-3.5 mb-6 bg-danger-bg text-red-700 rounded-lg text-sm border border-red-200 font-medium">
            {error}
          </div>
        )}
        {message && (
          <div role="status" aria-live="polite" className="p-3.5 mb-6 bg-success-bg text-green-700 rounded-lg text-sm border border-green-200 font-medium">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : mode === 'verify-admin' ? handleVerifyAdmin : handleVerify} className="space-y-4">
          {(mode === 'login' || mode === 'register') && (
            <>
              {mode === 'register' && (
                <Input
                  label="Full Name"
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              )}
              <Input
                label="Email"
                id="auth-email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
              <Input
                label="Password"
                id="auth-password"
                type="password"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </>
          )}

          {(mode === 'verify' || mode === 'verify-admin') && (
            <div className="mb-6">
              <label htmlFor="auth-otp" className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
              <input 
                id="auth-otp"
                type="text" 
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={formData.otp} 
                onChange={e => setFormData({...formData, otp: e.target.value})} 
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white focus:outline-none transition-all text-center tracking-[1em] text-2xl font-mono" 
                placeholder="000000"
                required 
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...
              </>
            ) : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up & Send Code' : 'Verify Code'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <p>Don't have an account? <button onClick={() => { setMode('register'); setError(''); setMessage(''); }} className="text-brand font-semibold hover:underline">Sign up</button></p>
          ) : mode === 'register' ? (
            <p>Already have an account? <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="text-brand font-semibold hover:underline">Sign in</button></p>
          ) : (
            <p>Wrong email? <button onClick={() => { setMode('login'); setFormData({...formData, otp: ''}); }} className="text-brand font-semibold hover:underline">Go back</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAuthPage;
