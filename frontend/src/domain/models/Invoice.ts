export interface Invoice {
  id: number;
  clientId: number;
  clientName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number; // Total HT
  taxRate: number; // Taux TVA en %
  taxAmount: number; // Montant TVA
  total: number; // Total TTC
  status: "payée" | "en_attente" | "en_retard";
}
