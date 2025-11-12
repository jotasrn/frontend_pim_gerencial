import jsPDF from 'jspdf';
import autoTable, { UserOptions, FontStyle, HAlignType } from 'jspdf-autotable';
import { Perda, Venda } from '../types';
import { formatDateTime, formatDate, formatCurrency } from './apiHelpers';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: UserOptions) => jsPDF;
        lastAutoTable: {
            finalY: number;
        };
    }
}

export const generatePerdaReport = (
    perdasFiltradas: Perda[],
    tipo: 'Mensal' | 'Anual',
    periodo: string
) => {
    const doc = new jsPDF() as jsPDF;
    const title = `Relatório de Perdas - ${tipo} (${periodo})`;
    const dataGeracao = formatDateTime(new Date().toISOString());

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
    [{
        content: 'Total de Itens Perdidos:',
        colSpan: 2,
        styles: { fontStyle: 'bold' as FontStyle, halign: 'right' as HAlignType }
    },

    {
        content: totalPerdido,
        styles: { fontStyle: 'bold' as FontStyle }
    },
    { content: '', colSpan: 2 }],
];


    autoTable(doc, {
        startY: 40,
        head: head,
        body: body,
        foot: tfoot,
        theme: 'striped',
        headStyles: {
            fillColor: [239, 68, 68]
        },
        footStyles: {
            fontStyle: 'bold' as FontStyle,
            fillColor: [240, 240, 240]
        },
    });
    doc.save(`Relatorio_Perdas_${tipo}_${periodo}.pdf`);
};

export const generateVendasReport = (vendas: Venda[], periodo: string) => {
    const doc = new jsPDF() as jsPDF;
    const dataGeracao = formatDateTime(new Date().toISOString());

    doc.setFontSize(18);
    doc.text('Relatório de Vendas', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Período: ${periodo}`, 14, 28);
    doc.text(`Gerado em: ${dataGeracao}`, 14, 34);

    const tableColumn = ["ID Pedido", "Data", "Cliente", "Forma Pgto", "Status", "Valor Total"];
    const tableRows: (string | number)[][] = [];

    let valorTotalPeriodo = 0;

    vendas.forEach(venda => {
        const vendaData = [
            `#${venda.id}`,
            formatDateTime(venda.dataHora),
            venda.cliente?.nomeCompleto || 'N/A',
            venda.formaPagamento,
            venda.statusPedido.replace('_', ' '),
            formatCurrency(venda.valorTotal)
        ];
        tableRows.push(vendaData);
        valorTotalPeriodo += venda.valorTotal;
    });

    doc.autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [38, 166, 154] }
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Valor Total no Período:', 14, finalY + 15);
    doc.text(formatCurrency(valorTotalPeriodo), 200, finalY + 15, { align: 'right' });

    doc.save(`Relatorio_Vendas_${periodo}.pdf`);
};