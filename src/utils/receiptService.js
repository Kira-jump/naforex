import jsPDF from 'jspdf';

const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime Video' };
const serviceColors = { netflix: [229, 9, 20], spotify: [29, 185, 84], prime: [0, 168, 225] };

export const generateReceipt = (client, service, compte, isRenewal = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const color = serviceColors[service.service] || [124, 58, 237];

  // Header bande couleur
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo texte NaforeX
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NaforeX', 15, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 200);
  doc.text('STREAMING MANAGER', 15, 32);

  // Titre reçu
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(isRenewal ? 'REÇU DE RENOUVELLEMENT' : "REÇU D'ABONNEMENT", pageWidth - 15, 25, { align: 'right' });

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 200);
  doc.text(dateStr, pageWidth - 15, 32, { align: 'right' });

  // Bande service colorée
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(0, 45, pageWidth, 3, 'F');

  let y = 65;

  // Badge service
  doc.setFillColor(color[0], color[1], color[2], 0.15);
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.roundedRect(15, y - 8, 50, 12, 2, 2, 'S');
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(serviceLabels[service.service], 40, y, { align: 'center' });

  y += 20;

  // Infos client
  doc.setTextColor(80, 80, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CLIENT', 15, y);
  y += 7;
  doc.setTextColor(20, 20, 30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(client.nom, 15, y);
  y += 6;
  if (client.whatsapp) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 100);
    doc.text(`WhatsApp: ${client.whatsapp}`, 15, y);
    y += 10;
  } else {
    y += 6;
  }

  // Ligne séparation
  doc.setDrawColor(230, 230, 235);
  doc.line(15, y, pageWidth - 15, y);
  y += 12;

  // Détails abonnement - tableau simple
  const rows = [
    ['Service', serviceLabels[service.service]],
    ['Compte', compte ? compte.nom : '-'],
    ['Prix', service.prix ? `${Number(service.prix).toLocaleString()} GNF` : '-'],
    ['Date de début', new Date().toLocaleDateString('fr-FR')],
    ['Date d\'expiration', new Date(service.dateExpiration).toLocaleDateString('fr-FR')],
  ];

  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 100);
    doc.text(label, 15, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 30);
    doc.text(value, pageWidth - 15, y, { align: 'right' });
    y += 9;
  });

  y += 8;
  doc.setDrawColor(230, 230, 235);
  doc.line(15, y, pageWidth - 15, y);
  y += 15;

  // Total
  if (service.prix) {
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(15, y - 8, pageWidth - 30, 16, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 30);
    doc.text('TOTAL PAYÉ', 20, y + 1.5);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(13);
    doc.text(`${Number(service.prix).toLocaleString()} GNF`, pageWidth - 20, y + 2, { align: 'right' });
    y += 25;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(230, 230, 235);
  doc.line(15, footerY, pageWidth - 15, footerY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 165);
  doc.text('Merci de votre confiance !', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('NaforeX © 2026 - naforexstream@gmail.com', pageWidth / 2, footerY + 14, { align: 'center' });

  const fileName = `Recu_${serviceLabels[service.service]}_${client.nom.replace(/\s/g, '_')}.pdf`;
  doc.save(fileName);
};
