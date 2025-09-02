/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { PDFObject } from 'react-pdfobject';
import { Editor } from 'react-draft-wysiwyg';
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
import {
  useDokumenPembelajaranByDosen,
  useDokumenPembelajaranById,
} from '../hooks/useDokumenPembelajaran';
import { useForm } from 'react-hook-form';
import CRUDropdownInput from '../components/CRUDropdownInput';
import { useLocation, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CRUInput from '../components/CRUInput';
import { PrimaryButton } from '../components/PrimaryButton';
import CRUTextAreaInput from '../components/CRUTextAreaInput';

const RPS = () => {
  const [link, setLink] = useState();
  const firstRender = useRef(true);
  const { data: mataKuliahData } = useMataKuliahData();
  // const { data: dokumenPembelajaranData } = useDokumenPembelajaranByDosen();
  const { register, handleSubmit } = useForm();
  const [subjectMatter, setSubjectMatter] = useState();
  const [rpsData, setRpsData] = useState();
  const { state } = useLocation();
  const [dokumenPembelajaranData, setDokumenPembelajaranData] = useState(
    state?.data
  );
  const { id } = useParams();
  const {
    auth: { userData },
  } = useAuth();

  useEffect(() => {}, [dokumenPembelajaranData]);

  const {
    data: updatedDokumenPembelajaranData,
    isLoading: updatedDokumenPembelajaranDataLoading,
    refetch: updatedDokumenPembelajaranDataRefetch,
  } = useDokumenPembelajaranById(id, {
    select: (response) => {
      return response.data;
    },
    enabled: !!id && !dokumenPembelajaranData,
  });

  useEffect(() => {
    if (!dokumenPembelajaranData) {
      setDokumenPembelajaranData(updatedDokumenPembelajaranData);
    }
  }, [dokumenPembelajaranData, updatedDokumenPembelajaranData]);

  // useEffect(() => {
  // }, [subjectMatter]);
  //

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
  }, [dokumenPembelajaranData, rpsData]);

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

    // doc.addImage(require('../assets/rps1.png'), 'PNG', 0, 0, pageWidth, 0);

    const header = () => {
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
        startY: 20.3,
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
      doc.setTextColor(0, 0, 0);

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
    };

    header();

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(14);

    doc.text('LECTURING UNIT FOR', center, 56, {
      align: 'center',
    });

    const mata_kuliah_detail =
      dokumenPembelajaranData?.penugasan_pengajaran_detail.mata_kuliah_detail;
    const surat_penugasan_detail =
      dokumenPembelajaranData?.penugasan_pengajaran_detail
        .surat_penugasan_detail;
    const dosen_pengampu_detail =
      dokumenPembelajaranData?.penugasan_pengajaran_detail
        .dosen_pengampu_detail;

    doc.text(
      `${mata_kuliah_detail?.kode} – ${mata_kuliah_detail?.name}`,
      center,
      63,
      {
        align: 'center',
      }
    );

    doc.setFontSize(11);
    doc.text(
      `Semester X, Academic Year – ${surat_penugasan_detail?.cycle_detail.start_year}/${surat_penugasan_detail?.cycle_detail.end_year}`,
      marginLeft,
      77.6
    );

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

    textWithColon('Faculty', 2, userData?.fullname);
    textWithColon('Email address', 3, userData?.email);
    textWithColon('Class', 4, `${dosen_pengampu_detail?.prodi_detail.name}`);
    textWithColon('Credits', 5, `${mata_kuliah_detail?.sks_total}`);
    textWithColon(
      'Prerequisite course',
      6,
      '(MK yang menjadi prasyarat dari MK ini)'
    );

    const sectionTitle = (title, y) => {
      doc.setTextColor(255, 255, 255);
      doc.setFont('Calibri', 'bold');
      doc.setFillColor(0, 0, 0);
      doc.rect(marginLeft, y - 4, pageWidth - marginRight, 5.5, 'F');
      doc.setFontSize(12);
      doc.text(title, marginLeft + 2, y);
    };

    sectionTitle('COURSE DESCRIPTION', 121);

    doc.setTextColor(0, 0, 0);
    doc.setFont('Calibri', 'normal');

    const courseDescriptionText = `${rpsData?.courseDescription}`;
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

    let table1End = 0;
    let table1MultiPage = false;

    const filterBodyTable1 = () => {
      const filteredAll = {
        sikap: [],
        pengetahuan: [],
        'keterampilan umum': [],
        'keterampilan khusus': [],
      };

      const capaianPembelajarCode = {
        sikap: 'S',
        pengetahuan: 'P',
        'keterampilan umum': 'KU',
        'keterampilan khusus': 'KK',
      };

      mata_kuliah_detail?.capaian_pembelajar_detail.forEach((item) => {
        filteredAll[item.aspect].push([
          {
            content: `${capaianPembelajarCode[item.aspect]}${item.number}`,
            styles: {
              halign: 'center',
            },
          },
          { content: item.description },
        ]);
      });

      return [
        [{ content: 'SIKAP (S)', colSpan: 2 }],
        ...filteredAll['sikap'],
        [{ content: 'PENGETAHUAN (P)', colSpan: 2 }],
        ...filteredAll['pengetahuan'],
        [{ content: 'KETERAMPILAN UMUM (KU)', colSpan: 2 }],
        ...filteredAll['keterampilan umum'],
        [{ content: 'KETERAMPILAN KHUSUS (KK)', colSpan: 2 }],
        ...filteredAll['keterampilan khusus'],
      ];
    };

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
      columnStyles: {
        0: { cellWidth: 30 },
      },
      showHead: 'firstPage',
      styles: {
        lineColor: 'black',
        lineWidth: 0.2,
        overflow: 'linebreak',
        font: 'Arial',
      },
      theme: 'plain',
      body: filterBodyTable1(),
      startY: 142 + courseDescriptionTextDimensions.h,
      margin: { horizontal: 62 },
      didDrawPage: (HookData) => {
        HookData.settings.margin.top = 52;
        table1End = HookData.cursor.y;

        if (HookData.pageNumber > 1) {
          table1MultiPage = true;
        }
      },
    });

    if (!table1MultiPage) {
      doc.addPage('a4');
    }

    header();

    sectionTitle(
      'COURSE LEARNING OUTCOMES (CAPAIAN PEMBELAJARAN MATA KULIAH – CPMK) & LESSON LEARNING OUTCOMES (SUB-CPMK)',
      table1MultiPage ? table1End + 10 : 55
    );

    let table2End = 0;
    let table2MultiPage = false;

    autoTable(doc, {
      head: [
        [
          {
            content: 'Supported CPL Code',
            styles: {
              valign: 'middle',
              halign: 'center',
              fontStyle: 'bold',
              fillColor: '#bfbfbf',
            },
          },
          {
            content: 'CPMK Code',
            styles: {
              valign: 'middle',
              halign: 'center',
              fontStyle: 'bold',
              fillColor: '#bfbfbf',
            },
          },
          {
            content: 'CPMK Statement',
            styles: {
              valign: 'middle',
              halign: 'center',
              fontStyle: 'bold',
              fillColor: '#bfbfbf',
            },
          },
          {
            content: 'Sub-CPMK Code',
            styles: {
              valign: 'middle',
              halign: 'center',
              fontStyle: 'bold',
              fillColor: '#bfbfbf',
            },
          },
          {
            content: 'Sub-CPMK Statement',
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
        ['testing', 'testing'],
        ['testing', 'testing'],
        ['testing', 'testing'],
      ],
      startY: table1MultiPage ? table1End + 17 : 62,
      margin: { horizontal: marginLeft },
      didDrawPage: (HookData) => {
        HookData.settings.margin.top = 52;

        table2End = HookData.cursor.y;

        if (HookData.pageNumber > 1) {
          table2MultiPage = true;
        }
      },
    });

    header();

    sectionTitle(
      'SUBJECT MATTER / BAHAN KAJIAN',
      table2MultiPage ? table2End + 10 : 55
    );

    doc.setTextColor(0, 0, 0);
    doc.setFont('Calibri', 'normal');
    doc.text(
      'Testing asdf asdf a fasd dfas dfa fasd  fasd dasf sdfa df asdf as sdfa asdf fsd asdf asdf sdfa afsd  dfas dasf asdf dfas asdfaf sdTesting asdf asdf a fasd dfas dfa fasd  fasd dasf sdfa df asdf as sdfa asdf fsd asdf asdf sdfa afsd  dfas dasf asdf dfas asdfaf sdTesting asdf asdf a fasd dfas dfa fasd  fasd dasf sdfa df asdf as sdfa asdf fsd asdf asdf sdfa afsd  dfas dasf asdf dfas asdfaf sd',
      marginLeft,
      table2End + 19,
      {
        maxWidth: pageWidth - marginRight,
      }
    );

    // subjectMatter.blocks.forEach((item) => {
    //   console.log(item);
    // });

    doc.addPage('a4');

    // return doc.save('test');
    return doc.output('blob');
  };

  const onSubmit = (values) => {
    setRpsData(values);
  };

  return (
    <>
      <section id="RPS-form" className="section-container">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CRUTextAreaInput
            register={register}
            registeredName="courseDescription"
            name="Deskripsi Mata Kuliah"
          />
          {/* <CRUInput
            register={register}
            registeredName="courseDescription"
            name="Deskripsi Mata Kuliah"
          /> */}
          <PrimaryButton>Submit</PrimaryButton>
        </form>
      </section>
      <section id="RPS" className="section-container mt-4">
        {/* <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">RPS</p>
      </div> */}
        <Editor
          toolbar={{
            options: ['inline', 'fontSize', 'list', 'textAlign', 'history'],
          }}
          initialContentState={null}
          onContentStateChange={(res) => {
            setSubjectMatter(res);
          }}
          wrapperClassName="wrapper-class"
        />
        <div className="w-full rounded-t-lg">
          <PDFObject page={1} height="60rem" url={link} />
        </div>
      </section>
    </>
  );
};

export default RPS;
