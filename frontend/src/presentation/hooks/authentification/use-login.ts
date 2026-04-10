import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AdminRoutesNavigations, PublicRoutesNavigation } from '@/shared/constants/AppRoutesNavigation';

const useLogin = () => {
  const { user, loading, error, login: storeLogin, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    await storeLogin(email, password);
    navigate(`/${AdminRoutesNavigations.DASHBOARD}`);
  };

  const logout = () => {
    storeLogout();
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    navigate(PublicRoutesNavigation.MAIN_PAGE);
  };

  return { login, logout, loading, error, user };
};

export default useLogin;
