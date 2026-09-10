from django.core import mail
from django.test import TestCase, override_settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from .models import CustomUser


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    FRONTEND_URL="http://localhost:5173",
    DEFAULT_FROM_EMAIL="portal@oouagoiwoye.edu.ng",
)
class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username="staff123",
            officialemail="staff123@oouagoiwoye.edu.ng",
            password="old-password",
        )

    def test_forgot_password_rejects_non_official_email(self):
        response = self.client.post(
            "/api/forgot-password/",
            {"officialemail": "staff123@gmail.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("officialemail", response.data)
        self.assertEqual(len(mail.outbox), 0)

    def test_forgot_password_sends_reset_link(self):
        response = self.client.post(
            "/api/forgot-password/",
            {"officialemail": "STAFF123@OOUAGOIWOYE.EDU.NG"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertEqual(message.to, [self.user.officialemail.lower()])
        self.assertIn("Research Productivity Portal password", message.subject)
        self.assertIn("http://localhost:5173/reset-password", message.body)
        self.assertIn("text/html", message.alternatives[0][1])

    def test_reset_password_updates_account(self):
        token = PasswordResetTokenGenerator().make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            "/api/reset-password/",
            {
                "uid": uid,
                "token": token,
                "new_password": "new-password",
                "confirm_password": "new-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("new-password"))

    def test_reset_password_rejects_mismatched_passwords(self):
        token = PasswordResetTokenGenerator().make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            "/api/reset-password/",
            {
                "uid": uid,
                "token": token,
                "new_password": "new-password",
                "confirm_password": "different-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("old-password"))
