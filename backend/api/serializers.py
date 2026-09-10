from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    CustomUser,
    Department,
    ResearchActivity,
    NationalAcademyFellowship,
    InternationalProfessionalFellowship,
    VisitingProfessorship,
    ResearchAward,
    JournalIndexStatus,
    EditorialAppointment,
    ResearchGroupMembership,
)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token


class ForgotPasswordSerializer(serializers.Serializer):
    officialemail = serializers.EmailField(required=True)

    def validate_officialemail(self, value):
        value = value.strip().lower()
        if not value.endswith("@oouagoiwoye.edu.ng"):
            raise serializers.ValidationError(
                "Use your official OOU email address ending in @oouagoiwoye.edu.ng."
            )
        return value


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": ["New passwords do not match."]}
            )
        return attrs

class DepartmentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    
    class Meta:
        model = Department
        fields = ['code', 'name', 'faculty_name']

class CustomUserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    faculty_name = serializers.CharField(source='department.faculty.name', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'sname', 'fname', 'mname', 'title', 'email', 'officialemail', 
                 'academic_rank', 'phone_number', 'specialization', 'state_of_origin', 'orcid_id', 'google_scholar_id',
                 'scopus_id',
                 'department', 'department_name', 'faculty_name']
        read_only_fields = ['username']

class ResearchActivitySerializer(serializers.ModelSerializer):
    def validate_year(self, value):
        if value is not None and value < 1980:
            raise serializers.ValidationError("Year must be 1980 or later.")
        return value

    class Meta:
        model = ResearchActivity
        fields = '__all__'
        read_only_fields = ['user']


class NationalAcademyFellowshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = NationalAcademyFellowship
        fields = '__all__'
        read_only_fields = ['user']


class InternationalProfessionalFellowshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternationalProfessionalFellowship
        fields = '__all__'
        read_only_fields = ['user']


class VisitingProfessorshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitingProfessorship
        fields = '__all__'
        read_only_fields = ['user']


class ResearchAwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchAward
        fields = '__all__'
        read_only_fields = ['user']


class JournalIndexStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalIndexStatus
        fields = ['id', 'name']


class EditorialAppointmentSerializer(serializers.ModelSerializer):
    indexing_status = JournalIndexStatusSerializer(many=True, required=False)

    class Meta:
        model = EditorialAppointment
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        indexing_status = validated_data.pop('indexing_status', [])
        appointment = EditorialAppointment.objects.create(**validated_data)
        for status in indexing_status:
            appointment.indexing_status.add(status)
        return appointment

    def update(self, instance, validated_data):
        indexing_status = validated_data.pop('indexing_status', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.indexing_status.set(indexing_status)
        return instance


class ResearchGroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchGroupMembership
        fields = '__all__'
        read_only_fields = ['user']
