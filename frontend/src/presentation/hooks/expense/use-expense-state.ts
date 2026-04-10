import { useEffect, useState } from "react";
import { useExpense } from "./use-expense";
import { useToast } from "@/presentation/hooks/use-toast";

export const useExpenseState = () => {
  const { expenses, create: addExpense, getAll } = useExpense();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newExp, setNewExp] = useState({
    description: "",
    amount: 0,
    category: "Charges",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    getAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExpense(newExp);
      toast.success("Dépense enregistrée");
      setIsAdding(false);
      setNewExp({
        description: "",
        amount: 0,
        category: "Charges",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout de la dépense");
    }
  };

  return { isAdding, expenses, newExp, setIsAdding, setNewExp, handleSubmit };
};
