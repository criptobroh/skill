'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  token: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ token: null, logout: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('skillops_token');
    if (!stored) {
      window.location.href = '/login';
      return;
    }

    // Decode JWT and check expiry
    try {
      const payload = JSON.parse(atob(stored.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('skillops_token');
        window.location.href = '/login';
        return;
      }
    } catch {
      localStorage.removeItem('skillops_token');
      window.location.href = '/login';
      return;
    }

    setToken(stored);
    setChecked(true);
  }, []);

  function logout() {
    localStorage.removeItem('skillops_token');
    window.location.href = '/login';
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1420' }}>
        <div className="animate-spin h-6 w-6 border-2 border-[#4fd1c5] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
