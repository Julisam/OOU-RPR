from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator


class Faculty(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)

    class Meta:
        verbose_name_plural = "Faculties"

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)
    faculty = models.ForeignKey(
        Faculty, to_field="code", on_delete=models.PROTECT, related_name="departments"
    )

    def __str__(self):
        return f"{self.name} - {self.faculty.name}"


class CustomUser(AbstractUser):
    RANK_CHOICES = [
        ("professor", "Professor"),
        ("associate_professor", "Associate Professor"),
        ("senior_lecturer", "Senior Lecturer"),
        ("lecturer_i", "Lecturer I"),
        ("lecturer_ii", "Lecturer II"),
        ("assistant_lecturer", "Assistant Lecturer"),
        ("graduate_assistant", "Graduate Assistant"),
    ]
    ROLE_CHOICES = [
        ("admin", "Administrator"),
        ("lecturer", "Lecturer"),
        ("hod", "Head of Department"),
        ("dean", "Dean"),
        ("dvc", "Deputy Vice Chancellor"),
    ]
    username = models.CharField(max_length=20, unique=True)
    academic_rank = models.CharField(
        max_length=30, choices=RANK_CHOICES, null=True, blank=True
    )
    title = models.CharField(max_length=15, null=True, blank=True)
    sname = models.CharField(max_length=100, null=True, blank=True)
    fname = models.CharField(max_length=100, null=True, blank=True)
    mname = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    officialemail = models.EmailField(max_length=255, null=True, blank=True)
    department = models.ForeignKey(
        Department,
        to_field="code",
        on_delete=models.PROTECT,
        related_name="users",
        null=True,
        blank=True,
    )
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    specialization = models.CharField(max_length=200, null=True, blank=True)
    orcid_id = models.CharField(max_length=50, null=True, blank=True)
    google_scholar_id = models.CharField(max_length=50, null=True, blank=True)
    state_of_origin = models.CharField(max_length=100, null=True, blank=True)
    scopus_id = models.CharField(max_length=100, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="lecturer")

    first_name = None
    last_name = None
    date_joined = None

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "officialemail"]

    def full_name(self):
        if self.mname:
            return f"{self.sname}, {self.fname} {self.mname}"
        return f"{self.sname}, {self.fname}"

    def __str__(self):
        return f"{self.username} - {self.full_name()}"

    class Meta:
        verbose_name_plural = "Academic Staff"
        verbose_name = "Academic Staff"


class ResearchActivity(models.Model):
    PUBLICATION_SCOPE_CHOICES = [
        ("foreign", "Foreign"),
        ("local", "Local"),
    ]

    PUBLICATION_QUARTILE_CHOICES = [
        ("Q1", "Quartile 1"),
        ("Q2", "Quartile 2"),
        ("Q3", "Quartile 3"),
        ("Q4", "Quartile 4"),
        ("other", "Others"),
    ]

    CATEGORY_CHOICES = [
        ("publications", "Publications"),
        ("conferences_attended", "Conferences/Workshops Attended"),
        ("patents", "Patents and Intellectual Property"),
        ("grants", "Research Income (Grants)"),
        ("innovations", "Innovations and Technology Transfer"),
    ]

    SUBCATEGORY_CHOICES = [
        # Publications
        ("journals", "Journals"),
        ("books", "Books"),
        ("conferences", "Conference Publications"),
        # Innovations
        ("prototype", "Prototypes developed"),
        ("software", "Software or tools created"),
        ("technology_transfer", "Technologies transferred to industries"),
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="research_activities",
        to_field="username",
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    subcategory = models.CharField(
        max_length=50, choices=SUBCATEGORY_CHOICES, null=True, blank=True
    )
    year = models.PositiveIntegerField(validators=[MinValueValidator(1980)])
    date = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    # Common fields
    title = models.CharField(max_length=500, null=True, blank=True)

    # Publication specific fields
    book_title = models.CharField(max_length=500, null=True, blank=True)
    editors = models.TextField(null=True, blank=True)
    journal_name = models.CharField(max_length=300, null=True, blank=True)
    volume = models.CharField(max_length=100, null=True, blank=True)
    issue = models.CharField(max_length=100, null=True, blank=True)
    authors = models.TextField(null=True, blank=True)
    doi = models.CharField(max_length=200, null=True, blank=True)
    publication_scope = models.CharField(
        max_length=10,
        choices=PUBLICATION_SCOPE_CHOICES,
        null=True,
        blank=True,
    )
    journal_quartile = models.CharField(
        max_length=10,
        choices=PUBLICATION_QUARTILE_CHOICES,
        null=True,
        blank=True,
    )
    no_of_citations = models.PositiveSmallIntegerField(null=True, blank=True)

    # Conference specific fields
    conference_name = models.CharField(max_length=300, null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)

    # Patent specific fields
    patent_number = models.CharField(max_length=100, null=True, blank=True)
    patent_status = models.CharField(max_length=50, null=True, blank=True)
    patent_agency = models.CharField(max_length=200, null=True, blank=True)

    # Grant specific fields
    grant_number = models.CharField(max_length=100, null=True, blank=True)
    funding_agency = models.CharField(max_length=200, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default="NGN", null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)

    # Innovation specific fields
    collaborators = models.TextField(null=True, blank=True)
    impact = models.TextField(null=True, blank=True)

    # Publication metadata (JSONField multi-selects — null=True for backward compatibility)
    authorship = models.JSONField(default=list, blank=True, null=True)
    journal_index = models.JSONField(default=list, blank=True, null=True)
    sdg_alignment = models.JSONField(default=list, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-year"]
        verbose_name_plural = "Research Activities"

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class NationalAcademyFellowship(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="national_academy_fellowships",
        to_field="username",
    )
    academy_name = models.CharField(max_length=255)
    academy_type = models.CharField(max_length=255)
    year_elected = models.PositiveIntegerField(validators=[MinValueValidator(1900)])
    discipline = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "National Academy Fellowships"
        ordering = ["-year_elected"]

    def __str__(self):
        return f"{self.user.username} - {self.academy_name}"


class InternationalProfessionalFellowship(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="international_professional_fellowships",
        to_field="username",
    )
    body_name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    year_elected = models.PositiveIntegerField(validators=[MinValueValidator(1900)])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "International Professional Fellowships"
        ordering = ["-year_elected"]

    def __str__(self):
        return f"{self.user.username} - {self.body_name}"


class VisitingProfessorship(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="visiting_professorships",
        to_field="username",
    )
    host_institution = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    title = models.CharField(max_length=40)
    year_appointed = models.PositiveIntegerField(validators=[MinValueValidator(1900)])
    duration = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Visiting Professorships"
        ordering = ["-year_appointed"]

    def __str__(self):
        return f"{self.user.username} - {self.host_institution}"


class ResearchAward(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="research_awards",
        to_field="username",
    )
    award_name = models.CharField(max_length=255)
    awarding_organization = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    year_received = models.PositiveIntegerField(validators=[MinValueValidator(1900)])
    award_category = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Research Awards"
        ordering = ["-year_received"]

    def __str__(self):
        return f"{self.user.username} - {self.award_name}"


class EditorialAppointment(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="editorial_appointments",
        to_field="username",
    )
    journal_name = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    position = models.CharField(max_length=40)
    indexing_status = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Editorial Appointments"
        ordering = ["-id"]

    def __str__(self):
        return f"{self.user.username} - {self.journal_name}"


class ResearchGroupMembership(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="research_group_memberships",
        to_field="username",
    )
    group_name = models.CharField(max_length=255)
    group_type = models.CharField(max_length=40)
    research_area = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=40)
    status = models.CharField(max_length=20)
    number_of_members = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Research Group Memberships"
        ordering = ["-id"]

    def __str__(self):
        return f"{self.user.username} - {self.group_name}"


class ActiveResearchProject(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="active_research_projects",
        to_field="username",
    )
    title = models.CharField(max_length=500)
    source_of_funding = models.CharField(max_length=300, blank=True)
    year_commenced = models.PositiveIntegerField(validators=[MinValueValidator(1980)])
    expected_year_of_completion = models.PositiveIntegerField(
        validators=[MinValueValidator(1980)], null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Active Research Projects"
        ordering = ["-year_commenced"]

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class CompletedResearchProject(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="completed_research_projects",
        to_field="username",
    )
    title = models.CharField(max_length=500)
    year_commenced = models.PositiveIntegerField(validators=[MinValueValidator(1980)])
    year_completed = models.PositiveIntegerField(validators=[MinValueValidator(1980)])
    # JSONField multi-select for research output status
    output_status = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Completed Research Projects"
        ordering = ["-year_completed"]

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class PhDThesis(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="phd_theses",
        to_field="username",
    )
    title = models.CharField(max_length=500)
    candidate_name = models.CharField(max_length=255)
    year_awarded = models.PositiveIntegerField(validators=[MinValueValidator(1980)])
    research_area = models.CharField(max_length=300, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "PhD Theses"
        ordering = ["-year_awarded"]

    def __str__(self):
        return f"{self.user.username} - {self.title}"
