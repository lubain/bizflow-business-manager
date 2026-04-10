import { useInvoiceStore } from '@/store/invoiceStore';

export const useInvoice = () => {
  const { invoices, loading, error, getAll, create, update, markAsPaid, remove } = useInvoiceStore();
  return { invoices, loading, error, getAll, create, update, markAsPaid, remove };
};
