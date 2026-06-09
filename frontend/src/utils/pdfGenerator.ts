import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice } from "../types";
import { formatCurrency, formatDate, getClientDisplayName } from "./helpers";

// Couleurs BizFlow
const BRAND = [76, 110, 245] as const;
const BRAND_BG = [240, 244, 255] as const;
const GRAY_DARK = [30, 30, 30] as const;
const GRAY_MID = [80, 80, 80] as const;
const GRAY_LIGHT = [120, 120, 120] as const;
const WHITE = [255, 255, 255] as const;

export function generateInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 0;

  // ─── Helper pour appliquer couleur texte ──────
  const setColor = (rgb: readonly number[]) =>
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  const setFill = (rgb: readonly number[]) =>
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setDraw = (rgb: readonly number[]) =>
    doc.setDrawColor(rgb[0], rgb[1], rgb[2]);

  // ══════════════════════════════════════════════
  // HEADER — bandeau bleu pleine largeur
  // ══════════════════════════════════════════════
  setFill(BRAND);
  doc.rect(0, 0, pageW, 36, "F");

  // Logo texte
  setColor(WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BizFlow", margin, 22);

  // Numéro + label FACTURE
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("FACTURE", pageW - margin, 14, { align: "right" });
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.number, pageW - margin, 24, { align: "right" });

  y = 44;

  // ══════════════════════════════════════════════
  // BLOC INFOS — client à gauche, détails à droite
  // ══════════════════════════════════════════════
  const colMid = pageW / 2 + 4;

  // ─ Client
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  setColor(GRAY_LIGHT);
  doc.text("FACTURÉ À", margin, y);

  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  setColor(GRAY_DARK);
  doc.text(getClientDisplayName(invoice.client), margin, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(GRAY_MID);

  const addr = invoice.client.address ?? {};
  const addrLines = [
    addr.street,
    addr.postalCode || addr.city
      ? `${addr.postalCode ?? ""} ${addr.city ?? ""}`.trim()
      : null,
    addr.country && addr.country !== "France" ? addr.country : null,
    invoice.client.email,
  ].filter(Boolean) as string[];

  addrLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 4.5;
  });

  // ─ Détails (droite) — utilise y initial de la section
  const detailsStartY = 49;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  setColor(GRAY_LIGHT);
  doc.text("DÉTAILS", colMid, detailsStartY);

  const details: [string, string][] = [
    ["Date d'émission", formatDate(invoice.issueDate)],
    ["Date d'échéance", formatDate(invoice.dueDate)],
    ["Conditions", `${invoice.paymentTerms ?? 30} jours`],
    ["Statut", invoice.status === "paid" ? "Payée ✓" : "En attente"],
  ];

  details.forEach(([label, value], i) => {
    const dy = detailsStartY + 5 + i * 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(GRAY_MID);
    doc.text(`${label} :`, colMid, dy);
    doc.setFont("helvetica", "bold");
    setColor(GRAY_DARK);
    doc.text(value, pageW - margin, dy, { align: "right" });
  });

  // Ligne de séparation
  y = Math.max(y, detailsStartY + 32) + 4;
  setDraw([220, 220, 230]);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ══════════════════════════════════════════════
  // TABLEAU DES LIGNES
  // ══════════════════════════════════════════════
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      ["Description", "Qté", "Prix unit. HT", "Remise", "TVA", "Total TTC"],
    ],
    body: invoice.lines.map((line) => [
      line.description,
      String(Number(line.quantity)),
      formatCurrency(Number(line.unitPrice)),
      `${Number(line.discount)}%`,
      `${Number(line.vatRate)}%`,
      formatCurrency(Number(line.totalTTC)),
    ]),
    headStyles: {
      fillColor: BRAND as unknown as [number, number, number],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: GRAY_MID as unknown as [number, number, number],
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    alternateRowStyles: {
      fillColor: BRAND_BG as unknown as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: "auto", halign: "left" },
      1: { cellWidth: 14, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
    tableLineColor: [220, 220, 230],
    tableLineWidth: 0.2,
  });

  // ══════════════════════════════════════════════
  // TOTAUX
  // ══════════════════════════════════════════════
  // @ts-ignore — lastAutoTable est ajouté dynamiquement par jspdf-autotable
  const afterTable: number = (doc as any).lastAutoTable?.finalY ?? y + 40;
  const totalsStartY = afterTable + 6;
  const totalsX = pageW - margin - 75;
  const totalsW = 75;

  const rows: [string, string][] = [
    ["Sous-total HT", formatCurrency(Number(invoice.subtotalHT))],
    ["TVA", formatCurrency(Number(invoice.totalVAT))],
  ];
  if (Number(invoice.totalDiscount) > 0) {
    rows.push([
      "Remises",
      `- ${formatCurrency(Number(invoice.totalDiscount))}`,
    ]);
  }

  rows.forEach(([label, value], i) => {
    const dy = totalsStartY + i * 7;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    setColor(GRAY_MID);
    doc.text(label, totalsX, dy);
    doc.text(value, pageW - margin, dy, { align: "right" });
  });

  // Ligne avant total TTC
  const totalTTCY = totalsStartY + rows.length * 7 + 3;
  doc.setLineWidth(0.4);
  setDraw(BRAND);
  doc.line(totalsX, totalTTCY - 2, pageW - margin, totalTTCY - 2);

  // Bandeau Total TTC
  setFill(BRAND);
  doc.roundedRect(totalsX - 2, totalTTCY, totalsW + 2, 11, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  setColor(WHITE);
  doc.text("TOTAL TTC", totalsX + 2, totalTTCY + 7);
  doc.text(
    formatCurrency(Number(invoice.totalTTC)),
    pageW - margin,
    totalTTCY + 7,
    { align: "right" },
  );

  // ══════════════════════════════════════════════
  // NOTES
  // ══════════════════════════════════════════════
  if (invoice.notes) {
    const notesY = totalTTCY + 20;
    setFill([248, 249, 252]);
    doc.roundedRect(margin, notesY - 4, pageW - margin * 2, 18, 2, 2, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    setColor(GRAY_LIGHT);
    doc.text("NOTES", margin + 3, notesY + 1);
    doc.setFont("helvetica", "normal");
    setColor(GRAY_MID);
    doc.text(invoice.notes, margin + 3, notesY + 6, {
      maxWidth: pageW - margin * 2 - 6,
    });
  }

  // ══════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════
  setFill([248, 249, 252]);
  doc.rect(0, pageH - 14, pageW, 14, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  setColor(GRAY_LIGHT);
  doc.text("Merci pour votre confiance  •  BizFlow", pageW / 2, pageH - 5.5, {
    align: "center",
  });
  // Numéro de page
  doc.text(`Page 1`, pageW - margin, pageH - 5.5, { align: "right" });

  // ══════════════════════════════════════════════
  // SAUVEGARDE
  // ══════════════════════════════════════════════
  doc.save(`${invoice.number}.pdf`);
}
