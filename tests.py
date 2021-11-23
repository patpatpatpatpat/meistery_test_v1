from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()


class LoginTest(APITestCase):
    url = "/api/v1/login"

    def setUp(self):
        self.user = User.objects.create(email="john.doe@test.com", age=20)
        self.user.set_password("password")
        self.user.save()

    def test_when_using_valid_credentials_response_should_contain_token(self):
        payload = {
            "email": self.user.email,
            "password": "password",
        }

        response = self.client.post(self.url, payload)

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

        response = self.client.post(self.url, payload)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )