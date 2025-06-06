import { useContext, createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user fields as needed
}

const defaultUser: User = {
  id: 'demo-user-id',
  name: 'Demo User',
  email: 'demo@example.com',
};

const AuthContext = createContext<{ user: User }>({ user: defaultUser });

export const useAuth = () => useContext(AuthContext); 