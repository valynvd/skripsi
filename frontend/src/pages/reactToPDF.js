/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { PDFObject } from 'react-pdfobject';
import { useEffect } from 'react';

const ReactToPDF = () => {
  const [link, setLink] = useState();

  const generatePDF = () => {
    let doc = new jsPDF();
    let pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    let pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.text('SURAT KEPUTUSAN', pageWidth / 2, 10, { align: 'center' });
    doc.text(
      'DEKAN SEKOLAH BISNIS DAN EKONOMI UNIVERSITAS PRASETIYA MULYA',
      pageWidth / 2,
      17,
      { align: 'center' }
    );
    doc.text('No. 0/3/06.03.04.1/0347/01/2022', pageWidth / 2, 24, {
      align: 'center',
    });

    setLink(URL.createObjectURL(doc.output('blob')));
  };

  useEffect(() => {
    generatePDF();
  }, []);

  return (
    <div>
      <PDFObject height="40rem" url={link} />
    </div>
  );
};

export default ReactToPDF;
