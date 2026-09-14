from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser,
    Faculty,
    Department,
    ResearchActivity,
    NationalAcademyFellowship,
    InternationalProfessionalFellowship,
    VisitingProfessorship,
    ResearchAward,
    EditorialAppointment,
    ResearchGroupMembership,
)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "full_name",
        "officialemail",
        "department",
        "academic_rank",
        "is_staff",
    )
    list_filter = ("academic_rank", "department", "is_staff", "is_active")
    search_fields = ("username", "sname", "fname", "email")

    fieldsets = (
        (None, {"fields": ("role", "password")}),
        (
            "Personal info",
            {
                "fields": (
                    "sname",
                    "fname",
                    "mname",
                    "title",
                    "email",
                    "officialemail",
                    "phone_number",
                )
            },
        ),
        (
            "Academic info",
            {
                "fields": (
                    "department",
                    "academic_rank",
                    "specialization",
                    "orcid_id",
                    "google_scholar_id",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "password1", "password2"),
            },
        ),
        (
            "Personal info",
            {
                "fields": (
                    "email",
                    "officialemail",
                )
            },
        ),
    )

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_staff=False)


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "faculty")
    list_filter = ("faculty",)
    search_fields = ("name", "code")


@admin.register(ResearchActivity)
class ResearchActivityAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "category", "year")
    list_filter = ("year", "category")
    search_fields = ("title", "user__username")

    readonly_fields = [field.name for field in ResearchActivity._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(NationalAcademyFellowship)
class NationalAcademyFellowshipAdmin(admin.ModelAdmin):
    list_display = ("user", "academy_name", "academy_type", "year_elected")
    list_filter = ("academy_type", "year_elected")
    search_fields = ("academy_name", "user__username")


@admin.register(InternationalProfessionalFellowship)
class InternationalProfessionalFellowshipAdmin(admin.ModelAdmin):
    list_display = ("user", "body_name", "country", "year_elected")
    list_filter = ("country", "year_elected")
    search_fields = ("body_name", "user__username")


@admin.register(VisitingProfessorship)
class VisitingProfessorshipAdmin(admin.ModelAdmin):
    list_display = ("user", "host_institution", "country", "title", "year_appointed")
    list_filter = ("title", "country", "year_appointed")
    search_fields = ("host_institution", "user__username")


@admin.register(ResearchAward)
class ResearchAwardAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "award_name",
        "awarding_organization",
        "country",
        "year_received",
    )
    list_filter = ("country", "year_received")
    search_fields = ("award_name", "user__username")


@admin.register(EditorialAppointment)
class EditorialAppointmentAdmin(admin.ModelAdmin):
    list_display = ("user", "journal_name", "position", "country")
    list_filter = ("position", "country")
    search_fields = ("journal_name", "user__username")


@admin.register(ResearchGroupMembership)
class ResearchGroupMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "group_name", "group_type", "role", "status")
    list_filter = ("group_type", "role", "status")
    search_fields = ("group_name", "user__username")
