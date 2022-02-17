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
        ('Student', 'Student'),
    )
    role = models.CharField(max_length=100, choices=ROLES, default='Student')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullname', 'phone', 'role', 'is_active', 'is_staff']

    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        self.email = self.email.lower()
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.photo.delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return '{} / {}'.format(self.email, self.fullname)
