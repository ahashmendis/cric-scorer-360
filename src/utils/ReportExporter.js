/**
 * REPORT EXPORTER - Handles PNG, PDF, and CSV exports
 * Converts report components to downloadable files at 300 DPI
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export report as PNG @ 300 DPI
 * @param {string} reportName - Name of the report (e.g., "BattingScorecard")
 * @param {HTMLElement} element - DOM element to export
 * @param {number} dpi - DPI for export (default: 300)
 */
export const exportReportAsPNG = async (reportName, element, dpi = 300) => {
  try {
    const canvas = await html2canvas(element, {
      scale: dpi / 96, // Convert DPI to scale (96 DPI is standard screen)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${reportName}_${getTodayDate()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`✓ PNG exported: ${link.download}`);
    return { success: true, file: link.download };
  } catch (error) {
    console.error('PNG Export Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export report as PDF (A4 portrait)
 * @param {string} reportName - Name of the report
 * @param {HTMLElement} element - DOM element to export
 */
export const exportReportAsPDF = async (reportName, element) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
    });

    // A4 dimensions (210mm × 297mm)
    const imgWidth = 210; // mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF, splitting across pages if necessary
    const imgData = canvas.toDataURL('image/png');
    const pageHeight = pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      if (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
      }
    }

    const filename = `${reportName}_${getTodayDate()}.pdf`;
    pdf.save(filename);

    console.log(`✓ PDF exported: ${filename}`);
    return { success: true, file: filename };
  } catch (error) {
    console.error('PDF Export Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export report data as CSV
 * @param {string} reportName - Name of the report
 * @param {Array<Object>} data - Array of objects to export
 * @param {Array<string>} columns - Column headers for CSV
 */
export const exportReportAsCSV = (reportName, data = [], columns = []) => {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data provided for CSV export');
    }

    // Determine columns from data if not provided
    const csvColumns = columns.length > 0 ? columns : Object.keys(data[0]);

    // Create CSV header
    const csvHeader = csvColumns.map(col => `"${col}"`).join(',');

    // Create CSV rows
    const csvRows = data.map(row =>
      csvColumns
        .map(col => {
          const value = row[col] || '';
          // Escape quotes and wrap in quotes if contains comma
          const escapedValue = String(value)
            .replace(/"/g, '""')
            .replace(/,/g, '","');
          return `"${escapedValue}"`;
        })
        .join(',')
    );

    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = `${reportName}_${getTodayDate()}.csv`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log(`✓ CSV exported: ${filename}`);
    return { success: true, file: filename };
  } catch (error) {
    console.error('CSV Export Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export table element as CSV
 * @param {string} reportName - Name of the report
 * @param {HTMLTableElement} tableElement - Table DOM element
 */
export const exportTableAsCSV = (reportName, tableElement) => {
  try {
    if (!tableElement || tableElement.tagName !== 'TABLE') {
      throw new Error('Invalid table element');
    }

    const rows = [];
    
    // Extract header
    const headerCells = tableElement.querySelectorAll('thead th');
    const headers = Array.from(headerCells).map(cell => cell.textContent.trim());
    rows.push(headers.map(h => `"${h}"`).join(','));

    // Extract body
    const bodyCells = tableElement.querySelectorAll('tbody tr');
    bodyCells.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const values = cells.map(cell =>
        `"${cell.textContent.trim().replace(/"/g, '""')}"`
      );
      rows.push(values.join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filename = `${reportName}_${getTodayDate()}.csv`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    console.log(`✓ Table CSV exported: ${filename}`);
    return { success: true, file: filename };
  } catch (error) {
    console.error('Table CSV Export Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export multiple formats at once
 * @param {string} reportName - Name of the report
 * @param {HTMLElement} element - DOM element to export
 * @param {Array<string>} formats - Formats to export ('png', 'pdf', 'csv')
 * @param {Object} csvData - Optional data for CSV export
 */
export const exportReportMultiple = async (
  reportName,
  element,
  formats = ['png', 'pdf'],
  csvData = { data: [], columns: [] }
) => {
  const results = {};
  const validFormats = ['png', 'pdf', 'csv'];

  for (const format of formats) {
    if (!validFormats.includes(format.toLowerCase())) {
      console.warn(`Skipping invalid format: ${format}`);
      continue;
    }

    try {
      if (format.toLowerCase() === 'png') {
        results.png = await exportReportAsPNG(reportName, element);
      } else if (format.toLowerCase() === 'pdf') {
        results.pdf = await exportReportAsPDF(reportName, element);
      } else if (format.toLowerCase() === 'csv') {
        results.csv = exportReportAsCSV(reportName, csvData.data, csvData.columns);
      }
    } catch (error) {
      results[format.toLowerCase()] = { success: false, error: error.message };
    }
  }

  return results;
};

/**
 * Utility: Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Utility: Get current timestamp for unique file naming
 */
export const getTimestamp = () => {
  const now = new Date();
  const date = getTodayDate();
  const time = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
  return `${date}_${time}`;
};

/**
 * Generate CSV from match data object
 * @param {Object} matchData - Match data object
 * @param {string} reportType - Type of report (batting, bowling, partnership, main)
 */
export const generateMatchDataCSV = (matchData = {}, reportType = 'main') => {
  const data = [];
  
  switch (reportType.toLowerCase()) {
    case 'batting':
      matchData.teamA?.playingXI?.batting?.forEach((batsman, idx) => {
        data.push({
          '#': idx + 1,
          'Batsman': batsman.name,
          'Runs': batsman.runs || 0,
          'Balls': batsman.balls || 0,
          'Fours': batsman.fours || 0,
          'Sixes': batsman.sixes || 0,
          'Strike Rate': batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(2) : '0.00',
          'Status': matchData.batsmansOut?.includes(idx) ? 'Out' : 'Not Out',
        });
      });
      break;

    case 'bowling':
      matchData.teamA?.playingXI?.bowling?.forEach((bowler, idx) => {
        const [overs, balls] = (bowler.overs || '0.0').toString().split('.').map(Number);
        const totalBalls = (overs * 6) + (balls || 0);
        const economy = totalBalls > 0 ? (bowler.runs / totalBalls * 6).toFixed(2) : '0.00';
        data.push({
          '#': idx + 1,
          'Bowler': bowler.name,
          'Overs': bowler.overs || '0.0',
          'Maidens': bowler.maidens || 0,
          'Runs': bowler.runs || 0,
          'Wickets': bowler.wickets || 0,
          'Economy': economy,
        });
      });
      break;

    case 'main':
    default:
      data.push({
        'Team A': matchData.teamA?.name,
        'Runs': matchData.teamA?.runs || 0,
        'Wickets': matchData.teamA?.wickets || 0,
        'Overs': matchData.teamA?.overs || '0.0',
        'Team B': matchData.teamB?.name,
        'B Runs': matchData.teamB?.runs || 0,
        'B Wickets': matchData.teamB?.wickets || 0,
        'B Overs': matchData.teamB?.overs || '0.0',
        'Venue': matchData.venue,
        'Toss Winner': matchData.tossWinner,
      });
      break;
  }

  return data;
};

export default {
  exportReportAsPNG,
  exportReportAsPDF,
  exportReportAsCSV,
  exportTableAsCSV,
  exportReportMultiple,
  generateMatchDataCSV,
  getTodayDate,
  getTimestamp,
};
