from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

User = get_user_model()

"""
Tests for the API specifications under Backend Trial Assignment.
Note that these may require slight modifications depending on 
how the applicant implemented the endpoints.

"""
class LoginAndLogoutTest(APITestCase):
    login_url = "/api/v1/login"
    logout_url = "/api/v1/logout"

    def setUp(self):
        self.user = User.objects.create(email="john.doe@test.com", age=20)
        self.user.set_password("password")
        self.user.save()
        Token.objects.get_or_create(user=self.user)

    def test_when_using_valid_credentials_response_should_contain_token(self):
        payload = {
            "email": self.user.email,
            "password": "password",
        }

        response = self.client.post(self.login_url, payload)

        self.assertTrue(
            response.status_code,
            status.HTTP_200_OK,
        )
        expected_keys = ["token", "user_id"]

        for key in expected_keys:
            self.assertIn(key, response.json())

        self.assertEqual(
            response.json()["user_id"],
            self.user.pk,
        )
        self.assertEqual(
            response.json()["token"],
            str(self.user.auth_token),
        )

    def test_when_using_invalid_credentials_response_should_be_400(self):
        payload = {
            "email": "error@mail.com",
            "password": "test",
        }

        response = self.client.post(self.login_url, payload)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_when_logging_out_response_should_be_200(self):
        self.client.force_authenticate(self.user)

        response = self.client.get(self.logout_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
