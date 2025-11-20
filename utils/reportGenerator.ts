import { jsPDF } from "jspdf";
import { GradingResult } from "../types";

export function generatePDF(studentName: string, result: GradingResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  // Helper for page breaks
  const checkPageBreak = (height: number) => {
    if (y + height > doc.internal.pageSize.height - margin) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Klausurbewertung", margin, y);
  y += 15;

  // Meta Data
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Schüler/in: ${studentName}`, margin, y);
  y += 7;
  doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, margin, y);
  y += 15;

  // Summary Box
  doc.setFillColor(240, 248, 255); // Light blue
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 180);
  doc.text("Gesamtergebnis", margin + 5, y + 10);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`${result.totalPoints} / ${result.maxPoints} Punkte`, margin + 5, y + 20);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Note: ${result.grade}`, margin + 5, y + 30);
  
  y += 50;

  // General Feedback
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Gesamteinschätzung", margin, y);
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const splitSummary = doc.splitTextToSize(result.summary, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 5 + 15;

  // Detailed Tasks
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  checkPageBreak(20);
  doc.text("Detailbewertung", margin, y);
  y += 10;
  doc.line(margin, y - 5, pageWidth - margin, y - 5);

  result.tasks.forEach((task) => {
    checkPageBreak(60); // Approx height for a task block

    // Task Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Aufgabe ${task.id} (${task.points}/${task.maxPoints} Pkt)`, margin, y);
    y += 7;

    // Analysis
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const analysis = doc.splitTextToSize(task.analysis, contentWidth);
    doc.text(analysis, margin, y);
    y += analysis.length * 4 + 5;

    // Errors (if any)
    if (task.errors) {
      doc.setTextColor(200, 0, 0); // Red
      doc.setFont("helvetica", "bold");
      doc.text("Fehler:", margin, y);
      doc.setFont("helvetica", "normal");
      const errors = doc.splitTextToSize(task.errors, contentWidth - 15);
      doc.text(errors, margin + 15, y);
      y += errors.length * 4 + 5;
    }

    // Suggestions (if any)
    if (task.suggestion) {
      doc.setTextColor(0, 100, 0); // Green
      doc.setFont("helvetica", "bold");
      doc.text("Tipp:", margin, y);
      doc.setFont("helvetica", "normal");
      const suggestion = doc.splitTextToSize(task.suggestion, contentWidth - 15);
      doc.text(suggestion, margin + 15, y);
      y += suggestion.length * 4 + 10;
    }

    doc.setTextColor(0, 0, 0);
    y += 5;
  });

  doc.save(`${studentName}_Bewertung.pdf`);
}