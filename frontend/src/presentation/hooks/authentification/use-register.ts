import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AdminRoutesNavigations } from "@/shared/constants/AppRoutesNavigation";

const useRegister = () => {
  const { loading, error, register: storeRegister } = useAuthStore();
  const navigate = useNavigate();

  const register = async (
    email: string,
    password: string,
    nom: string,
    prenom: string
  ) => {
    await storeRegister(email, password, nom, prenom);
    navigate(`/${AdminRoutesNavigations.DASHBOARD}`);
  };

  return { register, loading, error };
};

export default useRegister;
