// ──────────────────────────────────────────────
// Shared TypeScript types — BizFlow Frontend
// ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ─── Client ───────────────────────────────────
export type ClientType = "individual" | "business";

export interface Client {
  id: string;
  type: ClientType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phone?: string;
  siret?: string;
  vatNumber?: string;
  address: Address;
  notes?: string;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  invoiceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// ─── Product / Stock ──────────────────────────
export type ProductCategory =
  | "electronics"
  | "clothing"
  | "food"
  | "services"
  | "software"
  | "office"
  | "other";

export interface Product {
  id: string;
  reference: string;
  name: string;
  description?: string;
  category: ProductCategory;
  unitPrice: number;
  purchasePrice: number;
  vatRate: number;
  unit: string;
  stockQuantity: number;
  minStock: number;
  isService: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = "in" | "out" | "adjustment" | "return";

export interface StockMovement {
  id: string;
  productId: string;
  product: Pick<Product, "name" | "reference">;
  type: MovementType;
  quantity: number;
  unitPrice?: number;
  reason?: string;
  reference?: string;
  createdAt: string;
}

// ─── Invoice ──────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled" | "overdue";

export interface InvoiceLine {
  id?: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  totalHT: number;
  totalTTC: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  clientId: string;
  client: Pick<
    Client,
    "id" | "firstName" | "lastName" | "companyName" | "email" | "address"
  >;
  lines: InvoiceLine[];
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  notes?: string;
  subtotalHT: number;
  totalVAT: number;
  totalTTC: number;
  totalDiscount: number;
  paymentTerms: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Expense ──────────────────────────────────
export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "salaries"
  | "marketing"
  | "travel"
  | "supplies"
  | "equipment"
  | "software"
  | "insurance"
  | "taxes"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  vatAmount: number;
  vatRate: number;
  date: string;
  status: ExpenseStatus;
  supplier?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ────────────────────────────────
export interface DashboardKPIs {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  expenses: {
    current: number;
    previous: number;
    change: number;
  };
  profit: {
    current: number;
    previous: number;
    change: number;
  };
  invoicesPending: number;
  invoicesPendingAmount: number;
  invoicesOverdue: number;
  invoicesOverdueAmount: number;
  newClients: number;
  lowStockProducts: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  monthlyRevenue: MonthlyRevenue[];
  topClients: Array<{
    client: Pick<Client, "id" | "firstName" | "lastName" | "companyName">;
    total: number;
  }>;
  recentInvoices: Invoice[];
  lowStockProducts: Product[];
}

// ─── Pagination ───────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ─── API Error ────────────────────────────────
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
