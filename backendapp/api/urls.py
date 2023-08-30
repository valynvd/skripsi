from django.urls import path, include
from rest_framework import routers, urlpatterns
from rest_framework.routers import DefaultRouter
from . import views
from akreditasi import views as views_akreditasi
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
# Swagger documentation setup
schema_view = get_schema_view(
    openapi.Info(
        title="Snippets API",
        default_version='v1',
        contact=openapi.Contact(email="maleotechnologies@gmail.com"),
        license=openapi.License(name="MALEOTECH License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)
router = DefaultRouter()

# Glocal (tanpa token)
router.register('kurikulum', views.KurikulumViewSet)
router.register('matakuliah', views.MataKuliahViewSet)
router.register('cycle', views.CycleViewSet)
router.register('programstudi', views.ProgramStudiViewSet)
router.register('dosen', views.DosenViewSet)
router.register('suratpenugasan', views.SuratPenugasanViewSet)
router.register('penugasanpenelitian', views.PenugasanPenelitianViewSet)
router.register('publikasikarya', views.PublikasiKaryaViewSet)
router.register('patenhki', views.PatenHKIViewSet)
router.register('penugasanpengabdian', views.PenugasanPengabdianViewSet)
router.register('pembicara', views.PembicaraViewSet)
router.register('pengelolajurnal', views.PengelolaJurnalViewSet)
router.register('riwayatjabatanstruktural', views.RiwayatJabatanStrukturalViewSet)
router.register('penugasanpengajaran', views.PenugasanPengajaranViewSet)
router.register('penugasanpengajaranbyexcel', views.PenugasanPengajaranByExcelViewSet)
router.register('dokumenpembelajaran', views.DokumenPembelajaranViewSet)
router.register('riwayatdokumenpembelajaran', views.RiwayatDokumenPembelajaranViewSet)
router.register('portofolioperkuliahan', views.PortofolioPerkuliahanViewSet)
router.register('datamahasiswa', views.DataMahasiswaViewSet)
router.register('grupmahasiswa', views.GrupMahasiswaViewSet)
router.register('broadcastpesan', views.BroadCastPesanViewSet)
router.register('konsolchatbot', views.KonsolChatbotViewSet)
router.register('assignmahasiswatogrup', views.AssignMahasiswatoGrupViewSet)
router.register('monitoringmahasiswa', views.MonitoringMahasiswaViewSet)
router.register('capaianpembelajar', views.CapaianPembelajarViewSet)
router.register('validasimahasiswa', views.ValidasiMahasiswaViewSet)
router.register('transkripnilai', views.TranskripNilaiViewSet)
#Akreditasi
router.register('poinpenilaian', views_akreditasi.PoinPenilaianViewSet)
router.register('filefolder', views_akreditasi.ListFileFolderViewSet)
router.register('kriteria', views_akreditasi.KriteriaViewSet)
router.register('riwayatpoinpenilaian', views_akreditasi.RiwayatPoinPenilaianViewSet)
router.register('file', views_akreditasi.FileViewSet)
router.register('dokumenakreditasi', views_akreditasi.DokumenAkreditasiViewSet)
router.register('simulasimatriks', views_akreditasi.SimulasiMatriksViewSet)

urlpatterns = [
  path('', include(router.urls)),
  #Akreditasi custom request
  path('folderbymatrix/<matrix_id>', views_akreditasi.FolderFileByPoinPenilaian.as_view({'get': 'list'})),
  path('folderbyfolder/<folder_id>', views_akreditasi.FolderFileByFolder.as_view({'get': 'list'})),
  path('folderbykriteria/<kriteria_id>', views_akreditasi.FolderFileByKriteria.as_view({'get': 'list'})),
  # dokumen pembelajarn
  path('dokumenpembelajaranbydosen/<userId>/', views.DokumenPembelajaranByDosenViewSet.as_view()),
  path('dokumenpembelajaranbyprodi/<prodiId>/', views.DokumenPembelajaranByProdiViewSet.as_view()),
  path('riwayatdokumenpembelajaranbydokumenpembelajaran/<dokumenPembelajaranId>/', views.RiwayatDokumenPembelajaranByDokumenPembelajaranViewSet.as_view()),
  # penugasan pengajaran
  path('penugasanpengabdianbysuratpenugasan/<suratPenugasanId>/', views.PenugasanPengabdianBySuratPenugasan.as_view()),
  path('penugasanpengabdianbydosen/<dosenId>/', views.PenugasanPengabdianByDosenViewSet.as_view()),

  path('penugasanpengajaranbysuratpenugasan/<suratPenugasanId>/', views.PenugasanPengajaranBySuratPenugasan.as_view()),
  path('penugasanpengabdianbyprodi/<prodiId>/', views.PenugasanPengabdianByProdiViewSet.as_view()),
  path('penugasanpengabdianbydosen/<dosenId>/', views.PenugasanPengabdianByDosenViewSet.as_view()),

  path('penugasanpenelitianbysuratpenugasan/<suratPenugasanId>/', views.PenugasanPenelitianBySuratPenugasan.as_view()),
  path('penugasanpenelitianbyprodi/<prodiId>/', views.PenugasanPenelitianByProdiViewSet.as_view()),
  path('penugasanpenelitianbydosen/<dosenId>/', views.PenugasanPenelitianByDosenViewSet.as_view()),
  # paten hki
  path('patenhkibydosen/<dosenId>/', views.PatenHKIByDosenViewSet.as_view()),
  path('patenhkibyprodi/<prodiId>/', views.PatenHKIByProdiViewSet.as_view()),
  # publikasi karya
  path('publikasikaryabydosen/<dosenId>/', views.PublikasiKaryaByDosenViewSet.as_view()),
  path('publikasikaryabyprodi/<prodiId>/', views.PublikasiKaryaByProdiViewSet.as_view()),
  # matriks penilaian
  path('matrikspenilaianbyprodi/<prodiId>/', views_akreditasi.MatriksPenilaianByProdi),
  path('kriteriabydokumenakreditasiandsimulasimatriks/<dokumenAkreditasiId>/<simulasiMatriksId>/', views_akreditasi.KriteriaByDokumenAkreditasiAndSimulasiMatriks),
  path('kriteriabydokumenakreditasi/<dokumenAkreditasiId>/', views_akreditasi.KriteriaByDokumenAkreditasiViewSet.as_view()),
  # portofolio perkuliahan
  path('portofolioperkuliahanbydosen/<dosenId>/', views.PortofolioPerkuliahanByDosenViewSet.as_view()),
  #  documentation
  path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
  path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
  path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
  # grupmahasiswa
  path('assignmahasiswatogrupbynamagrup/<assignMahasiswaGrupName>/', views.AssignMahasiswatoGrupByNamaGrupViewSet.as_view()),
  # data mahasiswa
  path('datamahasiswabyprodi/<prodiId>/', views.DataMahasiswaByProdiViewSet.as_view()),
  # monitoringmahasiswa
  path('monitoringmahasiswabynim/<monitoringMahasiswaNIM>/', views.MonitoringMahasiswaByNIMViewSet.as_view()),
  path('monitoringmahasiswabymatakuliah/<monitoringMahasiswaKodeMataKuliah>/', views.MonitoringMahasiswaByKodeMatakuliahViewSet.as_view()),
  # validasimahasiswa
  path('validasimahasiswabynim/<validasiMahasiswaNIM>/', views.ValidasiMahasiswaByNIMViewSet.as_view()),
  # transkripnilai
  path('transkripnilaibynim/<transkripNilaiNIM>/', views.TranskripNilaiaByNIMViewSet.as_view()),
]
