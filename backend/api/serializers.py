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
    EditorialAppointment,
    ResearchGroupMembership,
    ActiveResearchProject,
    CompletedResearchProject,
    PhDThesis,
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
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
    faculty_name = serializers.CharField(source="faculty.name", read_only=True)

    class Meta:
        model = Department
        fields = ["code", "name", "faculty_name"]


class CustomUserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    faculty_name = serializers.CharField(
        source="department.faculty.name", read_only=True
    )

    class Meta:
        model = CustomUser
        fields = [
            "username",
            "sname",
            "fname",
            "mname",
            "title",
            "email",
            "officialemail",
            "academic_rank",
            "phone_number",
            "specialization",
            "state_of_origin",
            "orcid_id",
            "google_scholar_id",
            "scopus_id",
            "department",
            "department_name",
            "faculty_name",
        ]
        read_only_fields = ["username"]


class ResearchActivitySerializer(serializers.ModelSerializer):
    def validate_year(self, value):
        if value is not None and value < 1980:
            raise serializers.ValidationError("Year must be 1980 or later.")
        return value

    class Meta:
        model = ResearchActivity
        fields = "__all__"
        read_only_fields = ["user"]


class NationalAcademyFellowshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = NationalAcademyFellowship
        fields = "__all__"
        read_only_fields = ["user"]


class InternationalProfessionalFellowshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternationalProfessionalFellowship
        fields = "__all__"
        read_only_fields = ["user"]


class VisitingProfessorshipSerializer(serializers.ModelSerializer):
    duration_value = serializers.IntegerField(write_only=True, min_value=1)
    duration_unit = serializers.ChoiceField(
        choices=["weeks", "months", "years"],
        write_only=True,
    )

    def create(self, validated_data):
        duration_value = validated_data.pop("duration_value")
        duration_unit = validated_data.pop("duration_unit")
        validated_data["duration"] = f"{duration_value} {duration_unit}"
        return super().create(validated_data)

    def update(self, instance, validated_data):
        duration_value = validated_data.pop("duration_value", None)
        duration_unit = validated_data.pop("duration_unit", None)
        if duration_value is not None and duration_unit is not None:
            validated_data["duration"] = f"{duration_value} {duration_unit}"
        return super().update(instance, validated_data)

    class Meta:
        model = VisitingProfessorship
        fields = "__all__"
        read_only_fields = ["user"]


class ResearchAwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchAward
        fields = "__all__"
        read_only_fields = ["user"]


class EditorialAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EditorialAppointment
        fields = "__all__"
        read_only_fields = ["user"]


class ResearchGroupMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchGroupMembership
        fields = "__all__"
        read_only_fields = ["user"]


class ActiveResearchProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActiveResearchProject
        fields = "__all__"
        read_only_fields = ["user"]


class CompletedResearchProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletedResearchProject
        fields = "__all__"
        read_only_fields = ["user"]


class PhDThesisSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhDThesis
        fields = "__all__"
        read_only_fields = ["user"]
