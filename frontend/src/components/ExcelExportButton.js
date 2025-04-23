import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from 'react-bootstrap';

const ExcelExportButton = ({ data, fileName, buttonText = 'Exportar para Excel' }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <Button variant="success" onClick={exportToExcel} className="mb-3">
      <i className="fas fa-file-excel mr-2"></i> {buttonText}
    </Button>
  );
};

export default ExcelExportButton;
