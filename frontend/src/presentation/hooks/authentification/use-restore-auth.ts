import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useRestoreAuth = () => {
  const [isRestoreDone, setIsRestoreDone] = useState(false);
  const { token, user } = useAuthStore();

  useEffect(() => {
    // Token is persisted via zustand/persist — just verify it's coherent
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    setIsRestoreDone(true);
  }, []);

  return { isRestoreDone, user };
};
