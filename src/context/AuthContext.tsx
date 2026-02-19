
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { loginUser, registerUser, updateUser } from '@/utils/db';
import { isAdminAccount, getAdminName } from '@/utils/adminAccounts';
import { profileEndpoint } from '@/types/APIs';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone?: string, age?: number, height?: number, weight?: number, strongFoot?: 'Left' | 'Right', position?: string, role?: UserRole) => Promise<User>;
  updateProfile: (name: string, profileImageUrl?: string, role?: UserRole) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('profile');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Check if this is an admin account
      if (isAdminAccount(email, password)) {
        const adminName = getAdminName(email);
        const adminUser: User = {
          id: `admin-${email}`,
          email,
          name: adminName || 'Admin',
          passwordHash: password,
          role: 'ADMIN',
          country: 'EG', // Egypt by default for admins
          createdAt: Date.now()
        };
        setUser(adminUser);
        localStorage.setItem('elkawera_user', JSON.stringify(adminUser));
        return;
      }

      // Regular user login
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
      localStorage.setItem('elkawera_user', JSON.stringify(loggedInUser));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    age?: number,
    height?: number,
    weight?: number,
    strongFoot?: 'Left' | 'Right',
    position?: string,
    role: UserRole = 'PLAYER'
  ) => {
    setLoading(true);
    try {
      const newUser = await registerUser(name, email, password, phone, age, height, weight, strongFoot, position, role);
      setUser(newUser);
      localStorage.setItem('elkawera_user', JSON.stringify(newUser));
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    const profile = profileEndpoint();
    localStorage.removeItem('profile');
    localStorage.setItem('profile',JSON.stringify(profile))
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
  };
  
  const getAccessToken = () => {
    return localStorage.getItem('token');
  }
  const setAccessToken = (token: string) => {
    localStorage.setItem('token', token);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, updateProfile, signOut, getAccessToken, setAccessToken }}>
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

