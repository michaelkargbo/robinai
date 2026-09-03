import React, { createContext, useContext, useState, useEffect } from "react";
import authService, { User, Profile } from "../services/authService";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, avatarUrl?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.init().then((res) => {
      setUser(res.user);
      setProfile(res.profile);
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    setUser(data.user);
    setProfile(data.profile);
  };

  const register = async (email: string, pass: string, name: string) => {
    const data = await authService.register(email, pass, name);
    setUser(data.user);
    setProfile(data.profile);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (name: string, avatarUrl?: string) => {
    const updated = await authService.updateProfile(name, avatarUrl);
    setProfile(updated);
  };

  const refreshProfile = async () => {
    const data = await authService.fetchCurrentProfile();
    if (data) {
      setUser(data.user);
      setProfile(data.profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
