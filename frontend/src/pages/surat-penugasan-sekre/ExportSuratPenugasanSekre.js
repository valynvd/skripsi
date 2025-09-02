// /* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSuratPenugasanSekreById } from '../../hooks/useSuratPenugasanSekre';
import jsPDF from 'jspdf';
import { PrimaryButton } from '../../components/PrimaryButton';
import {
  fontCandara,
  fontCandaraBold,
  fontCandaraItalic,
} from '../../jspdf-fonts/Candara';
import { fontCalibri, fontCalibriBold } from '../../jspdf-fonts/Calibri';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import BreadCrumbs from '../../components/BreadCrumbs';

const ExportSuratPenugasanSekre = () => {
  const { id } = useParams();
  const { data: dataSurat } = useSuratPenugasanSekreById(id);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);

  useEffect(() => {
    if (dataSurat) {
      const doc = generatePDFPenugasan(dataSurat, true);
      const dataUrl = doc.output('datauristring');
      setPdfDataUrl(dataUrl);
    }
  }, [dataSurat]);

  if (!dataSurat || !dataSurat.data || dataSurat.data.length === 0) {
    return <p>No data available for the given ID.</p>;
  }
  console.log('DATAAAAAAAAAAA', dataSurat);

  const handleExportPDF = async () => {
    generatePDFPenugasan(dataSurat);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateIndonesian = date.toLocaleDateString('id-ID', options);
    const formattedDateEnglish = date.toLocaleDateString('en-US', options);
    return { formattedDateIndonesian, formattedDateEnglish };
  };

  const generatePDFPenugasan = (dataSurat, forPreview = false) => {
    if (!dataSurat) {
      console.error('dataSurat is undefined');
      return;
    }

    console.log(dataSurat);

    const {
      nomor_surat,
      pelaksana,
      agenda,
      tanggal_kegiatan,
      waktu_mulai_kegiatan,
      waktu_selesai_kegiatan,
      tempat_kegiatan,
      tanggal_surat,
      hari,
      ditugaskan_detail,
    } = dataSurat.data;

    const formatTanggalKegiatan = formatDate(tanggal_kegiatan);
    const formatTanggalSurat = formatDate(tanggal_surat);

    const justifyText = (doc, text, x, y, width, lineHeight) => {
      const lines = doc.splitTextToSize(text, width);

      lines.forEach((line, index) => {
        const words = line.split(' ');
        if (index < lines.length - 1) {
          // Justify all lines except the last one
          const totalWordsWidth = words.reduce(
            (total, word) => total + doc.getTextWidth(word),
            0
          );
          const spaceWidth = (width - totalWordsWidth) / (words.length - 1);
          let currentX = x;
          words.forEach((word, wordIndex) => {
            doc.text(word, currentX, y);
            if (wordIndex < words.length - 1) {
              currentX += doc.getTextWidth(word) + spaceWidth;
            }
          });
        } else {
          // Left-align the last line
          doc.text(line, x, y);
        }
        y += lineHeight;
      });
      return y;
    };

    (function (jsPDFAPI) {
      var callAddFont = function () {
        this.addFileToVFS('Candara-normal.ttf', fontCandara);
        this.addFont('Candara-normal.ttf', 'Candara', 'normal');
        this.addFileToVFS('Candara_Bold-bold.ttf', fontCandaraBold);
        this.addFont('Candara_Bold-bold.ttf', 'Candara', 'bold');
        this.addFileToVFS('Candara_Italic-italic.ttf', fontCandaraItalic);
        this.addFont('Candara_Italic-italic.ttf', 'Candara', 'italic');
        this.addFileToVFS('Calibri Regular.ttf', fontCalibri);
        this.addFont('Calibri Regular.ttf', 'Calibri', 'normal');
        this.addFileToVFS('Calibri Bold.ttf', fontCalibriBold);
        this.addFont('Calibri Bold.ttf', 'Calibri', 'bold');
      };
      jsPDFAPI.events.push(['addFonts', callAddFont]);
    })(jsPDF.API);

    const doc = new jsPDF();
    doc.setFont('Candara', 'bold');

    // const pageHeight =
    //   doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const center = pageWidth / 2;
    const titleStart = 30;
    // let currentY = titleStart + 40;

    // const heightPerSentence = 5.66;
    const heightPerSentenceFooter = 3.5;

    const titleText = (text, position, fontStyle = 'normal', fontSize = 12) => {
      doc.setFont('Candara', fontStyle);
      doc.setFontSize(fontSize);
      doc.text(text, center + 4, titleStart + position * 5, {
        align: 'center',
      });
    };

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    // KOP SURAT
    doc.setFontSize(12);
    titleText('SURAT PENUGASAN', 1, 'bold', 12);

    doc.setFont('Candara', 'normal');
    doc.setFontSize(12);
    titleText(`No. ${nomor_surat}`, 2, 'normal', 12);

    const boxX = 15;
    const boxY = 55;

    const lastY = justifyText(
      doc,
      `Merujuk kepada undangan dari ${pelaksana} untuk dilaksanakan nya ${agenda}, bersama ini Dekan Sekolah STEM Terapan Universitas Prasetiya Mulya menugaskan nama dibawah ini untuk: `,
      boxX,
      boxY,
      pageWidth - 30,
      doc.internal.getFontSize() / 2
    );

    // Yang ditugaskan
    doc.autoTable({
      startY: lastY + 5,
      // startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 90,
      head: [['No', 'Nama', 'Program Studi']],
      body: ditugaskan_detail.map((detail, index) => [
        index + 1,
        detail.name,
        detail.prodi_detail.name,
      ]),
      theme: 'plain',
      styles: {
        halign: 'center',
        valign: 'middle',
        lineColor: 'black',
        lineWidth: 0.2,
      },
    });

    const finalY = doc.autoTable.previous.finalY;

    doc.text(
      'Untuk menghadiri acara tersebut yang akan diselenggarakan pada: ',
      boxX,
      finalY + 10
    );

    const labelX = boxX + 10;
    const valueX = labelX + 35;

    const formatTime = (time) => {
      return time.slice(0, 5);
    };

    // Hari/Tanggal
    doc.text('Hari/Tanggal', labelX, finalY + 20);
    doc.text(':', labelX + 30, finalY + 20);
    doc.text(
      `${hari}, ${formatTanggalKegiatan.formattedDateIndonesian}`,
      valueX,
      finalY + 20
    );

    // Waktu
    doc.text('Waktu', labelX, finalY + 25);
    doc.text(':', labelX + 30, finalY + 25);
    doc.text(
      `${formatTime(waktu_mulai_kegiatan)} s.d. ${formatTime(
        waktu_selesai_kegiatan
      )} WIB`,
      valueX,
      finalY + 25
    );

    // Tempat
    doc.text('Tempat', labelX, finalY + 30);
    doc.text(':', labelX + 30, finalY + 30);
    doc.text(`${tempat_kegiatan}`, valueX, finalY + 30);

    doc.text(
      'Demikian Surat Penugasan ini disampaikan untuk dapat dilaksanakan dengan sebaik-baiknya.',
      boxX,
      finalY + 40
    );

    doc.text(
      `Tangerang, ${formatTanggalSurat.formattedDateIndonesian}`,
      pageWidth - 15,
      finalY + 60,
      { align: 'right' }
    );

    doc.setFont('Candara', 'bold');
    doc.text('Stevanus Wisnu Wijaya, Ph.D.', pageWidth - 15, finalY + 90, {
      align: 'right',
    });

    doc.setFont('Candara', 'normal');
    doc.text('Dekan Sekolah STEM', pageWidth - 15, finalY + 95, {
      align: 'right',
    });
    doc.text('Universitas Prasetiya Mulya', pageWidth - 15, finalY + 100, {
      align: 'right',
    });

    // Footer
    doc.setFont('Calibri', 'bold');
    doc.setFontSize(8);
    doc.text('Kampus BSD', 25, 272);

    doc.setFont('Calibri', 'normal');
    doc.text(
      'Kavling Edutown I.1, Jalan BSD Raya Utama',
      25,
      272 + heightPerSentenceFooter
    );
    doc.text(
      'BSD City, Tangerang – 15339',
      25,
      272 + heightPerSentenceFooter * 2
    );
    doc.text('t +62 21 30450 500', 25, 272 + heightPerSentenceFooter * 3);
    doc.text('f +62 21 30450 505', 52, 272 + heightPerSentenceFooter * 3);

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(8);
    doc.text('Kampus Cilandak', 88, 272);

    doc.setFont('Calibri', 'normal');
    doc.text(
      'Jalan R.A. Kartini (TB. Simatupang)',
      88,
      272 + heightPerSentenceFooter
    );
    doc.text(
      'Cilandak Barat, DKI Jakarta – 12430',
      88,
      272 + heightPerSentenceFooter * 2
    );
    doc.text('t +62 21 7500 463', 88, 272 + heightPerSentenceFooter * 3);
    doc.text('f +62 21 7500 460', 114, 272 + heightPerSentenceFooter * 3);

    doc.setFont('Calibri', 'bold');
    doc.setTextColor(47, 84, 150);
    doc.text('prasetiyamulya.ac.id', 152, 272 + heightPerSentenceFooter * 3);

    if (!forPreview) {
      doc.save(
        `Surat Penugasan ${formatTanggalKegiatan.formattedDateIndonesian}.pdf`
      );
    }
    return doc;
  };

  return (
    <section className="section-container">
      <BreadCrumbs
        links={[
          {
            name: 'Surat Penugasan',
            link: `/data-master/penugasan`,
          },
          { name: `Export` },
        ]}
      />
      <div className="container mx-auto p-4">
        {pdfDataUrl && (
          <div className="pdf-preview mt-4">
            <div className="flex flex-row justify-between mb-8">
              <h2 className="text-xl font-semibold">
                Preview PDF Surat Penugasan
              </h2>
              <PrimaryButton
                onClick={handleExportPDF}
                className="px-4 py-2 rounded"
              >
                Export PDF
              </PrimaryButton>
            </div>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfDataUrl} />
            </Worker>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExportSuratPenugasanSekre;
