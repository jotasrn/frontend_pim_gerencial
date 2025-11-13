import jsPDF from 'jspdf';
import autoTable, { UserOptions, FontStyle, HAlignType } from 'jspdf-autotable';
// 1. CORREÇÃO: Adicionados os tipos que faltavam
import { Perda, Venda, VendasCategoriaData, TopProdutosData, Produto } from '../types';
import { formatDateTime, formatDate, formatCurrency } from './apiHelpers';
import * as XLSX from 'xlsx';
// 2. CORREÇÃO: Importar o showToast
import { showToast } from '../components/Toast';

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

    // 3. CORREÇÃO: Mudar de doc.autoTable(...) para autoTable(doc, ...)
    autoTable(doc, {
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

export const generateDashboardExcelReport = (
    vendasData: Venda[],
    vendasCatData: VendasCategoriaData[],
    topProdData: TopProdutosData[],
    perdasData: Perda[],
    produtosData: Produto[]
) => {
    try {
        const wsVendasCat = XLSX.utils.json_to_sheet(vendasCatData.map(item => ({
            Categoria: item.categoria,
            'Total Vendido (R$)': item.totalVendido,
        })));

        const wsTopProd = XLSX.utils.json_to_sheet(topProdData.map(item => ({
            Produto: item.nomeProduto,
            'Unidades Vendidas': item.totalVendido,
        })));

        const wsPerdas = XLSX.utils.json_to_sheet(perdasData.map(p => ({
            Produto: p.produto?.nome || `ID ${p.produtoId}`,
            Quantidade: p.quantidade,
            Motivo: p.motivo || 'N/A',
            Data: formatDate(p.dataPerda),
        })));

        const wsProdutos = XLSX.utils.json_to_sheet(produtosData.map(p => ({
            Produto: p.nome,
            Categoria: p.categoria?.nome || 'N/A',
            Estoque: p.estoque?.quantidadeAtual || 0,
            Status: p.ativo ? 'Ativo' : 'Inativo',
            'Data Vencimento': p.dataValidade ? formatDate(p.dataValidade) : 'N/A',
        })));

        const wsVendas = XLSX.utils.json_to_sheet(vendasData.map(v => ({
            'ID Pedido': v.id,
            Cliente: v.cliente?.nomeCompleto || 'N/A',
            Data: formatDateTime(v.dataHora),
            Status: v.statusPedido,
            Pagamento: v.formaPagamento,
            'Valor (R$)': v.valorTotal,
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsVendas, 'Vendas Detalhadas');
        XLSX.utils.book_append_sheet(wb, wsPerdas, 'Perdas Detalhadas');
        XLSX.utils.book_append_sheet(wb, wsProdutos, 'Status Produtos');
        XLSX.utils.book_append_sheet(wb, wsVendasCat, 'Vendas por Categoria');
        XLSX.utils.book_append_sheet(wb, wsTopProd, 'Top Produtos');

        const dataGeracao = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Relatorio_Gerencial_Completo_${dataGeracao}.xlsx`);

    } catch (error) {
        console.error("Erro ao gerar relatório Excel:", error);
        showToast.error("Não foi possível gerar o relatório Excel.");
    }
};