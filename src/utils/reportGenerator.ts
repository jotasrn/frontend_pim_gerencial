import jsPDF from 'jspdf';
import autoTable, { UserOptions, FontStyle, HAlignType, RowInput } from 'jspdf-autotable';
import { Perda, Venda, VendasCategoriaData, TopProdutosData, Produto } from '../types';
import { formatDateTime, formatDate, formatCurrency } from './apiHelpers';
import * as XLSX from 'xlsx';
import { showToast } from '../components/Toast';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// --- FUNÇÕES AUXILIARES DE ESTILO (Cabeçalho e Rodapé) ---
const addHeader = (doc: jsPDF, title: string, periodo: string, usuario: string = 'Sistema') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const dateGen = formatDateTime(new Date().toISOString());

  // Fundo do Cabeçalho
  doc.setFillColor(245, 245, 245); // Cinza claro
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Título da Empresa
  doc.setFontSize(22);
  doc.setTextColor(34, 197, 94); // Verde do Hortifruti
  doc.setFont('helvetica', 'bold');
  doc.text("HortiFruti Gestão", 14, 18);

  // Título do Relatório
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(title, 14, 28);

  // Linha Divisória
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 35, pageWidth - 14, 35);

  // Metadados (Direita)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  const rightMargin = pageWidth - 14;
  doc.text(`Gerado por: ${usuario}`, rightMargin, 15, { align: 'right' });
  doc.text(`Emissão: ${dateGen}`, rightMargin, 20, { align: 'right' });
  if (periodo) {
      doc.text(`Período: ${periodo}`, rightMargin, 25, { align: 'right' });
  }
};

const addFooter = (doc: jsPDF, pageNumber: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("HortiFruti Gestão - Documento Confidencial", 14, pageHeight - 10);
  doc.text(`Página ${pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
};

// --- 1. RELATÓRIO DE PERDAS (Individual) ---
export const generatePerdaReport = (
  perdasFiltradas: Perda[],
  tipo: 'Mensal' | 'Anual',
  periodo: string
) => {
  const doc = new jsPDF();
  const title = `Relatório de Perdas - ${tipo}`;
  
  addHeader(doc, title, periodo, 'Estoquista');

  const head = [['ID', 'Produto', 'Quantidade', 'Motivo', 'Data']];
  const body = perdasFiltradas.map(p => [
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
    startY: 45,
    head: head,
    body: body as RowInput[],
    foot: tfoot as RowInput[],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] }, // Vermelho
    footStyles: { fontStyle: 'bold' as FontStyle, fillColor: [240, 240, 240] },
    didDrawPage: () => {
        addHeader(doc, title, periodo, 'Estoquista');
        addFooter(doc, doc.getNumberOfPages());
    }
  });
  
  doc.save(`Relatorio_Perdas_${tipo}_${periodo}.pdf`);
};

// --- 2. RELATÓRIO DE VENDAS (Individual) ---
export const generateVendasReport = (vendas: Venda[], periodo: string) => {
  const doc = new jsPDF();
  
  addHeader(doc, 'Relatório de Vendas', periodo, 'Gerente');

  const tableColumn = ["ID", "Data", "Cliente", "Forma Pgto", "Status", "Valor Total"];
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

  autoTable(doc, {
    startY: 45,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [38, 166, 154] },
    didDrawPage: () => {
        addHeader(doc, 'Relatório de Vendas', periodo, 'Gerente');
        addFooter(doc, doc.getNumberOfPages());
    }
  });

  const finalY = doc.lastAutoTable.finalY || 50;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Valor Total no Período: ${formatCurrency(valorTotalPeriodo)}`, 14, finalY + 10);

  doc.save(`Relatorio_Vendas_${periodo}.pdf`);
};

// --- 3. RELATÓRIO GERENCIAL COMPLETO (Gráficos + Tabelas) ---
export const generateRelatorioGerencialPDF = (
  chartsImage: string | null,
  vendas: Venda[],
  perdas: Perda[],
  periodoDescricao: string,
  usuarioNome: string
) => {
  const doc = new jsPDF();

  // 1. CAPA / GRÁFICOS
  addHeader(doc, "Relatório Gerencial Completo", periodoDescricao, usuarioNome);
  
  let currentY = 50;

  if (chartsImage) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text("1. Visão Geral Gráfica", 14, currentY);
    
    currentY += 5;
    const imgProps = doc.getImageProperties(chartsImage);
    const pdfWidth = doc.internal.pageSize.getWidth() - 28;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    doc.addImage(chartsImage, 'PNG', 14, currentY, pdfWidth, pdfHeight);
    currentY += pdfHeight + 10;
  }

  // 2. TABELA DE VENDAS
  if (currentY > 250) { doc.addPage(); currentY = 50; } 
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("2. Detalhamento de Vendas", 14, currentY);
  currentY += 5;

  const vendasRows = vendas.map(v => [
    `#${v.id}`,
    formatDateTime(v.dataHora),
    v.cliente?.nomeCompleto || 'Cliente Balcão',
    v.formaPagamento,
    v.statusPedido.replace('_', ' '),
    formatCurrency(v.valorTotal)
  ]);

  const totalVendas = vendas.reduce((acc, v) => acc + v.valorTotal, 0);

  autoTable(doc, {
    startY: currentY,
    head: [["ID", "Data", "Cliente", "Pagamento", "Status", "Valor"]],
    body: vendasRows,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    foot: [[
        { content: 'Total do Período:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' as FontStyle } },
        { content: formatCurrency(totalVendas), styles: { fontStyle: 'bold' as FontStyle } }
    ]],
    margin: { top: 45 },
    didDrawPage: () => {
      addHeader(doc, "Relatório Gerencial - Vendas", periodoDescricao, usuarioNome);
    }
  });

  // 3. TABELA DE PERDAS
  let finalY = doc.lastAutoTable.finalY + 15;
  if (finalY > 270) { doc.addPage(); finalY = 50; }
  
  doc.setFontSize(12);
  doc.text("3. Registro de Perdas", 14, finalY);
  
  const perdasRows = perdas.map(p => [
    p.produto?.nome || `ID ${p.produtoId}`,
    p.quantidade,
    p.motivo || 'N/A',
    formatDate(p.dataPerda)
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Produto", "Qtd", "Motivo", "Data"]],
    body: perdasRows,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    margin: { top: 45 },
  });

  // Numeração de Páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  doc.save(`Relatorio_Gerencial_Hortifruti_${formatDate(new Date())}.pdf`);
};

// --- 4. EXCEL ---
export const generateDashboardExcelReport = (
  vendasData: Venda[],
  vendasCatData: VendasCategoriaData[],
  topProdData: TopProdutosData[],
  perdasData: Perda[],
  produtosData: Produto[]
) => {
  try {
    const wsVendas = XLSX.utils.json_to_sheet(vendasData.map(v => ({
      'ID': v.id,
      'Data': formatDateTime(v.dataHora),
      'Cliente': v.cliente?.nomeCompleto || 'N/A',
      'Pagamento': v.formaPagamento,
      'Status': v.statusPedido,
      'Total (R$)': v.valorTotal
    })));

    const wsPerdas = XLSX.utils.json_to_sheet(perdasData.map(p => ({
      'Produto': p.produto?.nome || p.produtoId,
      'Quantidade': p.quantidade,
      'Motivo': p.motivo,
      'Data': formatDate(p.dataPerda)
    })));

    const wsTopProdutos = XLSX.utils.json_to_sheet(topProdData.map(t => ({
      'Produto': t.nomeProduto,
      'Vendas (Unid.)': t.totalVendido
    })));

    const wsVendasCat = XLSX.utils.json_to_sheet(vendasCatData.map(c => ({
      'Categoria': c.categoria,
      'Total Vendido (R$)': c.totalVendido
    })));
    
    const wsProdutosStatus = XLSX.utils.json_to_sheet(produtosData.map(p => ({
        'Produto': p.nome,
        'Categoria': p.categoria?.nome,
        'Estoque': p.estoque?.quantidadeAtual,
        'Status': p.ativo ? 'Ativo' : 'Inativo'
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsVendas, "Vendas");
    XLSX.utils.book_append_sheet(wb, wsPerdas, "Perdas");
    XLSX.utils.book_append_sheet(wb, wsTopProdutos, "Top Produtos");
    XLSX.utils.book_append_sheet(wb, wsVendasCat, "Por Categoria");
    XLSX.utils.book_append_sheet(wb, wsProdutosStatus, "Status Produtos");

    const dataStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Relatorio_Dados_Hortifruti_${dataStr}.xlsx`);
    showToast.success("Excel gerado com sucesso!");

  } catch (error) {
    console.error("Erro ao gerar Excel:", error);
    showToast.error("Erro ao gerar arquivo Excel.");
  }
};