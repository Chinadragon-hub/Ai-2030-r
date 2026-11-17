import { jsPDF } from 'jspdf';
import { PRESENTATION_META, PLAN_ITEMS, TIMELINE } from '../data/timeline.js';
import { computeCardTimings, getSpeakerDisplay } from '../utils/timelineHelpers.js';

/**
 * Builds normalized table rows directly from the single timeline data file.
 */
export function buildScriptTableRows() {
  const timed = computeCardTimings(TIMELINE);
  return timed.map((card) => ({
    time: card.timeFormatted,
    scene: card.sceneLabel,
    camera: card.cameraNote,
    speaker: getSpeakerDisplay(card.speaker).pdfName,
    speakerKey: card.speaker,
    words: card.lines.join(' '),
  }));
}

/**
 * Generates the complete jsPDF document (Title Page + Cue-by-Cue Rehearsal Table).
 */
export function createScriptPdfDocument() {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;

  // ================= PAGE 1: TITLE PAGE =================
  doc.setFillColor(11, 12, 26);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Accent bar
  doc.setFillColor(0, 240, 255);
  doc.rect(margin, 56, 72, 4, 'F');
  doc.setFillColor(252, 238, 10);
  doc.rect(margin + 80, 56, 36, 4, 'F');
  doc.setFillColor(255, 42, 109);
  doc.rect(margin + 124, 56, 22, 4, 'F');

  doc.setTextColor(0, 240, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.text(PRESENTATION_META.title.toUpperCase(), margin, 108);

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text(
    `${PRESENTATION_META.subtitle} — 5-Minute 3D Cinematic Presentation Script`,
    margin,
    136
  );

  doc.setTextColor(252, 238, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(
    `Presenters: ${PRESENTATION_META.presenters.join(' & ')}   |   AI Guide: ${PRESENTATION_META.aiGuide}   |   Duration: 05:00`,
    margin,
    168
  );

  // Section overview lines (one line per section)
  doc.setDrawColor(51, 65, 85);
  doc.line(margin, 194, pageWidth - margin, 194);

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PRESENTATION STRUCTURE (1 LINE PER SECTION)', margin, 224);

  const overviewLines = [
    {
      time: '0:00 – 1:00',
      label: 'Introduction & Plan: Presenters greet, introduce Julia, and present the 4-part roadmap.',
    },
    ...PLAN_ITEMS.map((item) => ({
      time: item.timeRange,
      label: `${item.number}. ${item.title}: ${item.subtitle}.`,
    })),
  ];

  let yPos = 256;
  for (const row of overviewLines) {
    doc.setTextColor(0, 240, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(row.time, margin, yPos);

    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.5);
    doc.text(row.label, margin + 88, yPos);
    yPos += 30;
  }

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.text(
    'Live Presenters Mode: Louay Kouki & Mahmoud Dammek speak live in person. Julia speaks via Web Speech API.',
    margin,
    pageHeight - 40
  );

  // ================= PAGES 2+: REHEARSAL TABLE =================
  const rows = buildScriptTableRows();
  const cols = [
    { header: 'Time', width: 52 },
    { header: 'Scene / 3D Model', width: 145 },
    { header: 'Camera Movement', width: 175 },
    { header: 'Who Speaks', width: 98 },
    { header: 'Exact Words', width: pageWidth - margin * 2 - (52 + 145 + 175 + 98) },
  ];

  function drawTableHeader(y) {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, pageWidth - margin * 2, 24, 'F');
    doc.setTextColor(0, 240, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    let x = margin + 6;
    for (const col of cols) {
      doc.text(col.header, x, y + 16);
      x += col.width;
    }
    return y + 24;
  }

  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('AI in 2030 — Cue-by-Cue Rehearsal Script', margin, 40);

  let y = drawTableHeader(54);

  rows.forEach((row, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    const sceneWrapped = doc.splitTextToSize(row.scene, cols[1].width - 10);
    const camWrapped = doc.splitTextToSize(row.camera, cols[2].width - 10);
    const wordsWrapped = doc.splitTextToSize(row.words, cols[4].width - 10);
    const maxLines = Math.max(sceneWrapped.length, camWrapped.length, wordsWrapped.length, 1);
    const rowHeight = Math.max(24, maxLines * 12 + 10);

    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = drawTableHeader(margin);
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    let x = margin + 6;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(row.time, x, y + 15);
    x += cols[0].width;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(sceneWrapped, x, y + 15);
    x += cols[1].width;

    doc.setTextColor(71, 85, 105);
    doc.text(camWrapped, x, y + 15);
    x += cols[2].width;

    doc.setFont('helvetica', 'bold');
    if (row.speakerKey === 'louay') doc.setTextColor(2, 132, 199);
    else if (row.speakerKey === 'mahmoud') doc.setTextColor(180, 120, 0);
    else doc.setTextColor(219, 39, 119);
    doc.text(row.speaker, x, y + 15);
    x += cols[3].width;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(wordsWrapped, x, y + 15);

    y += rowHeight;
  });

  return doc;
}

/**
 * Triggers a browser download of the PDF rehearsal script.
 */
export function downloadScriptPdf() {
  const doc = createScriptPdfDocument();
  doc.save('AI-2030-script.pdf');
}
