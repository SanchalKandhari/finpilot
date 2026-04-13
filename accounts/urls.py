from django.contrib.auth.views import LogoutView
from django.urls import path

from .views import CustomLoginView, dashboard, signup_view


urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("signup/", signup_view, name="signup"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
