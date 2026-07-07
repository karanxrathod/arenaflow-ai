import { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
}

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  name: 'Operations Commander',
  email: 'ops.lead@fifa2026.org',
  role: 'Operations Super Admin',
  organization: 'FIFA World Cup 2026 - NYNJ Host Committee'
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arenaflow_profile');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse user profile:', e);
        }
      }
    }
    return defaultProfile;
  });

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev: UserProfile) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('arenaflow_profile', JSON.stringify(next));
      return next;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
