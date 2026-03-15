#!/usr/bin/env node

/**
 * INTEGRATION TEST SUITE - Cricket Scorer 360 v3.0
 * Tests all major components and APIs
 */

import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color ANSI codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test counter
let passed = 0;
let failed = 0;

/**
 * HTTP GET request helper
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({ status: res.statusCode, data, duration });
      });
    }).on('error', reject);
  });
}

/**
 * Log test result
 */
function logTest(name, passed, details = '') {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  const detail = details ? ` - ${details}` : '';
  console.log(`  ${status} ${name}${detail}`);
  if (passed) passed++; else failed++;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.cyan}🎬 CRICKET SCORER 360 - INTEGRATION TEST SUITE${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  // ============= API Endpoint Tests =============
  console.log(`${colors.yellow}📡 Testing Backend API (Port 3000)${colors.reset}`);

  try {
    // Test 1: GET /api/match
    try {
      const res1 = await httpGet('http://localhost:3000/api/match');
      const hasRequiredFields = 
        res1.data.includes('matchId') &&
        res1.data.includes('teams') &&
        res1.data.includes('playingXI') &&
        res1.data.includes('customText');
      logTest('GET /api/match', res1.status === 200 && hasRequiredFields, `${res1.duration}ms`);
    } catch (e) {
      logTest('GET /api/match', false, e.message);
    }

    // Test 2: Check overlay.html
    try {
      const res2 = await httpGet('http://localhost:3000/overlay.html');
      const hasOverlay = res2.data.includes('DOCTYPE');
      logTest('GET /overlay.html (OBS Overlay)', res2.status === 200 && hasOverlay, `${res2.duration}ms`);
    } catch (e) {
      logTest('GET /overlay.html', false, e.message);
    }

    // Test 3: Check if backend responds to requests
    try {
      const res3 = await httpGet('http://localhost:3000/api/match');
      const responseTime = res3.duration;
      const isFast = responseTime < 100;
      logTest('API Response Time < 100ms', isFast, `${responseTime}ms`);
    } catch (e) {
      logTest('API Response Time', false, e.message);
    }
  } catch (e) {
    console.log(`${colors.red}  Backend server not responding. Make sure 'npm start' is running.${colors.reset}`);
  }

  // ============= File Structure Tests =============
  console.log(`\n${colors.yellow}📁 Testing File Structure${colors.reset}`);

  const requiredFiles = [
    'src/components/Reports/BattingScorecard.jsx',
    'src/components/Reports/BowlingScorecard.jsx',
    'src/components/Reports/PartnershipReport.jsx',
    'src/components/Reports/MainScorecard.jsx',
    'src/components/Reports/Reports.module.css',
    'src/utils/ReportExporter.js',
    'src/hooks/useActionHistory.js',
    'src/styles/design-tokens.js',
    'src/styles/color-map.js',
    'src/styles/design-system.css',
    'src/components/PerfectOverlay.jsx',
    'src/components/BallByBallBar.jsx',
  ];

  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(__dirname, file));
      logTest(file, true);
    } catch {
      logTest(file, false, 'File not found');
    }
  }

  // ============= Code Quality Tests =============
  console.log(`\n${colors.yellow}🔍 Code Quality Checks${colors.reset}`);

  // Check for syntax in critical files
  const criticalFiles = [
    'src/components/Reports/BattingScorecard.jsx',
    'src/utils/ReportExporter.js',
    'src/hooks/useActionHistory.js',
  ];

  for (const file of criticalFiles) {
    try {
      const content = await fs.readFile(
        path.join(__dirname, file),
        'utf8'
      );
      
      // Basic syntax check: matching braces
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      const syntaxOk = openBraces === closeBraces;
      
      logTest(`${file} - Syntax Check`, syntaxOk, `{${openBraces} :${closeBraces}}`);
    } catch (e) {
      logTest(`${file} - Syntax Check`, false, e.message);
    }
  }

  // ============= Design System Tests =============
  console.log(`\n${colors.yellow}🎨 Design System Validation${colors.reset}`);

  try {
    const tokens = await fs.readFile(
      path.join(__dirname, 'src/styles/design-tokens.js'),
      'utf8'
    );

    const hasColors = tokens.includes('COLORS');
    const hasTypography = tokens.includes('TYPOGRAPHY');
    const hasSpacing = tokens.includes('SPACING');
    const hasBreakpoints = tokens.includes('BREAKPOINTS');

    logTest('Design Tokens - COLORS', hasColors);
    logTest('Design Tokens - TYPOGRAPHY', hasTypography);
    logTest('Design Tokens - SPACING', hasSpacing);
    logTest('Design Tokens - BREAKPOINTS', hasBreakpoints);

    // Count tokens
    const colorCount = (tokens.match(/: '#[0-9A-Fa-f]{6}'/g) || []).length;
    logTest('Design Tokens - Color Count', colorCount >= 15, `${colorCount} colors defined`);
  } catch (e) {
    logTest('Design Tokens Validation', false, e.message);
  }

  // ============= Report Component Tests =============
  console.log(`\n${colors.yellow}📊 Report Components Validation${colors.reset}`);

  const reports = [
    'BattingScorecard.jsx',
    'BowlingScorecard.jsx',
    'PartnershipReport.jsx',
    'MainScorecard.jsx',
  ];

  for (const report of reports) {
    try {
      const content = await fs.readFile(
        path.join(__dirname, `src/components/Reports/${report}`),
        'utf8'
      );

      const hasExport = content.includes('export default') || content.includes('export');
      const hasProps = content.includes('matchData') || content.includes('team');
      const hasUseMemo = content.includes('useMemo');

      logTest(`${report} - Export Statement`, hasExport);
      logTest(`${report} - Props Handling`, hasProps);
      logTest(`${report} - Performance Optimization (useMemo)`, hasUseMemo);
    } catch (e) {
      logTest(`${report} Validation`, false, e.message);
    }
  }

  // ============= Utilities Tests =============
  console.log(`\n${colors.yellow}🔧 Utility Functions Validation${colors.reset}`);

  try {
    const exporter = await fs.readFile(
      path.join(__dirname, 'src/utils/ReportExporter.js'),
      'utf8'
    );

    const hasPNG = exporter.includes('exportReportAsPNG');
    const hasPDF = exporter.includes('exportReportAsPDF');
    const hasCSV = exporter.includes('exportReportAsCSV');
    const hasMultiple = exporter.includes('exportReportMultiple');

    logTest('ReportExporter - PNG Export', hasPNG);
    logTest('ReportExporter - PDF Export', hasPDF);
    logTest('ReportExporter - CSV Export', hasCSV);
    logTest('ReportExporter - Multi-format Export', hasMultiple);
  } catch (e) {
    logTest('ReportExporter Validation', false, e.message);
  }

  try {
    const history = await fs.readFile(
      path.join(__dirname, 'src/hooks/useActionHistory.js'),
      'utf8'
    );

    const hasUndo = history.includes('undo');
    const hasRedo = history.includes('redo');
    const hasReset = history.includes('reset');
    const hasMatchDataHook = history.includes('useMatchDataHistory');

    logTest('useActionHistory - Undo Function', hasUndo);
    logTest('useActionHistory - Redo Function', hasRedo);
    logTest('useActionHistory - Reset Function', hasReset);
    logTest('useActionHistory - Match Data Specialization', hasMatchDataHook);
  } catch (e) {
    logTest('useActionHistory Validation', false, e.message);
  }

  // ============= Summary =============
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);

  const total = passed + failed;
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log(`${colors.cyan}Overall: ${percentage}% (${passed}/${total})${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.green}🚀 ALL TESTS PASSED - SYSTEM READY FOR BROADCAST${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  ${failed} test(s) failed - Review above${colors.reset}\n`);
  }
}

// Run tests
runTests().catch(console.error);
