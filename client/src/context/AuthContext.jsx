import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      const looksLikeJwt = (value) =>
        typeof value === 'string' && value.split('.').length === 3;

      if (!savedToken || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        if (looksLikeJwt(savedToken)) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else if (looksLikeJwt(savedUser)) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${savedUser}`,
            },
          });

          if (!response.ok) {
            throw new Error('Invalid saved session');
          }

          const me = await response.json();
          setToken(savedUser);
          setUser(me);
          localStorage.setItem('token', savedUser);
          localStorage.setItem('user', JSON.stringify(me));
        } else {
          throw new Error('Invalid saved session');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
