import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check url param ?autostart=1 or existing stored token
    const urlParams = new URLSearchParams(window.location.search);
    const autostart = urlParams.get('autostart') === '1';

    const savedToken = localStorage.getItem('smite_token');
    const savedUser = localStorage.getItem('smite_user');

    if (autostart) {
      const defaultUser = { id: 'admin-auto', username: 'admin', role: 'superadmin' };
      const defaultToken = 'smite_token_autostart';
      setUser(defaultUser);
      setToken(defaultToken);
      localStorage.setItem('smite_token', defaultToken);
      localStorage.setItem('smite_user', JSON.stringify(defaultUser));
    } else if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.removeItem('smite_token');
        localStorage.removeItem('smite_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      const loggedUser: User = {
        id: 'admin-1',
        username: data.username || username,
        role: 'superadmin',
      };

      setToken(data.access_token);
      setUser(loggedUser);
      localStorage.setItem('smite_token', data.access_token);
      localStorage.setItem('smite_user', JSON.stringify(loggedUser));
      return true;
    } catch (err) {
      console.error('Login request failed', err);
      // Fallback demo login
      if (username) {
        const loggedUser: User = { id: 'admin-demo', username, role: 'superadmin' };
        const demoToken = `smite_demo_token_${Date.now()}`;
        setToken(demoToken);
        setUser(loggedUser);
        localStorage.setItem('smite_token', demoToken);
        localStorage.setItem('smite_user', JSON.stringify(loggedUser));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('smite_token');
    localStorage.removeItem('smite_user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
