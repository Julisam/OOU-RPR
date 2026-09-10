# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives
from django.db.models import Count, Min, Max
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils import timezone
from urllib.parse import quote
import binascii
from .models import (
    ResearchActivity,
    Department,
    CustomUser,
    Faculty,
    NationalAcademyFellowship,
    InternationalProfessionalFellowship,
    VisitingProfessorship,
    ResearchAward,
    JournalIndexStatus,
    EditorialAppointment,
    ResearchGroupMembership,
)
from .serializers import (
    ResearchActivitySerializer,
    DepartmentSerializer,
    CustomUserSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    NationalAcademyFellowshipSerializer,
    InternationalProfessionalFellowshipSerializer,
    VisitingProfessorshipSerializer,
    ResearchAwardSerializer,
    JournalIndexStatusSerializer,
    EditorialAppointmentSerializer,
    ResearchGroupMembershipSerializer,
)

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if not current_password or not new_password or not confirm_password:
            return Response(
                {"detail": "All password fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.check_password(current_password):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {"detail": "New passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_password)
        request.user.save()
        return Response({"detail": "Password updated successfully."})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        officialemail = serializer.validated_data["officialemail"]
        user = CustomUser.objects.filter(
            officialemail__iexact=officialemail,
            is_active=True,
        ).first()

        if user:
            token_generator = PasswordResetTokenGenerator()
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = token_generator.make_token(user)
            frontend_url = getattr(
                settings,
                "FRONTEND_URL",
                "http://localhost:5173",
            ).rstrip("/")
            reset_url = (
                f"{frontend_url}/reset-password?uid={quote(uid)}&token={quote(token)}"
            )
            context = {
                "reset_url": reset_url,
                "username": user.username,
            }
            html_message = render_to_string(
                "api/password_reset_email.html",
                context,
            )
            plain_message = (
                f"Hello {user.username},\n\n"
                "We received a request to reset your Research Productivity Portal password.\n\n"
                f"Reset your password: {reset_url}\n\n"
                "If you did not request this, you can safely ignore this email.\n\n"
                "Olabisi Onabanjo University Research Productivity Portal"
            )
            message = EmailMultiAlternatives(
                subject="Reset your Research Productivity Portal password",
                body=plain_message,
                from_email=getattr(
                    settings,
                    "DEFAULT_FROM_EMAIL",
                    getattr(settings, "EMAIL_HOST_USER", ""),
                ),
                to=[officialemail],
            )
            message.attach_alternative(html_message, "text/html")
            try:
                message.send(fail_silently=False)
            except Exception:
                return Response(
                    {"detail": "Unable to send the reset email. Please try again later."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        return Response(
            {
                "detail": (
                    "If an active account exists for this email, a password reset "
                    "link has been sent."
                )
            }
        )


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id, is_active=True)
        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            binascii.Error,
            CustomUser.DoesNotExist,
        ):
            return Response(
                {"detail": "This password reset link is invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response(
                {"detail": "This password reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password reset successfully."})


class NationalAcademyFellowshipViewSet(viewsets.ModelViewSet):
    serializer_class = NationalAcademyFellowshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NationalAcademyFellowship.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InternationalProfessionalFellowshipViewSet(viewsets.ModelViewSet):
    serializer_class = InternationalProfessionalFellowshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InternationalProfessionalFellowship.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class VisitingProfessorshipViewSet(viewsets.ModelViewSet):
    serializer_class = VisitingProfessorshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VisitingProfessorship.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResearchAwardViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchAwardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ResearchAward.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JournalIndexStatusViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = JournalIndexStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JournalIndexStatus.objects.all()


class EditorialAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = EditorialAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EditorialAppointment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResearchGroupMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchGroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ResearchGroupMembership.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResearchActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only access activities from their own records
        return ResearchActivity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResearchStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ResearchActivity.objects.filter(user=request.user)
        by_year = qs.values("year", "category").annotate(count=Count("id"))

        current_year = timezone.now().year
        years = list(range(current_year - 4, current_year + 1))
        categories = {
            "publications": 0,
            "conferences_attended": 0,
            "grants": 0,
            "patents": 0,
            "innovations": 0,
        }

        per_year = {
            str(year): {**categories, "total": 0} for year in years
        }
        all_time = {**categories, "total": 0}

        for row in by_year:
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if year in per_year:
                per_year[year][category] += count
                per_year[year]["total"] += count
            all_time[category] += count
            all_time["total"] += count

        recent = (
            qs.order_by("-year")
            .values("id", "title", "category", "year")[:5]
        )

        return Response(
            {
                "years": years,
                "per_year": per_year,
                "all_time": all_time,
                "recent": list(recent),
            }
        )


class AnnualReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = ResearchActivity.objects.filter(user=request.user)
        current_year = timezone.now().year
        min_year = qs.aggregate(min_year=Min("year")).get("min_year") or current_year

        years = list(range(min_year, current_year + 1))
        categories = {
            "publications": 0,
            "conferences_attended": 0,
            "grants": 0,
            "patents": 0,
            "innovations": 0,
        }
        per_year = {str(year): {**categories, "total": 0} for year in years}

        by_year = qs.values("year", "category").annotate(count=Count("id"))
        for row in by_year:
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if year in per_year and category in categories:
                per_year[year][category] += count
                per_year[year]["total"] += count

        activities = list(
            qs.values(
                "id",
                "category",
                "subcategory",
                "year",
                "date",
                "title",
                "book_title",
                "editors",
                "authors",
                "journal_name",
                "publication_scope",
                "journal_quartile",
                "conference_name",
                "location",
                "grant_number",
                "funding_agency",
                "amount",
                "currency",
                "start_date",
                "end_date",
                "status",
                "patent_number",
                "patent_status",
                "patent_agency",
                "collaborators",
                "description",
            )
        )

        return Response(
            {
                "years": years,
                "per_year": per_year,
                "activities": activities,
            }
        )


class HODReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["hod", "admin"]:
            return Response(
                {"detail": "You are not authorized to view this report."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not request.user.department:
            return Response(
                {"detail": "No department is linked to your account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        department = request.user.department
        dept_users = CustomUser.objects.filter(department=department).order_by("sname", "fname")
        all_activities_qs = ResearchActivity.objects.filter(user__in=dept_users)
        publications_qs = ResearchActivity.objects.filter(
            user__in=dept_users,
            category="publications",
        )

        current_year = timezone.now().year
        min_year = all_activities_qs.aggregate(min_year=Min("year")).get("min_year") or current_year
        years = list(range(min_year, current_year + 1))
        per_year_publications = {str(year): 0 for year in years}
        category_keys = [
            "publications",
            "conferences_attended",
            "grants",
            "patents",
            "innovations",
        ]
        per_year_categories = {
            str(year): {**{key: 0 for key in category_keys}, "total": 0}
            for year in years
        }
        all_time_categories = {**{key: 0 for key in category_keys}, "total": 0}

        by_year_publications = publications_qs.values("year").annotate(count=Count("id"))
        for row in by_year_publications:
            year = str(row["year"])
            if year in per_year_publications:
                per_year_publications[year] = row["count"]

        by_year_and_category = all_activities_qs.values("year", "category").annotate(count=Count("id"))
        for row in by_year_and_category:
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if year in per_year_categories and category in category_keys:
                per_year_categories[year][category] += count
                per_year_categories[year]["total"] += count
            if category in category_keys:
                all_time_categories[category] += count
                all_time_categories["total"] += count

        publication_type_keys = ["journals", "books", "conferences"]
        by_type = {key: 0 for key in publication_type_keys}
        per_year_publication_types = {
            str(year): {key: 0 for key in publication_type_keys}
            for year in years
        }
        type_counts = (
            publications_qs.values("subcategory")
            .annotate(count=Count("id"))
        )
        for row in type_counts:
            subcategory = row["subcategory"]
            if subcategory in by_type:
                by_type[subcategory] = row["count"]

        by_year_type_counts = (
            publications_qs.values("year", "subcategory")
            .annotate(count=Count("id"))
        )
        for row in by_year_type_counts:
            year = str(row["year"])
            subcategory = row["subcategory"]
            if year in per_year_publication_types and subcategory in publication_type_keys:
                per_year_publication_types[year][subcategory] = row["count"]

        quartiles = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0, "other": 0}
        quartile_counts = (
            publications_qs.values("journal_quartile")
            .annotate(count=Count("id"))
        )
        for row in quartile_counts:
            quartile = row["journal_quartile"] or "other"
            if quartile in quartiles:
                quartiles[quartile] += row["count"]
            else:
                quartiles["other"] += row["count"]

        scope_breakdown = {"foreign": 0, "local": 0, "other": 0}
        scope_counts = publications_qs.values("publication_scope").annotate(count=Count("id"))
        for row in scope_counts:
            scope = row["publication_scope"] or "other"
            if scope in scope_breakdown:
                scope_breakdown[scope] += row["count"]
            else:
                scope_breakdown["other"] += row["count"]

        user_last_year = {
            row["user"]: row["max_year"]
            for row in publications_qs.values("user").annotate(max_year=Max("year"))
        }

        user_type_counts = {}
        user_type_rows = publications_qs.values("user", "subcategory").annotate(count=Count("id"))
        for row in user_type_rows:
            username = row["user"]
            subcategory = row["subcategory"]
            if username not in user_type_counts:
                user_type_counts[username] = {"journals": 0, "books": 0, "conferences": 0}
            if subcategory in user_type_counts[username]:
                user_type_counts[username][subcategory] = row["count"]

        user_category_counts = {}
        user_category_rows = all_activities_qs.values("user", "category").annotate(count=Count("id"))
        for row in user_category_rows:
            username = row["user"]
            category = row["category"]
            count = row["count"]
            if username not in user_category_counts:
                user_category_counts[username] = {key: 0 for key in category_keys}
                user_category_counts[username]["total"] = 0
            if category in category_keys:
                user_category_counts[username][category] = count
                user_category_counts[username]["total"] += count

        user_year_category_counts = {}
        user_year_category_rows = all_activities_qs.values("user", "year", "category").annotate(count=Count("id"))
        for row in user_year_category_rows:
            username = row["user"]
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if username not in user_year_category_counts:
                user_year_category_counts[username] = {}
            if year not in user_year_category_counts[username]:
                user_year_category_counts[username][year] = {key: 0 for key in category_keys}
                user_year_category_counts[username][year]["total"] = 0
            if category in category_keys:
                user_year_category_counts[username][year][category] = count
                user_year_category_counts[username][year]["total"] += count

        lecturers = []
        active_staff_count = 0
        for user in dept_users:
            category_split = user_category_counts.get(
                user.username,
                {**{key: 0 for key in category_keys}, "total": 0},
            )
            if category_split["publications"] > 0:
                active_staff_count += 1
            lecturers.append(
                {
                    "username": user.username,
                    "full_name": user.full_name(),
                    "academic_rank": user.academic_rank or "",
                    "all_time": category_split,
                    "publication_split": user_type_counts.get(
                        user.username,
                        {"journals": 0, "books": 0, "conferences": 0},
                    ),
                    "per_year": user_year_category_counts.get(user.username, {}),
                    "last_publication_year": user_last_year.get(user.username),
                }
            )
        recent_publications = list(
            publications_qs
            .order_by("-year", "user__sname", "user__fname", "-updated_at")
            .values(
                "id",
                "user",
                "user__sname",
                "user__fname",
                "user__mname",
                "subcategory",
                "title",
                "book_title",
                "journal_name",
                "year",
            )[:10]
        )

        return Response(
            {
                "department": {
                    "code": department.code,
                    "name": department.name,
                    "faculty": department.faculty.name if department.faculty else "",
                },
                "years": years,
                "per_year_publications": per_year_publications,
                "per_year_categories": per_year_categories,
                "per_year_publication_types": per_year_publication_types,
                "all_time_categories": all_time_categories,
                "all_time_publication_types": by_type,
                "type_breakdown": by_type,
                "quartile_breakdown": quartiles,
                "scope_breakdown": scope_breakdown,
                "summary": {
                    "staff_count": dept_users.count(),
                    "active_staff_count": active_staff_count,
                    "total_publications": publications_qs.count(),
                },
                "lecturers": lecturers,
                "recent_publications": recent_publications,
            }
        )


class DeanReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["dean", "admin"]:
            return Response(
                {"detail": "You are not authorized to view this report."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not request.user.department or not request.user.department.faculty:
            return Response(
                {"detail": "No faculty context is linked to your account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        faculty = request.user.department.faculty
        faculty_departments = Department.objects.filter(faculty=faculty).order_by("name")
        faculty_users = CustomUser.objects.filter(department__in=faculty_departments)
        all_activities_qs = ResearchActivity.objects.filter(user__in=faculty_users)
        publications_qs = all_activities_qs.filter(category="publications")

        current_year = timezone.now().year
        min_year = all_activities_qs.aggregate(min_year=Min("year")).get("min_year") or current_year
        years = list(range(min_year, current_year + 1))

        per_year_publications = {str(year): 0 for year in years}
        category_keys = [
            "publications",
            "conferences_attended",
            "grants",
            "patents",
            "innovations",
        ]
        per_year_categories = {
            str(year): {**{key: 0 for key in category_keys}, "total": 0}
            for year in years
        }
        all_time_categories = {**{key: 0 for key in category_keys}, "total": 0}

        by_year_publications = publications_qs.values("year").annotate(count=Count("id"))
        for row in by_year_publications:
            year = str(row["year"])
            if year in per_year_publications:
                per_year_publications[year] = row["count"]

        by_year_and_category = all_activities_qs.values("year", "category").annotate(count=Count("id"))
        for row in by_year_and_category:
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if year in per_year_categories and category in category_keys:
                per_year_categories[year][category] += count
                per_year_categories[year]["total"] += count
            if category in category_keys:
                all_time_categories[category] += count
                all_time_categories["total"] += count

        publication_type_keys = ["journals", "books", "conferences"]
        all_time_publication_types = {key: 0 for key in publication_type_keys}
        per_year_publication_types = {
            str(year): {key: 0 for key in publication_type_keys}
            for year in years
        }

        by_type_counts = publications_qs.values("subcategory").annotate(count=Count("id"))
        for row in by_type_counts:
            subcategory = row["subcategory"]
            if subcategory in all_time_publication_types:
                all_time_publication_types[subcategory] = row["count"]

        by_year_type_counts = publications_qs.values("year", "subcategory").annotate(count=Count("id"))
        for row in by_year_type_counts:
            year = str(row["year"])
            subcategory = row["subcategory"]
            if year in per_year_publication_types and subcategory in publication_type_keys:
                per_year_publication_types[year][subcategory] = row["count"]

        quartiles = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0, "other": 0}
        quartile_counts = publications_qs.values("journal_quartile").annotate(count=Count("id"))
        for row in quartile_counts:
            quartile = row["journal_quartile"] or "other"
            if quartile in quartiles:
                quartiles[quartile] += row["count"]
            else:
                quartiles["other"] += row["count"]

        scope_breakdown = {"foreign": 0, "local": 0, "other": 0}
        scope_counts = publications_qs.values("publication_scope").annotate(count=Count("id"))
        for row in scope_counts:
            scope = row["publication_scope"] or "other"
            if scope in scope_breakdown:
                scope_breakdown[scope] += row["count"]
            else:
                scope_breakdown["other"] += row["count"]

        department_category_counts = {}
        dept_category_rows = all_activities_qs.values("user__department", "category").annotate(count=Count("id"))
        for row in dept_category_rows:
            dept_code = row["user__department"]
            category = row["category"]
            count = row["count"]
            if not dept_code:
                continue
            if dept_code not in department_category_counts:
                department_category_counts[dept_code] = {key: 0 for key in category_keys}
                department_category_counts[dept_code]["total"] = 0
            if category in category_keys:
                department_category_counts[dept_code][category] = count
                department_category_counts[dept_code]["total"] += count

        department_year_category_counts = {}
        dept_year_category_rows = all_activities_qs.values("user__department", "year", "category").annotate(count=Count("id"))
        for row in dept_year_category_rows:
            dept_code = row["user__department"]
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if not dept_code:
                continue
            if dept_code not in department_year_category_counts:
                department_year_category_counts[dept_code] = {}
            if year not in department_year_category_counts[dept_code]:
                department_year_category_counts[dept_code][year] = {key: 0 for key in category_keys}
                department_year_category_counts[dept_code][year]["total"] = 0
            if category in category_keys:
                department_year_category_counts[dept_code][year][category] = count
                department_year_category_counts[dept_code][year]["total"] += count

        department_publication_type_counts = {}
        dept_pub_type_rows = publications_qs.values("user__department", "subcategory").annotate(count=Count("id"))
        for row in dept_pub_type_rows:
            dept_code = row["user__department"]
            subcategory = row["subcategory"]
            count = row["count"]
            if not dept_code:
                continue
            if dept_code not in department_publication_type_counts:
                department_publication_type_counts[dept_code] = {key: 0 for key in publication_type_keys}
            if subcategory in department_publication_type_counts[dept_code]:
                department_publication_type_counts[dept_code][subcategory] = count

        department_last_publication_year = {
            row["user__department"]: row["max_year"]
            for row in publications_qs.values("user__department").annotate(max_year=Max("year"))
            if row["user__department"]
        }

        department_staff_counts = {
            row["department"]: row["count"]
            for row in faculty_users.values("department").annotate(count=Count("username"))
            if row["department"]
        }

        departments = []
        active_departments_count = 0
        for department in faculty_departments:
            all_time = department_category_counts.get(
                department.code,
                {**{key: 0 for key in category_keys}, "total": 0},
            )
            if all_time["publications"] > 0:
                active_departments_count += 1
            departments.append(
                {
                    "code": department.code,
                    "name": department.name,
                    "staff_count": department_staff_counts.get(department.code, 0),
                    "all_time": all_time,
                    "publication_split": department_publication_type_counts.get(
                        department.code,
                        {key: 0 for key in publication_type_keys},
                    ),
                    "per_year": department_year_category_counts.get(department.code, {}),
                    "last_publication_year": department_last_publication_year.get(department.code),
                }
            )

        recent_publications = list(
            publications_qs
            .order_by("-year", "user__department__name", "user__sname", "user__fname", "-updated_at")
            .values(
                "id",
                "user__department",
                "user__department__name",
                "user__sname",
                "user__fname",
                "subcategory",
                "title",
                "book_title",
                "journal_name",
                "year",
            )[:10]
        )

        return Response(
            {
                "faculty": {
                    "code": faculty.code,
                    "name": faculty.name,
                },
                "years": years,
                "per_year_publications": per_year_publications,
                "per_year_categories": per_year_categories,
                "per_year_publication_types": per_year_publication_types,
                "all_time_categories": all_time_categories,
                "all_time_publication_types": all_time_publication_types,
                "quartile_breakdown": quartiles,
                "scope_breakdown": scope_breakdown,
                "summary": {
                    "department_count": faculty_departments.count(),
                    "staff_count": faculty_users.count(),
                    "active_departments_count": active_departments_count,
                    "total_publications": publications_qs.count(),
                },
                "departments": departments,
                "recent_publications": recent_publications,
            }
        )


class AdminReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["admin", "dvc"]:
            return Response(
                {"detail": "You are not authorized to view this report."},
                status=status.HTTP_403_FORBIDDEN,
            )

        all_users = CustomUser.objects.all()
        all_activities_qs = ResearchActivity.objects.all()
        publications_qs = all_activities_qs.filter(category="publications")

        current_year = timezone.now().year
        min_year = all_activities_qs.aggregate(min_year=Min("year")).get("min_year") or current_year
        years = list(range(min_year, current_year + 1))

        per_year_publications = {str(year): 0 for year in years}
        category_keys = [
            "publications",
            "conferences_attended",
            "grants",
            "patents",
            "innovations",
        ]
        per_year_categories = {
            str(year): {**{key: 0 for key in category_keys}, "total": 0}
            for year in years
        }
        all_time_categories = {**{key: 0 for key in category_keys}, "total": 0}

        by_year_publications = publications_qs.values("year").annotate(count=Count("id"))
        for row in by_year_publications:
            year = str(row["year"])
            if year in per_year_publications:
                per_year_publications[year] = row["count"]

        by_year_and_category = all_activities_qs.values("year", "category").annotate(count=Count("id"))
        for row in by_year_and_category:
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if year in per_year_categories and category in category_keys:
                per_year_categories[year][category] += count
                per_year_categories[year]["total"] += count
            if category in category_keys:
                all_time_categories[category] += count
                all_time_categories["total"] += count

        publication_type_keys = ["journals", "books", "conferences"]
        all_time_publication_types = {key: 0 for key in publication_type_keys}
        per_year_publication_types = {
            str(year): {key: 0 for key in publication_type_keys}
            for year in years
        }

        by_type_counts = publications_qs.values("subcategory").annotate(count=Count("id"))
        for row in by_type_counts:
            subcategory = row["subcategory"]
            if subcategory in all_time_publication_types:
                all_time_publication_types[subcategory] = row["count"]

        by_year_type_counts = publications_qs.values("year", "subcategory").annotate(count=Count("id"))
        for row in by_year_type_counts:
            year = str(row["year"])
            subcategory = row["subcategory"]
            if year in per_year_publication_types and subcategory in publication_type_keys:
                per_year_publication_types[year][subcategory] = row["count"]

        quartiles = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0, "other": 0}
        quartile_counts = publications_qs.values("journal_quartile").annotate(count=Count("id"))
        for row in quartile_counts:
            quartile = row["journal_quartile"] or "other"
            if quartile in quartiles:
                quartiles[quartile] += row["count"]
            else:
                quartiles["other"] += row["count"]

        scope_breakdown = {"foreign": 0, "local": 0, "other": 0}
        scope_counts = publications_qs.values("publication_scope").annotate(count=Count("id"))
        for row in scope_counts:
            scope = row["publication_scope"] or "other"
            if scope in scope_breakdown:
                scope_breakdown[scope] += row["count"]
            else:
                scope_breakdown["other"] += row["count"]

        faculty_records = list(Faculty.objects.order_by("name").values("code", "name"))
        faculty_index = {
            faculty["code"]: {
                "code": faculty["code"],
                "name": faculty["name"],
                "staff_count": 0,
                "all_time": {**{key: 0 for key in category_keys}, "total": 0},
                "publication_split": {key: 0 for key in publication_type_keys},
                "per_year": {},
                "last_publication_year": None,
            }
            for faculty in faculty_records
        }
        faculty_index["others"] = {
            "code": "others",
            "name": "Others",
            "staff_count": 0,
            "all_time": {**{key: 0 for key in category_keys}, "total": 0},
            "publication_split": {key: 0 for key in publication_type_keys},
            "per_year": {},
            "last_publication_year": None,
        }

        faculty_user_counts = all_users.values("department__faculty").annotate(count=Count("username"))
        for row in faculty_user_counts:
            faculty_code = row["department__faculty"] or "others"
            if faculty_code in faculty_index:
                faculty_index[faculty_code]["staff_count"] = row["count"]

        faculty_category_rows = all_activities_qs.values("user__department__faculty", "category").annotate(count=Count("id"))
        for row in faculty_category_rows:
            faculty_code = row["user__department__faculty"] or "others"
            category = row["category"]
            count = row["count"]
            if faculty_code in faculty_index and category in category_keys:
                faculty_index[faculty_code]["all_time"][category] = count
                faculty_index[faculty_code]["all_time"]["total"] += count

        faculty_year_category_rows = all_activities_qs.values("user__department__faculty", "year", "category").annotate(count=Count("id"))
        for row in faculty_year_category_rows:
            faculty_code = row["user__department__faculty"] or "others"
            year = str(row["year"])
            category = row["category"]
            count = row["count"]
            if faculty_code not in faculty_index or category not in category_keys:
                continue
            if year not in faculty_index[faculty_code]["per_year"]:
                faculty_index[faculty_code]["per_year"][year] = {**{key: 0 for key in category_keys}, "total": 0}
            faculty_index[faculty_code]["per_year"][year][category] = count
            faculty_index[faculty_code]["per_year"][year]["total"] += count

        faculty_pub_type_rows = publications_qs.values("user__department__faculty", "subcategory").annotate(count=Count("id"))
        for row in faculty_pub_type_rows:
            faculty_code = row["user__department__faculty"] or "others"
            subcategory = row["subcategory"]
            count = row["count"]
            if faculty_code in faculty_index and subcategory in publication_type_keys:
                faculty_index[faculty_code]["publication_split"][subcategory] = count

        faculty_last_pub_year_rows = publications_qs.values("user__department__faculty").annotate(max_year=Max("year"))
        for row in faculty_last_pub_year_rows:
            faculty_code = row["user__department__faculty"] or "others"
            if faculty_code in faculty_index:
                faculty_index[faculty_code]["last_publication_year"] = row["max_year"]

        faculties = sorted(
            [value for key, value in faculty_index.items() if key != "others"],
            key=lambda item: item["name"],
        )
        faculties.append(faculty_index["others"])

        recent_publications = list(
            publications_qs
            .order_by("-year", "user__department__faculty__name", "user__sname", "user__fname", "-updated_at")
            .values(
                "id",
                "user__department__faculty",
                "user__department__faculty__name",
                "user__department__name",
                "user__sname",
                "user__fname",
                "subcategory",
                "title",
                "book_title",
                "journal_name",
                "year",
            )[:10]
        )

        active_faculties_count = sum(
            1 for faculty in faculties if faculty["all_time"]["publications"] > 0
        )

        return Response(
            {
                "years": years,
                "per_year_publications": per_year_publications,
                "per_year_categories": per_year_categories,
                "per_year_publication_types": per_year_publication_types,
                "all_time_categories": all_time_categories,
                "all_time_publication_types": all_time_publication_types,
                "quartile_breakdown": quartiles,
                "scope_breakdown": scope_breakdown,
                "summary": {
                    "faculty_count": len(faculties),
                    "staff_count": all_users.count(),
                    "active_faculties_count": active_faculties_count,
                    "total_publications": publications_qs.count(),
                },
                "faculties": faculties,
                "recent_publications": recent_publications,
            }
        )
