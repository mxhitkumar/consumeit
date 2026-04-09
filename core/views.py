from django.http import HttpResponse
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
