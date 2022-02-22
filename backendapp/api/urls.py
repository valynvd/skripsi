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
router.register('evaluasiperkulian', views.EvaluasiPerkuliahanViewSet)
router.register('portofolioperkuliahan', views.PortofolioPerkuliahanViewSet)
#Akreditasi
router.register('poinpenilaian', views_akreditasi.PoinPenilaianViewSet)
router.register('filefolder1', views_akreditasi.FileFolder1ViewSet)
router.register('filefolder2', views_akreditasi.FileFolder2ViewSet)
router.register('filefolder3', views_akreditasi.FileFolder3ViewSet)
router.register('filefolder4', views_akreditasi.FileFolder4ViewSet)

urlpatterns = [
  path('', include(router.urls)),

  #  documentation
  path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
  path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
