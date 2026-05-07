from django.http import HttpResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.urls import reverse


def robots_txt(request):
    content = render_to_string(
        "core/robots.txt",
        {
            "sitemap_url": request.build_absolute_uri(
                reverse("django.contrib.sitemaps.views.sitemap")
            ),
        },
    )
    return HttpResponse(content, content_type="text/plain")


def custom_404(request, exception):
    return render(
        request,
        "404.html",
        {
            "meta_title": "Page Not Found | ConsumeIT",
            "meta_description": (
                "The page you were looking for could not be found. "
                "Browse services, pricing, FAQs, or return to the homepage."
            ),
        },
        status=404,
    )
