import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AppUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserCredentials: (userId: string, username: string, password: string) => void;
  addUser: (username: string, password: string, role: UserRole) => void;
  deleteUser: (userId: string) => boolean;
  getUsers: () => Omit<AppUser, 'password'>[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo users
const DEFAULT_USERS: AppUser[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', role: 'user' },
];

const USERS_STORAGE_KEY = 'dahira_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dahira_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  // Persist users to localStorage
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
      };
      setUser(userData);
      localStorage.setItem('dahira_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('dahira_user');
  }, []);

  const updateUserCredentials = useCallback((userId: string, username: string, password: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, username, password } : u
    ));
    
    // Update current user session if it's the same user
    if (user && user.id === userId) {
      const updatedUser = { ...user, username };
      setUser(updatedUser);
      localStorage.setItem('dahira_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const addUser = useCallback((username: string, password: string, role: UserRole) => {
    const newUser: AppUser = {
      id: Date.now().toString(),
      username,
      password,
      role,
    };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const deleteUser = useCallback((userId: string): boolean => {
    // Cannot delete the main admin
    if (userId === '1') return false;
    setUsers(prev => prev.filter(u => u.id !== userId));
    return true;
  }, []);

  const getUsers = useCallback((): Omit<AppUser, 'password'>[] => {
    return users.map(({ password, ...rest }) => rest);
  }, [users]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      updateUserCredentials,
      addUser,
      deleteUser,
      getUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
