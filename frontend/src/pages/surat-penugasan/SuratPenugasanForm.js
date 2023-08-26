/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BiPlusCircle } from 'react-icons/bi';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostSuratPenugasan,
  usePatchSuratPenugasan,
  useSuratPenugasanById,
} from '../../hooks/useSuratPenugasan';
import { AlertError } from '../../components/Alert';
import CRUFileInput from '../../components/CRUFileInput';
import EditButton from '../../components/EditButton';
import {
  useDeletePenugasanPengajaran,
  usePenugasanPengajaranBySuratPenugasan,
} from '../../hooks/usePenugasanPengajaran';
import PenugasanPengajaranTable from './components/PenugasanPengajaranTable';
import jsPDF from 'jspdf';
import { PDFObject } from 'react-pdfobject';
import autoTable from 'jspdf-autotable';
import {
  fontCandara,
  fontCandaraBold,
  fontCandaraItalic,
} from '../../jspdf-fonts/Candara';
import { fontCalibri, fontCalibriBold } from '../../jspdf-fonts/Calibri';
import ModalCreateForm from '../../components/ModalCreateForm';
import PenugasanPengajaranModalForm from './components/PenugasanPengajaranModalForm';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import { useRef } from 'react';
import { usePostDokumenPembelajaran } from '../../hooks/useDokumenPembelajaran';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useCycleData } from '../../hooks/useCycle';
import PenugasanPenelitianTable from './components/PenugasanPenelitianTable';
import {
  useDeletePenugasanPenelitian,
  usePenugasanPenelitianBySuratPenugasan,
} from '../../hooks/usePenugasanPenelitian';
import PenugasanPenelitianModalForm from './components/PenugasanPenelitianModalForm';
import {
  useDeletePenugasanPengabdian,
  usePenugasanPengabdianBySuratPenugasan,
} from '../../hooks/usePenugasanPengabdian';
import PenugasanPengabdianModalForm from './components/PenugasanPengabdianModalForm';
import PenugasanPengabdianTable from './components/PenugasanPengabdianTable';

const SuratPenugasanForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemEdit, setSelectedItemEdit] = useState(null);
  const { state } = useLocation();
  const [suratPenugasanData, setSuratPenugasanData] = useState(state);
  const [link, setLink] = useState();
  const [editable, setEditable] = useState(true);
  const firstRender = useRef(true);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      judul: null,
      files: null,
      approved: null,
      category: null,
    },
  });
  const [openModal, setOpenModal] = useState(false);
  const [openModalPenelitian, setOpenModalPenelitian] = useState(false);
  const [openModalPengabdian, setOpenModalPengabdian] = useState(false);
  const semesterName = {
    Odd: 'Ganjil',
    Even: 'Genap',
    'Odd Short': 'Pendek Ganjil',
    'Even Short': 'Pendek Genap',
  };

  const { mutate: postSuratPenugasan, isLoading: postSuratPenugasanLoading } =
    usePostSuratPenugasan();
  const { mutate: patchSuratPenugasan, isLoading: patchSuratPenugasanLoading } =
    usePatchSuratPenugasan();
  const {
    data: dataPenugasanPengajaran,
    isLoading: isLoadingPenugasanPengajaran,
    refetch: penugasanPengajaranRefetch,
  } = usePenugasanPengajaranBySuratPenugasan(id, {
    enabled: !!id && suratPenugasanData?.category === 'pengajaran',
  });
  const {
    data: dataPenugasanPengabdian,
    isLoading: isLoadingPenugasanPengabdian,
    refetch: penugasanPengabdianRefetch,
  } = usePenugasanPengabdianBySuratPenugasan(id, {
    enabled: !!id && suratPenugasanData?.category === 'pengabdian',
  });
  const {
    data: dataPenugasanPenelitian,
    isLoading: isLoadingPenugasanPenelitian,
    refetch: penugasanPenelitianRefetch,
  } = usePenugasanPenelitianBySuratPenugasan(id, {
    enabled: !!id && suratPenugasanData?.category === 'penelitian',
  });
  const { data: dataCycle, isSuccess: dataCycleSuccess } = useCycleData({
    select: (response) => {
      const formatUserData = response.data.map(
        ({ id, start_year, end_year, semester }) => {
          return {
            value: id,
            label: `${start_year}/${end_year} ${semesterName[semester]}`,
          };
        }
      );

      return formatUserData;
    },
  });
  const {
    data: updatedSuratPenugasanData,
    isLoading: isLoadingUpdatedSuratPenugasan,
    refetch: updatedSuratPenugasanRefecth,
  } = useSuratPenugasanById(id, { enabled: !!id });
  const {
    mutate: postDokumenPembelajaran,
    isLoading: postDokumenPembelajaranLoading,
  } = usePostDokumenPembelajaran();
  const navigate = useNavigate();
  const { mutate: deletePenugasanPengajaran } = useDeletePenugasanPengajaran();
  const { mutate: deletePenugasanPenelitian } = useDeletePenugasanPenelitian();
  const { mutate: deletePenugasanPengabdian } = useDeletePenugasanPengabdian();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedSuratPenugasanData) {
        setSuratPenugasanData(updatedSuratPenugasanData.data);
        reset(updatedSuratPenugasanData.data);
      }
      setEditable(false);
    }
  }, [updatedSuratPenugasanData, reset, state, id]);

  const onSubmit = (data) => {
    const suratPenugasanFormData = new FormData();

    if (dirtyFields.judul) {
      suratPenugasanFormData.append('judul', data.judul);
    }
    if (dirtyFields.files) {
      suratPenugasanFormData.append('files', data.files);
    }
    if (dirtyFields.approved) {
      suratPenugasanFormData.append('approved', data.approved);
    }
    if (dirtyFields.category) {
      suratPenugasanFormData.append('category', data.category);
    }
    if (dirtyFields.cycle) {
      suratPenugasanFormData.append('cycle', data.cycle);
    }

    if (id) {
      patchSuratPenugasan(
        { data: suratPenugasanFormData, id: id },
        {
          onSuccess: (res) => {
            if (suratPenugasanData?.category === 'pengajaran') {
              if (
                suratPenugasanData.approved === false &&
                data.approved === true
              ) {
                dataPenugasanPengajaran.data.forEach((item) => {
                  const dokumenPembelajaranFormData = new FormData();

                  dokumenPembelajaranFormData.append(
                    'penugasanPengajaranId',
                    item.id
                  );

                  const postData = postDokumenPembelajaran(
                    dokumenPembelajaranFormData,
                    {
                      onError: (err) => {
                        return 'err';
                      },
                    }
                  );

                  if (postData === 'err') {
                    return;
                  }
                });
              }
            }
            setSuratPenugasanData(res.data);
            setEditable(false);
          },
          onError: (err) => {
            setErrorMessage(err.message);
            setTimeout(() => {
              setErrorMessage();
            }, 5000);
          },
        }
      );
    } else {
      postSuratPenugasan(suratPenugasanFormData, {
        onSuccess: ({ data }) => {
          navigate(`/pelaksanaan-pendidikan/surat-penugasan/${data.id}`);
          setSuratPenugasanData(data);
        },
        onError: (err) => {
          setErrorMessage(err.message);
          setTimeout(() => {
            setErrorMessage();
          }, 5000);
        },
      });
    }
  };

  // useEffect(() => {
  //   if (firstRender.current) {
  //     firstRender.current = false;
  //     return;
  //   }

  //   const pdfURL = generatePDFPengajaran();

  //   let pdfBlob = new Blob([pdfURL], { type: 'application/pdf' });
  //   let pdfURL2 = URL.createObjectURL(pdfBlob);

  //   setLink(pdfURL2);

  //   return () => {
  //     URL.revokeObjectURL(pdfURL2);
  //   };
  // }, [dataPenugasanPengajaran]);

  const generatePDFPenelitian = () => {
    (function (jsPDFAPI) {
      var callAddFont = function () {
        this.addFileToVFS('Candara-normal.ttf', fontCandara);
        this.addFont('Candara-normal.ttf', 'Candara', 'normal');
        this.addFileToVFS('Candara_Bold-bold.ttf', fontCandaraBold);
        this.addFont('Candara_Bold-bold.ttf', 'Candara', 'bold');
        this.addFileToVFS('Candara_Italic-italic.ttf', fontCandaraItalic);
        this.addFont('Candara_Italic-italic.ttf', 'Candara_Italic', 'italic');
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
    const marginLeftCenter = 3.6;

    // doc.addImage(
    //   require('../../assets/penelitian1.png'),
    //   'PNG',
    //   0,
    //   0,
    //   pageWidth,
    //   0
    // );

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      27,
      15,
      62,
      0
    );

    doc.setFontSize(12);
    const titleTextWidth = doc.getTextWidth('SURAT PENUGASAN') / 2;
    doc.text('SURAT PENUGASAN', center + marginLeftCenter, 44, {
      align: 'center',
    });
    doc.line(
      center - titleTextWidth + marginLeftCenter,
      44,
      center + titleTextWidth + marginLeftCenter,
      44
    );

    doc.text('No. 0/4/11.02.1/0675/09/2021', center + marginLeftCenter, 49.5, {
      align: 'center',
    });

    const marginLeft = 25;
    doc.setFont('Candara', 'normal');
    doc.text('Yang bertanda tangan di bawah ini:', marginLeft, 60);

    doc.text('Nama', marginLeft, 70);
    doc.text(':', marginLeft + 25, 70);
    doc.text('Prof. Yudi Samyudia, Ph.D', marginLeft + 28, 70);

    doc.text('Jabatan', marginLeft, 75.5);
    doc.text(':', marginLeft + 25, 75.5);
    doc.text('Dekan', marginLeft + 28, 75.5);

    doc.setFont('Times', 'normal');

    if (suratPenugasanData?.category === 'penelitian') {
      doc.text(
        'menugaskan Dosen Tetap Sekolah STEM Terapan Universitas Prasetiya Mulya seperti terlampir, untuk melaksanakan kegiatan Penelitian pada semester ganjil 2021/2022 untuk periode 06 September 2021 – 12 Januari 2022.',
        marginLeft,
        85.4,
        { maxWidth: pageWidth - 17.6 - marginLeft, align: 'justify' }
      );
    } else if (suratPenugasanData?.category === 'pengabdian') {
      doc.text(
        'menugaskan Dosen Tetap Sekolah STEM Terapan Universitas Prasetiya Mulya seperti terlampir, untuk melaksanakan kegiatan Pengabdian kepada Masyarakat pada semester ganjil 2021/2022 untuk periode 06 September 2021 – 12 Januari 2022.',
        marginLeft,
        85.4,
        { maxWidth: pageWidth - 17.6 - marginLeft, align: 'justify' }
      );
    }

    doc.text(
      'Demikianlah surat tugas ini dibuat dengan sebenarnya untuk dilaksanakan sebagaimana mestinya.',
      marginLeft,
      106.5,
      { maxWidth: pageWidth - 17.6 - marginLeft, align: 'justify' }
    );

    if (suratPenugasanData?.approved) {
      doc.addImage(
        require('../../assets/prof-yudi-sign-penelitian.png'),
        'PNG',
        119.2,
        133,
        43,
        0
      );
    }

    doc.setFont('Candara', 'normal');
    doc.text('Ditetapkan di', 114, 127);
    doc.text(':', 139.4, 127);
    doc.text('Serpong - BSD', 142.4, 127);

    doc.text('Pada Tanggal', 114, 132.3);
    doc.text(':', 139.4, 132.3);
    doc.text('03 September 2021', 142.4, 132.3);

    doc.setFont('Candara', 'bold');
    const profYudiTextWidth = doc.getTextWidth('Prof. Yudi Samyudia, Ph.D');
    doc.text('Prof. Yudi Samyudia, Ph.D', 114, 158);
    doc.line(114, 158, 114 + profYudiTextWidth, 158);

    doc.setFont('Candara', 'italic');
    doc.text('Dean of School of Applied STEM', 114, 163);

    const heightPerSentenceFooter = 3.5;

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(8);
    doc.text('Kampus BSD', 25, 275);

    doc.setFont('Calibri', 'normal');
    doc.text(
      'Kavling Edutown I.1, Jalan BSD Raya Utama',
      25,
      275 + heightPerSentenceFooter
    );
    doc.text(
      'BSD City, Tangerang – 15339',
      25,
      275 + heightPerSentenceFooter * 2
    );
    doc.text('t +62 21 30450 500', 25, 275 + heightPerSentenceFooter * 3);
    doc.text('f +62 21 30450 505', 52, 275 + heightPerSentenceFooter * 3);

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(8);
    doc.text('Kampus Cilandak', 88, 275);

    doc.setFont('Calibri', 'normal');
    doc.text(
      'Jalan R.A. Kartini (TB. Simatupang)',
      88,
      275 + heightPerSentenceFooter
    );
    doc.text(
      'Cilandak Barat, DKI Jakarta – 12430',
      88,
      275 + heightPerSentenceFooter * 2
    );
    doc.text('t +62 21 7500 463', 88, 275 + heightPerSentenceFooter * 3);
    doc.text('f +62 21 7500 460', 114, 275 + heightPerSentenceFooter * 3);

    doc.setFont('Calibri', 'bold');
    doc.setTextColor(47, 84, 150);
    doc.text('prasetiyamulya.ac.id', 152, 275 + heightPerSentenceFooter * 3);

    // halaman 2

    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    // doc.addImage(
    //   require('../../assets/penelitian2.png'),
    //   'PNG',
    //   0,
    //   0,
    //   pageWidth,
    //   0
    // );

    doc.setFont('Candara', 'bold');
    doc.setFontSize(12);
    doc.text('DAFTAR NAMA DOSEN TETAP', center + marginLeftCenter, 43.7, {
      align: 'center',
    });
    doc.text('SEKOLAH STEM TERAPAN', center + marginLeftCenter, 48.7, {
      align: 'center',
    });
    doc.text('UNIVERSITAS PRASETIYA MULYA', center + marginLeftCenter, 53.7, {
      align: 'center',
    });

    const filterBody = () => {
      if (!dataPenugasanPenelitian) {
        return [];
      }
      const dataPenugasanPenelitianLen = dataPenugasanPenelitian.data.length;

      dataPenugasanPenelitian.data.sort(function (a, b) {
        var nameA = a.dosen_pengampu_detail.prodi_detail.name.toLowerCase(),
          nameB = b.dosen_pengampu_detail.prodi_detail.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      let data = [];
      for (let i = 0; i < dataPenugasanPenelitianLen; i++) {
        data.push([
          {
            content: i + 1,
            styles: { halign: 'center' },
          },
          dataPenugasanPenelitian.data[i].dosen_pengampu_detail.name,
          {
            content:
              dataPenugasanPenelitian.data[i].dosen_pengampu_detail.prodi_detail
                .name,
            styles: { halign: 'center' },
          },
        ]);
      }

      return data;
    };

    console.error = () => {};
    autoTable(doc, {
      head: [
        [
          {
            content: 'No',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'Nama',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'Program Studi',
            styles: { halign: 'center', valign: 'middle' },
          },
        ],
      ],
      body: filterBody(),
      theme: 'plain',
      startY: 65,
      columnStyles: {
        0: { cellWidth: 13 },
        1: { cellWidth: 80 },
        2: { cellWidth: 60 },
      },
      styles: {
        lineColor: 'black',
        lineWidth: 0.2,
        overflow: 'linebreak',
        font: 'Candara',
      },
      showHead: 'everyPage',
      margin: { vertical: 30, left: 32.1 },
      didDrawPage: function (data) {
        // Header
        doc.addImage(
          require('../../assets/logo/prasmul-logo-default.png'),
          'PNG',
          26.8,
          14.5,
          62,
          0
        );
        // Footer
        // var str = 'Page ' + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        var pageSize = doc.internal.pageSize;
        var pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();

        doc.setFont('Calibri', 'bold');
        doc.setFontSize(8);
        doc.text('Kampus BSD', 25, 275);

        doc.setFont('Calibri', 'normal');
        doc.text(
          'Kavling Edutown I.1, Jalan BSD Raya Utama',
          25,
          275 + heightPerSentenceFooter
        );
        doc.text(
          'BSD City, Tangerang – 15339',
          25,
          275 + heightPerSentenceFooter * 2
        );
        doc.text('t +62 21 30450 500', 25, 275 + heightPerSentenceFooter * 3);
        doc.text('f +62 21 30450 505', 57, 275 + heightPerSentenceFooter * 3);

        doc.setFont('Calibri', 'bold');
        doc.setFontSize(8);
        doc.text('Kampus Cilandak', 88.5, 275);

        doc.setFont('Calibri', 'normal');
        doc.text(
          'Jalan R.A. Kartini (TB. Simatupang)',
          88.5,
          275 + heightPerSentenceFooter
        );
        doc.text(
          'Cilandak Barat, DKI Jakarta – 12430',
          88.5,
          275 + heightPerSentenceFooter * 2
        );
        doc.text('t +62 21 7500 463', 88.5, 275 + heightPerSentenceFooter * 3);
        doc.text('f +62 21 7500 460', 114.5, 275 + heightPerSentenceFooter * 3);

        doc.setFont('Calibri', 'bold');
        doc.setTextColor(47, 84, 150);
        doc.text(
          'prasetiyamulya.ac.id',
          152,
          275 + heightPerSentenceFooter * 3
        );
      },
    });

    return doc.save('test');
    // return doc.output('blob');
  };

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

    // doc.addImage(
    //   require('../../assets/pengajaran1.png'),
    //   'PNG',
    //   0,
    //   0,
    //   pageWidth,
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
    const titleStart = 29;
    const titleText = (text, position) => {
      doc.text(text, center + 4, titleStart + position * 5, {
        align: 'center',
      });
    };
    doc.setFontSize(12);

    console.log(suratPenugasanData);
    titleText('SURAT KEPUTUSAN', 1);
    titleText('DEKAN SEKOLAH STEM – UNIVERSITAS PRASETIYA MULYA', 2);
    titleText(
      `NOMOR 0/4/11.01.1/0674/09/${suratPenugasanData.cycle_detail?.start_year}`,
      3
    );
    titleText('TENTANG', 4);
    titleText(
      `PENUGASAN PENGAJARAN SEMESTER ${
        semesterName[suratPenugasanData.cycle_detail?.semester] &&
        semesterName[suratPenugasanData.cycle_detail?.semester].toUpperCase()
      } TAHUN AKADEMIK ${suratPenugasanData.cycle_detail?.start_year}/${
        suratPenugasanData.cycle_detail?.end_year
      }`,
      5
    );
    titleText('SEKOLAH STEM – UNIVERSITAS PRASETIYA MULYA', 6);
    titleText('DEKAN SEKOLAH STEM – UNIVERSITAS PRASETIYA MULYA', 8);

    doc.setFont('Times', 'bold');
    doc.text('Menimbang:', 25, 83);

    doc.setFont('Times', 'normal');
    bulletList(
      'a.',
      `Bahwa untuk menunjang kelancaran pendidikan Program Sarjana (S1) Sekolah STEM Universitas Prasetiya Mulya, perlu ditetapkan penugasan pengajaran semester ganjil tahun akademik ${suratPenugasanData.cycle_detail?.start_year}/${suratPenugasanData.cycle_detail?.end_year}`,
      91
    );
    bulletList(
      'b.',
      'Bahwa aspek bidang penugasan pengajaran didasarkan pada keilmuan dari Faculty Member',
      91 + heightPerSentence * 3
    );
    bulletList(
      'c.',
      'Bahwa nama yang tercantum dalam Surat Keputusan ini layak, mampu, dan memenuhi syarat untuk keperluan di atas.',
      91 + heightPerSentence * 4
    );
    bulletList(
      'd.',
      'Bahwa berdasarkan pertimbangan a, b, dan c di atas perlu dikeluarkan Surat Keputusan.',
      91 + heightPerSentence * 6
    );

    doc.setFont('Times', 'bold');
    doc.text('Mengingat:', 25, 144);

    doc.setFont('Times', 'normal');
    bulletList(
      '1.',
      'Surat Keputusan Rektor Universitas Prasetiya Mulya Nomor 0/2/0335-3/10/17/02/01 tanggal 01 Oktober 2017 tentang Standar Jam Layanan Fakulti Program Sarjana di Program Sarjana.',
      152.5
    );
    bulletList(
      '2.',
      'Surat Keputusan Ketua Pengurus Yayasan Prasetiya Mulya Nomor 0/1/01/0183/08/2020 tanggal 25 Agustus 2020 tentang Penetapan Pengangkatan Dekan Sekolah STEM Terapan Universitas Prasetiya Mulya Masa Tugas 2020 – 2024.',
      152.5 + heightPerSentence * 2
    );

    doc.setFont('Times', 'bold');
    doc.setFontSize(11);
    doc.text('MEMUTUSKAN:', center - 11, 194.2);

    doc.setFontSize(12);
    doc.text('Menetapkan:', 25, 202);

    doc.setFont('Times', 'normal');
    bulletList(
      '1.',
      `Menugaskan kepada nama-nama Faculty Member di dalam lampiran Surat Keputusan ini untuk bertindak dan bertanggung jawab sebagai Dosen Pengampu Mata Kuliah Program Sarjana (S1) Sekolah STEM Universitas Prasetiya Mulya untuk Semester Ganjil Tahun Akademik ${suratPenugasanData.cycle_detail?.start_year}/${suratPenugasanData.cycle_detail?.end_year}.`,
      211.5
    );

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

    // halaman 2

    doc.addPage('a4');
    doc.setTextColor(0, 0, 0);

    // doc.addImage(
    //   require('../../assets/pengajaran2.png'),
    //   'PNG',
    //   0,
    //   0,
    //   pageWidth,
    //   0
    // );

    if (suratPenugasanData?.approved) {
      doc.setFont('Candara', 'bold');
      doc.setFontSize(12);
      doc.addImage(
        require('../../assets/prof-yudi-sign-pengajaran.png'),
        'PNG',
        87.8,
        65.5,
        43,
        0
      );
      doc.text('Prof. Yudi Samyudia, Ph.D', center + 4, 90, {
        align: 'center',
      });
    }

    doc.addImage(
      require('../../assets/logo/prasmul-logo-default.png'),
      'PNG',
      28,
      10,
      60,
      0
    );

    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    bulletList(
      '2.',
      'Keputusan ini berlaku sejak awal masa perkuliahan Semester Genap Tahun Akademik 2020/2021 dan apabila terdapat kekeliruan di dalam penetapannya akan diadakan perubahan sebagaimana mestinya.',
      29
    );

    doc.setFont('Candara', 'normal');
    doc.text('Ditetapkan di', 81, 49);
    doc.text(':', 108, 49);
    doc.text('Tangerang', 113, 49);

    doc.text('Pada Tanggal', 81, 54);
    doc.text(':', 108, 54);
    doc.text('05 Maret 2021', 113, 54);

    doc.setFont('Candara', 'bold');

    // if()
    doc.text(
      'Dekan Sekolah STEM Terapan Universitas Prasetiya Mulya',
      center + 4,
      64,
      {
        align: 'center',
      }
    );

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(8);
    doc.text('Kampus BSD', 25, 274);

    doc.setFont('Calibri', 'normal');
    doc.text(
      'Kavling Edutown I.1, Jalan BSD Raya Utama',
      25,
      274 + heightPerSentenceFooter
    );
    doc.text(
      'BSD City, Tangerang – 15339',
      25,
      274 + heightPerSentenceFooter * 2
    );
    doc.text('t +62 21 30450 500', 25, 274 + heightPerSentenceFooter * 3);
    doc.text('f +62 21 30450 505', 52, 274 + heightPerSentenceFooter * 3);

    doc.setFont('Calibri', 'bold');
    doc.setFontSize(8);
    doc.text('Kampus Cilandak', 88, 274);

    doc.setFont('Calibri', 'normal');
    doc.text(
      'Jalan R.A. Kartini (TB. Simatupang)',
      88,
      274 + heightPerSentenceFooter
    );
    doc.text(
      'Cilandak Barat, DKI Jakarta – 12430',
      88,
      274 + heightPerSentenceFooter * 2
    );
    doc.text('t +62 21 7500 463', 88, 274 + heightPerSentenceFooter * 3);
    doc.text('f +62 21 7500 460', 114, 274 + heightPerSentenceFooter * 3);

    doc.setFont('Calibri', 'bold');
    doc.setTextColor(47, 84, 150);
    doc.text('prasetiyamulya.ac.id', 152, 274 + heightPerSentenceFooter * 3);

    doc.addPage('a4', 'landscape');

    const filterBody = () => {
      if (!dataPenugasanPengajaran) {
        return [];
      }
      const dataPenugasanPengajaranLen = dataPenugasanPengajaran.data.length;

      let lecturerName = '';
      let rowSpan = 1;
      let indexedLocation = 0;
      let lecturerObj = {
        content: '',
        rowSpan: 0,
        styles: { valign: 'middle' },
      };

      let filteredData = [];

      dataPenugasanPengajaran.data.sort(function (a, b) {
        var nameA = a.dosen_pengampu_detail.name.toLowerCase(),
          nameB = b.dosen_pengampu_detail.name.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });

      dataPenugasanPengajaran.data.forEach((item, index) => {
        let itemData = [
          '',
          {
            content: item.mata_kuliah_detail?.name || 'Tidak ada',
            styles: { valign: 'middle' },
          },
          {
            content: item.mata_kuliah_detail?.kode || 'Tidak ada',
            styles: { valign: 'middle', halign: 'center' },
          },
          {
            content:
              item.dosen_pengampu_detail?.prodi_detail?.name || 'Tidak ada',
            styles: { valign: 'middle', halign: 'center' },
          },
          {
            content: item.class_code || 'Tidak ada',
            styles: { valign: 'middle', halign: 'center' },
          },
          {
            content: item.mata_kuliah_detail?.sks_total || 'Tidak ada',
            styles: { valign: 'middle', halign: 'center' },
          },
          {
            content: item.sks_realisasi || 'Tidak ada',
            styles: { valign: 'middle', halign: 'center' },
          },
          {
            content: item.students_amount || 'Tidak ada',
            styles: { valign: 'middle', halign: 'center' },
          },
        ];

        if (index === 0) {
          lecturerName = item.dosen_pengampu_detail.name;
          indexedLocation = index;
          lecturerObj.content = lecturerName;
          itemData[0] = {
            content: lecturerName,
            rowSpan: 0,
            styles: { valign: 'middle' },
          };
        } else if (item.dosen_pengampu_detail.name !== lecturerName) {
          filteredData[indexedLocation][0].rowSpan = rowSpan;
          if (index + 1 !== dataPenugasanPengajaranLen) {
            lecturerName = item.dosen_pengampu_detail.name;
          }
          itemData[0] = {
            content: item.dosen_pengampu_detail.name,
            rowSpan: 0,
            styles: { valign: 'middle' },
          };
          indexedLocation = index;
          rowSpan = 1;
        } else {
          rowSpan += 1;
          itemData.shift();
        }

        if (
          dataPenugasanPengajaranLen !== 1 &&
          index + 1 === dataPenugasanPengajaran.data.length &&
          item.dosen_pengampu_detail.name === lecturerName
        ) {
          filteredData[indexedLocation][0].rowSpan = rowSpan;
        }

        filteredData.push(itemData);
      });

      return filteredData;
    };

    // doc.addImage(
    //   require('../../assets/pengajaran3.png'),
    //   'PNG',
    //   0,
    //   0,
    //   pageWidth,
    //   0
    // );

    doc.setFont('Candara', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(
      'Lampiran 1. SK Dekan Sekolah STEM Terapan Nomor 0/4/11.01.1/0116/03/2020',
      30,
      29
    );

    doc.text(
      'PENUGASAN PENGAJARAN SEMESTER GENAP TAHUN AKADEMIK 2020/2021',
      pageHeight / 2 + 3,
      37.4,
      { align: 'center' }
    );
    doc.text(
      'SEKOLAH STEM TERAPAN UNIVERSITAS PRASETIYA MULYA',
      pageHeight / 2 + 3,
      43,
      { align: 'center' }
    );

    autoTable(doc, {
      head: [
        [
          {
            content: 'Nama Faculty Member',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'Mata Kuliah',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'Kode Mata Kuliah',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'Program Studi',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'Kode Kelas',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'SKS Mata Kuliah',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'SKS Realisasi',
            styles: { halign: 'center', valign: 'middle' },
          },
          {
            content: 'Jumlah Mahasiswa',
            styles: { halign: 'center', valign: 'middle' },
          },
        ],
      ],
      body: filterBody(),
      theme: 'plain',
      startY: 50,
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 64 },
        2: { cellWidth: 24 },
        3: { cellWidth: 33 },
        4: { cellWidth: 23 },
        5: { cellWidth: 15 },
        6: { cellWidth: 20 },
      },
      styles: {
        lineColor: 'black',
        lineWidth: 0.2,
        overflow: 'linebreak',
        font: 'Candara',
      },
      showHead: 'everyPage',
      margin: { right: 10, vertical: 30, left: 15.5 },
      didParseCell: function (cell) {
        if (cell.cell?.raw?.content === 'Tidak ada') {
          cell.cell.styles.fontStyle = 'bold';
          cell.cell.styles.textColor = [255, 0, 0];
        }
      },
      didDrawPage: function (data) {
        // Header
        doc.addImage(
          require('../../assets/logo/prasmul-logo-default.png'),
          'PNG',
          33,
          10,
          60,
          0
        );
        // Footer
        // var str = 'Page ' + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        var pageSize = doc.internal.pageSize;
        var pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();

        doc.setFont('Calibri', 'bold');
        doc.setFontSize(8);
        doc.text('Kampus BSD', 30, 186);

        doc.setFont('Calibri', 'normal');
        doc.text(
          'Kavling Edutown I.1, Jalan BSD Raya Utama',
          30,
          186 + heightPerSentenceFooter
        );
        doc.text(
          'BSD City, Tangerang – 15339',
          30,
          186 + heightPerSentenceFooter * 2
        );
        doc.text('t +62 21 30450 500', 30, 186 + heightPerSentenceFooter * 3);
        doc.text('f +62 21 30450 505', 57, 186 + heightPerSentenceFooter * 3);

        doc.setFont('Calibri', 'bold');
        doc.setFontSize(8);
        doc.text('Kampus Cilandak', 93.5, 186);

        doc.setFont('Calibri', 'normal');
        doc.text(
          'Jalan R.A. Kartini (TB. Simatupang)',
          93.5,
          186 + heightPerSentenceFooter
        );
        doc.text(
          'Cilandak Barat, DKI Jakarta – 12430',
          93.5,
          186 + heightPerSentenceFooter * 2
        );
        doc.text('t +62 21 7500 463', 93.5, 186 + heightPerSentenceFooter * 3);
        doc.text('f +62 21 7500 460', 119.5, 186 + heightPerSentenceFooter * 3);

        doc.setFont('Calibri', 'bold');
        doc.setTextColor(47, 84, 150);
        doc.text(
          'prasetiyamulya.ac.id',
          157,
          186 + heightPerSentenceFooter * 3
        );
      },
    });

    return doc.save('test');
    // return doc.output('blob');
  };

  return (
    <>
      <ModalDelete
        title={`Penugasan ${suratPenugasanData?.category
          ?.charAt(0)
          .toUpperCase()}${suratPenugasanData?.category?.slice(1)}`}
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() => {
          if (suratPenugasanData?.category === 'pengajaran') {
            deletePenugasanPengajaran(selectedItem, {
              onSuccess: () => {
                queryClient.invalidateQueries(
                  'penugasan-pengajaran-by-surat-penugasan'
                );
                setOpenModalDelete(false);
              },
            });
          } else if (suratPenugasanData?.category === 'penelitian') {
            deletePenugasanPenelitian(selectedItem, {
              onSuccess: () => {
                queryClient.invalidateQueries(
                  'penugasan-penelitian-by-surat-penugasan'
                );
                setOpenModalDelete(false);
              },
            });
          } else if (suratPenugasanData?.category === 'pengabdian') {
            deletePenugasanPengabdian(selectedItem, {
              onSuccess: () => {
                queryClient.invalidateQueries(
                  'penugasan-pengabdian-by-surat-penugasan'
                );
                setOpenModalDelete(false);
              },
            });
          }
        }}
      />
      <PenugasanPengabdianModalForm
        penugasanPengabdianRefetch={penugasanPengabdianRefetch}
        openModal={openModalPengabdian}
        setOpenModal={setOpenModalPengabdian}
        penugasanPengabdianData={selectedItemEdit}
        suratPenugasanId={id}
      />
      <PenugasanPenelitianModalForm
        penugasanPenelitianRefetch={penugasanPenelitianRefetch}
        openModal={openModalPenelitian}
        setOpenModal={setOpenModalPenelitian}
        penugasanPenelitianData={selectedItemEdit}
        suratPenugasanId={id}
      />
      <PenugasanPengajaranModalForm
        penugasanPengajaranRefetch={penugasanPengajaranRefetch}
        openModal={openModal}
        setOpenModal={setOpenModal}
        penugasanPengajaranData={selectedItemEdit}
        suratPenugasanId={id}
      />
      <section id="surat-penugasan-form" className="section-container">
        <BreadCrumbs
          links={[
            {
              name: 'Daftar Surat Penugasan',
              link: '/pelaksanaan-pendidikan/surat-penugasan',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        <p className="text-lg font-semibold">
          {id ? 'Detail' : 'Buat'} Surat Penugasan
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUInput
            register={register}
            name="judul"
            required
            errors={errors}
            registeredName="judul"
            isDisabled={!editable}
          />
          <CRUDropdownInput
            control={control}
            name="Periode"
            registeredName="cycle"
            options={dataCycleSuccess ? dataCycle : []}
            required
            isDisabled={!editable}
          />
          <CRUDropdownInput
            control={control}
            name="Kategori"
            registeredName="category"
            defaultValue={
              suratPenugasanData?.category
                ? {
                    value: suratPenugasanData.category,
                    label: suratPenugasanData.category,
                  }
                : null
            }
            options={[
              { value: 'pengajaran', label: 'Pengajaran' },
              { value: 'pengabdian', label: 'Pengabdian' },
              { value: 'penelitian', label: 'Penelitian' },
            ]}
            required
            isDisabled={!editable}
          />
          <CRUFileInput
            control={control}
            fileLink={suratPenugasanData?.files}
            register={register}
            registeredName="files"
            name="File"
            type="file"
            note="Jika file surat penugasan sudah ada, upload file tersebut di sini. Jika file surat penugasan tidak ada, gunakan website ini untuk membuat surat penugasan secara otomatis."
            isDisabled={!editable}
          />
          {id ? (
            <CRUInput
              register={register}
              name="Disetujui"
              type="checkbox"
              errors={errors}
              registeredName="approved"
              isDisabled={!editable}
            />
          ) : null}
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {id ? (
            <div className="flex flex-row !mt-8 space-x-3">
              {!editable && (
                <EditButton
                  className={`!text-base`}
                  type="button"
                  onClick={() => setEditable(true)}
                />
              )}
              {editable && (
                <EditButton
                  className={`!text-base`}
                  type="submit"
                  isLoading={patchSuratPenugasanLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={postSuratPenugasanLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
      {id ? (
        <>
          {suratPenugasanData?.category === 'pengajaran' && (
            <section
              id="penugasan-pengajaran-table"
              className="section-container mt-4"
            >
              <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">
                  Daftar Penugasan Pengajaran
                </p>
                <PrimaryButton
                  icon={<BiPlusCircle size={22} />}
                  onClick={() => {
                    setSelectedItemEdit(null);
                    setOpenModal((openModal) => !openModal);
                  }}
                >
                  Buat Penugasan Pengajaran
                </PrimaryButton>
              </div>

              <div className="mt-8 w-full rounded-t-lg">
                <PenugasanPengajaranTable
                  setSelectedItem={setSelectedItem}
                  setSelectedItemEdit={setSelectedItemEdit}
                  setOpenModalDelete={setOpenModalDelete}
                  setOpenModalEdit={setOpenModal}
                  loading={isLoadingPenugasanPengajaran}
                  data={dataPenugasanPengajaran?.data ?? []}
                />
              </div>
            </section>
          )}
          {suratPenugasanData?.category === 'penelitian' && (
            <section
              id="penugasan-pengajaran-table"
              className="section-container mt-4"
            >
              <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">
                  Daftar Penugasan Penelitian
                </p>
                <PrimaryButton
                  icon={<BiPlusCircle size={22} />}
                  onClick={() => {
                    setSelectedItemEdit(null);
                    setOpenModalPenelitian((openModal) => !openModal);
                  }}
                >
                  Buat Penugasan Penelitian
                </PrimaryButton>
              </div>

              <div className="mt-8 w-full rounded-t-lg">
                <PenugasanPenelitianTable
                  setSelectedItem={setSelectedItem}
                  setSelectedItemEdit={setSelectedItemEdit}
                  setOpenModalDelete={setOpenModalDelete}
                  setOpenModalEdit={setOpenModalPenelitian}
                  loading={isLoadingPenugasanPenelitian}
                  data={dataPenugasanPenelitian?.data ?? []}
                />
              </div>
            </section>
          )}
          {suratPenugasanData?.category === 'pengabdian' && (
            <section
              id="penugasan-pengajaran-table"
              className="section-container mt-4"
            >
              <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">
                  Daftar Penugasan Pengabdian
                </p>
                <PrimaryButton
                  icon={<BiPlusCircle size={22} />}
                  onClick={() => {
                    setSelectedItemEdit(null);
                    setOpenModalPengabdian((openModal) => !openModal);
                  }}
                >
                  Buat Penugasan Pengabdian
                </PrimaryButton>
              </div>

              <div className="mt-8 w-full rounded-t-lg">
                <PenugasanPengabdianTable
                  setSelectedItem={setSelectedItem}
                  setSelectedItemEdit={setSelectedItemEdit}
                  setOpenModalDelete={setOpenModalDelete}
                  setOpenModalEdit={setOpenModalPenelitian}
                  loading={isLoadingPenugasanPengabdian}
                  data={dataPenugasanPengabdian?.data ?? []}
                />
              </div>
            </section>
          )}
          <section id="pdf" className="section-container mt-4">
            <p className="font-semibold text-lg">Format PDF</p>
            <div className="mt-2">
              {/* <PDFObject height="60rem" url={link} /> */}
              <PrimaryButton
                onClick={() => {
                  if (suratPenugasanData?.category === 'pengajaran') {
                    generatePDFPengajaran();
                  } else if (
                    suratPenugasanData?.category === 'penelitian' ||
                    suratPenugasanData?.category === 'pengabdian'
                  ) {
                    generatePDFPenelitian();
                  }
                }}
              >
                Download PDF
              </PrimaryButton>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
};

export default SuratPenugasanForm;
