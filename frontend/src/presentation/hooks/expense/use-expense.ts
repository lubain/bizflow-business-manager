import { useExpenseStore } from '@/store/expenseStore';

export const useExpense = () => {
  const { expenses, loading, error, getAll, create, update, remove } = useExpenseStore();
  return { expenses, loading, error, getAll, create, update, remove };
};
