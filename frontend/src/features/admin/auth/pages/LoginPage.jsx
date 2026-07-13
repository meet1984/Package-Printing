import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/store/useAuth';
import SEO from '../../../../shared/components/SEO';

const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const { login, isAuthenticated, error, loading, loadUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      const result = await login(email, password);
      if (result?.requireOTP) {
        setStep(2);
      }
    } else {
      await login(email, password, otp);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Admin Login" />
      <div className="max-w-md w-full space-y-8 bg-surface p-10 rounded-2xl border border-border shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-black font-display text-neutral">
            {step === 1 ? 'P&P Admin' : 'Security Verification'}
          </h2>
          <p className="mt-2 text-center text-sm text-neutral/60">
            {step === 1 ? 'Sign in to manage your storefront' : `Enter the code sent to ${email}`}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-neutral mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-border placeholder-neutral/30 text-neutral rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-surface transition-shadow"
                    placeholder="admin@pandp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-border placeholder-neutral/30 text-neutral rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-surface transition-shadow"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral mb-1">6-Digit OTP</label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  className="appearance-none relative block w-full px-4 py-3 border border-border placeholder-neutral/30 text-neutral rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center tracking-[1em] font-mono text-xl bg-surface transition-shadow"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-lg hover:shadow-primary/30"
            >
              {loading ? 'Processing...' : step === 1 ? 'Sign in' : 'Verify & Login'}
            </button>
          </div>
          {step === 2 && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-primary font-bold hover:underline"
              >
                Go back
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
