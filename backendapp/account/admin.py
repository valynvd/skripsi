from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser
from import_export.admin import ImportExportModelAdmin

class UserAdmin(BaseUserAdmin, ImportExportModelAdmin, admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': (
                'email', 'fullname', 'phone', 'photo', 
                'role', 'jabatan', 'jabatan_fungsional', 'password'
            )
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser'
            )}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':(
                'email', 'fullname', 'phone', 'photo', 
                'role', 'jabatan', 'jabatan_fungsional', 'password1', 'password2'
            )
        }),
    )
    list_display = ['created_at', 'role', 'email', 'fullname']
    search_fields = ['role', 'email', 'fullname']
    ordering = ['-created_at']

admin.site.site_header = "STEM MANAGEMENT ADMIN"
admin.site.register(CustomUser, UserAdmin)
