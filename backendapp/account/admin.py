from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser

class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {
            'fields': (
                'email', 'fullname', 'phone', 'photo', 
                'role', 'password'
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
                'role', 'password1', 'password2',
            )
        }),
    )
    list_display = ['created_at', 'role', 'email', 'fullname']
    search_fields = ['role', 'email', 'fullname']
    ordering = ['-created_at']

admin.site.site_header = "STEM MANAGEMENT ADMIN"
admin.site.register(CustomUser, UserAdmin)
