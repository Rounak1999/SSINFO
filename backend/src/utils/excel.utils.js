const XLSX = require('xlsx');

function parseWorkbook(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
  });
}

module.exports = { parseWorkbook };
