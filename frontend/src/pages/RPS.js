/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { PDFObject } from 'react-pdfobject';
import autoTable from 'jspdf-autotable';
import {
  fontCandara,
  fontCandaraBold,
  fontCandaraItalic,
} from '../jspdf-fonts/Candara';
import { fontCalibri, fontCalibriBold } from '../jspdf-fonts/Calibri';
import jsPDF from 'jspdf';
import { fontArial, fontArialBold } from '../jspdf-fonts/Arial';
import { useMataKuliahData } from '../hooks/useMataKuliah';
import { useDokumenPembelajaranByDosen } from '../hooks/useDokumenPembelajaran';
import { useForm } from 'react-hook-form';

const RPS = () => {
  const [link, setLink] = useState();
  const firstRender = useRef(true);
  const { data: mataKuliahData } = useMataKuliahData();
  const { data: dokumenPembelajaranData } = useDokumenPembelajaranByDosen();

  const { control } = useForm();

  useEffect(() => {
    console.log(dokumenPembelajaranData?.data);
  }, [dokumenPembelajaranData]);

  useEffect(() => {
    // if (firstRender.current) {
    //   firstRender.current = false;
    //   return;
    // }

    const pdfURL = generatePDFPengajaran();

    let pdfBlob = new Blob([pdfURL], { type: 'application/pdf' });
    let pdfURL2 = URL.createObjectURL(pdfBlob);

    setLink(pdfURL2);

    return () => {
      URL.revokeObjectURL(pdfURL2);
    };
  }, []);

  const generatePDFPengajaran = () => {
    (function (jsPDFAPI) {
      var callAddFont = function () {
        this.addFileToVFS('Candara-normal.ttf', fontCandara);
        this.addFont('Candara-normal.ttf', 'Candara', 'normal');
        this.addFileToVFS('Candara_Bold-bold.ttf', fontCandaraBold);
        this.addFont('Candara_Bold-bold.ttf', 'Candara', 'bold');
        this.addFileToVFS('Calibri Regular.ttf', fontCalibri);
        this.addFont('Calibri Regular.ttf', 'Calibri', 'normal');
        this.addFileToVFS('Calibri Bold.ttf', fontCalibriBold);
        this.addFont('Calibri Bold.ttf', 'Calibri', 'bold');
        this.addFileToVFS('ARIAL-normal.ttf', fontArial);
        this.addFont('ARIAL-normal.ttf', 'Arial', 'normal');
        this.addFileToVFS('ARIALBD-bold.ttf', fontArialBold);
        this.addFont('ARIALBD-bold.ttf', 'Arial', 'bold');
      };
      jsPDFAPI.events.push(['addFonts', callAddFont]);
    })(jsPDF.API);

    const doc = new jsPDF('landscape');
    doc.setFont('Candara', 'bold');

    const pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const center = pageWidth / 2;
    const marginLeft = 12.3;
    const marginRight = 26;

    const heightPerSentence = 5.66;
    const heightPerSentenceFooter = 3.5;

    const bulletList = (bullet, text, top) => {
      doc.text(bullet, 30, top);
      doc.text(text, 35, top, {
        maxWidth: pageWidth - 52,
        align: 'justify',
        lineHeightFactor: 1.3,
      });
    };

    doc.addImage(require('../assets/rps1.png'), 'PNG', 0, 0, pageWidth, 0);

    console.error = () => {};
    autoTable(doc, {
      body: [
        [
          { content: '', rowSpan: 3 },
          {
            content: 'SISTEM PENJAMINAN MUTU INTERNAL',
            styles: { halign: 'center', fontStyle: 'bold' },
          },
          'Nomor',
        ],
        [
          {
            content: 'RENCANA PEMBELAJARAN SEMESTER (RPS)',
            rowSpan: 2,
            styles: { valign: 'middle', halign: 'center', fontStyle: 'bold' },
          },
          'Revisi',
        ],
        ['Halaman'],
      ],
      theme: 'plain',
      columnStyles: {
        0: { cellWidth: 76 },
        1: { cellWidth: 132 },
        2: { cellWidth: 64.5 },
      },
      styles: {
        lineColor: 'black',
        lineWidth: 0.2,
        overflow: 'linebreak',
        font: 'Arial',
      },
      showHead: 'everyPage',
      margin: { top: 20.1, left: 12.3 },
    });

    doc.addImage(
      require('../assets/logo/prasmul-logo-default.png'),
      'PNG',
      13.5,
      23.5,
      73,
      0
    );

    doc.setFont('Arial', 'normal');
    doc.setFontSize(9);

    doc.text(':', 230.5 + marginLeft, 24.5);
    doc.text(':', 230.5 + marginLeft, 32.3);
    doc.text(':', 230.5 + marginLeft, 39.8);

    doc.text(
      `${
        doc.internal.getCurrentPageInfo().pageNumber
      } dari ${doc.getNumberOfPages()}`,
      232.5 + marginLeft,
      40.2
    );

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(14);

    doc.text('LECTURING UNIT FOR', center, 56, {
      align: 'center',
    });
    doc.text('KODE MATA KULIAH – NAMA MATA KULIAH', center, 63, {
      align: 'center',
    });

    doc.setFontSize(11);
    doc.text('Semester X, Academic Year – XXXX/XXXX', marginLeft, 77.6);

    doc.setFont('Calibri', 'normal');
    const textWithColon = (text, textNumber, desc) => {
      doc.text(text, marginLeft, 82.3 + 4.7 * (textNumber - 1));
      doc.text(':', marginLeft + 36, 82.3 + 4.7 * (textNumber - 1));
      doc.text(desc, marginLeft + 38.1, 82.3 + 4.7 * (textNumber - 1));
    };

    textWithColon(
      'Course Term',
      1,
      '(Periode pembelajaran, co : Sept 2022 – Jan 2023)'
    );
    textWithColon('Faculty', 2, '(Nama dosen yang mengajar)');
    textWithColon('Email address', 3, '(Email dosen yang mengajar)');
    textWithColon('Class', 4, '(Prodi / Angkatan)');
    textWithColon('Credits', 5, '(Jumlah SKS)');
    textWithColon(
      'Prerequisite course',
      6,
      '(MK yang menjadi prasyarat dari MK ini)'
    );

    const sectionTitle = (title, y) => {
      doc.setTextColor(255, 255, 255);
      doc.setFont('Calibri', 'bold');
      doc.rect(marginLeft, y - 4, pageWidth - marginRight, 5.5, 'F');
      doc.text(title, marginLeft + 2, y);
    };

    sectionTitle('COURSE DESCRIPTION', 121);

    doc.setTextColor(0, 0, 0);
    doc.setFont('Calibri', 'normal');

    const courseDescriptionText =
      'testing dengan apapun testing dengan apapun testing dengan apapun testing dengan apapun testing dengan apapun testing dengan apapun testing dengan apapun testing dengan apapun testing dengan apapun ';
    doc.text(courseDescriptionText, marginLeft, 130.5, {
      maxWidth: pageWidth - marginRight,
    });
    const courseDescriptionTextDimensions = doc.getTextDimensions(
      courseDescriptionText,
      {
        maxWidth: pageWidth - marginRight,
      }
    );

    sectionTitle(
      'CAPAIAN PEMBELAJARAN LULUSAN (CPL)',
      135 + courseDescriptionTextDimensions.h
    );

    autoTable(doc, {
      head: [
        [
          {
            content: 'CPL Code',
            styles: {
              valign: 'middle',
              halign: 'center',
              fontStyle: 'bold',
              fillColor: '#bfbfbf',
            },
          },
          {
            content: 'CPL Statements',
            styles: {
              valign: 'middle',
              halign: 'center',
              fontStyle: 'bold',
              fillColor: '#bfbfbf',
            },
          },
        ],
      ],
      showHead: 'firstPage',
      styles: {
        lineColor: 'black',
        lineWidth: 0.2,
        overflow: 'linebreak',
        font: 'Arial',
      },
      theme: 'plain',
      body: [
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
      ],
      startY: 142 + courseDescriptionTextDimensions.h,
      margin: { horizontal: 62 },
    });

    doc.setTextColor(0, 0, 0);
    doc.text('zvxcxczvzxcv', 20, 210);

    // return doc.save('test');
    return doc.output('blob');
  };

  return (
    <section id="dokumen-pembelajaran" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">RPS</p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PDFObject height="60rem" url={link} />
      </div>
    </section>
  );
};

export default RPS;
