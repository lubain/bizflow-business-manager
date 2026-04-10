import { useEffect, useState } from "react";
import { useClient } from "./use-client";
import { useToast } from "@/presentation/hooks/use-toast";

export const useClientState = () => {
  const { clients, create: addClient, getAll } = useClient();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    getAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClient(newClient);
      toast.success("Client ajouté avec succès");
      setIsAdding(false);
      setNewClient({ name: "", email: "", phone: "", address: "" });
    } catch (err) {
      toast.error(err.message || "Erreur lors de la création du client");
    }
  };

  return {
    isAdding,
    clients,
    newClient,
    setIsAdding,
    setNewClient,
    handleSubmit,
  };
};
