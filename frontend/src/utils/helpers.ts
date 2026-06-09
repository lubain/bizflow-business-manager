import { format, parseISO, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  InvoiceStatus,
  ExpenseCategory,
  ProductCategory,
  MovementType,
} from "../types";

// ─── Currency ─────────────────────────────────
export const formatCurrency = (amount: number, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    amount,
  );

export const formatNumber = (n: number, decimals = 2) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

// ─── Date ─────────────────────────────────────
export const formatDate = (date: string | Date) =>
  format(typeof date === "string" ? parseISO(date) : date, "dd/MM/yyyy", {
    locale: fr,
  });

export const formatDateLong = (date: string | Date) =>
  format(typeof date === "string" ? parseISO(date) : date, "dd MMMM yyyy", {
    locale: fr,
  });

export const formatRelativeDate = (date: string | Date) =>
  formatDistanceToNow(typeof date === "string" ? parseISO(date) : date, {
    addSuffix: true,
    locale: fr,
  });

export const formatDateForInput = (date: string | Date) =>
  format(typeof date === "string" ? parseISO(date) : date, "yyyy-MM-dd");

// ─── Percentage change ─────────────────────────
export const formatChange = (change: number) => {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

// ─── Status labels ────────────────────────────
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  cancelled: "Annulée",
  overdue: "En retard",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  overdue: "bg-orange-100 text-orange-700",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: "Loyer",
  utilities: "Charges",
  salaries: "Salaires",
  marketing: "Marketing",
  travel: "Déplacements",
  supplies: "Fournitures",
  equipment: "Équipement",
  software: "Logiciels",
  insurance: "Assurance",
  taxes: "Impôts & taxes",
  other: "Autre",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  electronics: "Électronique",
  clothing: "Vêtements",
  food: "Alimentation",
  services: "Services",
  software: "Logiciels",
  office: "Bureau",
  other: "Autre",
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  in: "Entrée",
  out: "Sortie",
  adjustment: "Ajustement",
  return: "Retour",
};

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  in: "text-green-600",
  out: "text-red-600",
  adjustment: "text-blue-600",
  return: "text-orange-600",
};

// ─── Client display name ──────────────────────
export const getClientDisplayName = (client: {
  type?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}) => {
  if (client.companyName) return client.companyName;
  if (client.firstName || client.lastName) {
    return [client.firstName, client.lastName].filter(Boolean).join(" ");
  }
  return "Client inconnu";
};

// ─── Invoice calculations ─────────────────────
export const calcLineHT = (qty: number, price: number, discount: number) =>
  qty * price * (1 - discount / 100);

export const calcLineTTC = (lineHT: number, vatRate: number) =>
  lineHT * (1 + vatRate / 100);

// ─── cn helper (clsx + tailwind-merge) ───────
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
