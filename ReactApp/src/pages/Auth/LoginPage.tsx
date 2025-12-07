import React, { useState } from 'react';
import { useAuth } from '@auth/useAuth';
import { axiosInstance } from '@utils/axiosInstance';
import './LoginPage.css';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      fullName: string;
      role: string;
    };
  };
  message?: string;
  errors?: string[];
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post<LoginResponse>('/api/users/authenticate', {
        email: form.email,
        password: form.password
      });

      if (response.data.success && response.data.data?.token) {
        login(response.data.data.token);
      } else {
        setError(response.data.message || 'Giriş başarısız');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors?.length > 0) {
        setError(err.response.data.errors.join(', '));
      } else {
        setError('Giriş sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>İSG Sistemi</h1>
          <h2>Kullanıcı Girişi</h2>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="test-users">
          <h3>Test Kullanıcıları:</h3>
          <p><strong>Admin:</strong> admin@isg.com / admin123</p>
          <p><strong>Manager:</strong> manager@isg.com / manager123</p>
          <p><strong>Employee:</strong> employee@isg.com / employee123</p>
        </div>
      </div>
    </div>
  );
};
