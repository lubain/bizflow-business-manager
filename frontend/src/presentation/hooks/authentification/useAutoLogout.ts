import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PublicRoutesNavigation } from '@/shared/constants/AppRoutesNavigation';

const AUTO_LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes

export default function useAutoLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
      navigate(PublicRoutesNavigation.MAIN_PAGE);
    }, AUTO_LOGOUT_TIME);
  };

  useEffect(() => {
    if (!user) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [user]);
}
