import { useProductStore } from "@/store/productStore";

export const useProduct = () => {
  const {
    products,
    loading,
    error,
    getAll,
    create,
    update,
    updateStock,
    remove,
  } = useProductStore();
  return {
    products,
    loading,
    error,
    getAll,
    create,
    update,
    updateStock,
    remove,
  };
};
