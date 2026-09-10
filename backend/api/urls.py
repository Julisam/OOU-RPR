from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .serializers import CustomTokenObtainPairSerializer

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet)
router.register(r'research-activities', views.ResearchActivityViewSet, basename='research-activities')
router.register(r'national-academy-fellowships', views.NationalAcademyFellowshipViewSet, basename='national-academy-fellowships')
router.register(r'international-professional-fellowships', views.InternationalProfessionalFellowshipViewSet, basename='international-professional-fellowships')
router.register(r'visiting-professorships', views.VisitingProfessorshipViewSet, basename='visiting-professorships')
router.register(r'research-awards', views.ResearchAwardViewSet, basename='research-awards')
router.register(r'journal-index-statuses', views.JournalIndexStatusViewSet, basename='journal-index-statuses')
router.register(r'editorial-appointments', views.EditorialAppointmentViewSet, basename='editorial-appointments')
router.register(r'research-group-memberships', views.ResearchGroupMembershipViewSet, basename='research-group-memberships')

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    path('token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('stats/', views.ResearchStatsView.as_view(), name='research-stats'),
    path('annual-report/', views.AnnualReportView.as_view(), name='annual-report'),
    path('hod-report/', views.HODReportView.as_view(), name='hod-report'),
    path('dean-report/', views.DeanReportView.as_view(), name='dean-report'),
    path('admin-report/', views.AdminReportView.as_view(), name='admin-report'),
]
