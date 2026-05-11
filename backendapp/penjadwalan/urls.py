from django.urls import path

from .views import (
    batch_create,
    batch_detail,
    batch_export_xls,
    batch_list,
    batch_regenerate,
    batch_upload_excel,
    jadwal_update,
    ruangan_collection,
    ruangan_detail,
    upload_form,
)


urlpatterns = [
    path("", upload_form, name="penjadwalan-upload-form"),
    path("batches/", batch_list, name="penjadwalan-batch-list"),
    path("batches/create/", batch_create, name="penjadwalan-batch-create"),
    path("batches/upload-excel/", batch_upload_excel, name="penjadwalan-batch-upload-excel"),
    path("batches/<int:batch_id>/", batch_detail, name="penjadwalan-batch-detail"),
    path("batches/<int:batch_id>/regenerate/", batch_regenerate, name="penjadwalan-batch-regenerate"),
    path("batches/<int:batch_id>/export-xls/", batch_export_xls, name="penjadwalan-batch-export-xls"),
    path("ruangan/", ruangan_collection, name="penjadwalan-ruangan-collection"),
    path("ruangan/<int:room_id>/", ruangan_detail, name="penjadwalan-ruangan-detail"),
    path("jadwal/<int:jadwal_id>/", jadwal_update, name="penjadwalan-jadwal-update"),
]
