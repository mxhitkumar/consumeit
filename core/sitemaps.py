from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from blog.models import Post
from cms.models import Page


class StaticViewSitemap(Sitemap):
    priority = 0.8
    changefreq = "weekly"

    def items(self):
        return ["pages:home", "pages:services", "pages:pricing", "pages:faq", "blog:list"]

    def location(self, item):
        return reverse(item)


class CmsPageSitemap(Sitemap):
    priority = 0.7
    changefreq = "monthly"

    def items(self):
        return Page.objects.filter(is_published=True)

    def lastmod(self, obj):
        return obj.updated_at


class BlogPostSitemap(Sitemap):
    priority = 0.9
    changefreq = "weekly"

    def items(self):
        return Post.published.live()

    def lastmod(self, obj):
        return obj.updated_at
