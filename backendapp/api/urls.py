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
router.register('programstudi', views.ProgramStudiViewSet)
router.register('dosen', views.DosenViewSet)
router.register('suratpenugasan', views.SuratPenugasanViewSet)
router.register('penugasanpengajaran', views.PenugasanPengajaranViewSet)
router.register('evaluasiperkuliahan', views.EvaluasiPerkuliahanViewSet)
router.register('portofolioperkuliahan', views.PortofolioPerkuliahanViewSet)
#Akreditasi
router.register('poinpenilaian', views_akreditasi.PoinPenilaianViewSet)
router.register('filefolder', views_akreditasi.ListFileFolderViewSet)
router.register('kriteria', views_akreditasi.KriteriaViewSet)

urlpatterns = [
  path('', include(router.urls)),
  #Akreditasi custom request
  path('folderbymatrix/<matrix_id>', views_akreditasi.FolderFileByPoinPenilaian.as_view({'get': 'list'})),
  path('folderbyfolder/<folder_id>', views_akreditasi.FolderFileByFolder.as_view({'get': 'list'})),
  path('folderbykriteria/<kriteria_id>', views_akreditasi.FolderFileByKriteria.as_view({'get': 'list'})),
  # evaluasi perkuliahan
  path('evaluasiperkuliahanbydosen/<userId>/', views.EvaluasiPerkuliahanByDosenViewSet.as_view()),
  #  documentation
  path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
  path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
  path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]
