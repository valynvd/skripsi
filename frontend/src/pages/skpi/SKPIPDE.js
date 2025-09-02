/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNilaiMahasiswaDataByNIM } from '../../hooks/useNilaiMahasiswa';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import {
  fontCandara,
  fontCandaraBold,
  fontCandaraItalic,
} from '../../jspdf-fonts/Candara';
import { fontCalibri, fontCalibriBold } from '../../jspdf-fonts/Calibri';
import { PrimaryButton } from '../../components/PrimaryButton';
import signatureImage from '../../assets/prof-yudi-sign-pengajaran.png';
import CRUInput from '../../components/CRUInput';
import { usePatchSKPI, useSKPIDataByNIM } from '../../hooks/useSuratSKPI';
import { useForm } from 'react-hook-form';
import EditButton from '../../components/EditButton';
import CancelButton from '../../components/CancelButton';

const SKPIPDE = () => {
  const { nim } = useParams();
  const {
    data: responseResult,
    isLoading,
    error,
  } = useNilaiMahasiswaDataByNIM(nim);

  const {
    data: skpiData,
    isLoading: skpiLoading,
    error: skpiError,
    refetch: refetchSKPIData,
  } = useSKPIDataByNIM(nim);

  const { mutate: patchDataSKPI } = usePatchSKPI();

  const navigate = useNavigate();
  const [editable, setEditable] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dataSKPIMahasiswa, setDataSKPIMahasiswa] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      tempat_lahir: null,
      tanggal_lahir: null,
      tanggal_masuk: null,
      tanggal_kelulusan: null,
      no_ijazah: null,
      no_surat_keputusan_pendirian: null,
      no_surat_keputusan_akreditasi_perguruan_tinggi: null,
      no_surat_keputusan_akreditasi_prodi: null,
      lama_studi: null,
      tanggal_surat: null,
    },
  });

  useEffect(() => {
    console.log('NIM from useParams:', nim);
    console.log('Response Data from API:', responseResult);
  }, [nim, responseResult]);

  useEffect(() => {
    console.log('NIM from useParams:', nim);
    console.log('Response SKPI from API:', skpiData);
    if (skpiData && skpiData.data.length > 0) {
      reset({
        tempat_lahir: skpiData.data[0].tempat_lahir,
        tanggal_lahir: skpiData.data[0].tanggal_lahir,
        tanggal_masuk: skpiData.data[0].tanggal_masuk,
        tanggal_kelulusan: skpiData.data[0].tanggal_kelulusan,
        no_ijazah: skpiData.data[0].no_ijazah,
        no_surat_keputusan_pendirian:
          skpiData.data[0].no_surat_keputusan_pendirian_pt,
        no_surat_keputusan_akreditasi_perguruan_tinggi:
          skpiData.data[0].no_surat_akreditasi_pt,
        no_surat_keputusan_akreditasi_prodi:
          skpiData.data[0].no_surat_akreditasi_prodi,
        tanggal_surat: skpiData.data[0].tanggal_pengesahan_kelulusan,
        lama_studi: skpiData.data[0].lama_studi,
      });
      setDataSKPIMahasiswa(skpiData.data[0]);
    }
  }, [nim, skpiData]);

  console.log('Ini data skpi mahasiswa', dataSKPIMahasiswa);

  const pdfRef = useRef();
  const handleExportPDF = async () => {
    generatePDFSKPI(mahasiswaDetail, finalCPLScores, dataSKPIMahasiswa);
  };

  // Kode CPL
  const uniqueCPLCodes = useMemo(() => {
    const cplCodes = new Set();
    if (responseResult?.data) {
      responseResult.data.forEach((item) => {
        item.penilaian_detail.cpmk_details.forEach((cpmk) => {
          cplCodes.add(cpmk.cpl_detail.kode);
        });
      });
    }
    return Array.from(cplCodes);
  }, [responseResult]);

  const bobotMataKuliah = useMemo(() => {
    const bobot_s = {};
    if (responseResult?.data) {
      responseResult.data.forEach((item) => {
        const mataKuliahName = item.mk_detail.name;
        const bobot = item.bobot;

        uniqueCPLCodes.forEach((cplCode) => {
          if (
            item.penilaian_detail.cpmk_details.some(
              (cpmk) => cpmk.cpl_detail.kode === cplCode
            )
          ) {
            if (!bobot_s[cplCode]) {
              bobot_s[cplCode] = {};
            }

            if (!bobot_s[cplCode][mataKuliahName]) {
              bobot_s[cplCode][mataKuliahName] = 0;
            }

            bobot_s[cplCode][mataKuliahName] += bobot;
          }
        });
      });
    }
    return bobot_s;
  }, [responseResult, uniqueCPLCodes]);

  const detailData = useMemo(() => {
    if (responseResult?.data) {
      const allDetails = {};

      uniqueCPLCodes.forEach((cplCode) => {
        const bobotMataKuliah = {};

        responseResult.data.forEach((item) => {
          const mataKuliahName = item.mk_detail.name;
          const bobot = item.bobot;

          if (
            item.penilaian_detail.cpmk_details.some(
              (cpmk) => cpmk.cpl_detail.kode === cplCode
            )
          ) {
            if (!bobotMataKuliah[mataKuliahName]) {
              bobotMataKuliah[mataKuliahName] = 0;
            }
            bobotMataKuliah[mataKuliahName] += bobot;
          }
        });

        console.log('Bobot Matakuliah for', cplCode, ':', bobotMataKuliah);

        const detail = responseResult.data
          .filter((item) =>
            item.penilaian_detail.cpmk_details.some(
              (cpmk) => cpmk.cpl_detail.kode === cplCode
            )
          )
          .map((item) => {
            const totalBobot = bobotMataKuliah[item.mk_detail.name];
            const perolehanNilai =
              (item.nilai_penilaian * item.bobot) / totalBobot;
            console.log(`Menghitung CPL untuk ${item.mk_detail.name}:`);
            console.log(`  Nilai: ${item.nilai_penilaian}`);
            console.log(`  Bobot: ${item.bobot}`);
            console.log(`  Total Bobot: ${totalBobot}`);
            console.log(`  Perolehan Nilai: ${perolehanNilai.toFixed(2)}`);
            return {
              ...item,
              perolehan_nilai: perolehanNilai.toFixed(2),
              cplCode,
            };
          });

        allDetails[cplCode] = detail;
      });

      return allDetails;
    }
    return {};
  }, [responseResult, uniqueCPLCodes]);

  // Calculate finalCPLScores for each unique CPL code
  const calculateCPL = (data, bobotMataKuliah) => {
    const totalNilaiMK = {};
    const sksMK = {};

    data.forEach((item) => {
      const nilai = item.nilai_penilaian;
      const bobot = item.bobot;
      const sks = item.mk_detail.sks_total;
      const mataKuliahName = item.mk_detail.name;
      const totalBobot = bobotMataKuliah[mataKuliahName];
      const perolehanNilai = (nilai * bobot) / totalBobot;

      if (!totalNilaiMK[mataKuliahName]) {
        totalNilaiMK[mataKuliahName] = 0;
        sksMK[mataKuliahName] = sks;
      }

      totalNilaiMK[mataKuliahName] += perolehanNilai;
    });

    let totalScore = 0;
    let totalSKS = 0;

    Object.keys(totalNilaiMK).forEach((mataKuliahName) => {
      totalScore += totalNilaiMK[mataKuliahName] * sksMK[mataKuliahName];
      totalSKS += sksMK[mataKuliahName];
    });

    const finalCPLScore = totalScore / totalSKS;
    return finalCPLScore;
  };

  const finalCPLScores = useMemo(() => {
    const scores = {};
    uniqueCPLCodes.forEach((cplCode) => {
      scores[cplCode] = calculateCPL(
        detailData[cplCode],
        bobotMataKuliah[cplCode]
      );
    });
    return scores;
  }, [detailData, bobotMataKuliah, uniqueCPLCodes]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  if (
    !responseResult ||
    !responseResult.data ||
    responseResult.data.length === 0
  ) {
    return <p>No data available for the given NIM.</p>;
  }
  console.log('========', responseResult);

  if (!skpiData || !skpiData.data || skpiData.data.length === 0) {
    return <p>No data available for the given NIM.</p>;
  }
  console.log('========', skpiData);

  // const mahasiswaDetail = responseResult.data[0]?.mahasiswa_detail;
  const mahasiswaDetail = skpiData.data[0]?.mahasiswa_detail;
  const noIjazah = watch('no_ijazah', skpiData.no_ijazah);

  const handleCPLClick = (cplCode) => {
    navigate(`/degreeaudit/skpi/${nim}/cpl-detail/${cplCode}`);
  };

  // Function to format the name
  const formatName = (name) => {
    if (name.includes(',')) {
      const [lastName, firstName] = name.split(', ');
      name = `${firstName} ${lastName}`;
    }

    if (name.length > 40) {
      const nameParts = name.split(' ');
      const formattedName = nameParts.reduce((acc, part, index) => {
        if (acc.length + part.length + 1 <= 40 || index === 0) {
          return acc ? `${acc} ${part}` : part;
        } else {
          return `${acc} ${part.charAt(0)}.`;
        }
      }, '');

      return formattedName;
    }

    return name;
  };

  // Format the student's name
  const formattedName = formatName(mahasiswaDetail.nama);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateIndonesian = date.toLocaleDateString('id-ID', options);
    const formattedDateEnglish = date.toLocaleDateString('en-US', options);
    return { formattedDateIndonesian, formattedDateEnglish };
  };

  const generatePDFSKPI = (
    mahasiswaDetail,
    finalCPLScores,
    dataSKPIMahasiswa
  ) => {
    if (!mahasiswaDetail) {
      console.error('mahasiswaDetail is undefined');
      return;
    }
    console.log('ASAS === ', finalCPLScores);

    const {
      no_ijazah,
      tempat_lahir,
      tanggal_lahir,
      tanggal_masuk,
      tanggal_kelulusan,
      no_surat_keputusan_pendirian_pt,
      no_surat_akreditasi_pt,
      no_surat_akreditasi_prodi,
      // no_surat_keputusan_detail: {
      //   no_surat_pendirian,
      //   no_surat_akreditasi_perguruan_tinggi,
      //   no_surat_keputusan,
      // },
      lama_studi,
      tanggal_pengesahan_kelulusan,
    } = dataSKPIMahasiswa;

    const formatTanggalLahir = formatDate(tanggal_lahir);
    const formatTanggalMasuk = formatDate(tanggal_masuk);
    const formatTanggalKelulusan = formatDate(tanggal_kelulusan);
    const formatTanggalSurat = formatDate(tanggal_pengesahan_kelulusan);

    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDateIndonesian = today.toLocaleDateString('id-ID', options);
    const formattedDateEnglish = today.toLocaleDateString('en-US', options);

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
    };

    const tinggiPerCell = (text, width) => {
      const lines = doc.splitTextToSize(text, width - 2 * cellPadding);
      return lines.length * (doc.internal.getFontSize() / 2) + cellPadding * 2;
    };

    (function (jsPDFAPI) {
      var callAddFont = function () {
        this.addFileToVFS('Candara-normal.ttf', fontCandara);
        this.addFont('Candara-normal.ttf', 'Candara', 'normal');
        this.addFileToVFS('Candara_Bold-bold.ttf', fontCandaraBold);
        this.addFont('Candara_Bold-bold.ttf', 'Candara', 'bold');
        this.addFileToVFS('Candara_Italic-italic.ttf', fontCandaraItalic); // Pastikan Anda memiliki font ini
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

    const pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const center = pageWidth / 2;
    const titleStart = 30;
    let currentY = titleStart + 40;

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

    const titleText = (text, position, fontStyle = 'normal', fontSize = 12) => {
      doc.setFont('Calibri', fontStyle);
      doc.setFontSize(fontSize);
      doc.text(text, center + 4, titleStart + position * 5, {
        align: 'center',
      });
    };

    const addPageWithHeader = () => {
      doc.addPage();
      currentY = 20;
    };

    // Function to format the name
    const formatName = (name) => {
      if (name.includes(',')) {
        const [lastName, firstName] = name.split(', ');
        name = `${firstName} ${lastName}`;
      }

      if (name.length > 40) {
        const nameParts = name.split(' ');
        const formattedName = nameParts.reduce((acc, part, index) => {
          if (acc.length + part.length + 1 <= 40 || index === 0) {
            return acc ? `${acc} ${part}` : part;
          } else {
            return `${acc} ${part.charAt(0)}.`;
          }
        }, '');

        return formattedName;
      }

      return name;
    };

    // Format the student's name
    const formattedName = formatName(mahasiswaDetail.nama);

    // doc.addImage(
    //   require('../../assets/logo/logo-stem-merah.png'),
    //   'PNG',
    //   28,
    //   10,
    //   60,
    //   0
    // );

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    const lineStartX = 15;
    const lineEndX = pageWidth - 15;
    const lineY = 28;

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    // KOP SURAT
    doc.setFontSize(14);
    titleText('Surat Keterangan Pendamping Ijazah', 1, 'bold', 14);

    doc.setFont('Calibri', 'italic');
    titleText('Diploma Supplement', 2, 'italic', 12);

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(12);
    titleText(`No. ${no_ijazah}/SKPI`, 4, 'bold', 12);

    const boxX = 15;
    const boxY = 55;
    const boxWidth = pageWidth - 30;
    const boxHeight = 20;

    doc.setLineWidth(0.2);
    doc.rect(boxX, boxY, boxWidth, boxHeight);

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(11);
    doc.text('I. Informasi Identitas Diri', boxX + 4, boxY + 8);

    doc.setFont('Calibri', 'italic');
    doc.setFontSize(11);
    doc.text('Personal Details', boxX + 4, boxY + 16);

    // Tabel data pribadi
    const rightTextX = boxX + 100; // Adjust the right text position
    const tableDataPribadi = [
      [
        '1.1 Nama Mahasiswa',
        "      Student's Name",
        `: ${formattedName}`,
        `  ${formattedName}`,
      ],
      [
        '1.2 Tempat dan Tanggal Lahir',
        '      Place and Date of Birth',
        `: ${tempat_lahir}, ${formatTanggalLahir.formattedDateIndonesian}`,
        `  ${tempat_lahir}, ${formatTanggalLahir.formattedDateEnglish}`,
      ],
      [
        '1.3 Nomor Induk Mahasiswa',
        "      Student's Identification Number",
        `: ${mahasiswaDetail.nim}`,
        `  ${mahasiswaDetail.nim}`,
      ],
      [
        '1.4 Tanggal Masuk',
        '      Date of Entry',
        `: ${formatTanggalMasuk.formattedDateIndonesian}`,
        `  ${formatTanggalMasuk.formattedDateEnglish}`,
      ],
      [
        '1.5 Tanggal Kelulusan',
        '      Date of Completion',
        `: ${formatTanggalKelulusan.formattedDateIndonesian}`,
        `  ${formatTanggalKelulusan.formattedDateEnglish}`,
      ],
      [
        '1.6 Nomor Ijazah',
        '      Certificate Number',
        `: ${no_ijazah}`,
        `  ${no_ijazah}`,
      ],
      [
        '1.7 Jenis Pendidikan',
        '      Type of Education',
        ': Akademik',
        '  Academic',
      ],
      [
        '1.8 Gelar',
        '      Degree Granted',
        ': Sarjana Desain (S.Ds.)',
        '  Bachelor of Design (B.Des.)',
      ],
    ];

    currentY = boxY + boxHeight + 10;
    tableDataPribadi.forEach(
      ([leftText, leftItalicText, rightText, rightItalicText]) => {
        doc.setFont('Calibri', 'normal');
        doc.text(leftText, boxX, currentY);

        doc.setFont('Calibri', 'italic');
        doc.text(leftItalicText, boxX, currentY + 5);

        doc.setFont('Calibri', 'normal');
        doc.text(rightText, rightTextX, currentY);

        doc.setFont('Calibri', 'italic');
        doc.text(rightItalicText, rightTextX, currentY + 5);

        currentY += 15;
      }
    );

    // Tambah box II. Informasi Program
    const boxY2 = currentY + 5;
    doc.rect(boxX, boxY2, boxWidth, boxHeight);

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(11);
    doc.text('II. Informasi Identitas Program', boxX + 4, boxY2 + 8);

    doc.setFont('Calibri', 'italic');
    doc.setFontSize(11);
    doc.text(
      'Higher Education Institution Identity Information',
      boxX + 4,
      boxY2 + 16
    );

    // Tabel data program Page 1
    const tableDataProgram1 = [
      [
        '2.1 Nomor Surat Keputusan Pendirian Perguruan Tinggi',
        '      Establishment Decree Number',
        `: ${no_surat_keputusan_pendirian_pt}`,
        '  ',
      ],
      [
        '2.2 Nama Perguruan Tinggi',
        '      Institution’s Name',
        ': Universitas Prasetiya Mulya',
        '  Universitas Prasetiya Mulya',
      ],
    ];

    let programY1 = boxY2 + boxHeight + 10;
    tableDataProgram1.forEach(
      ([leftText, leftItalicText, rightText, rightItalicText]) => {
        if (programY1 > pageHeight - 40) {
          addPageWithHeader();
          programY1 = 20;
        }

        doc.setFont('Calibri', 'normal');
        doc.text(leftText, boxX, programY1);

        doc.setFont('Calibri', 'italic');
        doc.text(leftItalicText, boxX, programY1 + 5);

        doc.setFont('Calibri', 'normal');
        doc.text(rightText, rightTextX, programY1);

        doc.setFont('Calibri', 'italic');
        doc.text(rightItalicText, rightTextX, programY1 + 5);

        programY1 += 15;
      }
    );

    // Footer Page 1
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

    // Halaman 2
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    // Tabel data program Page 1
    doc.setFontSize(11);

    const tableDataProgram2 = [
      [
        '2.3 Status Akreditasi Perguruan Tinggi',
        '      Institution’s Accreditation status',
        ': Terakreditasi',
        '  Accredited',
      ],
      [
        '2.4 Nomor Surat Keputusan Akreditasi Perguruan Tinggi',
        '      Institution’s Accreditation Decree Number',
        `: ${no_surat_akreditasi_pt}`,
        '  ',
      ],
      [
        '2.5 Program Studi',
        '      Study Program',
        `: ${mahasiswaDetail.prodi_detail.name}`,
        `  ${mahasiswaDetail.prodi_detail.name}`,
      ],
      [
        '2.6 Status Akreditasi Program Studi',
        '      Study Program’s Accreditation status',
        ': Terakreditasi',
        '  Accredited',
      ],
      [
        '2.7 Nomor Surat Keputusan Akreditasi Program Studi',
        '      Study Program’s Accreditation Decree Number',
        `: ${no_surat_akreditasi_prodi}`,
        '  ',
      ],
      [
        '2.8 Jenjang Pendidikan',
        '      Level of Education',
        ': Sarjana',
        '  Undergraduate Program',
      ],
      [
        '2.9 Persyaratan Penerimaan',
        '      Entry Requirements',
        ': Lulusan SMA atau sederajat',
        '  High School Graduate or Equivalent',
      ],
      [
        '2.10 Bahasa Pengantar',
        '      Language of Instruction',
        ': Bahasa Indonesia',
        '  Indonesian',
      ],
      [
        '2.11 Sistem Penilaian',
        '      Grading System',
        ': A=4; AB=3.5; B=3; BC=2.5; C=2; D=1; E=0',
        '  A=4; AB=3.5; B=3; BC=2.5; C=2; D=1; E=0',
      ],
      [
        '2.12 Jenis dan Jenjang Pendidikan Lanjutan',
        '      Accessible Higher Level Education',
        ': Pascasarjana',
        '  Graduate Program',
      ],
      [
        '2.13 Lama Studi',
        '      Duration of Study',
        `: ${lama_studi} Semester`,
        `: ${lama_studi} Semesters`,
      ],
    ];

    let programY = 35;
    tableDataProgram2.forEach(
      ([leftText, leftItalicText, rightText, rightItalicText]) => {
        if (programY > pageHeight - 40) {
          addPageWithHeader();
          programY = 20;
        }

        doc.setFont('Calibri', 'normal');
        doc.text(leftText, boxX, programY);

        doc.setFont('Calibri', 'italic');
        doc.text(leftItalicText, boxX, programY + 5);

        doc.setFont('Calibri', 'normal');
        doc.text(rightText, rightTextX, programY);

        doc.setFont('Calibri', 'italic');
        doc.text(rightItalicText, rightTextX, programY + 5);

        programY += 15;
      }
    );

    // Tambah box III. Informasi Tentang Kualifikasi dan Hasil yang Dicapai
    const boxY3 = programY;
    doc.rect(boxX, boxY3, boxWidth, boxHeight);

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(11);
    doc.text(
      'III. Informasi Tentang Kualifikasi dan Hasil yang Dicapai',
      boxX + 4,
      boxY3 + 8
    );

    doc.setFont('Calibri', 'italic');
    doc.setFontSize(11);
    doc.text(
      'Information on Qualifications and Learning Outcomes',
      boxX + 4,
      boxY3 + 16
    );

    // Bold text outside the box
    let boldTextY = boxY3 + boxHeight + 8;
    if (boldTextY > pageHeight - 40) {
      addPageWithHeader();
      boldTextY = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(11);
    justifyText(
      doc,
      'Capaian pembelajaran lulusan program studi Desain Produk pada program sarjana, Universitas Prasetiya Mulya mengacu kepada Kerangka Kualifikasi Nasional Indonesia (KKNI) Level 6 sebagai syarat minimal kelulusan:',
      boxX,
      boldTextY,
      pageWidth - 30,
      doc.internal.getFontSize() / 2
    );

    // Italic text outside the box
    let italicTextY = boldTextY + 18;
    if (italicTextY > pageHeight - 40) {
      addPageWithHeader();
      italicTextY = 20;
    }

    doc.setFont('Calibri', 'italic');
    justifyText(
      doc,
      'Learning outcomes of the undergraduate program in Product Design Engineering, Universitas Prasetiya Mulya refer to the Indonesian Qualification Framework Level 6 as minimum requirements for completion:',
      boxX,
      italicTextY,
      pageWidth - 30,
      doc.internal.getFontSize() / 2
    );

    // Footer Page 2
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

    // Halaman 3
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    // A. Sikap
    let newSectionY = 35;

    doc.setFont('Calibri', 'bold');
    doc.text('A. Sikap dan Tata Nilai', boxX, newSectionY);

    doc.setFont('Calibri', 'italic');
    doc.text('   Attitudes and Values', boxX, newSectionY + 5);

    let newBoldTextY = newSectionY + 15;
    if (newBoldTextY > pageHeight - 40) {
      addPageWithHeader();
      newBoldTextY = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.text(
      'Lulusan program studi Desain Produk pada program sarjana, Universitas Prasetiya Mulya:',
      boxX,
      newBoldTextY,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    let newItalicTextY = newBoldTextY + 5;
    if (newItalicTextY > pageHeight - 40) {
      addPageWithHeader();
      newItalicTextY = 20;
    }

    doc.setFont('Calibri', 'italic');
    doc.text(
      'Graduates of the undergraduate program in Product Design Engineering, Universitas Prasetiya Mulya:',
      boxX,
      newItalicTextY,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    const tableData1 = [
      [
        '3.A.1',
        'Memiliki jiwa Pancasila sebagai sikap dasar dalam berbangsa dan bernegara;',
        'Uphold Pancasila values as basic attitude in the life of the people and of the nation;',
        finalCPLScores['CPL-PDE-S1']
          ? finalCPLScores['CPL-PDE-S1'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.A.2',
        [
          'Memiliki karakter CHAIN - Caring (kepedulian), Humility (kerendahan hati), Achieving (berprestasi tinggi), Integrity (integritas), dan Non-discrimination (non-diskriminasi), yang artinya mempunyai nilai-nilai sikap dan kepribadian yang:',
          'a. Memberi perhatian dan dukungan yang tulus dan bertanggung jawab;',
          'b. Cerdas dan berpendirian, namun menyadari ketidaksempurnaan pengetahuan dan ketidaksempurnaan diri, bersikap rendah hati, menghargai sesama manusia serta terbuka terhadap perbedaan dan perubahan;',
          'c. Mendayagunakan seluruh potensi yang dimiliki Universitas Prasetiya Mulya untuk mencapai prestasi terbaik;',
          'd. Memegang teguh prinsip-prinsip profesional, bersikap dan berperilaku etis, serta senantiasa mengupayakan terperliharanya kebersamaan dan kesatuan organisasi;',
          'e. Memperlakukan dan bersikap tidak membeda-bedakan orang lain berdasarkan warna kulit, golongan, suku, ekonomi, agama dan sebagainya;',
        ].join('\n'),
        [
          'Possess CHAIN characters - Caring, Humility, Achieving, Integrity, and Non-discrimination, which are:',
          'a. sincere, genuinely supportive, and responsible;',
          'b. smart and firm but aware of self-imperfection in knowledge, humble, respectful, and open to differences and changes;',
          'c. utilizing all of Universitas Prasetiya Mulya’s potentials to achieve the best performance;',
          'd. professional, ethically-behaved, and striving for solidarity and unity;',
          'e. non-discriminating against people on the basis of their skin color, group, ethnicity, economic condition, religion, or the likes;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-S2']
          ? finalCPLScores['CPL-PDE-S2'].toFixed(2)
          : 'N/A',
      ],
    ];

    const tableStartY = newItalicTextY + 10;
    if (tableStartY > pageHeight - 40) {
      addPageWithHeader();
    }

    // Print Table Data
    const cellPadding = 3;
    const colWidths = [15, 75, 75, 15];
    const lineHeight = doc.internal.getFontSize() / 2;

    let rowY = tableStartY;

    tableData1.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidths[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (rowY + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        rowY = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0 ? 0 : colWidths.slice(0, i).reduce((a, b) => a + b, 0));
        const cellWidth = colWidths[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(rowY) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            rowY,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, rowY, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = rowY + cellPadding + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPadding,
          currentY,
          cellWidth - 2 * cellPadding,
          lineHeight
        );
      });

      rowY += rowHeight;
    });

    // Footer Halaman 3
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

    // Halaman 4
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    const tableData2 = [
      [
        '3.A.3',
        'Memiliki semangat untuk membangun bangsa dan negara baik sebagai profesional, pelaku usaha dan/atau warganegara untuk mengembangkan keunggulan lokal tanpa membedakan menurut etnisitas, agama dan kepercayaan, kelamin, ciri-ciri badaniah, usia, maupun strata sosial;',
        'Are passionate to develop the nation and country as professionals, business men/women and/or citizens and to develop local advantage without discrimating people based on their ethnicity, religion and belief, gender, physical characteristics, age, and social status;',
        finalCPLScores['CPL-PDE-S3']
          ? finalCPLScores['CPL-PDE-S3'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.A.4',
        'Memiliki semangat untuk terus belajar sepanjang hayat; ',
        'Have a passion for life-long learning;',
        finalCPLScores['CPL-PDE-S4']
          ? finalCPLScores['CPL-PDE-S4'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.A.5',
        'Memiliki spirit entrepreneurship dan gigih;',
        'Have entrepreneurial skills and persistence;',
        finalCPLScores['CPL-PDE-S5']
          ? finalCPLScores['CPL-PDE-S5'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.A.6',
        'Memiliki kepekaan terhadap permasalahan sosial.',
        'Have social awareness.',
        finalCPLScores['CPL-PDE-S6']
          ? finalCPLScores['CPL-PDE-S6'].toFixed(2)
          : 'N/A',
      ],
    ];

    const tableStartY2 = 35;
    let rowY2 = tableStartY2;

    // Print Table Data
    const cellPadding2 = 3;
    const colWidths2 = [15, 75, 75, 15];
    const lineHeight2 = doc.internal.getFontSize() / 2;

    tableData2.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidths2[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (rowY2 + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        rowY2 = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0 ? 0 : colWidths2.slice(0, i).reduce((a, b) => a + b, 0));
        const cellWidth = colWidths2[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(rowY2) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            rowY2,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, rowY2, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = rowY2 + cellPadding2 + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPadding2,
          currentY,
          cellWidth - 2 * cellPadding2,
          lineHeight2
        );
      });

      rowY2 += rowHeight;
    });

    // B. Keterampilan Umum
    let newSectionKeterampilanUmum = rowY2 + 15;
    if (newSectionKeterampilanUmum > pageHeight - 40) {
      addPageWithHeader();
      newSectionKeterampilanUmum = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.text('B. Keterampilan Umum', boxX, newSectionKeterampilanUmum);

    doc.setFont('Calibri', 'italic');
    doc.text('   General Skills', boxX, newSectionKeterampilanUmum + 5);

    let newBoldTextKeterampilanUmum = newSectionKeterampilanUmum + 15;
    if (newBoldTextKeterampilanUmum > pageHeight - 40) {
      addPageWithHeader();
      newBoldTextKeterampilanUmum = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.text(
      'Lulusan program studi Desain Produk pada program sarjana, Universitas Prasetiya Mulya:',
      boxX,
      newBoldTextKeterampilanUmum,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    let newItalicTextKeterampilanUmum = newBoldTextKeterampilanUmum + 5;
    if (newItalicTextKeterampilanUmum > pageHeight - 40) {
      addPageWithHeader();
      newItalicTextKeterampilanUmum = 20;
    }

    doc.setFont('Calibri', 'italic');
    doc.text(
      'Graduates of the undergraduate program in Product Design Engineering, Universitas Prasetiya Mulya:',
      boxX,
      newItalicTextKeterampilanUmum,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    const tableDataKeterampilanUmum = [
      [
        '3.B.1',
        'Mampu bekerja dalam tim dengan berbagai kalangan sesuai dengan profesinya untuk memecahkan berbagai permasalahan, secara holistik, baik pada aras lokal, aras nasional, maupun aras global;',
        'Are able to work in team with various types of people to solve various problems holistically, at the local level, national level, and global level;',
        finalCPLScores['CPL-PDE-KU1']
          ? finalCPLScores['CPL-PDE-KU1'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.B.2',
        'Mampu menjadi pelaku usaha baru melalui pemrakarsaan usaha bisnis dan/atau profesional yang menguasai pengetahuan dan kemampuan praktis dalam ilmu bisnis, sosial terapan dan STEM terapan;',
        'Are able to become business owner through the initiation of business ventures and / or business professionals who master the knowledge and practical capabilities in business science, applied social sciences, and applied STEM;',
        finalCPLScores['CPL-PDE-KU2']
          ? finalCPLScores['CPL-PDE-KU2'].toFixed(2)
          : 'N/A',
      ],
    ];

    const tableStartKeterampilanUmum = newItalicTextKeterampilanUmum + 10;
    let rowKeterampilanUmumY = tableStartKeterampilanUmum;

    // Print Table Data
    const cellPaddingKeterampilanUmum = 2;
    const colWidthsKeterampilanUmum = [15, 75, 75, 15];
    const lineHeightKeterampilanUmum = doc.internal.getFontSize() / 2;

    tableDataKeterampilanUmum.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsKeterampilanUmum[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (rowKeterampilanUmumY + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        rowKeterampilanUmumY = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsKeterampilanUmum.slice(0, i).reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsKeterampilanUmum[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(rowKeterampilanUmumY) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            rowKeterampilanUmumY,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, rowKeterampilanUmumY, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = rowKeterampilanUmumY + cellPaddingKeterampilanUmum + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingKeterampilanUmum,
          currentY,
          cellWidth - 2 * cellPaddingKeterampilanUmum,
          lineHeightKeterampilanUmum
        );
      });

      rowKeterampilanUmumY += rowHeight;
    });

    // Footer Halaman 4
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

    // Halaman 5
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    const tableDataKeterampilanUmum2 = [
      [
        '3.B.3',
        'Memiliki kemampuan AMICA – Analytical thinking, Maturity, Interpersonal relationship, Communication and Achievement yang baik;',
        'Possess strong AMICA skills (Analytical thinking, Maturity, Interpersonal relationship, Communication, and Achievement);',
        finalCPLScores['CPL-PDE-KU3']
          ? finalCPLScores['CPL-PDE-KU3'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.B.4',
        'Mampu mengkaji implikasi pengembangan atau implementasi STEM Terapan dan menyusun deskripsi saintifik hasil kajian yang dilakukan dalam bentuk skripsi atau laporan tugas akhir.',
        'Examine the implication of applied STEM development or and compile a scientific description of the studies in the form of a thesis or final project report.',
        finalCPLScores['CPL-PDE-KU4']
          ? finalCPLScores['CPL-PDE-KU4'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.B.5',
        'Mampu menegakkan integritas akademik secara umum dan mencegah terjadinya praktek plagiarisme',
        'Are able to uphold academic integrity in general and prevent the practice of plagiarism;',
        finalCPLScores['CPL-PDE-KU5']
          ? finalCPLScores['CPL-PDE-KU5'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.B.6',
        'Mampu menggunakan teknologi informasi dalam konteks pengembangan keilmuan dan implementasi bidang keahlian.',
        'Are able to use information technology in the context of scientific development and implementation of areas of expertise.',
        finalCPLScores['CPL-PDE-KU6']
          ? finalCPLScores['CPL-PDE-KU6'].toFixed(2)
          : 'N/A',
      ],
    ];

    const tableStartKeterampilanUmumY2 = 35;
    let rowKeterampilanUmumY2 = tableStartKeterampilanUmumY2;

    // Print Table Data
    const cellPaddingKeterampilanUmum2 = 3;
    const colWidthsKeterampilanUmum2 = [15, 75, 75, 15];
    const lineHeightKeterampilanUmum2 = doc.internal.getFontSize() / 2;

    tableDataKeterampilanUmum2.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsKeterampilanUmum2[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (rowKeterampilanUmumY2 + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        rowKeterampilanUmumY2 = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsKeterampilanUmum2
                .slice(0, i)
                .reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsKeterampilanUmum2[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(rowKeterampilanUmumY2) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            rowKeterampilanUmumY2,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, rowKeterampilanUmumY2, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = rowKeterampilanUmumY2 + cellPaddingKeterampilanUmum2 + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingKeterampilanUmum2,
          currentY,
          cellWidth - 2 * cellPaddingKeterampilanUmum2,
          lineHeightKeterampilanUmum2
        );
      });

      rowKeterampilanUmumY2 += rowHeight;
    });

    // C. Pengetahuan
    let newSectionPengetahuan = rowKeterampilanUmumY2 + 15;
    if (newSectionPengetahuan > pageHeight - 40) {
      addPageWithHeader();
      newSectionPengetahuan = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.text('C. Pengetahuan ', boxX, newSectionPengetahuan);

    doc.setFont('Calibri', 'italic');
    doc.text('   Knowledge', boxX, newSectionPengetahuan + 5);

    let newBoldTextPengetahuan = newSectionPengetahuan + 15;
    if (newBoldTextPengetahuan > pageHeight - 40) {
      addPageWithHeader();
      newBoldTextPengetahuan = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.text(
      'Lulusan program studi Desain Produk pada program sarjana, Universitas Prasetiya Mulya:',
      boxX,
      newBoldTextPengetahuan,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    let newItalicTextPengetahuan = newBoldTextPengetahuan + 5;
    if (newItalicTextPengetahuan > pageHeight - 40) {
      addPageWithHeader();
      newItalicTextPengetahuan = 20;
    }

    doc.setFont('Calibri', 'italic');
    doc.text(
      'Graduates of the undergraduate program in Product Design Engineering, Universitas Prasetiya Mulya:',
      boxX,
      newItalicTextPengetahuan,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    const tableDataPengetahuan = [
      [
        '3.C.1',
        'Menguasai konsep integritas akademik secara umum dan mengetahui konsep plagiarisme dalam hal jenis, konsekuensi pelanggaran dan upaya pencegahannya;',
        'Master the concept of academic integrity in general and know the concept of plagiarism in terms of types, consequences of violations and efforts to prevent them;',
        finalCPLScores['CPL-PDE-P1']
          ? finalCPLScores['CPL-PDE-P1'].toFixed(2)
          : 'N/A',
      ],
    ];

    const tableStartPengetahuan = newItalicTextPengetahuan + 10;
    let rowPengetahuanY = tableStartPengetahuan;

    // Print Table Data
    const cellPaddingPengetahuan = 2;
    const colWidthsPengetahuan = [15, 75, 75, 15];
    const lineHeightPengetahuan = doc.internal.getFontSize() / 2;

    tableDataPengetahuan.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsPengetahuan[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (rowPengetahuanY + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        rowPengetahuanY = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsPengetahuan.slice(0, i).reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsPengetahuan[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(rowPengetahuanY) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            rowPengetahuanY,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, rowPengetahuanY, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = rowPengetahuanY + cellPaddingPengetahuan + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingPengetahuan,
          currentY,
          cellWidth - 2 * cellPaddingPengetahuan,
          lineHeightPengetahuan
        );
      });

      rowPengetahuanY += rowHeight;
    });

    // Footer Halaman 5
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

    // Halaman 6
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    const tableDataPengetahuan2 = [
      [
        '3.C.2',
        [
          'Menguasai keragaman metoda, proses, dan pendekatan desain yang digunakan untuk mengembangkan visi dan konsep desain produk industri yang inovatif melalui berbagai eksplorasi, hasil-hasil eksperimen dan penterjemahan hasil-hasil riset yang diimplementasikan dalam perencanaan produk dan perancangan produk meliputi:',
          'a. metoda yang digunakan untuk menemukan peluang, menghasilkan alternatif gagasan, dan memutuskan gagasan terpilih;',
          'b. jenis metoda, proses, dan pendekatan pada perancangan desain yang berorientasi pada obyek untuk menghasilkan nilai kebaruan, industri jenis komoditas tertentu, subyek (faktor manusia) sebagai individu dan dalam lingkup komunitas tertentu, dan kreativitas;',
        ].join('\n'),
        [
          'Master a variety of methods, processes and design approaches used to develop visions and concepts for innovative industrial product designs through various explorations, experimental results and translation of research results implemented in product planning and product design, including:',
          'a. the method used to find opportunities, generate alternative ideas, and decide on the selected ideas;',
          'b. types of methods, processes, and approaches to object-oriented designs to produce novelty values, certain types of commodity industries, subjects (human factors) as individuals and within a certain community scope, and creativity;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-P2']
          ? finalCPLScores['CPL-PDE-P2'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.C.3',
        'Mampu menjelaskan prinsip dan metode dasar rekayasa serta keterkaitan antara berbagai konsep dan metode rekayasa dan desain dalam pengembangan produk;',
        'Are able to explain the basic principles and methods of engineering as well as the inter-relationships between various engineering and design concepts and methods in product development;',
        finalCPLScores['CPL-PDE-P3']
          ? finalCPLScores['CPL-PDE-P3'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.C.4',
        [
          'Menguasai keragaman aspek yang membuat sebuah produk bernilai; termasuk perangkat analisis yang digunakan, sekaligus menjelaskannya secara formal dan informatif meliputi:',
          'a.	konsep teoritis mengenai faktor manusia;',
          'b.	konsep teoritis mengenai analisa keputusan;',
        ].join('\n'),
        [
          'Master the various aspects that make a product valuable; including the analytical tools used, as well as explaining them formally and informatively, including:',
          'a. theoretical concepts regarding human factors;',
          'b. theoretical concepts regarding decision analysis;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-P4']
          ? finalCPLScores['CPL-PDE-P4'].toFixed(2)
          : 'N/A',
      ],
    ];

    let tableStartPengetahuan2 = 35;

    // Print Table Data
    const cellPaddingPengetahuan2 = 2;
    const colWidthsPengetahuan2 = [15, 75, 75, 15];
    const lineHeightPengetahuan2 = doc.internal.getFontSize() / 2;

    tableDataPengetahuan2.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsPengetahuan2[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (tableStartPengetahuan2 + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        tableStartPengetahuan2 = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsPengetahuan2.slice(0, i).reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsPengetahuan2[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(tableStartPengetahuan2) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            tableStartPengetahuan2,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, tableStartPengetahuan2, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = tableStartPengetahuan2 + cellPaddingPengetahuan2 + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingPengetahuan2,
          currentY,
          cellWidth - 2 * cellPaddingPengetahuan2,
          lineHeightPengetahuan2
        );
      });

      tableStartPengetahuan2 += rowHeight;
    });

    // Footer Halaman 6
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

    // Halaman 7
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    const tableDataPengetahuan3 = [
      [
        '',
        [
          'c.	konsep teoritis mengenai keragaman aspek diluar faktor manusia yang mempengaruhi nilai sebuah produk;',
          'd.	konsep teoritis yang didukung oleh pengalaman mengenai presentasi;',
        ].join('\n'),
        [
          'c. theoretical concepts regarding the various aspects beyond the human factor that affect the value of a product;',
          'd. theoretical concepts supported by experience regarding presentations;',
        ].join('\n'),
        '',
      ],
      [
        '3.C.5',
        [
          'Memiliki wawasan mengenai bagaimana produk dan sistem dibuat sebagai komoditas, meliputi :',
          'a. pengembangan produk yang didasari oleh pertimbangan industri dan/atau pasar;',
          'b. konsep teoritis mengenai metoda pengembangan produk;',
          'c. proses distribusi gagasan kepada pasar;',
        ].join('\n'),
        [
          'Have insight into how products and systems are made as commodities, including:',
          'a. product development based on industry and/or market considerations;',
          'b. theoretical concepts regarding product development methods;',
          'c. the process of distributing ideas to the market;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-P5']
          ? finalCPLScores['CPL-PDE-P5'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.C.6',
        [
          'Memiliki wawasan mengenai bagaimana produk dan sistem berkaitan dengan isu-isu lingkungan dan sosial serta desain yang bertanggung jawab, meliputi:',
          'a. dasar perubahan sosial;',
          'b. konsep pembangunan berkelanjutan;',
          'c. bagaimana perilaku manusia berkaitan dengan isu-isu tersebut;',
        ].join('\n'),
        [
          'Have insight into how products and systems relate to environmental and social issues as well as responsible design, including:',
          'a. basis of social change;',
          'b. the concept of sustainable development;',
          'c. how human behavior relates to these issues;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-P6']
          ? finalCPLScores['CPL-PDE-P6'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.C.7',
        [
          'Memiliki wawasan mengenai aspek-aspek yang terintegrasi pada produk komoditas meliputi:',
          'a. karakteristik material dan produksi;',
          'b. sejarah dan perkembangan desain produk industri;',
          'c. perilaku etis dan isu-isu kekayaan intelektual;',
        ].join('\n'),
        [
          'Have insight into integrated aspects of  commodity products, including:',
          'a. material and production characteristics;',
          'b. history and development of industrial product design;',
          'c. ethical behavior and intellectual property issues;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-P7']
          ? finalCPLScores['CPL-PDE-P7'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.C.8',
        'Memiliki wawasan dan pengetahuan dasar mengenai karakteristik material dan produksi yang berkaitan dengan industri skala kecil dan menengah dan/atau industri skala manufaktur;',
        'Have insight and basic knowledge about the characteristics of materials and production related to small and medium scale industries and/or manufacturing scale industries;',
        finalCPLScores['CPL-PDE-P8']
          ? finalCPLScores['CPL-PDE-P8'].toFixed(2)
          : 'N/A',
      ],
    ];

    let tableStartPengetahuan3 = 35;

    // Print Table Data
    const cellPaddingPengetahuan3 = 2;
    const colWidthsPengetahuan3 = [15, 75, 75, 15];
    const lineHeightPengetahuan3 = doc.internal.getFontSize() / 2;

    tableDataPengetahuan3.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsPengetahuan3[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (tableStartPengetahuan3 + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        tableStartPengetahuan3 = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsPengetahuan3.slice(0, i).reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsPengetahuan3[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(tableStartPengetahuan3) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            tableStartPengetahuan3,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, tableStartPengetahuan3, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = tableStartPengetahuan3 + cellPaddingPengetahuan3 + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingPengetahuan3,
          currentY,
          cellWidth - 2 * cellPaddingPengetahuan3,
          lineHeightPengetahuan3
        );
      });

      tableStartPengetahuan3 += rowHeight;
    });

    // Footer Halaman 7
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

    // Halaman 8
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    const tableDataPengetahuan4 = [
      [
        '3.C.9',
        [
          'Memiliki wawasan dan pengetahuan dasar mengenai sejarah dan perkembangan desain produk industri meliputi:',
          'a. sejarah desain produk industri secara umum;',
          'b. sejarah perkembangan desain produk industri pada 5 tahun terakhir;',
          'c. sejarah desain produk industri pada salah satu komoditas tertentu;',
        ].join('\n'),
        [
          'Have insight and basic knowledge about the history and development of industrial product design, including:',
          'a. history of industrial product design in general;',
          'b. history of industrial product design development in the last 5 years;',
          'c. history of industrial product design on a particular commodity;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-P9']
          ? finalCPLScores['CPL-PDE-P9'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.C.10',
        'Memiliki wawasan dan pengetahuan dasar untuk mendukung kemampuan membangun sudut pandang strategis yang berorientasi pada peluang komersial dari konsep desain terhadap sektor pasar yang ada dan dinamika perubahannya;',
        'Have insight and basic knowledge to support the ability to build a strategic viewpoint oriented to commercial opportunities from design concepts to existing market sectors and their changing dynamics;',
        finalCPLScores['CPL-PDE-P10']
          ? finalCPLScores['CPL-PDE-P10'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.C.11',
        [
          'Memiliki pengetahuan dalam analisis dan pengambilan keputusan visual produk meliputi:',
          'a. dasar kajian obyek visual dengan orientasi pada aspek formal;',
          'b. dasar kajian obyek visual dengan orientasi pada aspek manusia (subyek);',
          'c. penerapan kedua dasar kajian tersebut sebagai perangkat analisis visual.',
        ].join('\n'),
        [
          'Have knowledge about product visual analysis and decision making, including:',
          'a. basic study of visual objects with an orientation to the formal aspect;',
          'b. basic study of visual objects with an orientation to the human aspect (subject);',
          'c. the application of the two basic assessments as a visual analysis tool.',
        ].join('\n'),
        finalCPLScores['CPL-PDE-P11']
          ? finalCPLScores['CPL-PDE-P11'].toFixed(2)
          : 'N/A',
      ],
    ];

    let tableStartPengetahuan4 = 35;

    // Print Table Data
    const cellPaddingPengetahuan4 = 2;
    const colWidthsPengetahuan4 = [15, 75, 75, 15];
    const lineHeightPengetahuan4 = doc.internal.getFontSize() / 2;

    tableDataPengetahuan4.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsPengetahuan4[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (tableStartPengetahuan4 + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        tableStartPengetahuan4 = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsPengetahuan4.slice(0, i).reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsPengetahuan4[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(tableStartPengetahuan4) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            tableStartPengetahuan4,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, tableStartPengetahuan4, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY = tableStartPengetahuan4 + cellPaddingPengetahuan4 + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingPengetahuan4,
          currentY,
          cellWidth - 2 * cellPaddingPengetahuan4,
          lineHeightPengetahuan4
        );
      });

      tableStartPengetahuan4 += rowHeight;
    });

    // D. Keterampilan Khusus

    let newSectionKeterampilanKhusus = tableStartPengetahuan4 + 15;
    if (newSectionKeterampilanKhusus > pageHeight - 40) {
      addPageWithHeader();
      newSectionKeterampilanKhusus = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.text('D. Keterampilan Khusus ', boxX, newSectionKeterampilanKhusus);

    doc.setFont('Calibri', 'italic');
    doc.text('   Specific Skills ', boxX, newSectionKeterampilanKhusus + 5);

    let newBoldTextKeterampilanKhusus = newSectionKeterampilanKhusus + 15;
    if (newBoldTextKeterampilanKhusus > pageHeight - 40) {
      addPageWithHeader();
      newBoldTextKeterampilanKhusus = 20;
    }

    doc.setFont('Calibri', 'bold');
    doc.text(
      'Lulusan program studi Desain Produk pada program sarjana, Universitas Prasetiya Mulya:',
      boxX,
      newBoldTextKeterampilanKhusus,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    let newItalicTextKeterampilanKhusus = newBoldTextKeterampilanKhusus + 5;
    if (newItalicTextKeterampilanKhusus > pageHeight - 40) {
      addPageWithHeader();
      newItalicTextKeterampilanKhusus = 20;
    }

    doc.setFont('Calibri', 'italic');
    doc.text(
      'Graduates of the undergraduate program in Product Design Engineering, Universitas Prasetiya Mulya:',
      boxX,
      newItalicTextKeterampilanKhusus,
      {
        maxWidth: pageWidth - 30,
        align: 'justify',
      }
    );

    const tableDataKeterampilanKhusus = [
      [
        '3.D.1',
        'Mampu meneliti, menentukan, mengintegrasikan, serta mengkomunikasikan beragam persoalan',
        'Are able to research, determine, integrate, and communicate various industrial product design issues in an integrated unit, ',
        finalCPLScores['CPL-PDE-KK1']
          ? finalCPLScores['CPL-PDE-KK1'].toFixed(2)
          : 'N/A',
      ],
    ];

    const tableStartKeterampilanKhusus = newItalicTextKeterampilanKhusus + 5;
    let rowKeterampilanKhususY = tableStartKeterampilanKhusus;

    // Print Table Data
    const cellPaddingKeterampilanKhusus = 2;
    const colWidthsKeterampilanKhusus = [15, 75, 75, 15];
    const lineHeightKeterampilanKhusus = doc.internal.getFontSize() / 2;

    tableDataKeterampilanKhusus.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsKeterampilanKhusus[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (rowKeterampilanKhususY + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        rowKeterampilanKhususY = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsKeterampilanKhusus
                .slice(0, i)
                .reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsKeterampilanKhusus[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(rowKeterampilanKhususY) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            rowKeterampilanKhususY,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, rowKeterampilanKhususY, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY =
          rowKeterampilanKhususY + cellPaddingKeterampilanKhusus + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingKeterampilanKhusus,
          currentY,
          cellWidth - 2 * cellPaddingKeterampilanKhusus,
          lineHeightKeterampilanKhusus
        );
      });

      rowKeterampilanKhususY += rowHeight;
    });

    // Footer Halaman 8
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

    // Halaman 9
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    const tableDataKeterampilanKhusus2 = [
      [
        '',
        [
          'desain produk industri dalam kesatuan yang terintegrasi, meliputi:',
          'a. kemampuan menerapkan salah satu metoda penelitian kualitatif dengan tingkat kompleksitas rendah;',
          'b. kemampuan mengabstraksi persoalan desain produk industri dalam bentuk diagram;',
          'c. kemampuan dasar penggunaan perangkat analisis visual;',
        ].join('\n'),
        [
          'including:',
          'a. the ability to apply one of the qualitative research methods with a low level of complexity;',
          'b. the ability to abstract industrial product design issues in the form of diagrams;',
          'c. basic ability to use visual analysis tools;',
        ].join('\n'),
        '',
      ],
      [
        '3.D.2',
        'Mampu menghasilkan keragaman gagasan yang informatif, baik dalam hal kualitas maupun kuantitas, melalui media dua dimensi dan tiga dimensi sebagai media komunikasi antara penggagas dan gagasannya;',
        'Able to produce a variety of informative ideas, both in terms of quality and quantity, through two-dimensional and three-dimensional media as a medium of communication between initiators and their ideas;',
        finalCPLScores['CPL-PDE-KK2']
          ? finalCPLScores['CPL-PDE-KK2'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.D.3',
        [
          'Mampu menuangkan gagasan yang informatif melalui media dua dimensi dan tiga dimensi sebagai media komunikasi antara penggagas dan kelompok kerja meliputi:',
          'a. pengungkapan gagasan berupa alternatif dan pengembangannya melalui thumbnail sketch, quick sketch, render sketch, dan model komputer;',
          'b. pengalaman yang terkait dengan pemilihan dan penggunaan media dan material untuk pengungkapan gagasan;',
        ].join('\n'),
        [
          'Are able to convey informative ideas through two-dimensional and three-dimensional media as a medium of communication between initiators and working groups, including:',
          'a. expressing ideas in the form of alternatives and their development through thumbnail sketches, quick sketches, rendering sketches, and computer models;',
          'b. experiences related to the selection and use of media and materials for expressing ideas;',
        ].join('\n'),
        finalCPLScores['CPL-PDE-KK3']
          ? finalCPLScores['CPL-PDE-KK3'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.D.4',
        'Mampu menuangkan gagasan sesuai dengan standar gambar produk yang mengacu pada salah satu ketetapan dari standar gambar produk internasional;',
        'Are able to express ideas in accordance with product drawing standards that refer to one of the provisions of international product drawing standards;',
        finalCPLScores['CPL-PDE-KK4']
          ? finalCPLScores['CPL-PDE-KK4'].toFixed(2)
          : 'N/A',
      ],
    ];

    let tableStartKeterampilanKhusus2 = 35;

    // Print Table Data
    const cellPaddingKeterampilanKhusus2 = 2;
    const colWidthsKeterampilanKhusus2 = [15, 75, 75, 15];
    const lineHeightKeterampilanKhusus2 = doc.internal.getFontSize() / 2;

    tableDataKeterampilanKhusus2.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsKeterampilanKhusus2[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (tableStartKeterampilanKhusus2 + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        tableStartKeterampilanKhusus2 = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsKeterampilanKhusus2
                .slice(0, i)
                .reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsKeterampilanKhusus2[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(tableStartKeterampilanKhusus2) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            tableStartKeterampilanKhusus2,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, tableStartKeterampilanKhusus2, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY =
          tableStartKeterampilanKhusus2 + cellPaddingKeterampilanKhusus2 + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingKeterampilanKhusus2,
          currentY,
          cellWidth - 2 * cellPaddingKeterampilanKhusus2,
          lineHeightKeterampilanKhusus2
        );
      });

      tableStartKeterampilanKhusus2 += rowHeight;
    });

    // Footer Halaman 9
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

    // Halaman 10
    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setLineWidth(0.3); // Set the line width
    doc.line(lineStartX, lineY, lineEndX, lineY);

    doc.setFontSize(11);

    const tableDataKeterampilanKhusus3 = [
      [
        '3.D.5',
        'Mampu mengabstraksikan kualitas gagasan yang dihasilkan melalui tulisan dan bagan visual yang ditunjukkan melalui portofolio desain;',
        'Are able to abstract the quality of ideas generated through writing and visual charts shown through design portfolio;',
        finalCPLScores['CPL-PDE-KK5']
          ? finalCPLScores['CPL-PDE-KK5'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.D.6',
        'Mampu menggunakan salah satu perangkat lunak sebagai alat bantu desain;',
        'Are able to use a software as a design tool;',
        finalCPLScores['CPL-PDE-KK6']
          ? finalCPLScores['CPL-PDE-KK6'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.D.7',
        'Mampu merencanakan dan melakukan simulasi komputer dan eksperimen rekayasa dari model atau purwarupa desain serta melakukan analisis dan pembahasan hasil simulasi dan eksperimen tersebut;',
        'Are able to plan and carry out computer simulations and engineering experiments from models or design prototypes as well as carry out analysis and discussion of the results of these simulations and experiments;',
        finalCPLScores['CPL-PDE-KK7']
          ? finalCPLScores['CPL-PDE-KK7'].toFixed(2)
          : 'N/A',
      ],
      [
        '3.D.8',
        'Mampu menyusun dokumen spesifikasi produk, serta instruksi dan spesifikasi manufakturing produk dengan level kompleksitas rendah;',
        'Are able to generate product specification documents, as well as product manufacturing instructions and specifications with a low level of complexity;',
        finalCPLScores['CPL-PDE-KK8']
          ? finalCPLScores['CPL-PDE-KK8'].toFixed(2)
          : 'N/A',
      ],
    ];

    let tableStartKeterampilanKhusus3 = 35;

    // Print Table Data
    const cellPaddingKeterampilanKhusus3 = 2;
    const colWidthsKeterampilanKhusus3 = [15, 75, 75, 15];
    const lineHeightKeterampilanKhusus3 = doc.internal.getFontSize() / 2;

    tableDataKeterampilanKhusus3.forEach((row) => {
      const cellHeights = row.map((cell, i) =>
        tinggiPerCell(cell, colWidthsKeterampilanKhusus3[i])
      );
      const rowHeight = Math.max(...cellHeights);

      if (tableStartKeterampilanKhusus3 + rowHeight > pageHeight - 40) {
        addPageWithHeader();
        tableStartKeterampilanKhusus3 = 20;
      }

      row.forEach((cell, i) => {
        const cellX =
          boxX +
          (i === 0
            ? 0
            : colWidthsKeterampilanKhusus3
                .slice(0, i)
                .reduce((a, b) => a + b, 0));
        const cellWidth = colWidthsKeterampilanKhusus3[i];

        // Ensure valid values
        if (
          isNaN(cellX) ||
          isNaN(tableStartKeterampilanKhusus3) ||
          isNaN(cellWidth) ||
          isNaN(rowHeight)
        ) {
          console.error('Invalid values:', {
            cellX,
            tableStartKeterampilanKhusus3,
            cellWidth,
            rowHeight,
          });
          return;
        }

        doc.rect(cellX, tableStartKeterampilanKhusus3, cellWidth, rowHeight);

        if (i === 2 || i === 3) {
          doc.setFont('Calibri', 'italic');
        } else {
          doc.setFont('Calibri', 'normal');
        }

        // Justify text
        let currentY =
          tableStartKeterampilanKhusus3 + cellPaddingKeterampilanKhusus3 + 5;
        justifyText(
          doc,
          cell,
          cellX + cellPaddingKeterampilanKhusus3,
          currentY,
          cellWidth - 2 * cellPaddingKeterampilanKhusus3,
          lineHeightKeterampilanKhusus3
        );
      });

      tableStartKeterampilanKhusus3 += rowHeight;
    });

    let afterTableY = tableStartKeterampilanKhusus3 + 10;
    if (afterTableY > pageHeight - 60) {
      addPageWithHeader();
      afterTableY = 20;
    }

    doc.setFont('Calibri', 'normal');
    doc.text(
      // `Jakarta, ${formattedDateIndonesian}`,
      `Jakarta, ${formatTanggalSurat.formattedDateIndonesian}`,
      pageWidth / 2 - 18,
      afterTableY
    );
    doc.setFont('Calibri', 'italic');
    doc.text(
      // `Jakarta, ${formattedDateEnglish}`,
      `Jakarta, ${formatTanggalSurat.formattedDateEnglish}`,
      pageWidth / 2 - 18,
      afterTableY + 5
    );

    doc.addImage(
      require('../../assets/prof-yudi-sign-pengajaran.png'),
      'PNG',
      pageWidth / 2 - 18,
      afterTableY + 10,
      60,
      30
    );

    doc.setFont('Calibri', 'bold');
    doc.text(
      'Stevanus Wisnu Wijaya, Ph.D.',
      pageWidth / 2 - 18,
      afterTableY + 50
    );
    doc.setFont('Calibri', 'normal');
    doc.text(
      'Dekan, Sekolah Sains, Teknologi, Rekayasa, dan Matematika',
      pageWidth / 2 - 18,
      afterTableY + 55
    );
    doc.setFont('Calibri', 'italic');
    doc.text(
      'Dean, School of Science, Technology, Engineering, and Mathematics',
      pageWidth / 2 - 18,
      afterTableY + 60
    );

    // Footer Halaman 10
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

    return doc.save(`SKPI_${formattedName}_${mahasiswaDetail.nim}.pdf`);
  };

  // Tanggal Hari ini
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDateIndonesian = today.toLocaleDateString('id-ID', options);
  const formattedDateEnglish = today.toLocaleDateString('en-US', options);

  const handleSave = async (data) => {
    const dataSKPIForm = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dataSKPIForm.append(key, data[key]);
      }
    });

    patchDataSKPI(
      { data: dataSKPIForm, nim: nim },
      {
        onSuccess: () => {
          setEditable(false);
          refetchSKPIData();
        },
        onError: (err) => {
          console.error('Update failed:', err.message);
          setErrorMessage(err.message);
          setTimeout(() => {
            setErrorMessage();
          }, 5000);
        },
      }
    );
  };

  return (
    <section id="skpi" className="section-container">
      <div className="flex flex-row !mt-8 space-x-3 justify-end">
        {!editable && (
          <>
            <PrimaryButton
              onClick={handleExportPDF}
              className="px-4 py-2 rounded"
            >
              Export PDF
            </PrimaryButton>
            <EditButton
              className={`!text-base`}
              type="button"
              onClick={() => setEditable(true)}
            />
          </>
        )}
        {editable && (
          <>
            <EditButton
              className={`!text-base`}
              type="submit"
              onClick={handleSubmit(handleSave)}
              name="Simpan"
            />
            <CancelButton onClick={() => setEditable(false)} />
          </>
        )}
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Draf SKPI view */}
      <div ref={pdfRef}>
        {/* Kop Surat */}
        <div className="text-center my-8">
          <h2 className="text-4xl font-bold">
            Surat Keterangan Pendamping Ijazah
          </h2>
          <p className="font-bold italic mb-4 mt-4 text-xl">
            Diploma Supplement
          </p>
          <p className="font-bold text-2xl">No. {noIjazah}/SKPI</p>
        </div>

        {/* Informasi Pribadi*/}
        <div id="informasi-pribadi" className="my-8">
          <div className="border-t border-b py-4 mb-8 border border-black w-full">
            <div className="px-4">
              <h3 className="text-lg font-semibold">
                I. Informasi Identitas Diri
              </h3>
              <p className="italic">Personal Details</p>
            </div>
          </div>
          <table className="w-full mt-4">
            <tbody>
              <tr>
                <td className="w-1/3 py-2">
                  1.1 Nama Mahasiswa
                  <br />
                  <span className="italic">Student{`'`}s Name</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value={formattedName}
                    readOnly
                  />
                </td>
              </tr>

              <tr>
                <td className="w-1/3 py-2">
                  1.2 Tempat dan Tanggal Lahir
                  <br />
                  <span className="italic">Place and Date of Birth</span>
                </td>
                <td className="w-2/3 py-2">
                  <div className="flex space-x-2">
                    <div className="w-1/2">
                      <CRUInput
                        control={control}
                        register={register}
                        registeredName="tempat_lahir"
                        name="Tempat Lahir"
                        required
                        errors={errors}
                        isDisabled={!editable}
                        hideLabel={true}
                      />
                    </div>
                    <div className="w-1/2">
                      <CRUInput
                        control={control}
                        register={register}
                        registeredName="tanggal_lahir"
                        name="Tanggal Lahir"
                        required
                        type="date"
                        errors={errors}
                        isDisabled={!editable}
                        hideLabel={true}
                      />
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="w-1/3 py-2">
                  1.3 Nomor Induk Mahasiswa
                  <br />
                  <span className="italic">
                    Student{`'`}s Identification Number
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value={mahasiswaDetail.nim}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  1.4 Tanggal Masuk
                  <br />
                  <span className="italic"> Date of Entry</span>
                </td>
                <td className="w-2/3 py-2">
                  <CRUInput
                    control={control}
                    register={register}
                    registeredName="tanggal_masuk"
                    name="Tanggal Masuk"
                    required
                    type="date"
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  1.5 Tanggal Kelulusan
                  <br />
                  <span className="italic"> Date of Completion</span>
                </td>
                <td className="w-2/3 py-2">
                  <CRUInput
                    control={control}
                    register={register}
                    registeredName="tanggal_kelulusan"
                    name="Tanggal Kelulusan"
                    required
                    type="date"
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  1.6 Nomor Ijazah
                  <br />
                  <span className="italic"> Certificate Number</span>
                </td>
                <td className="w-2/3 py-2">
                  <CRUInput
                    control={control}
                    register={register}
                    registeredName="no_ijazah"
                    name="Nomor Ijazah"
                    required
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  1.7 Jenis Pendidikan
                  <br />
                  <span className="italic"> Type of Education</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Akademik"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  1.8 Gelar
                  <br />
                  <span className="italic"> Degree Granted</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Sarjana Desain (S.Ds.)"
                    readOnly
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Informasi Penyelenggara */}
        <div id="informasi-penyelenggara" className=" my-8 mt-4">
          <div className="border-t border-b py-4 mb-8 border border-black w-full">
            <div className="px-4">
              <h3 className="text-lg font-semibold">
                II. Informasi Identitas Penyelenggara Program
              </h3>
              <p className="italic">
                Higher Education Institution Identity Information
              </p>
            </div>
          </div>
          <table className="w-full mt-4">
            <tbody>
              <tr>
                <td className="w-1/3 py-2">
                  2.1 Nomor Surat Keputusan Pendirian Perguruan Tinggi
                  <br />
                  <span className="italic">Establishment Decree Number</span>
                </td>
                <td className="w-2/3 py-2">
                  <CRUInput
                    control={control}
                    register={register}
                    registeredName="no_surat_keputusan_pendirian"
                    name="Nomor Surat Keputusan Pendirian"
                    required
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.2 Nama Perguruan Tinggi
                  <br />
                  <span className="italic">Institution’s Name</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Universitas Prasetiya Mulya"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.3 Status Akreditasi Perguruan Tinggi
                  <br />
                  <span className="italic">
                    Institution{`'`}s Accreditation status
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Terakreditasi"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.4 Nomor Surat Keputusan Akreditasi Perguruan Tinggi
                  <br />
                  <span className="italic">
                    {' '}
                    Institution’s Accreditation Decree Number{' '}
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  <CRUInput
                    control={control}
                    register={register}
                    registeredName="no_surat_keputusan_akreditasi_perguruan_tinggi"
                    name="Nomor Surat Keputusan Akreditasi Perguruan Tinggi"
                    required
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.5 Program Studi
                  <br />
                  <span className="italic"> Study Program</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value={mahasiswaDetail.prodi_detail.name}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.6 Status Akreditasi Program Studi
                  <br />
                  <span className="italic">
                    {' '}
                    Study Program{`'`}s Accreditation status
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Terakreditasi"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.7 Nomor Surat Keputusan Akreditasi Program Studi
                  <br />
                  <span className="italic">
                    {' '}
                    Study Program{`'`}s Accreditation Decree Number
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  <CRUInput
                    control={control}
                    register={register}
                    registeredName="no_surat_keputusan_akreditasi_prodi"
                    name="Nomor Surat Keputusan Akreditasi Prodi"
                    required
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.8 Jenjang Pendidikan
                  <br />
                  <span className="italic"> Level of Education</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Sarjana"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.9 Persyaratan Penerimaan
                  <br />
                  <span className="italic"> Entry Requirements</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Lulusan SMA atau Sederajat"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.10 Bahasa Pengantar Kuliah
                  <br />
                  <span className="italic"> Language of Instruction</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Bahasa Indonesia"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.11 Sistem Penilaian
                  <br />
                  <span className="italic"> Grading System</span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="A=4; AB=3,5; B=3; BC=2,5; C=2; D=1; E=0"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.12 Jenis dan Jenjang Pendidikan Lanjutan
                  <br />
                  <span className="italic">
                    {' '}
                    Accessible Higher Level Education
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  <input
                    className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
                    value="Pascasarjana"
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.13 Lama Studi
                  <br />
                  <span className="italic"> Duration of Study</span>
                </td>
                <td className="w-2/3 py-2">
                  <CRUInput
                    register={register}
                    registeredName="lama_studi"
                    name="Lama Studi "
                    required
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          {/* <table className="w-full mt-4">
            <tbody>
              <tr>
                <td className="w-1/3 py-2">
                  2.1 Nomor Surat Keputusan Pendirian Perguruan Tinggi
                  <br />
                  <span className="italic">Establishment Decree Number</span>
                </td>
                <td className="w-2/3 py-2">
                  : 87/KPT/I/2015
                  <br />
                  <span className="italic">&nbsp; </span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.2 Nama Perguruan Tinggi
                  <br />
                  <span className="italic">Institution’s Name</span>
                </td>
                <td className="w-2/3 py-2">
                  : Universitas Prasetiya Mulya
                  <br />
                  <span className="italic">
                    &nbsp;Universitas Prasetiya Mulya{' '}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.3 Status Akreditasi Perguruan Tinggi
                  <br />
                  <span className="italic">
                    Institution{`'`}s Accreditation status
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  : Terakreditasi
                  <br />
                  <span className="italic">&nbsp;Accredited </span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.4 Nomor Surat Keputusan Akreditasi Perguruan Tinggi
                  <br />
                  <span className="italic">
                    {' '}
                    Institution’s Accreditation Decree Number{' '}
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  :
                  <br />
                  <span className="italic">&nbsp;</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.5 Program Studi
                  <br />
                  <span className="italic"> Study Program</span>
                </td>
                <td className="w-2/3 py-2">
                  : {mahasiswaDetail.prodi_detail.name}
                  <br />
                  <span className="italic">
                    &nbsp;{mahasiswaDetail.prodi_detail.name}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.6 Status Akreditasi Program Studi
                  <br />
                  <span className="italic">
                    {' '}
                    Study Program{`'`}s Accreditation status
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  : Terakreditasi
                  <br />
                  <span className="italic">&nbsp;Accredited</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.7 Nomor Surat Keputusan Akreditasi Program Studi
                  <br />
                  <span className="italic">
                    {' '}
                    Study Program{`'`}s Accreditation Decree Number
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  : Akademik
                  <br />
                  <span className="italic">&nbsp;Academic</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.8 Jenjang Pendidikan
                  <br />
                  <span className="italic"> Level of Education</span>
                </td>
                <td className="w-2/3 py-2">
                  : Sarjana
                  <br />
                  <span className="italic">&nbsp;Undergraduate Program</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.9 Persyaratan Penerimaan
                  <br />
                  <span className="italic"> Entry Requirements</span>
                </td>
                <td className="w-2/3 py-2">
                  : Lulusan SMA atau sederajat
                  <br />
                  <span className="italic">
                    &nbsp;High School Graduate or Equivalent{' '}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.10 Bahasa Pengantar Kuliah
                  <br />
                  <span className="italic"> Language of Instruction</span>
                </td>
                <td className="w-2/3 py-2">
                  : Bahasa Indonesia
                  <br />
                  <span className="italic">&nbsp;Indonesian</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.11 Sistem Penilaian
                  <br />
                  <span className="italic"> Grading System</span>
                </td>
                <td className="w-2/3 py-2">
                  : A=4; AB=3,5; B=3; BC=2,5; C=2; D=1; E=0
                  <br />
                  <span className="italic">
                    &nbsp;A=4; AB=3,5; B=3; BC=2,5; C=2; D=1; E=0
                  </span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.12 Jenis dan Jenjang Pendidikan Lanjutan
                  <br />
                  <span className="italic">
                    {' '}
                    Accessible Higher Level Education
                  </span>
                </td>
                <td className="w-2/3 py-2">
                  : Pascasarjana
                  <br />
                  <span className="italic">&nbsp;Graduate Program</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/3 py-2">
                  2.13 Lama Studi
                  <br />
                  <span className="italic"> Duration of Study</span>
                </td>
                <td className="w-2/3 py-2">
                  : 8 Semester
                  <br />
                  <span className="italic">&nbsp;8 Semesters</span>
                </td>
              </tr>
            </tbody>
          </table> */}
        </div>

        {/* Informasi tentang kualifikasi dan hasil yang dicapai */}
        <div id="informasi-pribadi" className=" my-8 mt-4">
          <div className="border-t border-b py-4 mb-8 border border-black w-full">
            <div className="px-4">
              <h3 className="text-lg font-semibold">
                III. IInformasi Tentang Kualifikasi dan Hasil yang Dicapai
              </h3>
              <p className="italic">
                Information on Qualifications and Learning Outcomes
              </p>
            </div>
          </div>
          <h2 className="text-lg font-semibold">
            Capaian pembelajaran lulusan program studi Desain Produk pada
            program sarjana, Universitas Prasetiya Mulya mengacu kepada Kerangka
            Kualifikasi Nasional Indonesia (KKNI) Level 6 sebagai syarat minimal
            kelulusan:
          </h2>
          <p className="italic mb-4">
            Learning outcomes of the undergraduate program in Product Design
            Engineering, Universitas Prasetiya Mulya refer to the Indonesian
            Qualification Framework Level 6 as minimum requirements for
            completion:
          </p>

          {/* Capaian Pembelajaran Aspek Sikap */}
          <div>
            <h3 className="text-lg font-semibold">A. Sikap dan Tata Nilai</h3>
            <p className="italic">Attitudes and Values</p>

            <h3 className="text-lg font-semibold mt-8">
              Lulusan program studi Desain Produk pada program sarjana,
              Universitas Prasetiya Mulya:
            </h3>
            <p className="italic">
              Graduates of undergraduate program in Product Design Engineering,
              Universitas Prasetiya Mulya:
            </p>

            <table className="w-full mt-8 border-collapse border border-gray-400">
              <tbody className="align-top">
                <tr className="border">
                  <td className="border w-1/12 p-2">3.A.1</td>
                  <td className="border w-5/12 p-2">
                    Memiliki jiwa Pancasila sebagai sikap dasar dalam berbangsa
                    dan bernegara;
                  </td>
                  <td className="border w-5/12 p-2 italic">
                    Uphold Pancasila values as basic attitude in the life of the
                    people and of the nation;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-S1')}
                  >
                    {finalCPLScores['CPL-PDE-S1']
                      ? finalCPLScores['CPL-PDE-S1'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.A.2</td>
                  <td className="border w-5/12 p-2">
                    Memiliki karakter CHAIN - Caring (kepedulian), Humility
                    (kerendahan hati), Achieving (berprestasi tinggi), Integrity
                    (integritas), dan Non-discrimination (non-diskriminasi),
                    yang artinya mempunyai nilai-nilai sikap dan kepribadian
                    yang:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        Memberi perhatian dan dukungan yang tulus dan
                        bertanggung jawab;
                      </li>
                      <li>
                        Cerdas dan berpendirian, namun menyadari
                        ketidaksempurnaan pengetahuan dan ketidaksempurnaan
                        diri, bersikap rendah hati, menghargai sesama manusia
                        serta terbuka terhadap perbedaan dan perubahan;
                      </li>
                      <li>
                        Mendayagunakan seluruh potensi yang dimiliki Universitas
                        Prasetiya Mulya untuk mencapai prestasi terbaik;
                      </li>
                      <li>
                        Memegang teguh prinsip-prinsip profesional, bersikap dan
                        berperilaku etis, serta senantiasa mengupayakan
                        terpeliharanya kebersamaan dan kesatuan organisasi;
                      </li>
                      <li>
                        Memperlakukan dan bersikap tidak membeda-bedakan orang
                        lain berdasarkan warna kulit, golongan, suku, ekonomi,
                        agama dan sebagainya;
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Possess CHAIN characters - Caring, Humility, Achieving,
                    Integrity, and Non-discrimination, which are:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>sincere, genuinely supportive, and responsible;</li>
                      <li>
                        smart and firm but aware of self-imperfection in
                        knowledge, humble, respectful, and open to differences
                        and changes;
                      </li>
                      <li>
                        utilizing all of Universitas Prasetiya Mulya’s
                        potentials to achieve the best performance;
                      </li>
                      <li>
                        professional, ethically-behaved, and striving for
                        solidarity and unity;
                      </li>
                      <li>
                        non-discriminating against people on the basis of their
                        skin color, group, ethnicity, economic condition,
                        religion, or the likes;
                      </li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-S2')}
                  >
                    {finalCPLScores['CPL-PDE-S2']
                      ? finalCPLScores['CPL-PDE-S2'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.A.3</td>
                  <td className="border w-5/12 p-2">
                    Memiliki semangat untuk membangun bangsa dan negara baik
                    sebagai profesional, pelaku usaha dan/atau warganegara untuk
                    mengembangkan keunggulan lokal tanpa membedakan menurut
                    etnisitas, agama dan kepercayaan, kelamin, ciri-ciri
                    badaniah, usia, maupun strata sosial;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are passionate to develop the nation and country as
                    professionals, business men/women and/or citizens and to
                    develop local advantage without discrimating people based on
                    their ethnicity, religion and belief, gender, physical
                    characteristics, age, and social status;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-S3')}
                  >
                    {finalCPLScores['CPL-PDE-S3']
                      ? finalCPLScores['CPL-PDE-S3'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.A.4</td>
                  <td className="border w-5/12 p-2">
                    Memiliki semangat untuk terus belajar sepanjang hayat;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have a passion for life-long learning;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-S4')}
                  >
                    {finalCPLScores['CPL-PDE-S4']
                      ? finalCPLScores['CPL-PDE-S4'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.A.5</td>
                  <td className="border w-5/12 p-2">
                    Memiliki spirit entrepreneurship dan gigih;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have entrepreneurial skills and persistence;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-S5')}
                  >
                    {finalCPLScores['CPL-PDE-S5']
                      ? finalCPLScores['CPL-PDE-S5'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.A.6</td>
                  <td className="border w-5/12 p-2">
                    Memiliki kepekaan terhadap permasalahan sosial.
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have social awareness.
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-S6')}
                  >
                    {finalCPLScores['CPL-PDE-S6']
                      ? finalCPLScores['CPL-PDE-S6'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Capaian Pembelajaran Aspek Keterampilan Umum */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">B. Keterampilan Umum</h3>
            <p className="italic">General Skills</p>

            <h3 className="text-lg font-semibold mt-8">
              Lulusan program studi Desain Produk pada program sarjana,
              Universitas Prasetiya Mulya:
            </h3>
            <p className="italic">
              Graduates of undergraduate program in Product Design Engineering,
              Universitas Prasetiya Mulya:
            </p>

            <table className="w-full mt-8 border-collapse border border-gray-400">
              <tbody className="align-top">
                <tr className="border">
                  <td className="border w-1/12 p-2">3.B.1</td>
                  <td className="border w-5/12 p-2">
                    Mampu bekerja dalam tim dengan berbagai kalangan sesuai
                    dengan profesinya untuk memecahkan berbagai permasalahan
                    secara holistik, baik pada aras lokal, aras nasional, maupun
                    aras global;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to work in team with various types of people to
                    solve various problems holistically, at the local level,
                    national level, and global level;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KU1')}
                  >
                    {finalCPLScores['CPL-PDE-KU1']
                      ? finalCPLScores['CPL-PDE-KU1'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.B.2</td>
                  <td className="border w-5/12 p-2">
                    Mampu menjadi pelaku usaha baru melalui pemrakarsaan usaha
                    bisnis dan/atau profesional yang menguasai pengetahuan dan
                    kemampuan praktis dalam ilmu bisnis, sosial terapan dan STEM
                    terapan;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to become business owner through the initiation of
                    business ventures and / or business professionals who master
                    the knowledge and practical capabilities in business
                    science, applied social sciences, and applied STEM;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KU2')}
                  >
                    {finalCPLScores['CPL-PDE-KU2']
                      ? finalCPLScores['CPL-PDE-KU2'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.B.3</td>
                  <td className="border w-5/12 p-2">
                    Memiliki kemampuan AMICA – Analytical thinking, Maturity,
                    Interpersonal relationship, Communication and Achievement
                    yang baik;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Possess strong AMICA skills (Analytical thinking, Maturity,
                    Interpersonal relationship, Communication, and Achievement);
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KU3')}
                  >
                    {finalCPLScores['CPL-PDE-KU3']
                      ? finalCPLScores['CPL-PDE-KU3'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.B.4</td>
                  <td className="border w-5/12 p-2">
                    Mampu mengkaji implikasi pengembangan atau implementasi STEM
                    Terapan dan menyusun deskripsi saintifik hasil kajian yang
                    dilakukan dalam bentuk skripsi atau laporan tugas akhir;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Examine the implication of applied STEM development or and
                    compile a scientific description of the studies in the form
                    of a thesis or final project report.
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KU4')}
                  >
                    {finalCPLScores['CPL-PDE-KU4']
                      ? finalCPLScores['CPL-PDE-KU4'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.B.5</td>
                  <td className="border w-5/12 p-2">
                    Mampu menegakkan integritas akademik secara umum dan
                    mencegah terjadinya praktek plagiarisme
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to uphold academic integrity in general and prevent
                    the practice of plagiarism;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KU5')}
                  >
                    {finalCPLScores['CPL-PDE-KU5']
                      ? finalCPLScores['CPL-PDE-KU5'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.B.6</td>
                  <td className="border w-5/12 p-2">
                    Mampu menggunakan teknologi informasi dalam konteks
                    pengembangan keilmuan dan implementasi bidang keahlian.
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to use information technology in the context of
                    scientific development and implementation of areas of
                    expertise.
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KU6')}
                  >
                    {finalCPLScores['CPL-PDE-KU6']
                      ? finalCPLScores['CPL-PDE-KU6'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Capaian Pembelajaran Aspek Pengetahuan */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">C. Pengetahuan</h3>
            <p className="italic">Knowledge</p>

            <h3 className="text-lg font-semibold mt-8">
              Lulusan program studi Desain Produk pada program sarjana,
              Universitas Prasetiya Mulya:
            </h3>
            <p className="italic">
              Graduates of undergraduate program in Product Design Engineering,
              Universitas Prasetiya Mulya:
            </p>

            <table className="w-full mt-8 border-collapse border border-gray-400">
              <tbody className="align-top">
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.1</td>
                  <td className="border w-5/12 p-2">
                    Menguasai konsep integritas akademik secara umum dan
                    mengetahui konsep plagiarisme dalam hal jenis, konsekuensi
                    pelanggaran dan upaya pencegahannya;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Master the concept of academic integrity in general and know
                    the concept of plagiarism in terms of types, consequences of
                    violations and efforts to prevent them;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P1')}
                  >
                    {finalCPLScores['CPL-PDE-P1']
                      ? finalCPLScores['CPL-PDE-P1'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.2</td>
                  <td className="border w-5/12 p-2">
                    Menguasai keragaman metoda, proses, dan pendekatan desain
                    yang digunakan untuk mengembangkan visi dan konsep desain
                    produk industri yang inovatif melalui berbagai eksplorasi,
                    hasil-hasil eksperimen dan penterjemahan hasil-hasil riset
                    yang diimplementasikan dalam perencanaan produk dan
                    perancangan produk meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        metoda yang digunakan untuk menemukan peluang,
                        menghasilkan alternatif gagasan, dan memutuskan gagasan
                        terpilih;
                      </li>
                      <li>
                        jenis metoda, proses, dan pendekatan pada perancangan
                        desain yang berorientasi pada obyek untuk menghasilkan
                        nilai kebaruan, industri jenis komoditas tertentu,
                        subyek (faktor manusia) sebagai individu dan dalam
                        lingkup komunitas tertentu, dan kreativitas;
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Master a variety of methods, processes and design approaches
                    used to develop visions and concepts for innovative
                    industrial product designs through various explorations,
                    experimental results and translation of research results
                    implemented in product planning and product design,
                    including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        the method used to find opportunities, generate
                        alternative ideas, and decide on the selected ideas;
                      </li>
                      <li>
                        types of methods, processes, and approaches to
                        object-oriented designs to produce novelty values,
                        certain types of commodity industries, subjects (human
                        factors) as individuals and within a certain community
                        scope, and creativity;
                      </li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P2')}
                  >
                    {finalCPLScores['CPL-PDE-P2']
                      ? finalCPLScores['CPL-PDE-P2'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.3</td>
                  <td className="border w-5/12 p-2">
                    Mampu menjelaskan prinsip dan metode dasar rekayasa serta
                    keterkaitan antara berbagai konsep dan metode rekayasa dan
                    desain dalam pengembangan produk;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to explain the basic principles and methods of
                    engineering as well as the inter-relationships between
                    various engineering and design concepts and methods in
                    product development;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P3')}
                  >
                    {finalCPLScores['CPL-PDE-P3']
                      ? finalCPLScores['CPL-PDE-P3'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.4</td>
                  <td className="border w-5/12 p-2">
                    Menguasai keragaman aspek yang membuat sebuah produk
                    bernilai; termasuk perangkat analisis yang digunakan,
                    sekaligus menjelaskannya secara formal dan informatif
                    meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>konsep teoritis mengenai faktor manusia;</li>
                      <li>konsep teoritis mengenai analisa keputusan;</li>
                      <li>
                        konsep teoritis mengenai keragaman aspek diluar faktor
                        manusia yang mempengaruhi nilai sebuah produk;
                      </li>
                      <li>
                        konsep teoritis yang didukung oleh pengalaman mengenai
                        presentasi;
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Master the various aspects that make a product valuable;
                    including the analytical tools used, as well as explaining
                    them formally and informatively, including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>theoretical concepts regarding human factors;</li>
                      <li>theoretical concepts regarding decision analysis;</li>
                      <li>
                        theoretical concepts regarding the various aspects
                        beyond the human
                      </li>
                      <li>
                        theoretical concepts supported by experience regarding
                        presentations;
                      </li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P4')}
                  >
                    {finalCPLScores['CPL-PDE-P4']
                      ? finalCPLScores['CPL-PDE-P4'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.5</td>
                  <td className="border w-5/12 p-2">
                    Memiliki wawasan mengenai bagaimana produk dan sistem dibuat
                    sebagai komoditas, meliputi :
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        pengembangan produk yang didasari oleh pertimbangan
                        industri dan/atau pasar;
                      </li>
                      <li>
                        konsep teoritis mengenai metoda pengembangan produk;
                      </li>
                      <li>proses distribusi gagasan kepada pasar;</li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have insight into how products and systems are made as
                    commodities, including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        product development based on industry and/or market
                        considerations;
                      </li>
                      <li>
                        theoretical concepts regarding product development
                        methods;
                      </li>
                      <li>the process of distributing ideas to the market;</li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P5')}
                  >
                    {finalCPLScores['CPL-PDE-P5']
                      ? finalCPLScores['CPL-PDE-P5'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.6</td>
                  <td className="border w-5/12 p-2">
                    Memiliki wawasan mengenai bagaimana produk dan sistem
                    berkaitan dengan isu-isu lingkungan dan sosial serta desain
                    yang bertanggung jawab, meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>dasar perubahan sosial;</li>
                      <li>konsep pembangunan berkelanjutan;</li>
                      <li>
                        bagaimana perilaku manusia berkaitan dengan isu-isu
                        tersebut;
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have insight into how products and systems relate to
                    environmental and social issues as well as responsible
                    design, including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>basis of social change;</li>
                      <li>the concept of sustainable development;</li>
                      <li>how human behavior relates to these issues;</li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P6')}
                  >
                    {finalCPLScores['CPL-PDE-P6']
                      ? finalCPLScores['CPL-PDE-P6'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.7</td>
                  <td className="border w-5/12 p-2">
                    Memiliki wawasan mengenai aspek-aspek yang terintegrasi pada
                    produk komoditas meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>karakteristik material dan produksi;</li>
                      <li>sejarah dan perkembangan desain produk industri;</li>
                      <li>perilaku etis dan isu-isu kekayaan intelektual;</li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have insight into integrated aspects of commodity products,
                    including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>material and production characteristics;</li>
                      <li>
                        history and development of industrial product design;
                      </li>
                      <li>
                        ethical behavior and intellectual property issues;
                      </li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P7')}
                  >
                    {finalCPLScores['CPL-PDE-P7']
                      ? finalCPLScores['CPL-PDE-P7'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.8</td>
                  <td className="border w-5/12 p-2">
                    Memiliki wawasan dan pengetahuan dasar mengenai
                    karakteristik material dan produksi yang berkaitan dengan
                    industri skala kecil dan menengah dan/atau industri skala
                    manufaktur;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have insight and basic knowledge about the characteristics
                    of materials and production related to small and medium
                    scale industries and/or manufacturing scale industries;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P8')}
                  >
                    {finalCPLScores['CPL-PDE-P8']
                      ? finalCPLScores['CPL-PDE-P8'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.9</td>
                  <td className="border w-5/12 p-2">
                    Memiliki wawasan dan pengetahuan dasar mengenai sejarah dan
                    perkembangan desain produk industri meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>sejarah desain produk industri secara umum;</li>
                      <li>
                        sejarah perkembangan desain produk industri pada 5 tahun
                        terakhir;
                      </li>
                      <li>
                        sejarah desain produk industri pada salah satu komoditas
                        tertentu;
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have insight and basic knowledge about the history and
                    development of industrial product design, including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>history of industrial product design in general;</li>
                      <li>
                        history of industrial product design development in the
                        last 5 years;
                      </li>
                      <li>
                        history of industrial product design on a particular
                        commodity;
                      </li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P9')}
                  >
                    {finalCPLScores['CPL-PDE-P9']
                      ? finalCPLScores['CPL-PDE-P9'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.10</td>
                  <td className="border w-5/12 p-2">
                    Memiliki wawasan dan pengetahuan dasar untuk mendukung
                    kemampuan membangun sudut pandang strategis yang
                    berorientasi pada peluang komersial dari konsep desain
                    terhadap sektor pasar yang ada dan dinamika perubahannya;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have insight and basic knowledge to support the ability to
                    build a strategic viewpoint oriented to commercial
                    opportunities from design concepts to existing market
                    sectors and their changing dynamics;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P10')}
                  >
                    {finalCPLScores['CPL-PDE-P10']
                      ? finalCPLScores['CPL-PDE-P10'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.C.11</td>
                  <td className="border w-5/12 p-2">
                    Memiliki pengetahuan dalam analisis dan pengambilan
                    keputusan visual produk meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        dasar kajian obyek visual dengan orientasi pada aspek
                        formal;
                      </li>
                      <li>
                        dasar kajian obyek visual dengan orientasi pada aspek
                        manusia (subyek);
                      </li>
                      <li>
                        penerapan kedua dasar kajian tersebut sebagai perangkat
                        analisis visual.
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Have knowledge about product visual analysis and decision
                    making, including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        basic study of visual objects with an orientation to the
                        formal aspect;
                      </li>
                      <li>
                        basic study of visual objects with an orientation to the
                        human aspect (subject);
                      </li>
                      <li>
                        the application of the two basic assessments as a visual
                        analysis tool.
                      </li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P11')}
                  >
                    {finalCPLScores['CPL-PDE-P11']
                      ? finalCPLScores['CPL-PDE-P11'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Capaian Pembelajaran Aspek Keterampilan Khusus */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">D. Keterampilan Khusus</h3>
            <p className="italic">Spesific Skills</p>

            <h3 className="text-lg font-semibold mt-8">
              Lulusan program studi Desain Produk pada program sarjana,
              Universitas Prasetiya Mulya:
            </h3>
            <p className="italic">
              Graduates of undergraduate program in Product Design Engineering,
              Universitas Prasetiya Mulya:
            </p>

            <table className="w-full mt-8 border-collapse border border-gray-400">
              <tbody className="align-top">
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.1</td>
                  <td className="border w-5/12 p-2">
                    Mampu meneliti, menentukan, mengintegrasikan, serta
                    mengkomunikasikan beragam persoalan desain produk industri
                    dalam kesatuan yang terintegrasi, meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        kemampuan menerapkan salah satu metoda penelitian
                        kualitatif dengan tingkat kompleksitas rendah;
                      </li>
                      <li>
                        kemampuan mengabstraksi persoalan desain produk industri
                        dalam bentuk diagram;
                      </li>
                      <li>
                        kemampuan dasar penggunaan perangkat analisis visual;
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to research, determine, integrate, and communicate
                    various industrial product design issues in an integrated
                    unit, including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        the ability to apply one of the qualitative research
                        methods with a low level of complexity;
                      </li>
                      <li>
                        the ability to abstract industrial product design issues
                        in the form of diagrams;
                      </li>
                      <li>basic ability to use visual analysis tools;</li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-P11')}
                  >
                    {finalCPLScores['CPL-PDE-P11']
                      ? finalCPLScores['CPL-PDE-P11'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.2</td>
                  <td className="border w-5/12 p-2">
                    Mampu menghasilkan keragaman gagasan yang informatif, baik
                    dalam hal kualitas maupun kuantitas, melalui media dua
                    dimensi dan tiga dimensi sebagai media komunikasi antara
                    penggagas dan gagasannya;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Able to produce a variety of informative ideas, both in
                    terms of quality and quantity, through two-dimensional and
                    three-dimensional media as a medium of communication between
                    initiators and their ideas;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KK2')}
                  >
                    {finalCPLScores['CPL-PDE-KK2']
                      ? finalCPLScores['CPL-PDE-KK2'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.3</td>
                  <td className="border w-5/12 p-2">
                    Mampu menuangkan gagasan yang informatif melalui media dua
                    dimensi dan tiga dimensi sebagai media komunikasi antara
                    penggagas dan kelompok kerja meliputi:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        pengungkapan gagasan berupa alternatif dan
                        pengembangannya melalui thumbnail sketch, quick sketch,
                        render sketch, dan model komputer;
                      </li>
                      <li>
                        pengalaman yang terkait dengan pemilihan dan penggunaan
                        media dan material untuk pengungkapan gagasan;
                      </li>
                    </ul>
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to convey informative ideas through two-dimensional
                    and three-dimensional media as a medium of communication
                    between initiators and working groups, including:
                    <ul
                      className="list-disc ml-6"
                      style={{ listStyleType: 'lower-alpha' }}
                    >
                      <li>
                        expressing ideas in the form of alternatives and their
                        development through thumbnail sketches, quick sketches,
                        rendering sketches, and computer models;
                      </li>
                      <li>
                        experiences related to the selection and use of media
                        and materials for expressing ideas;
                      </li>
                    </ul>
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KK3')}
                  >
                    {finalCPLScores['CPL-PDE-KK3']
                      ? finalCPLScores['CPL-PDE-KK3'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.4</td>
                  <td className="border w-5/12 p-2">
                    Mampu menuangkan gagasan sesuai dengan standar gambar produk
                    yang mengacu pada salah satu ketetapan dari standar gambar
                    produk internasional;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to express ideas in accordance with product drawing
                    standards that refer to one of the provisions of
                    international product drawing standards;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KK4')}
                  >
                    {finalCPLScores['CPL-PDE-KK4']
                      ? finalCPLScores['CPL-PDE-KK4'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.5</td>
                  <td className="border w-5/12 p-2">
                    Mampu mengabstraksikan kualitas gagasan yang dihasilkan
                    melalui tulisan dan bagan visual yang ditunjukkan melalui
                    portofolio desain;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to abstract the quality of ideas generated through
                    writing and visual charts shown through design portfolio;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KK5')}
                  >
                    {finalCPLScores['CPL-PDE-KK5']
                      ? finalCPLScores['CPL-PDE-KK5'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.6</td>
                  <td className="border w-5/12 p-2">
                    Mampu menggunakan salah satu perangkat lunak sebagai alat
                    bantu desain;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to use a software as a design tool;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KK6')}
                  >
                    {finalCPLScores['CPL-PDE-KK6']
                      ? finalCPLScores['CPL-PDE-KK6'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.7</td>
                  <td className="border w-5/12 p-2">
                    Mampu merencanakan dan melakukan simulasi komputer dan
                    eksperimen rekayasa dari model atau purwarupa desain serta
                    melakukan analisis dan pembahasan hasil simulasi dan
                    eksperimen tersebut;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to plan and carry out computer simulations and
                    engineering experiments from models or design prototypes as
                    well as carry out analysis and discussion of the results of
                    these simulations and experiments;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KK7')}
                  >
                    {finalCPLScores['CPL-PDE-KK7']
                      ? finalCPLScores['CPL-PDE-KK7'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="border">
                  <td className="border w-1/12 p-2">3.D.8</td>
                  <td className="border w-5/12 p-2">
                    Mampu menyusun dokumen spesifikasi produk, serta instruksi
                    dan spesifikasi manufakturing produk dengan level
                    kompleksitas rendah;
                  </td>
                  <td className="border w-6/12 p-2 italic">
                    Are able to generate product specification documents, as
                    well as product manufacturing instructions and
                    specifications with a low level of complexity;
                  </td>
                  <td
                    className="border w-1/12 p-2 cursor-pointer font-bold text-primary-400"
                    onClick={() => handleCPLClick('CPL-PDE-KK8')}
                  >
                    {finalCPLScores['CPL-PDE-KK8']
                      ? finalCPLScores['CPL-PDE-KK8'].toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TTD Dekan */}
          <div className="flex mt-24">
            <div className="w-1/2"></div>
            <div className="w-1/2">
              <div className="text-left">
                <div className="flex items-center gap-4">
                  <p>Jakarta,</p>
                  <CRUInput
                    control={control}
                    register={register}
                    registeredName="tanggal_surat"
                    name="Tanggal Pengesahan Kelulusan"
                    required
                    errors={errors}
                    isDisabled={!editable}
                    hideLabel={true}
                    type="date"
                  />
                </div>

                <div className="text-left">
                  <img
                    src={signatureImage}
                    alt="Prof. Yudi Samyudia Signature"
                    className="inline-block"
                    style={{ width: '200px' }}
                  />
                </div>
                <p className="font-bold">Stevanus Wisnu Wijaya, Ph.D.</p>
                <p>Dekan, Sekolah Sains, Teknologi, Rekayasa, dan Matematika</p>
                <p className="italic">
                  Dean, School of Science, Technology, Engineering, and
                  Mathematics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SKPIPDE;
