import Papa from 'papaparse'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/** Trigger a browser download of arbitrary text content. */
function download(filename: string, content: BlobPart, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Export an array of row objects to CSV. */
export function exportCsv(filename: string, rows: Record<string, unknown>[]): void {
  const csv = Papa.unparse(rows)
  download(filename.endsWith('.csv') ? filename : `${filename}.csv`, csv, 'text/csv;charset=utf-8')
}

interface PdfTableSection {
  title: string
  head: string[]
  body: (string | number)[][]
}

/** Export one or more titled tables to a PDF document. */
export function exportPdf(
  filename: string,
  documentTitle: string,
  sections: PdfTableSection[]
): void {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(documentTitle, 14, 18)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 25)

  let cursorY = 32
  for (const section of sections) {
    doc.setFontSize(12)
    doc.setTextColor(20)
    doc.text(section.title, 14, cursorY)
    autoTable(doc, {
      head: [section.head],
      body: section.body,
      startY: cursorY + 4,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [91, 99, 245] }
    })
    // @ts-expect-error lastAutoTable is augmented at runtime by the plugin.
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY + 20) + 12
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
