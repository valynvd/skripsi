from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid

class CustomUserManager(BaseUserManager):
    def _create_user(self, email, fullname, phone, role, is_staff, is_active, password,
    **extra_fields):

        if not email:
            raise ValueError('The given username must be set')

        email = self.normalize_email(email)
        user = self.model(  email=email,
                            fullname=fullname,
                            phone=phone,
                            role=role,
                            is_staff=is_staff,
                            is_active=is_active,
                            **extra_fields)
        user.set_password(password)
        user.save(using=self.db)

        return user

    def create_user(self,  email, fullname, phone, role,  is_staff, is_active,password=None, **extra_fields):
        return self._create_user(email, fullname, phone, role, is_staff,True, password, **extra_fields)

    def create_superuser(self, email, fullname, phone, role, is_staff, is_active,password=None, **extra_fields):
        return self._create_user(email, fullname, phone, 'Superadmin',  True, True, password,  **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    email = models.EmailField(max_length=255, unique=True)
    fullname = models.CharField(max_length=255, default='')
    phone = models.CharField(max_length=20, default='')
    photo = models.ImageField(upload_to='user/photo/', blank=True, null=True)
    ROLES = (
        ('Superadmin', 'Superadmin'),
        ('Admin', 'Admin'),
        ('Faculty Member', 'Faculty Member'),
        ('Student', 'Student'),
    )
    role = models.CharField(max_length=100, choices=ROLES, default='Student')
    LIST_JABATAN = (
        ('Tidak ada', 'Tidak ada'),
        ('Dosen Pengajar', 'Dosen Pengajar'),
        ('Kaprodi', 'Kaprodi'),
        ('Direktur/Kepala Unit', 'Direktur/Kepala Unit'),
        ('Dekan', 'Dekan'),
    )
    jabatan = models.CharField(max_length=100, choices=LIST_JABATAN, default='Tidak ada')
    LIST_JABATAN_FUNGSIONAL = (
        ('Belum ada', 'Belum ada'),
        ('Asisten Ahli 150', 'Asisten Ahli 150'),
        ('Lektor 200', 'Lektor 200'),
        ('Lektor 300', 'Lektor 300'),
        ('Lektor Kepala 400', 'Lektor Kepala 400'),
        ('Lektor Kepala 550', 'Lektor Kepala 550'),
        ('Lektor Kepala 700', 'Lektor Kepala 700'),
        ('Profesor 850', 'Profesor 850'),
        ('Profesor 1050', 'Profesor 1050'),
    )
    jabatan_fungsional = models.CharField(max_length=100, choices=LIST_JABATAN_FUNGSIONAL, default='Belum ada')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullname', 'phone', 'role', 'is_active', 'is_staff', 'jabatan', 'jabatan_fungsional']

    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        self.email = self.email.lower()
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.photo.delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return '{} / {}'.format(self.email, self.fullname)
