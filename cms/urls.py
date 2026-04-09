from django.urls import path

from cms.views import PageDetailView

app_name = "cms"

urlpatterns = [
    path("<slug:slug>/", PageDetailView.as_view(), name="page-detail"),
]
