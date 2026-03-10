import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, username?: string) => {
      setLoading(true);
      try {
        const response = await authAPI.signup({ email, password, username });
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Account created successfully!');
        router.push('/dashboard');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Signup failed';
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const signin = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const response = await authAPI.signin({ email, password });
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Signed in successfully!');
        router.push('/dashboard');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Sign in failed';
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    router.push('/');
  }, [router]);

  return {
    user,
    loading,
    isAuthenticated,
    signup,
    signin,
    logout,
  };
}
