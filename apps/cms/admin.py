from django.contrib import admin

from apps.cms.models import Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "template_key", "is_published", "show_in_navigation")
    list_filter = ("template_key", "is_published", "show_in_navigation")
    search_fields = ("title", "slug", "summary", "body")
    prepopulated_fields = {"slug": ("title",)}
