from django.contrib.auth import get_user_model
from djoser.serializers import UserSerializer
from rest_framework import serializers
from akreditasi import models as akreditasiModels
from api import serializers as apiSerializers

User = get_user_model()

class UserSerializerMeDAB(UserSerializer):
    dosen_detail = serializers.SerializerMethodField(read_only=True)

    class Meta(UserSerializer.Meta):
        model = User
        fields = (
            'id', 'fullname', 'phone', 'role', 'jabatan', 'email', 'dosen_detail'
        )

    def get_dosen_detail(self, obj):
        dosenByUser = akreditasiModels.Dosen.objects.filter(user = obj)
        if (len(dosenByUser) != 0):
            return apiSerializers.DosenSerializersAuthMe(dosenByUser[0], many=False).data
        else:
            return None
