from django.urls import path

from apps.pages.views import FAQView, HomeView, PricingView, ServiceDetailView, ServiceListView

app_name = "pages"

urlpatterns = [
    path("", HomeView.as_view(), name="home"),
    path("services/", ServiceListView.as_view(), name="services"),
    path("services/<slug:slug>/", ServiceDetailView.as_view(), name="service-detail"),
    path("pricing/", PricingView.as_view(), name="pricing"),
    path("faq/", FAQView.as_view(), name="faq"),
]
