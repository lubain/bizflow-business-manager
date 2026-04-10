import useAutoLogout from '@/presentation/hooks/authentification/useAutoLogout';
import { ReactNode } from 'react';

export default function AuthWrapper({ children }: { children: ReactNode }) {
  useAutoLogout();
  return <>{children}</>;
}
