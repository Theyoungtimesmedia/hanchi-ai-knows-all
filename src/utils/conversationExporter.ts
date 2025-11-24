import { jsPDF } from 'jspdf';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
}

export const conversationExporter = {
  exportAsText: (messages: Message[], conversationTitle: string): string => {
    const header = `${conversationTitle}\n${'='.repeat(conversationTitle.length)}\n\n`;
    const content = messages.map((msg) => {
      const role = msg.role === 'user' ? 'You' : 'Hanchi AI';
      return `${role}:\n${msg.content}\n\n`;
    }).join('');
    return header + content;
  },

  exportAsMarkdown: (messages: Message[], conversationTitle: string): string => {
    const header = `# ${conversationTitle}\n\n`;
    const content = messages.map((msg) => {
      const role = msg.role === 'user' ? '**You**' : '**Hanchi AI** 👃🏿';
      return `${role}:\n\n${msg.content}\n\n---\n\n`;
    }).join('');
    return header + content;
  },

  exportAsPDF: async (messages: Message[], conversationTitle: string): Promise<Blob> => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Add title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(conversationTitle, margin, yPosition);
    yPosition += 15;

    // Add messages
    pdf.setFontSize(11);
    messages.forEach((msg, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // Role header
      pdf.setFont('helvetica', 'bold');
      const role = msg.role === 'user' ? 'You' : 'Hanchi AI';
      pdf.text(role + ':', margin, yPosition);
      yPosition += 7;

      // Message content
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(msg.content, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    });

    // Add footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        `Exported from Hanchi AI - Page ${i} of ${totalPages}`,
        margin,
        pageHeight - 10
      );
    }

    return pdf.output('blob');
  },

  downloadFile: (content: string | Blob, filename: string, type: 'text' | 'markdown' | 'pdf') => {
    let blob: Blob;
    let extension: string;

    if (type === 'pdf') {
      blob = content as Blob;
      extension = 'pdf';
    } else {
      const mimeType = type === 'markdown' ? 'text/markdown' : 'text/plain';
      blob = new Blob([content as string], { type: mimeType });
      extension = type === 'markdown' ? 'md' : 'txt';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
