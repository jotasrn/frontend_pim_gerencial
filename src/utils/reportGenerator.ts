import jsPDF from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';
import { Perda } from '../types';
import { formatDateTime, formatDate } from './apiHelpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AutoTableOptions extends Record<string, any> {
 startY?: number;
 head?: string[][];
 body?: (string | number | { content: string | number; colSpan?: number; styles?: Record<string, unknown> })[][];
 theme?: 'striped' | 'grid' | 'plain';
 headStyles?: {
  fillColor: [number, number, number];
 };
 footStyles?: {
  fontStyle: string;
 };
 didDrawCell?: (data: CellHookData) => void;
}

declare module 'jspdf' {
 interface jsPDF {
  autoTable: (options: AutoTableOptions) => jsPDF;
 }
}

export const generatePerdaReport = (
 perdasFiltradas: Perda[],
 tipo: 'Mensal' | 'Anual',
 periodo: string
) => {
 const doc = new jsPDF();
 const title = `Relatório de Perdas - ${tipo} (${periodo})`;
 const dataGeracao = formatDateTime(new Date());

 doc.setFontSize(18);
 doc.text(title, 14, 22);

 doc.setFontSize(10);
 doc.text(`Gerado em: ${dataGeracao}`, 14, 30);

 const head = [['ID', 'Produto', 'Quantidade', 'Motivo', 'Data']];

 const body: (string | number)[][] = perdasFiltradas.map(p => [
  p.id,
  p.produto?.nome || `ID: ${p.produtoId}`,
  p.quantidade,
  p.motivo || '-',
  formatDate(p.dataPerda),
 ]);

 const totalPerdido = perdasFiltradas.reduce((sum, p) => sum + p.quantidade, 0);

 const tfoot = [
  { content: 'Total', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
  { content: totalPerdido, styles: { fontStyle: 'bold' } },
  { content: '', colSpan: 2, styles: {} },
 ];
 
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 (body as any[]).push(tfoot);

 autoTable(doc, {
  startY: 40,
  head: head,
  body: body,
  theme: 'striped',
  headStyles: {
   fillColor: [239, 68, 68]
  },
  footStyles: {
   fontStyle: 'bold',
  },
  didDrawCell: (data: CellHookData) => {
   if (data.section === 'body' && data.row.index === (body.length - 1)) {
    if (data.column.index === 1 || data.column.index > 2) {
     if (data.cell.styles) {
      data.cell.styles.fillColor = false;
      data.cell.styles.lineWidth = 0;
     }
    }
   }
  }
 });
 doc.save(`Relatorio_Perdas_${tipo}_${periodo}.pdf`);
};