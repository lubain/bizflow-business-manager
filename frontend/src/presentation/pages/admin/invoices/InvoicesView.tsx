import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { Select } from "@/presentation/components/ui/Select";
import { Client, Product } from "@/domain/models";
import { useInvoiceState } from "@/presentation/hooks/invoice/use-invoice-state";
import ListDataGrid from "@/presentation/components/common/listDataGrid/ListDataGrid";

const TAX_OPTIONS = [
  { value: 20, label: "20 %" },
  { value: 10, label: "10 %" },
  { value: 5.5, label: "5.5 %" },
  { value: 0, label: "0 %" },
];

export default function InvoicesView() {
  const {
    view,
    cart,
    selectedClient,
    clients,
    currentProduct,
    products,
    qty,
    invoices,
    enableTax,
    taxRate,
    issueDate,
    dueDate,
    setIssueDate,
    setDueDate,
    setTaxRate,
    setEnableTax,
    setCurrentProduct,
    setQty,
    setView,
    setSelectedClient,
    addToCart,
    removeFromCart,
    handleSaveInvoice,
  } = useInvoiceState();

  if (view === "create") {
    const subtotal = cart.reduce((a, i) => a + i.total, 0);
    const taxAmt = enableTax ? subtotal * (taxRate / 100) : 0;
    const total = subtotal + taxAmt;

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="animate-fade-up flex items-center gap-4">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-white dark:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} /> Retour
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white dark:text-white">
            Nouvelle facture
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Client */}
            <div
              className="animate-fade-up bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
              style={{ animationDelay: ".05s" }}
            >
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
                <div className="h-7 w-7 gradient-blue rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-black">1</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white dark:text-white text-sm">
                  Sélectionner le client
                </h3>
              </div>
              <div className="p-6">
                <Select
                  placeholder="— Choisir un client —"
                  value={selectedClient}
                  onChange={setSelectedClient}
                  options={clients.map((c: Client) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                />
              </div>
            </div>

            {/* Step 2: Products */}
            <div
              className="animate-fade-up bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
              style={{ animationDelay: ".1s" }}
            >
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
                <div className="h-7 w-7 gradient-blue rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-black">2</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white dark:text-white text-sm">
                  Ajouter des produits
                </h3>
                {cart.length > 0 && (
                  <div className="ml-auto flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <ShoppingCart size={12} />
                    {cart.length} article{cart.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3 items-end">
                  <Select
                    label="Produit"
                    placeholder="— Choisir —"
                    value={currentProduct}
                    onChange={setCurrentProduct}
                    containerClassName="flex-1"
                    options={products.map((p: Product) => ({
                      value: p.id,
                      label: `${p.name} — ${Number(p.price).toLocaleString("fr-FR")} €`,
                    }))}
                  />
                  <Input
                    label="Qté"
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e: any) => setQty(parseInt(e.target.value) || 1)}
                    containerClassName="w-20"
                  />
                  <Button onClick={addToCart} disabled={!currentProduct}>
                    Ajouter
                  </Button>
                </div>

                {cart.length > 0 && (
                  <div className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700 dark:bg-slate-900">
                        <tr>
                          {["Désignation", "Qté", "PU HT", "Total HT", ""].map(
                            (h, i) => (
                              <th
                                key={i}
                                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wide"
                              >
                                {h}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {cart.map((item) => (
                          <tr
                            key={item.productId}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-slate-700 dark:bg-slate-900 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-white dark:text-white">
                              {item.productName}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {item.unitPrice.toLocaleString("fr-FR")} €
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                              {item.total.toLocaleString("fr-FR")} €
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {cart.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500 gap-2 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                    <ShoppingCart size={28} className="opacity-30" />
                    <p className="text-sm">Ajoutez des produits à la facture</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="animate-fade-up" style={{ animationDelay: ".15s" }}>
            <div className="sticky top-24 gradient-sidebar rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-white/10 rounded-lg flex items-center justify-center">
                    <Receipt size={15} className="text-white" />
                  </div>
                  <h3 className="font-bold text-white">Résumé</h3>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
                      Émission
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-white px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
                      Échéance
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-white px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* TVA toggle */}
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold">
                      TVA
                    </span>
                    <div
                      className={`toggle-track ${enableTax ? "on" : ""}`}
                      onClick={() => setEnableTax((e) => !e)}
                    >
                      <div className="toggle-thumb" />
                    </div>
                  </div>
                  {enableTax && (
                    <Select
                      value={taxRate}
                      onChange={(v) => setTaxRate(Number(v))}
                      options={TAX_OPTIONS}
                      className="bg-white/10 border-white/10 text-white text-xs py-1.5"
                    />
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Sous-total HT</span>
                    <span>{subtotal.toLocaleString("fr-FR")} €</span>
                  </div>
                  {enableTax && (
                    <div className="flex justify-between text-slate-300 text-sm">
                      <span>TVA ({taxRate} %)</span>
                      <span>{taxAmt.toLocaleString("fr-FR")} €</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white font-bold">Total TTC</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {total.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSaveInvoice}
                  disabled={!selectedClient || cart.length === 0}
                  className="w-full py-3.5 gradient-blue rounded-xl font-bold text-white shadow-lg shadow-blue-900/40 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Save size={17} /> Valider la facture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white dark:text-white">
            Facturation
          </h2>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm mt-0.5">
            {invoices.length} facture{invoices.length !== 1 ? "s" : ""} émise
            {invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setView("create")}>
          Créer une facture
        </Button>
      </div>
      <div className="animate-fade-up" style={{ animationDelay: ".05s" }}>
        <ListDataGrid type="invoice" data={[...invoices].reverse()} />
      </div>
    </div>
  );
}
